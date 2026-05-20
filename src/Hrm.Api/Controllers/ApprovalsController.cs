using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

using Hrm.Service.Interfaces;

namespace Hrm.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ApprovalsController : ControllerBase
    {
        private readonly HrmDbContext _context;
        private readonly INotificationService _notificationService;

        public ApprovalsController(HrmDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPendingRequests()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

            var user = await _context.Users
                .Include(u => u.Employee)
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return Unauthorized();

            var userRoleNames = user.UserRoles.Select(ur => ur.Role!.Name).ToList();
            var isAdmin = userRoleNames.Contains("Admin") || User.HasClaim(c => c.Type == "Permission" && c.Value == "APPROVE_ALL");
            var isGeneralManager = userRoleNames.Contains("General Manager");
            var isDeptManager = userRoleNames.Contains("Department Manager") || User.HasClaim(c => c.Type == "Permission" && c.Value == "APPROVE_DEPT");

            var query = _context.ApprovalRequests
                .Include(r => r.Requester).ThenInclude(u => u!.Employee)
                .AsQueryable();

            if (isAdmin || isGeneralManager)
            {
                // Can see everything
            }
            else if (isDeptManager)
            {
                // Can only see requests from their department
                var deptId = user.Employee?.DepartmentId;
                query = query.Where(r => r.DepartmentId == deptId);
            }
            else
            {
                // Regular employees can only see their own requests
                query = query.Where(r => r.RequesterId == userId);
            }

            var results = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.RequestType,
                    r.EntityName,
                    r.EntityId,
                    r.Description,
                    r.Status,
                    r.CreatedAt,
                    RequesterName = r.Requester != null 
                        ? (r.Requester.Employee != null ? r.Requester.Employee.FullName : r.Requester.Username) 
                        : "N/A",
                    r.DataJson
                })
                .ToListAsync();

            // Load LeaveRequests corresponding to LEAVE_REQUEST types to build dynamic DataJson
            var leaveRequestIds = results
                .Where(r => r.RequestType == "LEAVE_REQUEST" && !string.IsNullOrEmpty(r.EntityId))
                .Select(r => int.TryParse(r.EntityId, out var lid) ? lid : 0)
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (leaveRequestIds.Any())
            {
                var leaveRequests = await _context.LeaveRequests
                    .Where(l => leaveRequestIds.Contains(l.Id))
                    .ToDictionaryAsync(l => l.Id);

                var enrichedResults = results.Select(r =>
                {
                    var dataJson = r.DataJson;
                    if (r.RequestType == "LEAVE_REQUEST" && int.TryParse(r.EntityId, out var lid) && leaveRequests.TryGetValue(lid, out var lr))
                    {
                        // Dynamically build JSON from the single source of truth in LeaveRequests table
                        dataJson = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            lr.Id,
                            lr.UserId,
                            lr.LeaveType,
                            lr.StartDate,
                            lr.EndDate,
                            lr.Reason,
                            Status = "Approved", // Keep "Approved" status so proposed change is displayed correctly in details modal
                            lr.CreatedAt,
                            lr.ApprovedBy,
                            lr.Comment
                        });
                    }

                    return new
                    {
                        r.Id,
                        r.RequestType,
                        r.EntityName,
                        r.Description,
                        r.Status,
                        r.CreatedAt,
                        r.RequesterName,
                        DataJson = dataJson
                    };
                }).ToList();

                return Ok(enrichedResults);
            }

            // Fallback for non-enriched results
            var finalResults = results.Select(r => new
            {
                r.Id,
                r.RequestType,
                r.EntityName,
                r.Description,
                r.Status,
                r.CreatedAt,
                r.RequesterName,
                r.DataJson
            }).ToList();

            return Ok(finalResults);
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveRequest(int id, [FromBody] string note)
        {
            return await ProcessRequest(id, ApprovalStatus.Approved, note);
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id, [FromBody] string note)
        {
            return await ProcessRequest(id, ApprovalStatus.Rejected, note);
        }

        private async Task<IActionResult> ProcessRequest(int id, ApprovalStatus status, string note)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

            var request = await _context.ApprovalRequests.FindAsync(id);
            if (request == null) return NotFound();
            if (request.Status != ApprovalStatus.Pending) return BadRequest("Request is already processed.");

            // Basic authorization check
            var user = await _context.Users
                .Include(u => u.Employee)
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return Unauthorized();
            var userRoleNames = user.UserRoles.Select(ur => ur.Role!.Name).ToList();
            
            bool canApprove = userRoleNames.Contains("Admin") || userRoleNames.Contains("General Manager") || User.HasClaim(c => c.Type == "Permission" && c.Value == "APPROVE_ALL");
            if (!canApprove && (userRoleNames.Contains("Department Manager") || User.HasClaim(c => c.Type == "Permission" && c.Value == "APPROVE_DEPT")))
            {
                canApprove = user.Employee?.DepartmentId == request.DepartmentId;
            }

            if (!canApprove) return Forbid();

            request.Status = status;
            request.ApproverId = userId;
            request.ApprovalNote = note;
            request.ActionedAt = DateTime.UtcNow;
            request.UpdatedAt = DateTime.UtcNow;

            if (request.RequestType == "LEAVE_REQUEST" && !string.IsNullOrEmpty(request.EntityId))
            {
                if (int.TryParse(request.EntityId, out var leaveRequestId))
                {
                    var leaveRequest = await _context.LeaveRequests.Include(l => l.User).FirstOrDefaultAsync(l => l.Id == leaveRequestId);
                    if (leaveRequest != null)
                    {
                        var approverName = user.Employee?.FullName ?? user.Username;
                        
                        if (status == ApprovalStatus.Approved)
                        {
                            leaveRequest.Status = "Approved";
                        }
                        else if (status == ApprovalStatus.Rejected)
                        {
                            leaveRequest.Status = "Rejected";
                        }
                        
                        leaveRequest.ApprovedBy = approverName;
                        leaveRequest.Comment = note;

                        // Send notifications
                        try
                        {
                            var statusStr = status == ApprovalStatus.Approved ? "Approved" : "Rejected";
                            var displayStatus = status == ApprovalStatus.Approved ? "Duyệt" : "Từ chối";
                            
                            var shortMsg = status == ApprovalStatus.Approved ? "Đơn nghỉ của bạn đã được duyệt" : "Đơn nghỉ của bạn đã bị từ chối";
                            var fullMsg = $"Đơn nghỉ phép của bạn đã được {displayStatus.ToLower()}. Người duyệt: {approverName}. Ghi chú: {note ?? "-"}.";

                            var userNotif = new Notification
                            {
                                UserId = leaveRequest.UserId,
                                Title = status == ApprovalStatus.Approved ? "Đơn nghỉ được duyệt" : "Đơn nghỉ bị từ chối",
                                Message = fullMsg,
                                Type = status == ApprovalStatus.Approved ? "LeaveApproved" : "LeaveRejected",
                                MetaJson = System.Text.Json.JsonSerializer.Serialize(new {
                                    messageKey = "leave.request.status",
                                    messageParams = new { id = leaveRequest.Id, status = statusStr },
                                    fallback = fullMsg
                                })
                            };

                            await _notificationService.CreateAndSendAsync(userNotif);

                            var roleShort = $"Đơn nghỉ đã chuyển sang trạng thái {statusStr}";
                            var roleNotif = new Notification
                            {
                                UserId = null,
                                Title = "Cập nhật đơn nghỉ",
                                Message = roleShort,
                                Type = "LeaveStatus"
                            };

                            await _notificationService.CreateAndSendAsync(roleNotif, "Admin");
                            await _notificationService.CreateAndSendAsync(roleNotif, "Personnel");
                            await _notificationService.CreateAndSendAsync(roleNotif, "Manager");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Notification Error in ApprovalsController] {ex.Message}");
                        }
                    }
                }
            }
            else if (status == ApprovalStatus.Approved && !string.IsNullOrEmpty(request.DataJson))
            {
                try {
                    await ApplyApprovedChanges(request);
                } catch (Exception ex) {
                    return BadRequest($"Failed to apply changes: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        private async Task ApplyApprovedChanges(ApprovalRequest request)
        {
            var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            
            if (request.RequestType == "PERSONNEL_UPDATE" && !string.IsNullOrEmpty(request.EntityId))
            {
                var id = int.Parse(request.EntityId);
                var employee = await _context.Employees.FindAsync(id);
                if (employee != null)
                {
                    var data = System.Text.Json.JsonSerializer.Deserialize<Employee>(request.DataJson, options);
                    if (data != null)
                    {
                        _context.Entry(employee).CurrentValues.SetValues(data);
                        employee.Id = id; 
                    }
                }
            }
            else if (request.RequestType == "PERSONNEL_CREATE")
            {
                var data = System.Text.Json.JsonSerializer.Deserialize<Employee>(request.DataJson, options);
                if (data != null)
                {
                    _context.Employees.Add(data);
                }
            }
            else if (request.RequestType == "PERSONNEL_DELETE" && !string.IsNullOrEmpty(request.EntityId))
            {
                var id = int.Parse(request.EntityId);
                var employee = await _context.Employees.FindAsync(id);
                if (employee != null)
                {
                    _context.Employees.Remove(employee);
                }
            }

            else if (request.RequestType == "ATTENDANCE_CORRECTION" && !string.IsNullOrEmpty(request.EntityId))
            {
                var id = int.Parse(request.EntityId);
                var correction = await _context.AttendanceCorrections.FindAsync(id);
                if (correction != null)
                {
                    var data = System.Text.Json.JsonSerializer.Deserialize<AttendanceCorrection>(request.DataJson, options);
                    if (data != null)
                    {
                        _context.Entry(correction).CurrentValues.SetValues(data);
                        correction.Id = id;

                        // Also update the actual attendance if approved
                        if (correction.AttendanceId.HasValue)
                        {
                            var attendance = await _context.Attendances.FindAsync(correction.AttendanceId.Value);
                            if (attendance != null)
                            {
                                if (correction.RequestedCheckIn.HasValue) attendance.CheckInTime = correction.RequestedCheckIn.Value;
                                if (correction.RequestedCheckOut.HasValue) attendance.CheckOutTime = correction.RequestedCheckOut.Value;
                            }
                        }
                    }
                }
            }
            // Add other types as needed
        }
    }
}

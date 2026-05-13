using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Hrm.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ApprovalsController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public ApprovalsController(HrmDbContext context)
        {
            _context = context;
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

            var userRoleNames = user.UserRoles.Select(ur => ur.Role.Name).ToList();
            var isAdmin = userRoleNames.Contains("Admin");
            var isGeneralManager = userRoleNames.Contains("General Manager");
            var isDeptManager = userRoleNames.Contains("Department Manager");

            var query = _context.ApprovalRequests
                .Include(r => r.Requester).ThenInclude(u => u.Employee)
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
                    r.Description,
                    r.Status,
                    r.CreatedAt,
                    RequesterName = r.Requester != null && r.Requester.Employee != null ? r.Requester.Employee.FullName : r.Requester.Username,
                    r.DataJson
                })
                .ToListAsync();

            return Ok(results);
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
            var userRoleNames = user.UserRoles.Select(ur => ur.Role.Name).ToList();
            
            bool canApprove = userRoleNames.Contains("Admin") || userRoleNames.Contains("General Manager");
            if (!canApprove && userRoleNames.Contains("Department Manager"))
            {
                canApprove = user.Employee?.DepartmentId == request.DepartmentId;
            }

            if (!canApprove) return Forbid();

            request.Status = status;
            request.ApproverId = userId;
            request.ApprovalNote = note;
            request.ActionedAt = DateTime.UtcNow;
            request.UpdatedAt = DateTime.UtcNow;

            if (status == ApprovalStatus.Approved && !string.IsNullOrEmpty(request.DataJson))
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
            else if (request.RequestType == "LEAVE_REQUEST" && !string.IsNullOrEmpty(request.EntityId))
            {
                var id = int.Parse(request.EntityId);
                var leave = await _context.LeaveRequests.FindAsync(id);
                if (leave != null)
                {
                    var data = System.Text.Json.JsonSerializer.Deserialize<LeaveRequest>(request.DataJson, options);
                    if (data != null)
                    {
                        _context.Entry(leave).CurrentValues.SetValues(data);
                        leave.Id = id;
                    }
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

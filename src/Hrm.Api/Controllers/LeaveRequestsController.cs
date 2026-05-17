using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace Hrm.Api.Controllers
{
    public class CreateLeaveRequestDto
    {
        public string LeaveType { get; set; } = "Annual";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveRequestsController : ControllerBase
    {
        private readonly HrmDbContext _context;
        private readonly Hrm.Service.Interfaces.INotificationService _notificationService;

        public LeaveRequestsController(HrmDbContext context, Hrm.Service.Interfaces.INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLeaveRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var claimUserId))
            {
                return Unauthorized();
            }

            var isAdminOrHR = User.IsInRole("Admin") || User.IsInRole("Manager") || User.IsInRole("Personnel");

            var query = _context.LeaveRequests
                .Include(l => l.User)
                    .ThenInclude(u => u!.Employee)
                .AsQueryable();

            if (!isAdminOrHR)
            {
                query = query.Where(l => l.UserId == claimUserId);
            }

            var data = await query
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new {
                    l.Id,
                    l.UserId,
                    l.LeaveType,
                    l.StartDate,
                    l.EndDate,
                    l.ApprovedBy,
                    l.Comment,
                    l.Reason,
                    l.Status,
                    l.CreatedAt,
                    FullName = (l.User != null && l.User.Employee != null) ? l.User.Employee.FullName : (l.User != null ? l.User.Username : "N/A")
                })
                .ToListAsync();
            return Ok(data);
        }


        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateLeaveRequest([FromBody] CreateLeaveRequestDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var claimUserId))
                {
                    return Unauthorized(new { message = "Invalid user identity" });
                }

                var user = await _context.Users
                    .Include(u => u.Employee)
                    .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.Id == claimUserId);

                if (user == null) return Unauthorized();
                var isAdmin = user.UserRoles.Any(ur => ur.Role!.Name == "Admin");

                // 1. Map DTO to Entity
                var request = new LeaveRequest
                {
                    UserId = claimUserId,
                    LeaveType = dto.LeaveType,
                    StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
                    EndDate = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc),
                    Reason = dto.Reason ?? "",
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                // 2. Save to Database
                _context.LeaveRequests.Add(request);
                await _context.SaveChangesAsync();

                var senderName = user.Employee?.FullName ?? user.Username;

                // 3. If not admin, create an Approval Request
                if (!isAdmin)
                {
                    // Update the status in the JSON data so it gets applied as Approved
                    var approvedData = new LeaveRequest
                    {
                        Id = request.Id,
                        UserId = request.UserId,
                        LeaveType = request.LeaveType,
                        StartDate = request.StartDate,
                        EndDate = request.EndDate,
                        Reason = request.Reason,
                        Status = "Approved",
                        CreatedAt = request.CreatedAt
                    };

                    var approval = new ApprovalRequest
                    {
                        RequesterId = claimUserId,
                        RequestType = "LEAVE_REQUEST",
                        EntityName = "LeaveRequest",
                        EntityId = request.Id.ToString(),
                        DataJson = System.Text.Json.JsonSerializer.Serialize(approvedData),
                        Description = $"Đơn nghỉ phép: {senderName} ({request.LeaveType})",
                        DepartmentId = user.Employee?.DepartmentId,
                        Status = ApprovalStatus.Pending
                    };

                    _context.ApprovalRequests.Add(approval);
                    await _context.SaveChangesAsync();
                }

                // 4. Fire notifications
                try {
                    var roleFull = $"Đơn nghỉ mới - Người gửi: {senderName}";
                    var notif = new Notification
                    {
                        Title = "Yêu cầu nghỉ mới",
                        Message = roleFull,
                        Type = "LeaveRequest",
                        MetaJson = System.Text.Json.JsonSerializer.Serialize(new {
                            messageKey = "leave.request.created",
                            messageParams = new {
                                id = request.Id,
                                userId = request.UserId,
                                startDate = request.StartDate,
                                endDate = request.EndDate
                            },
                            fallback = roleFull
                        })
                    };

                    await _notificationService.CreateAndSendAsync(notif, "Admin");
                    await _notificationService.CreateAndSendAsync(notif, "Personnel");
                    await _notificationService.CreateAndSendAsync(notif, "Manager");
                }
                catch (Exception ex) {
                    Console.WriteLine($"[Notification Error] {ex.Message}");
                }

                return Ok(new {
                    request.Id,
                    request.UserId,
                    request.LeaveType,
                    request.StartDate,
                    request.EndDate,
                    request.Reason,
                    request.Status,
                    request.CreatedAt,
                    FullName = senderName,
                    RequiresApproval = !isAdmin
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CreateLeaveRequest Error] {ex}");
                return StatusCode(500, new { message = "Lỗi hệ thống khi tạo đơn nghỉ", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLeaveRequest(int id)
        {
            var l = await _context.LeaveRequests
                .Include(x => x.User)
                    .ThenInclude(u => u!.Employee)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (l == null) return NotFound();

            return Ok(new {
                l.Id,
                l.UserId,
                l.LeaveType,
                l.StartDate,
                l.EndDate,
                l.ApprovedBy,
                l.Comment,
                l.Reason,
                l.Status,
                l.CreatedAt,
                FullName = (l.User != null && l.User.Employee != null) ? l.User.Employee.FullName : (l.User != null ? l.User.Username : "N/A")
            });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto, [FromServices] Hrm.Service.Interfaces.INotificationService notificationService)
        {
            try
            {
                var request = await _context.LeaveRequests.Include(l => l.User).FirstOrDefaultAsync(l => l.Id == id);
                if (request == null) return NotFound();

                request.Status = dto.Status;
                request.ApprovedBy = dto.ApprovedBy;
                request.Comment = dto.Comment;

                await _context.SaveChangesAsync();

                // Gửi thông báo realtime NGẮN và ĐẦY ĐỦ cho người dùng liên quan (theo user-{id}) via notificationService
                var shortMsg = dto.Status == "Approved" ? "Đơn nghỉ của bạn đã được duyệt" : "Đơn nghỉ của bạn đã bị từ chối";
                var fullMsg = $"Đơn nghỉ phép của bạn đã được {(dto.Status == "Approved" ? "Duyệt" : "Từ chối")}. Người duyệt: {dto.ApprovedBy ?? "-"}. Ghi chú: {dto.Comment ?? "-"}.";

                var userNotif = new Notification
                {
                    UserId = request.UserId,
                    Title = dto.Status == "Approved" ? "Đơn nghỉ được duyệt" : "Đơn nghỉ bị từ chối",
                    Message = fullMsg,
                    Type = dto.Status == "Approved" ? "LeaveApproved" : "LeaveRejected",
                    MetaJson = System.Text.Json.JsonSerializer.Serialize(new {
                        messageKey = "leave.request.status",
                        messageParams = new { id = request.Id, status = dto.Status },
                        fallback = fullMsg
                    })
                };

                await notificationService.CreateAndSendAsync(userNotif);

                // Đồng thời gửi thông báo rút gọn cho các role quản trị (Admin/Personnel/Manager) để cập nhật danh sách
                var roleShort = $"Đơn nghỉ đã chuyển sang trạng thái {request.Status}";
                var roleNotif = new Notification
                {
                    UserId = null,
                    Title = "Cập nhật đơn nghỉ",
                    Message = roleShort,
                    Type = "LeaveStatus"
                };

                await notificationService.CreateAndSendAsync(roleNotif, "Admin");
                await notificationService.CreateAndSendAsync(roleNotif, "Personnel");
                await notificationService.CreateAndSendAsync(roleNotif, "Manager");

                return NoContent();
            }
            catch (Exception ex)
            {
                // Log exception for debugging and return details (dev only)
                Console.WriteLine("Exception in UpdateStatus: ");
                Console.WriteLine(ex.ToString());
                return Problem(detail: ex.ToString(), title: "Internal Server Error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLeaveRequest(int id, LeaveRequest request)
        {
            if (id != request.Id) return BadRequest();

            var existing = await _context.LeaveRequests.FindAsync(id);
            if (existing == null) return NotFound();

            // Cập nhật các trường chính
            existing.LeaveType = request.LeaveType;
            existing.Reason = request.Reason;
            existing.Status = request.Status;
            existing.Comment = request.Comment;
            existing.ApprovedBy = request.ApprovedBy;

            // Ensure incoming date fields have UTC kind to satisfy Npgsql timestamptz
            if (request.StartDate != default)
                existing.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
            if (request.EndDate != default)
                existing.EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LeaveRequestExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLeaveRequest(int id)
        {
            var request = await _context.LeaveRequests.FindAsync(id);
            if (request == null) return NotFound();

            _context.LeaveRequests.Remove(request);
            await _context.SaveChangesAsync();

            return NoContent();
        }



        private bool LeaveRequestExists(int id)
        {
            return _context.LeaveRequests.Any(e => e.Id == id);
        }
    }



    public class UpdateStatusDto
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("approvedBy")]
        public string? ApprovedBy { get; set; }

        [JsonPropertyName("comment")]
        public string? Comment { get; set; }
    }
}

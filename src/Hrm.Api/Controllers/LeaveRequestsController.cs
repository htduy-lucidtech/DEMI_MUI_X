using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveRequestsController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public LeaveRequestsController(HrmDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetLeaveRequests()
        {
            var data = await _context.LeaveRequests
                .Include(l => l.User)
                    .ThenInclude(u => u!.Employee)
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

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserLeaveRequests(int userId)
        {
            var data = await _context.LeaveRequests
                .Include(l => l.User)
                    .ThenInclude(u => u!.Employee)
                .Where(l => l.UserId == userId)
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
        public async Task<ActionResult<LeaveRequest>> CreateLeaveRequest(LeaveRequest request, [FromServices] Hrm.Service.Interfaces.INotificationService notificationService)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var claimUserId))
            {
                return Unauthorized();
            }

            request.UserId = claimUserId;
            // Ensure date kinds are UTC for PostgreSQL timestamptz
            if (request.StartDate != default)
                request.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
            if (request.EndDate != default)
                request.EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

            request.CreatedAt = DateTime.UtcNow;
            request.Status = "Pending";
            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();

            // Load the author (with Employee) to avoid null dereference of navigation properties
            var author = await _context.Users.Include(u => u.Employee).FirstOrDefaultAsync(u => u.Id == request.UserId);
            var senderName = (author != null && author.Employee != null) ? author.Employee.FullName : (author != null ? author.Username : $"User {request.UserId}");

            // Notify Admin/Personnel/Manager roles that a new leave request was created
            var roleShort = $"Yêu cầu nghỉ mới từ user {senderName}";
            var roleFull = $"Đơn nghỉ mới - Người gửi: {senderName}";

            var notif = new Notification
            {
                UserId = null,
                Role = null,
                Title = "Yêu cầu nghỉ mới",
                // fallback message (kept for older clients)
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

            // Send to multiple roles (server provides key+params; FE localizes)
            await notificationService.CreateAndSendAsync(notif, "Admin");
            await notificationService.CreateAndSendAsync(notif, "Personnel");
            await notificationService.CreateAndSendAsync(notif, "Manager");

            var result = new {
                request.Id,
                request.UserId,
                request.LeaveType,
                request.StartDate,
                request.EndDate,
                request.ApprovedBy,
                request.Comment,
                request.Reason,
                request.Status,
                request.CreatedAt,
                FullName = (request.User != null && request.User.Employee != null) ? request.User.Employee.FullName : (request.User != null ? request.User.Username : "N/A")
            };

            return CreatedAtAction(nameof(GetLeaveRequest), new { id = request.Id }, result);
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

            // Ensure incoming date fields have UTC kind to satisfy Npgsql timestamptz
            if (request.StartDate != default)
                request.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
            if (request.EndDate != default)
                request.EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

            _context.Entry(request).State = EntityState.Modified;

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
        public string Status { get; set; } = string.Empty;
        public string? ApprovedBy { get; set; }
        public string? Comment { get; set; }
    }
}

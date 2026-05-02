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

            // Notify Admin/Personnel/Manager roles that a new leave request was created
            var roleShort = $"Yêu cầu nghỉ mới (ID: {request.Id}) từ user {request.UserId}";
            var roleFull = $"Đơn nghỉ mới (ID: {request.Id}) - Người gửi: {request.UserId}. Thời gian: {request.StartDate:u} - {request.EndDate:u}. Lý do: {request.Reason}";

            var notif = new Notification
            {
                UserId = null,
                Role = null,
                Title = "Yêu cầu nghỉ mới",
                Message = roleFull,
                Type = "LeaveRequest"
            };

            // Send to multiple roles
            await notificationService.CreateAndSendAsync(notif, "Admin");
            await notificationService.CreateAndSendAsync(notif, "Personnel");
            await notificationService.CreateAndSendAsync(notif, "Manager");

            return CreatedAtAction(nameof(GetLeaveRequest), new { id = request.Id }, request);
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
            var request = await _context.LeaveRequests.Include(l => l.User).FirstOrDefaultAsync(l => l.Id == id);
            if (request == null) return NotFound();

            request.Status = dto.Status;
            request.ApprovedBy = dto.ApprovedBy;
            request.Comment = dto.Comment;

            await _context.SaveChangesAsync();

            // Gửi thông báo realtime NGẮN và ĐẦY ĐỦ cho người dùng liên quan (theo user-{id}) via notificationService
            var shortMsg = dto.Status == "Approved" ? "Đơn nghỉ của bạn đã được duyệt" : "Đơn nghỉ của bạn đã bị từ chối";
            var fullMsg = $"Đơn nghỉ phép (ID: {request.Id}) của bạn đã được {(dto.Status == "Approved" ? "Duyệt" : "Từ chối")}. Người duyệt: {dto.ApprovedBy ?? "-"}. Ghi chú: {dto.Comment ?? "-"}.";

            var userNotif = new Notification
            {
                UserId = request.UserId,
                Title = dto.Status == "Approved" ? "Đơn nghỉ được duyệt" : "Đơn nghỉ bị từ chối",
                Message = fullMsg,
                Type = dto.Status == "Approved" ? "LeaveApproved" : "LeaveRejected"
            };

            await notificationService.CreateAndSendAsync(userNotif);

            // Đồng thời gửi thông báo rút gọn cho các role quản trị (Admin/Personnel/Manager) để cập nhật danh sách
            var roleShort = $"Đơn nghỉ (ID: {request.Id}) đã chuyển sang trạng thái {request.Status}";
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

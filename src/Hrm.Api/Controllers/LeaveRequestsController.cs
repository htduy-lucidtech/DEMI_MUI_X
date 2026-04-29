using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

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
                    l.Reason,
                    l.Status,
                    l.CreatedAt,
                    FullName = (l.User != null && l.User.Employee != null) ? l.User.Employee.FullName : (l.User != null ? l.User.Username : "N/A")
                })
                .ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult<LeaveRequest>> CreateLeaveRequest(LeaveRequest request)
        {
            request.CreatedAt = DateTime.UtcNow;
            request.Status = "Pending";
            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetLeaveRequests), new { id = request.Id }, request);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto, [FromServices] IHubContext<Hrm.Api.Hubs.NotificationHub> hubContext)
        {
            var request = await _context.LeaveRequests.Include(l => l.User).FirstOrDefaultAsync(l => l.Id == id);
            if (request == null) return NotFound();

            request.Status = dto.Status;
            request.ApprovedBy = dto.ApprovedBy;
            request.Comment = dto.Comment;

            await _context.SaveChangesAsync();

            // Gửi thông báo realtime cho người dùng
            await hubContext.Clients.All.SendAsync("ReceiveNotification", "Hệ thống", 
                $"Đơn nghỉ phép của bạn đã được { (dto.Status == "Approved" ? "Duyệt" : "Từ chối") }");

            return NoContent();
        }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? ApprovedBy { get; set; }
        public string? Comment { get; set; }
    }
}

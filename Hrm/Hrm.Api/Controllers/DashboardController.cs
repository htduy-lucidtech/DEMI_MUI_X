using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public DashboardController(HrmDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalEmployees = await _context.Employees.CountAsync();
            var activeEmployees = await _context.Users.CountAsync(u => u.IsActive);
            
            var today = DateTime.UtcNow.Date;
            var attendanceToday = await _context.Attendances
                .CountAsync(a => a.CheckInTime.Date == today);

            var recentActivities = await _context.Attendances
                .Include(a => a.User)
                    .ThenInclude(u => u!.Employee)
                .OrderByDescending(a => a.CheckInTime)
                .Take(5)
                .Select(a => new {
                    id = a.Id,
                    user = (a.User != null && a.User.Employee != null) ? a.User.Employee.FullName : (a.User != null ? a.User.Username : "N/A"),
                    action = "Check-in",
                    time = a.CheckInTime.ToString("hh:mm tt"),
                    status = "success"
                })
                .ToListAsync();

            return Ok(new
            {
                totalEmployees,
                activeEmployees,
                attendanceToday,
                lateToday = 2,
                leaveRequests = 3,
                recentActivities
            });
        }
        
        [HttpGet("test-notification")]
        public async Task<IActionResult> TestNotification([FromServices] IHubContext<Hrm.Api.Hubs.NotificationHub> hubContext)
        {
            await hubContext.Clients.All.SendAsync("ReceiveNotification", "Hệ thống", "Chào mừng bạn đến với HRM Pro! Đây là thông báo realtime.");
            return Ok(new { message = "Notification sent" });
        }
    }
}

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

            var lateToday = await _context.Attendances
                .CountAsync(a => a.CheckInTime.Date == today && a.CheckInTime.TimeOfDay > new TimeSpan(8, 0, 0));

            var leaveRequests = await _context.LeaveRequests
                .CountAsync(l => l.Status == "Pending");

            // KPI Completion based on PerformanceReview scores (1-5 scale)
            var performanceReviews = await _context.PerformanceReviews.ToListAsync();
            double kpiCompletion = 0;
            if (performanceReviews.Any())
            {
                var averageScore = performanceReviews.Average(p => (double)p.TotalScore);
                kpiCompletion = Math.Round((averageScore / 5.0) * 100, 1);
            }

            // Overall attendance rate (mock 30 days history logic or use current active base)
            // If we have attendance data, we can just use today's attendance / active employees
            // For a more realistic "overall" rate, we'll calculate based on all time attendances 
            // vs total possible (simplification: attendance rate is today's rate * 100 if > 0, else 0)
            double attendanceRate = 0;
            if (activeEmployees > 0)
            {
                attendanceRate = Math.Round(((double)attendanceToday / activeEmployees) * 100, 1);
                // If it's a weekend or holiday and 0, let's pull historical
                if (attendanceRate == 0 && await _context.Attendances.AnyAsync())
                {
                    var totalDays = await _context.Attendances.Select(a => a.CheckInTime.Date).Distinct().CountAsync();
                    var totalAttendances = await _context.Attendances.CountAsync();
                    if (totalDays > 0)
                    {
                        var avgDaily = (double)totalAttendances / totalDays;
                        attendanceRate = Math.Round((avgDaily / activeEmployees) * 100, 1);
                    }
                }
            }

            // Normalize to max 100%
            if (attendanceRate > 100) attendanceRate = 100;
            if (kpiCompletion > 100) kpiCompletion = 100;

            return Ok(new
            {
                totalEmployees,
                activeEmployees,
                attendanceToday,
                lateToday,
                leaveRequests,
                kpiCompletion,
                attendanceRate,
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

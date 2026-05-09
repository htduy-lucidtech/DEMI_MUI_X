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

        private int GetUserIdFromToken()
        {
            var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        public DashboardController(HrmDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var today = DateTime.UtcNow.Date;
            var userIdFromToken = GetUserIdFromToken();
            var isEmployee = User.IsInRole("Employee");
            
            // Nếu là Employee, bắt buộc trả về stats cá nhân
            if (isEmployee)
            {
                var userId = userIdFromToken;
                var user = await _context.Users
                    .Include(u => u.Employee)
                    .FirstOrDefaultAsync(u => u.Id == userId);
                
                if (user == null) return NotFound("User not found");

                var myAttendances = await _context.Attendances
                    .Where(a => a.UserId == userId.Value)
                    .OrderByDescending(a => a.CheckInTime)
                    .ToListAsync();

                var attendanceToday = myAttendances.FirstOrDefault(a => a.CheckInTime.Date == today);
                var myLeaveRequests = await _context.LeaveRequests
                    .Where(l => l.UserId == userId.Value)
                    .ToListAsync();

                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;

                var pendingLeave = myLeaveRequests.Count(l => l.Status == "Pending");
                var approvedLeave = myLeaveRequests.Count(l => l.Status == "Approved");
                
                // Days in CURRENT MONTH
                var monthLeaveDays = myLeaveRequests
                    .Where(l => l.Status == "Approved" && 
                               l.StartDate.Month == currentMonth && 
                               l.StartDate.Year == currentYear)
                    .Sum(l => (l.EndDate - l.StartDate).Days + 1);

                // Total Lateness count (not just today)
                var totalLateCount = myAttendances.Count(a => a.IsLate);

                // Performance for this individual
                var myReviews = await _context.PerformanceReviews
                    .Where(p => p.EmployeeId == user.EmployeeId)
                    .ToListAsync();
                
                double kpiCompletion = 0;
                if (myReviews.Any())
                {
                    var averageScore = myReviews.Average(p => (double)p.TotalScore);
                    kpiCompletion = Math.Round((averageScore / 5.0) * 100, 1);
                }

                // Individual attendance rate (e.g. over last 30 days)
                // For simplicity: (days present in last 30) / (30 days)
                var last30Days = DateTime.UtcNow.AddDays(-30).Date;
                var presentDays = myAttendances.Count(a => a.CheckInTime.Date >= last30Days);
                double attendanceRate = Math.Round((presentDays / 30.0) * 100, 1);

                var recentActivities = myAttendances
                    .Take(5)
                    .Select(a => new {
                        id = a.Id,
                        user = user.Employee?.FullName ?? user.Username,
                        action = "Check-in",
                        time = a.CheckInTime.ToString("hh:mm tt"),
                        status = a.IsLate ? "error" : "success"
                    })
                    .ToList();

                return Ok(new
                {
                    totalEmployees = 0, // Hidden for employees
                    activeEmployees = 1,
                    attendanceToday = attendanceToday != null ? 1 : 0,
                    lateToday = totalLateCount, // Now returns total count
                    leaveRequests = pendingLeave,
                    approvedLeave,
                    totalLeaveDays = monthLeaveDays, // Now returns monthly count
                    kpiCompletion,
                    attendanceRate,
                    recentActivities,
                    isPersonal = true,
                    currentMonthName = DateTime.UtcNow.ToString("MMMM")
                });
            }

            // Global stats for Admin/HR
            var totalEmployees = await _context.Employees.CountAsync();
            var activeEmployees = await _context.Users.CountAsync(u => u.IsActive);
            
            var attendanceTodayCount = await _context.Attendances
                .CountAsync(a => a.CheckInTime.Date == today);

            var recentActivitiesGlobal = await _context.Attendances
                .Include(a => a.User)
                    .ThenInclude(u => u!.Employee)
                .OrderByDescending(a => a.CheckInTime)
                .Take(5)
                .Select(a => new {
                    id = a.Id,
                    user = (a.User != null && a.User.Employee != null) ? a.User.Employee.FullName : (a.User != null ? a.User.Username : "N/A"),
                    action = "Check-in",
                    time = a.CheckInTime.ToString("hh:mm tt"),
                    status = a.IsLate ? "error" : "success"
                })
                .ToListAsync();

            var lateTodayCount = await _context.Attendances
                .CountAsync(a => a.CheckInTime.Date == today && a.IsLate);

            var leaveRequestsCount = await _context.LeaveRequests
                .CountAsync(l => l.Status == "Pending");

            // Global Performance
            var performanceReviews = await _context.PerformanceReviews.ToListAsync();
            double globalKpi = 0;
            if (performanceReviews.Any())
            {
                var averageScore = performanceReviews.Average(p => (double)p.TotalScore);
                globalKpi = Math.Round((averageScore / 5.0) * 100, 1);
            }

            double globalAttendanceRate = 0;
            if (activeEmployees > 0)
            {
                globalAttendanceRate = Math.Round(((double)attendanceTodayCount / activeEmployees) * 100, 1);
            }

            return Ok(new
            {
                totalEmployees,
                activeEmployees,
                attendanceToday = attendanceTodayCount,
                lateToday = lateTodayCount,
                leaveRequests = leaveRequestsCount,
                kpiCompletion = globalKpi,
                attendanceRate = globalAttendanceRate,
                recentActivities = recentActivitiesGlobal,
                isPersonal = false
            });
        }
        
        [HttpGet("test-notification")]
        public async Task<IActionResult> TestNotification([FromServices] Hrm.Service.Interfaces.INotificationService notificationService)
        {
            var notif = new Hrm.Domain.Entities.Notification
            {
                UserId = null,
                Title = "Hệ thống",
                Message = "Chào mừng bạn đến với HRM Pro! Đây là thông báo realtime.",
                Type = "System"
            };

            notif.MetaJson = System.Text.Json.JsonSerializer.Serialize(new {
                messageKey = "system.welcome",
                messageParams = new { },
                fallback = notif.Message
            });

            // send to common roles as a basic broadcast
            await notificationService.CreateAndSendAsync(notif, "Admin");
            await notificationService.CreateAndSendAsync(notif, "Personnel");
            await notificationService.CreateAndSendAsync(notif, "Manager");
            await notificationService.CreateAndSendAsync(notif, "Employee");

            return Ok(new { message = "Notification sent" });
        }
    }
}

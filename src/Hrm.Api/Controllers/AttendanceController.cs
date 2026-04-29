using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public AttendanceController(HrmDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAttendances()
        {
            var data = await _context.Attendances
                .Include(a => a.User)
                    .ThenInclude(u => u!.Employee)
                .OrderByDescending(a => a.CheckInTime)
                .Select(a => new {
                    a.Id,
                    a.UserId,
                    a.CheckInTime,
                    a.CheckOutTime,
                    a.IsLate,
                    a.LateReason,
                    a.Note,
                    FullName = (a.User != null && a.User.Employee != null) ? a.User.Employee.FullName : (a.User != null ? a.User.Username : "N/A")
                })
                .ToListAsync();
            return Ok(data);
        }

        [HttpGet("today-status/{userId}")]
        public async Task<IActionResult> GetTodayStatus(int userId)
        {
            var today = DateTime.UtcNow.Date;
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.UserId == userId && a.CheckInTime.Date == today);

            var settings = await _context.SystemSettings
                .Where(s => s.Key == "StandardCheckInTime" || s.Key == "StandardCheckOutTime")
                .ToDictionaryAsync(s => s.Key, s => s.Value);

            return Ok(new
            {
                HasCheckedIn = attendance != null,
                HasCheckedOut = attendance?.CheckOutTime != null,
                CheckInTime = attendance?.CheckInTime,
                CheckOutTime = attendance?.CheckOutTime,
                IsLate = attendance?.IsLate ?? false,
                LateReason = attendance?.LateReason,
                Regulations = new {
                    CheckIn = settings.GetValueOrDefault("StandardCheckInTime", "08:30"),
                    CheckOut = settings.GetValueOrDefault("StandardCheckOutTime", "17:30")
                }
            });
        }

        public class CheckInRequest
        {
            public int UserId { get; set; }
            public string? LateReason { get; set; }
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
        {
            var userId = request.UserId;
            var today = DateTime.UtcNow.Date;
            var existing = await _context.Attendances
                .AnyAsync(a => a.UserId == userId && a.CheckInTime.Date == today);

            if (existing) return BadRequest("Already checked in today");

            var settings = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == "StandardCheckInTime");
            
            var standardTimeStr = settings?.Value ?? "08:30";
            var now = DateTime.UtcNow;
            var standardTime = TimeSpan.Parse(standardTimeStr);
            
            // Convert now to local time for comparison if needed, or keep UTC
            // For simplicity, let's assume standardTime is UTC or server time
            var isLate = now.TimeOfDay > standardTime;

            var attendance = new Attendance
            {
                UserId = userId,
                CheckInTime = now,
                IsLate = isLate,
                LateReason = request.LateReason,
                Note = isLate ? "Đi muộn" : "Đúng giờ"
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            return Ok(attendance);
        }

        [HttpGet("regulations")]
        public async Task<IActionResult> GetRegulations()
        {
            var settings = await _context.SystemSettings
                .Where(s => s.Key == "StandardCheckInTime" || s.Key == "StandardCheckOutTime")
                .ToListAsync();
            return Ok(settings);
        }

        [HttpPost("regulations")]
        public async Task<IActionResult> UpdateRegulations([FromBody] List<SystemSetting> settings)
        {
            foreach (var setting in settings)
            {
                var existing = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == setting.Key);
                if (existing != null)
                {
                    existing.Value = setting.Value;
                }
                else
                {
                    _context.SystemSettings.Add(setting);
                }
            }
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut([FromBody] int userId)
        {
            var today = DateTime.UtcNow.Date;
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.UserId == userId && a.CheckInTime.Date == today);

            if (attendance == null) return BadRequest("No check-in record found for today");
            if (attendance.CheckOutTime != null) return BadRequest("Already checked out today");

            attendance.CheckOutTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(attendance);
        }
    }
}

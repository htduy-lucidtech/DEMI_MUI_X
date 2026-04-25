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

            return Ok(new
            {
                HasCheckedIn = attendance != null,
                HasCheckedOut = attendance?.CheckOutTime != null,
                CheckInTime = attendance?.CheckInTime,
                CheckOutTime = attendance?.CheckOutTime
            });
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] int userId)
        {
            var today = DateTime.UtcNow.Date;
            var existing = await _context.Attendances
                .AnyAsync(a => a.UserId == userId && a.CheckInTime.Date == today);

            if (existing) return BadRequest("Already checked in today");

            var attendance = new Attendance
            {
                UserId = userId,
                CheckInTime = DateTime.UtcNow
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            return Ok(attendance);
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

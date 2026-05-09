using Hrm.Service.Interfaces;
using Hrm.Domain.Entities;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;
using Hrm.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly Hrm.Service.Interfaces.INotificationService _notificationService;
        private readonly HrmDbContext _context;

        public AttendanceController(IAttendanceService attendanceService, Hrm.Service.Interfaces.INotificationService notificationService, HrmDbContext context)
        {
            _attendanceService = attendanceService;
            _notificationService = notificationService;
            _context = context;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        [HttpPost("checkin")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInDto dto)
        {
            var userId = GetUserId();
            var attendance = await _attendanceService.CheckInAsync(userId, dto.Source, dto.DeviceId, dto.GeoJson);

            // notify user + roles (full)
            var userNotif = new Notification
            {
                UserId = userId,
                Title = "Check-in",
                Message = "Bạn đã điểm danh (check-in)",
                Type = "Attendance",
                MetaJson = JsonSerializer.Serialize(new {
                    messageKey = "attendance.checkin",
                    messageParams = new { attendanceId = attendance.Id },
                    fallback = "Bạn đã điểm danh (check-in)"
                })
            };
            await _notificationService.CreateAndSendAsync(userNotif);

            var roleNotif = new Notification
            {
                UserId = null,
                Title = "Nhân viên điểm danh",
                Message = $"User {userId} đã check-in)",
                Type = "Attendance",
                MetaJson = JsonSerializer.Serialize(new {
                    messageKey = "attendance.checkin",
                    messageParams = new { userId = userId, attendanceId = attendance.Id },
                    fallback = $"User {userId} đã check-in"
                })
            };
            await _notificationService.CreateAndSendAsync(roleNotif, "Manager");

            return CreatedAtAction(nameof(GetLatest), new { id = attendance.Id }, attendance);
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> CheckOut()
        {
            var userId = GetUserId();
            var attendance = await _attendanceService.CheckOutAsync(userId);
            if (attendance == null) return NotFound();

            var userNotifOut = new Notification
            {
                UserId = userId,
                Title = "Check-out",
                Message = "Bạn đã điểm danh (check-out)",
                Type = "Attendance",
                MetaJson = JsonSerializer.Serialize(new {
                    messageKey = "attendance.checkout",
                    messageParams = new { attendanceId = attendance.Id },
                    fallback = "Bạn đã điểm danh (check-out)"
                })
            };
            await _notificationService.CreateAndSendAsync(userNotifOut);

            var roleNotifOut = new Notification
            {
                UserId = null,
                Title = "Nhân viên điểm danh",
                Message = $"User {userId} đã check-out",
                Type = "Attendance"
            };
            await _notificationService.CreateAndSendAsync(roleNotifOut, "Manager");
            return Ok(attendance);
        }

        [HttpPost("correction")]
        public async Task<IActionResult> RequestCorrection([FromBody] CorrectionDto dto)
        {
            var userId = GetUserId();
            var correction = await _attendanceService.RequestCorrectionAsync(userId, dto.RequestedCheckIn, dto.RequestedCheckOut, dto.Reason);

            var corrRoleNotif = new Notification
            {
                UserId = null,
                Title = "Yêu cầu sửa chấm công",
                Message = $"User {userId} đã gửi yêu cầu sửa chấm công",
                Type = "Attendance"
            };
            await _notificationService.CreateAndSendAsync(corrRoleNotif, "Manager");

            return CreatedAtAction(nameof(GetCorrection), new { id = correction.Id }, correction);
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatest()
        {
            var userId = GetUserId();
            var attendance = await _attendanceService.GetLatestForUserAsync(userId);
            if (attendance == null) return NotFound();
            return Ok(attendance);
        }

        [HttpGet("correction/{id}")]
        public async Task<IActionResult> GetCorrection(int id)
        {
            // minimal: return from DB
            var corr = await _attendanceService.GetCorrectionByIdAsync(id);
            if (corr == null) return NotFound();
            return Ok(corr);
        }

        [HttpGet("corrections")]
        [Authorize(Roles = "Admin,Personnel,Manager")]
        public async Task<IActionResult> GetPendingCorrections()
        {
            var list = await _attendanceService.GetPendingCorrectionsAsync();
            return Ok(list);
        }

        [HttpPost("correction/{id}/approve")]
        [Authorize(Roles = "Admin,Personnel,Manager")]
        public async Task<IActionResult> ApproveCorrection(int id, [FromBody] ApproveDto dto)
        {
            var approverId = GetUserId();
            var corr = await _attendanceService.ApproveCorrectionAsync(id, approverId, dto.Approve, dto.Comment);
            if (corr == null) return NotFound();

            // notify user
            var userResultNotif = new Notification
            {
                UserId = corr.UserId,
                Title = "Kết quả sửa chấm công",
                Message = $"Yêu cầu sửa chấm công đã được {corr.Status}",
                Type = "Attendance",
                MetaJson = JsonSerializer.Serialize(new { type = "attendance:correction:result", data = corr })
            };
            await _notificationService.CreateAndSendAsync(userResultNotif);

            var personnelNotif = new Notification
            {
                UserId = null,
                Title = "Kết quả sửa chấm công",
                Message = $"Yêu cầu sửa chấm công đã được {corr.Status}",
                Type = "Attendance"
            };
            await _notificationService.CreateAndSendAsync(personnelNotif, "Personnel");

            return Ok(corr);
        }

        // Compatibility endpoints used by existing frontend
        [HttpGet]
        [AllowAnonymous]
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
        [AllowAnonymous]
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

        public class CheckOutRequest
        {
            public int UserId { get; set; }
        }

        [HttpPost("check-in")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckInLegacy([FromBody] CheckInRequest request)
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
            
            var isLate = now.TimeOfDay > standardTime;

            var attendance = new Hrm.Domain.Entities.Attendance
            {
                UserId = userId,
                CheckInTime = now,
                IsLate = isLate,
                LateReason = request.LateReason,
                Note = isLate ? "Đi muộn" : "Đúng giờ",
                CreatedAt = now
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            var legUserNotif = new Notification
            {
                UserId = userId,
                Title = "Check-in (legacy)",
                Message = "Bạn đã điểm danh (check-in)",
                Type = "Attendance",
                MetaJson = JsonSerializer.Serialize(new {
                    messageKey = "attendance.checkin",
                    messageParams = new { attendanceId = attendance.Id },
                    fallback = "Bạn đã điểm danh (check-in)"
                })
            };
            await _notificationService.CreateAndSendAsync(legUserNotif);

            var legRoleNotif = new Notification
            {
                UserId = null,
                Title = "Nhân viên điểm danh",
                Message = $"User {userId} đã check-in",
                Type = "Attendance"
            };
            await _notificationService.CreateAndSendAsync(legRoleNotif, "Manager");

            return Ok(attendance);
        }

        [HttpPost("check-out")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckOutLegacy([FromBody] CheckOutRequest request)
        {
            var userId = request.UserId;
            var today = DateTime.UtcNow.Date;
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.UserId == userId && a.CheckInTime.Date == today);

            if (attendance == null) return BadRequest("No check-in record found for today");
            if (attendance.CheckOutTime != null) return BadRequest("Already checked out today");

            attendance.CheckOutTime = DateTime.UtcNow;
            attendance.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var legUserNotifOut = new Notification
            {
                UserId = userId,
                Title = "Check-out (legacy)",
                Message = "Bạn đã điểm danh (check-out)",
                Type = "Attendance",
                MetaJson = JsonSerializer.Serialize(new {
                    messageKey = "attendance.checkout",
                    messageParams = new { attendanceId = attendance.Id },
                    fallback = "Bạn đã điểm danh (check-out)"
                })
            };
            await _notificationService.CreateAndSendAsync(legUserNotifOut);

            var legRoleNotifOut = new Notification
            {
                UserId = null,
                Title = "Nhân viên điểm danh",
                Message = $"User {userId} đã check-out",
                Type = "Attendance"
            };
            await _notificationService.CreateAndSendAsync(legRoleNotifOut, "Manager");

            return Ok(attendance);
        }

        [HttpGet("regulations")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<SystemSetting>>> GetRegulations()
        {
            return await _context.SystemSettings
                .Where(s => s.Key == "StandardCheckInTime" || s.Key == "StandardCheckOutTime")
                .ToListAsync();
        }

        [HttpPost("regulations")]
        [Authorize(Roles = "Admin,Personnel")]
        public async Task<IActionResult> UpdateRegulations([FromBody] List<SystemSetting> settings)
        {
            foreach (var setting in settings)
            {
                var existing = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == setting.Key);
                if (existing != null)
                {
                    existing.Value = setting.Value;
                    _context.Entry(existing).State = EntityState.Modified;
                }
                else
                {
                    _context.SystemSettings.Add(setting);
                }
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    public class CheckInDto
    {
        public string? Source { get; set; }
        public string? DeviceId { get; set; }
        public string? GeoJson { get; set; }
    }

    public class CorrectionDto
    {
        public DateTime? RequestedCheckIn { get; set; }
        public DateTime? RequestedCheckOut { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ApproveDto
    {
        public bool Approve { get; set; }
        public string? Comment { get; set; }
    }
}


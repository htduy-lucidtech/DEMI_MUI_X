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

            // Create Approval Request
            var user = await _context.Users.Include(u => u.Employee).FirstOrDefaultAsync(u => u.Id == userId);
            var senderName = user?.Employee?.FullName ?? user?.Username ?? "Nhân viên";

            var approvedData = new AttendanceCorrection
            {
                Id = correction.Id,
                UserId = correction.UserId,
                AttendanceId = correction.AttendanceId,
                RequestedCheckIn = correction.RequestedCheckIn,
                RequestedCheckOut = correction.RequestedCheckOut,
                Reason = correction.Reason,
                Status = "Approved",
                CreatedAt = correction.CreatedAt
            };

            var approval = new ApprovalRequest
            {
                RequesterId = userId,
                RequestType = "ATTENDANCE_CORRECTION",
                EntityName = "AttendanceCorrection",
                EntityId = correction.Id.ToString(),
                DataJson = JsonSerializer.Serialize(approvedData),
                Description = $"Sửa chấm công: {senderName} ({correction.CreatedAt.ToShortDateString()})",
                DepartmentId = user?.Employee?.DepartmentId,
                Status = ApprovalStatus.Pending
            };

            _context.ApprovalRequests.Add(approval);
            await _context.SaveChangesAsync();

            var corrRoleNotif = new Notification
            {
                UserId = null,
                Title = "Yêu cầu sửa chấm công",
                Message = $"{senderName} đã gửi yêu cầu sửa chấm công",
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

        [HttpGet]
        public async Task<IActionResult> GetAttendances()
        {
            var userId = GetUserId();
            var isAdminOrHR = User.IsInRole("Admin") || User.IsInRole("Manager") || User.IsInRole("Personnel");

            var query = _context.Attendances
                .Include(a => a.User)
                    .ThenInclude(u => u!.Employee)
                .AsQueryable();

            // TỐI ƯU: Lọc ngay tại database dựa trên quyền hạn
            if (!isAdminOrHR)
            {
                query = query.Where(a => a.UserId == userId);
            }

            var data = await query
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

        [HttpGet("today-status")]
        public async Task<IActionResult> GetTodayStatus()
        {
            var userId = GetUserId();
            var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.UserId == userId && a.CheckInTime.Date == today.Date);

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



        [HttpGet("regulations")]
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


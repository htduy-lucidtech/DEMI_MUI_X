using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Hrm.Service.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Service.Implementations
{
    public class AttendanceService : IAttendanceService
    {
        private readonly HrmDbContext _context;

        public AttendanceService(HrmDbContext context)
        {
            _context = context;
        }

        public async Task<Attendance> CheckInAsync(int userId, string? source = null, string? deviceId = null, string? geoJson = null)
        {
            var now = DateTime.UtcNow;
            var attendance = new Attendance
            {
                UserId = userId,
                CheckInTime = now,
                Source = source,
                DeviceId = deviceId,
                GeoJson = geoJson,
                Status = "Normal",
                CreatedAt = now
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();
            return attendance;
        }

        public async Task<Attendance?> CheckOutAsync(int userId)
        {
            var attendance = await _context.Attendances
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CheckInTime)
                .FirstOrDefaultAsync(a => a.CheckOutTime == null);

            if (attendance == null) return null;

            attendance.CheckOutTime = DateTime.UtcNow;
            // basic worked minutes calc
            if (attendance.CheckOutTime.HasValue)
            {
                attendance.WorkedMinutes = (int)(attendance.CheckOutTime.Value - attendance.CheckInTime).TotalMinutes;
                attendance.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return attendance;
        }

        public async Task<AttendanceCorrection> RequestCorrectionAsync(int userId, DateTime? requestedCheckIn, DateTime? requestedCheckOut, string reason)
        {
            var now = DateTime.UtcNow;
            var correction = new AttendanceCorrection
            {
                UserId = userId,
                RequestedCheckIn = requestedCheckIn,
                RequestedCheckOut = requestedCheckOut,
                Reason = reason,
                Status = "Pending",
                CreatedAt = now
            };

            _context.AttendanceCorrections.Add(correction);
            await _context.SaveChangesAsync();
            return correction;
        }

        public async Task<Attendance?> GetLatestForUserAsync(int userId)
        {
            return await _context.Attendances
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CheckInTime)
                .FirstOrDefaultAsync();
        }

        public async Task<List<AttendanceCorrection>> GetPendingCorrectionsAsync()
        {
            return await _context.AttendanceCorrections
                .Where(c => c.Status == "Pending")
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<AttendanceCorrection?> GetCorrectionByIdAsync(int id)
        {
            return await _context.AttendanceCorrections
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<AttendanceCorrection?> ApproveCorrectionAsync(int correctionId, int approverId, bool approve, string? approverComment = null)
        {
            var correction = await _context.AttendanceCorrections.FirstOrDefaultAsync(c => c.Id == correctionId);
            if (correction == null) return null;

            correction.Status = approve ? "Approved" : "Rejected";
            correction.ApproverId = approverId;
            correction.ApproverComment = approverComment;
            correction.UpdatedAt = DateTime.UtcNow;

            // If approved and linked to an attendance, apply requested times
            if (approve && correction.AttendanceId.HasValue)
            {
                var attendance = await _context.Attendances.FirstOrDefaultAsync(a => a.Id == correction.AttendanceId.Value);
                if (attendance != null)
                {
                    if (correction.RequestedCheckIn.HasValue)
                        attendance.CheckInTime = correction.RequestedCheckIn.Value;
                    if (correction.RequestedCheckOut.HasValue)
                        attendance.CheckOutTime = correction.RequestedCheckOut.Value;
                    attendance.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return correction;
        }
    }
}

using Hrm.Domain.Entities;

namespace Hrm.Service.Interfaces
{
    public interface IAttendanceService
    {
        Task<Attendance> CheckInAsync(int userId, string? source = null, string? deviceId = null, string? geoJson = null);
        Task<Attendance?> CheckOutAsync(int userId);
        Task<AttendanceCorrection> RequestCorrectionAsync(int userId, DateTime? requestedCheckIn, DateTime? requestedCheckOut, string reason);
        Task<Attendance?> GetLatestForUserAsync(int userId);
        Task<List<AttendanceCorrection>> GetPendingCorrectionsAsync();
        Task<AttendanceCorrection?> GetCorrectionByIdAsync(int id);
        Task<AttendanceCorrection?> ApproveCorrectionAsync(int correctionId, int approverId, bool approve, string? approverComment = null);
    }
}

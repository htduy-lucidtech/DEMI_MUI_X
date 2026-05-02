namespace Hrm.Domain.Entities
{
    public class Attendance
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int? ShiftId { get; set; }
        public Shift? Shift { get; set; }
        public DateTime CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public string? Source { get; set; } // web/mobile/biometric
        public string? GeoJson { get; set; }
        public string? DeviceId { get; set; }
        public string? Status { get; set; } // Normal / Excused / Exception
        public int? WorkedMinutes { get; set; }
        public int? LateMinutes { get; set; }
        public int? EarlyMinutes { get; set; }
        public int? OtMinutes { get; set; }
        public string? ApprovedBy { get; set; }
        public string? ApprovalComment { get; set; }
        public string? Note { get; set; }
        public bool IsLate { get; set; }
        public string? LateReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

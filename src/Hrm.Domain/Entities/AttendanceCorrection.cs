namespace Hrm.Domain.Entities
{
    public class AttendanceCorrection
    {
        public int Id { get; set; }
        public int? AttendanceId { get; set; }
        public Attendance? Attendance { get; set; }
        public int UserId { get; set; }
        public DateTime? RequestedCheckIn { get; set; }
        public DateTime? RequestedCheckOut { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending/Approved/Rejected
        public int? ApproverId { get; set; }
        public string? ApproverComment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace Hrm.Domain.Entities
{
    public class LeaveRequest
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public virtual User? User { get; set; }

        [Required]
        public string LeaveType { get; set; } = "Annual"; // Annual, Sick, Personal, Holiday

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public string Reason { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Cancelled

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public string? ApprovedBy { get; set; }
        public string? Comment { get; set; }
    }
}

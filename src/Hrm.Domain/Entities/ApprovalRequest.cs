using System;

namespace Hrm.Domain.Entities
{
    public enum ApprovalStatus
    {
        Pending,
        Approved,
        Rejected,
        Cancelled
    }

    public class ApprovalRequest
    {
        public int Id { get; set; }
        
        public int RequesterId { get; set; }
        public User? Requester { get; set; }

        public string RequestType { get; set; } = string.Empty; // e.g. "PERSONNEL_CREATE", "SALARY_UPDATE"
        public string EntityName { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        
        public string DataJson { get; set; } = string.Empty; // Proposed changes in JSON
        public string? Description { get; set; }

        public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;
        
        public int? ApproverId { get; set; }
        public User? Approver { get; set; }
        
        public string? ApprovalNote { get; set; }
        public DateTime? ActionedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // For Department-level scope
        public int? DepartmentId { get; set; }
    }
}

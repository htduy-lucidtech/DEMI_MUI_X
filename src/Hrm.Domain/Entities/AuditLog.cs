using System;

namespace Hrm.Domain.Entities
{
    public class AuditLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public User? User { get; set; }
        public string Action { get; set; } = string.Empty; // e.g. "Create", "Update", "Delete"
        public string Module { get; set; } = string.Empty; // e.g. "Personnel"
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string? OldValues { get; set; } // JSON string
        public string? NewValues { get; set; } // JSON string
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? IpAddress { get; set; }
    }
}

using System;

namespace Hrm.Domain.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Người nhận
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Type { get; set; } = "Info"; // Info, Warning, Success, Error
    }
}

using System;

namespace Hrm.Domain.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        // Nếu null: thông báo nhắm role hoặc chung
        public int? UserId { get; set; }
        public string? Role { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Type { get; set; } = "Info"; // Info, Warning, Success, Error
        // Thông tin phụ (json) để client dùng khi cần điều hướng/chi tiết
        public string? MetaJson { get; set; }
    }
}

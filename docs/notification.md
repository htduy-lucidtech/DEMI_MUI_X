# Hệ thống Thông báo (Notifications)

Tài liệu này định nghĩa luồng sinh, lưu trữ và truyền phát thông báo trong hệ thống HRM, bao gồm cả thông báo bền vững (persistent) và thời gian thực (realtime).

## 1. Tóm tắt và Cách hoạt động

### Khái niệm chính
- **Persistent Notification**: Bản ghi được lưu trong Database (bảng `Notifications`), cho phép xem lại lịch sử trong danh sách thông báo hoặc chuông thông báo.
- **Realtime Notification**: Sử dụng SignalR để đẩy thông báo ngay lập tức tới trình duyệt của người dùng mà không cần tải lại trang.
- **Nhóm đối tượng**: Thông báo có thể gửi cho một cá nhân cụ thể (`UserId`) hoặc một vai trò cụ thể (`Role`).

### Luồng hoạt động
1. **Phát sinh sự kiện**: Một hành động nghiệp vụ xảy ra (ví dụ: nhân viên nộp đơn nghỉ phép, quản lý duyệt lương).
2. **Lưu Database**: Service tạo bản ghi `Notification` mới với các thông tin: Tiêu đề, Nội dung, Loại (`Type`), và Đối tượng nhận.
3. **Phát SignalR**: Backend gọi `IHubContext` để đẩy event tới các "Groups" tương ứng (`user-{id}` hoặc `role-{name}`).
4. **Xử lý tại Frontend**:
   - `layout.tsx` lắng nghe các event từ `NotificationHub`.
   - Hiển thị Snackbar (thông báo nhanh) cho các sự kiện `ReceiveNotificationShort`.
   - Cập nhật danh sách thông báo và badge cho các sự kiện `ReceiveNotificationFull`.

---

## 2. Chi tiết triển khai vào code

### Cấu trúc dữ liệu (Backend)
Thực thể `Notification` trong `Hrm.Domain/Entities/Notification.cs`:
```csharp
public class Notification {
		public int Id { get; set; }
    public int? UserId { get; set; }     // Gửi cho cá nhân
    public string? Role { get; set; }    // Gửi cho nhóm vai trò
		public string Title { get; set; }
		public string Message { get; set; }
    public string Type { get; set; }      // Ví dụ: "Leave", "Payroll", "Attendance"
		public bool IsRead { get; set; }
		public DateTime CreatedAt { get; set; }
		public string? MetaJson { get; set; }
}
```

- C#: gửi notification đến user/role (service bên server):

```
var notification = new Notification { UserId = userId, Title = title, Message = msg, Type = type, CreatedAt = DateTime.UtcNow };
_context.Notifications.Add(notification);
await _context.SaveChangesAsync();

var shortPayload = new { type = notification.Type, title = notification.Title, message = notification.Message };
var fullPayload = new { id = notification.Id, type = notification.Type, title = notification.Title, message = notification.Message, meta = notification.MetaJson };

if (userId != null) {
		await _hubContext.Clients.Group($"user-{userId}").SendAsync("ReceiveNotificationShort", shortPayload);
		await _hubContext.Clients.Group($"user-{userId}").SendAsync("ReceiveNotificationFull", fullPayload);
} else if (!string.IsNullOrEmpty(role)) {
		await _hubContext.Clients.Group($"role-{role}").SendAsync("ReceiveNotificationShort", shortPayload);
		await _hubContext.Clients.Group($"role-{role}").SendAsync("ReceiveNotificationFull", fullPayload);
}
```

- C#: ví dụ trong Controller (cải thiện `CreateNotification` hiện tại):

```
// thay vì Clients.All.SendAsync(...)
await _hubContext.Clients.Group($"user-{notification.UserId}")
		.SendAsync("ReceiveNotificationShort", new { type = notification.Type, title = notification.Title, message = notification.Message });
```

7. Frontend (Next.js) — kết nối SignalR và xử lý

- Kết nối hub trong `app/(authenticated)/layout.tsx` hoặc provider chung:
  - Lắng nghe `ReceiveNotificationShort` để hiện snackbar.
  - Lắng nghe `ReceiveNotificationFull` để cập nhật danh sách notification (push vào context hoặc refetch API).

- Ví dụ client subscription (TS):

```
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const conn = new HubConnectionBuilder()
	.withUrl('/notificationHub', { accessTokenFactory: () => authToken })
	.configureLogging(LogLevel.Information)
	.build();

conn.on('ReceiveNotificationShort', (payload) => {
	// show snackbar
});

conn.on('ReceiveNotificationFull', (payload) => {
	// add to notification list or refetch
});

await conn.start();
```

8. Payload mẫu

- Short:

```
{ "type": "LeaveApproved", "title": "Đơn nghỉ đã được duyệt", "message": "Đơn nghỉ của bạn cho 01-05 đã được duyệt" }
```

- Full:

```
{ "id": 123, "type": "LeaveApproved", "title": "Đơn nghỉ đã được duyệt", "message": "Xem chi tiết...", "meta": { "leaveId": 456 } }
```

9. Quy tắc mapping role/account

- Nếu sự kiện nhắm đến một cá nhân -> tạo `Notification.UserId` và gửi đến `user-{id}`.
- Nếu sự kiện nhắm nhóm role -> tạo `Notification.Role` (hoặc tạo bản ghi cho mỗi user trong role tuỳ yêu cầu), gửi tới `role-{roleName}`.
- Badge count (unread) có thể tính realtime bằng cách gửi `ReceiveNotificationCount` hoặc client gọi API `GET /api/Notifications/user/{id}`.

10. Gợi ý cải thiện hiện tại (kế hoạch thực thi)

- Thay `Clients.All.SendAsync(...)` trong `NotificationsController.CreateNotification` bằng gửi đến `Group("user-{id}")` hoặc `Group("role-{role}")`.
- Tạo service server `INotificationService` để gom logic tạo record + gửi hub.
- FE: khi nhận `ReceiveNotificationShort` chỉ hiển thị snackbar; khi nhận `ReceiveNotificationFull` cập nhật store và tăng badge.

11. Ví dụ cURL tạo notification (testing)

```
curl -X POST https://localhost:5001/api/Notifications \
 -H "Content-Type: application/json" \
 -d '{ "userId": 5, "title": "Test", "message": "Thông báo test", "type": "Test" }'
```

Kết luận: cơ sở đã có (SignalR hub và service FE), cần chuẩn hoá payload/event, gửi vào nhóm cụ thể, tách service tạo record + gửi hub, và cập nhật docs này làm chuẩn cho dev khác.

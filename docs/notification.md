Mô tả luồng thông báo (send/receive) theo role và account

Mục tiêu: định nghĩa rõ ràng cách sinh, lưu, phát và nhận thông báo realtime và persistent
đối với các Role (ví dụ: Admin, Manager, Employee, ...) và các account (user).

1. Khái niệm chính

- **Notification (entity)**: bản ghi persistent trong DB dùng để hiện trong UI (bell, history).
  - Fields gợi ý: `Id`, `UserId` (nullable nếu gửi cho role), `Role` (nullable), `Title`, `Message`, `Type`, `IsRead`, `CreatedAt`, `Meta` (JSON).
- **Realtime short / full**:
  - `short`: thông báo ngắn (snackbar) chỉ cần message/tóm tắt, dùng để hiển thị nhanh.
  - `full`: payload đầy đủ, dùng để mở modal/chi tiết hoặc điều hướng.

2. Nhóm SignalR (grouping)

- `user-{userId}`: nhóm cho từng người dùng (kết nối cá nhân).
- `role-{roleName}`: nhóm cho từng role (ví dụ: `role-Manager`).

3. Các event SignalR (server -> client)

- `ReceiveNotificationShort` (payload: `{ type, title, message, meta? }`) — dùng để hiển thị snackbar.
- `ReceiveNotificationFull` (payload: `{ id, type, title, message, meta? }`) — dùng để cập nhật UI chi tiết và lịch sử.
- (tuỳ chọn) `ReceiveNotificationCount` (payload: `{ unread: number }`) — cập nhật badge.

4. Luồng gửi thông báo (tổng quát)

- 1. Một hành động hệ thống xảy ra (ví dụ: leave approved).
- 2. Service nghiệp vụ tạo `Notification` record trong DB (gán `UserId` hoặc `Role`).
- 3. Service gọi `IHubContext<NotificationHub>` gửi:
  - Nếu gửi đến user: `_hubContext.Clients.Group($"user-{userId}").SendAsync("ReceiveNotificationShort", shortPayload);`
  - Nếu gửi đến role: `_hubContext.Clients.Group($"role-{roleName}").SendAsync("ReceiveNotificationShort", shortPayload);`
- 4. Client nhận event: hiển thị snackbar, gọi API lấy danh sách notification (tuỳ cấu hình) hoặc đồng bộ cục bộ.

5. Lưu ý hiện tại trong repo

- `src/Hrm.Api/Hubs/NotificationHub.cs` đã thêm connection vào nhóm `user-{id}` và `role-{roleName}`.
- `src/Hrm.Api/Controllers/NotificationsController.cs` tạo record và hiện đang broadcast với `Clients.All.SendAsync("ReceiveNotification", ...)`.
  - Đề xuất: gửi thẳng vào nhóm cụ thể thay vì `All`.
- FE có `web/services/notification.service.ts` và `useRealtime.ts` / context để nhận events.

6. Đề xuất API & snippets

- Notification entity (C#) gợi ý:

```
public class Notification {
		public int Id { get; set; }
		public int? UserId { get; set; }
		public string? Role { get; set; }
		public string Title { get; set; }
		public string Message { get; set; }
		public string Type { get; set; } // e.g. "LeaveApproved", "Payroll"
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

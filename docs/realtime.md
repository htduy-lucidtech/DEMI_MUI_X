# Thông báo Thời gian thực (Realtime Notifications)

Tài liệu này mô tả cơ chế và cách triển khai các thông báo thời gian thực trong hệ thống HRM sử dụng SignalR.

## 1. Tóm tắt và Cách hoạt động

### Công nghệ sử dụng
- **Backend**: SignalR Hub (`/notificationHub`).
- **Frontend**: `@microsoft/signalr` kết hợp với Custom Events và React Hooks.

### Luồng hoạt động
1. **Kết nối**: Khi người dùng đăng nhập, `AuthenticatedLayout` khởi tạo kết nối SignalR tới Server.
2. **Lắng nghe**: Client lắng nghe các sự kiện như `ReceiveNotificationShort` và `ReceiveNotificationFull` từ Server.
3. **Phát tán (Dispatch)**: Khi có sự kiện từ SignalR, Client sẽ phát đi một `CustomEvent` của trình duyệt (`notification:short` hoặc `notification:full`).
4. **Tiêu thụ (Consume)**: Các Component/Page sử dụng hook `useRealtimeRefresh` để đăng ký lắng nghe các Custom Event này và thực hiện hành động tương ứng (ví dụ: tải lại dữ liệu).

---

## 2. Chi tiết triển khai vào code

### Phía Server (Backend)
SignalR Hub được cấu hình tại `src/Hrm.Api/Hubs/NotificationHub.cs` và đăng ký tại `Program.cs`. Server đẩy thông báo tới các nhóm (Groups) dựa trên UserId hoặc Role.

### Phía Client (Frontend)

#### Kết nối SignalR
Logic kết nối chính nằm trong `web/app/(authenticated)/layout.tsx`:
```typescript
const newConnection = new signalR.HubConnectionBuilder()
  .withUrl(hubUrl, { accessTokenFactory: () => token })
  .withAutomaticReconnect()
  .build();

newConnection.on("ReceiveNotificationShort", (message) => {
  // 1. Hiển thị Snackbar nhanh
  // 2. Dispatch event cho toàn hệ thống
  window.dispatchEvent(new CustomEvent("notification:short", { detail: { message } }));
});
```

#### Sử dụng Hook `useRealtimeRefresh`
Đây là cách tối ưu nhất để thực hiện logic realtime tại các Page/Component.

**Cú pháp:**
```tsx
import useRealtimeRefresh from '@/lib/useRealtime';

export default function MyPage() {
  const fetchData = async () => { /* logic lấy dữ liệu */ };

  // Tự động fetch lại dữ liệu khi có bất kỳ thông báo 'short' nào
  useRealtimeRefresh(() => {
    fetchData();
  }, ["short"]);

  // Hoặc xử lý dựa trên payload
  useRealtimeRefresh((detail) => {
    if (detail?.message?.type === "SpecificType") {
      fetchData();
    }
  }, ["short"]);
}
```

### Các sự kiện chuẩn
- `notification:short`: Dùng cho các thông báo nhanh, yêu cầu UI cập nhật dữ liệu ngay lập tức.
- `notification:full`: Dùng cho các thông báo chi tiết, có thể kèm theo điều hướng hoặc mở modal.

---
*Lưu ý: Luôn sử dụng `useRealtimeRefresh` thay vì tự đăng ký event listener thủ công để đảm bảo cleanup memory và tính nhất quán.*

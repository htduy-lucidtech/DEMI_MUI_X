# Kế hoạch triển khai Notification (Realtime + Persistent)

Mục tiêu: Hoàn thiện luồng tạo, lưu, gửi và nhận thông báo theo role và user, đảm bảo realtime (SignalR) và persistent (DB + API).

## Phạm vi

- Backend: chuẩn hoá entity, service, controller, hub.
- Frontend: subscribe SignalR events, hiển thị snackbar, cập nhật notification list và badge.
- Kiểm thử: unit/integration + kiểm tra thủ công (cURL / UI).

## Các bước triển khai (tổng quan)

1. Chuẩn hoá model Notification
   - `Notification.UserId` nullable, `Role`, `MetaJson`.
   - Migrate nếu cần (EF migrations).
2. Tách logic gửi notification vào service
   - `INotificationService` + `NotificationService` (đã thêm vào `Hrm.Api/Services`).
3. Sửa controller để dùng service
   - `NotificationsController.CreateNotification(...)` gọi `CreateAndSendAsync`.
4. Gửi đúng nhóm SignalR
   - Gửi tới `user-{id}` khi có `UserId`.
   - Gửi tới `role-{role}` khi gửi role; tuỳ chọn: tạo record riêng cho từng user trong role.
5. Frontend
   - Kết nối hub trong `app/(authenticated)/layout.tsx` hoặc `NotificationProvider`.
   - Lắng nghe `ReceiveNotificationShort` (snackbar) và `ReceiveNotificationFull` (cập nhật danh sách).
   - Khi nhận full, push vào store/local state hoặc refetch `GET /api/Notifications/user/{id}`.
6. Tests & Manual QA
   - Unit test cho `NotificationService` (mock `IHubContext`).
   - Manual: POST test notification + kiểm tra snackbar và badge.

## Chi tiết kỹ thuật & file cần thay đổi

- Backend:
  - `src/Hrm.Domain/Entities/Notification.cs` (model) — đã cập nhật.
  - `src/Hrm.Api/Services/NotificationService.cs` — implement service (đã thêm).
  - `src/Hrm.Service/Interfaces/INotificationService.cs` — interface (đã thêm).
  - `src/Hrm.Api/Controllers/NotificationsController.cs` — sử dụng service (đã cập nhật).
  - `src/Hrm.Api/Hubs/NotificationHub.cs` — giữ nguyên (đăng ký groups).
  - `src/Hrm.Api/Program.cs` — đăng ký DI.

- Frontend:
  - `web/app/(authenticated)/layout.tsx` hoặc `web/app/(authenticated)/context/NotificationContext.tsx` — connect hub.
  - `web/services/notification.service.ts` — API calls (hiện có).
  - `web/app/components/layout/Navbar.tsx` — hiển thị badge + menu (hiện có logic lấy notifications).

## Payload & Event chuẩn

- `ReceiveNotificationShort`: `{ type, title, message, meta? }`
- `ReceiveNotificationFull`: `{ id, type, title, message, meta? }`

## Các lệnh thử nghiệm nhanh (manual)

1. Start API

```powershell
cd src\Hrm.Api
dotnet run
```

2. Start FE

```bash
cd web
npm run dev
```

3. Tạo notification test

```bash
curl -X POST https://localhost:5001/api/Notifications \
 -H "Content-Type: application/json" \
 -d '{ "userId": 5, "title": "Test", "message": "Thông báo test", "type": "Test" }'
```

## Rollout & Backwards compatibility

- Nếu DB đã có dữ liệu, `UserId` nullable không gây lỗi; nếu cần migrate để thêm `Role` hoặc `MetaJson`, tạo migration.
- Client cũ vẫn nhận `ReceiveNotification` nếu cần tạm thời; ưu tiên chuyển sang `ReceiveNotificationShort/Full`.

## Thời gian ước tính

- Backend (model + service + controller): 1-2 giờ
- Frontend (hub + snackbar + list update): 2-3 giờ
- Tests + QA: 1-2 giờ

---

Nếu bạn đồng ý, tôi sẽ bắt đầu thực hiện bước Frontend: kết nối SignalR trong `app/(authenticated)/layout.tsx` và hiển thị snackbar khi nhận `ReceiveNotificationShort`.

## Các luồng Notification (mapping chi tiết)

Phần này liệt kê các sự kiện chính trong hệ thống, nơi tạo notification (controller/service), người nhận và loại payload gửi realtime.

- **Tạo đơn nghỉ phép (Leave Request created)**
  - Gọi từ: `src/Hrm.Api/Controllers/LeaveRequestsController.cs` khi user nộp đơn.
  - Tạo record: `INotificationService.CreateAndSendAsync(...)` (via service layer).
  - Người nhận: `Manager` của phòng (role `Manager`), `Personnel` (role `Personnel`), và `Admin` (role `Admin`) — tuỳ cấu hình tổ chức.
  - Realtime events: `ReceiveNotificationShort` (snackbar cho các role), `ReceiveNotificationFull` (chi tiết + link tới đơn).

- **Đơn nghỉ được duyệt / từ chối (Leave Approved/Rejected)**
  - Gọi từ: service xử lý phê duyệt trong `LeaveRequestsController` hoặc dịch vụ tương ứng.
  - Người nhận: `User` (người nộp đơn) — gửi vào `user-{userId}`.
  - Payload: short (thông báo nhanh) + full (chi tiết, meta chứa `leaveId`).

- **Yêu cầu sửa chấm công (Attendance correction requested)**
  - Gọi từ: `AttendanceService` / `AttendanceController` khi nhân viên gửi yêu cầu.
  - Người nhận: `Attendance` role và `Manager`/`Personnel` tuỳ workflow.
  - Payload: short để thông báo kịp thời, full để xem form sửa.

- **Kết quả sửa chấm công (Approved/Rejected)**
  - Gọi từ: `AttendanceService.ApproveCorrectionAsync`.
  - Người nhận: `User` (chủ yêu cầu) — `user-{id}`.

- **Bảng lương / Payroll published**
  - Gọi từ: `PayrollController` khi bảng lương được duyệt/đăng.
  - Người nhận: `User` (tất cả nhân viên trong tháng) hoặc role `Employee` / `Manager` tuỳ phạm vi.

- **Tạo nhân viên / user mới**
  - Gọi từ: `UsersController` hoặc service tạo user.
  - Người nhận: `Admin` / `Personnel` (thông báo về user mới), hoặc `User` (welcome message).

- **Công tác tuyển dụng (New Candidate / Offer)**
  - Gọi từ: `RecruitmentController`.
  - Người nhận: `Recruiter`/`Manager`/`Personnel` (role tương ứng).

- **Cập nhật performance / review assigned**
  - Gọi từ: `PerformanceReviewsController`.
  - Người nhận: `User` (reviewee), `Manager` (reviewer).

Ghi chú chung:

- Ở mỗi điểm trigger, ưu tiên gọi `INotificationService` để tạo record và gửi realtime.
- Quy tắc mapping role: lấy `User.Role` từ `src/Hrm.Domain/Entities/User.cs` và nhóm SignalR `role-{role}`.
- Nếu cần gửi cho từng cá nhân trong role, `NotificationService` hiện đã hỗ trợ tạo bản ghi cho mỗi user trong role trước khi gửi group event.

---

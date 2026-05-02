Checklist triển khai nghiệp vụ Chấm công (Tiếng Việt)

Mục tiêu: Mô tả chi tiết các ràng buộc, API, DB, realtime và yêu cầu FE/BE để dev có thể triển khai hệ thống chấm công đầy đủ và chính xác.

1. Tổng quan nghiệp vụ

- Mục đích: Ghi nhận check-in / check-out của nhân viên theo ca, tính toán: thời gian làm việc, phút trễ, phút về sớm, OT, break, và tạo luồng duyệt cho sửa đổi/ngoại lệ.
- Quy tắc chính: ca cố định/ca xoay, grace period, làm tròn, breaks, OT phải được duyệt khi cần.

2. Các ràng buộc nghiệp vụ (chi tiết)

- Ca (Shift): có `startTime`, `endTime`, `breaks` (danh sách thời gian nghỉ), `type` (day/night), `minShiftLength`, `maxContinuousWork`.
- Cửa check-in/out: cho phép check-in trong khoảng [shift.start - preWindow, shift.end + postWindow].
- Grace period: N phút (cấu hình) — nếu check-in muộn <= grace thì không tính penalty.
- Late/Early calculation: `lateMinutes = max(0, actualCheckIn - shift.start - grace)`; `earlyMinutes = max(0, shift.end - actualCheckOut)`.
- Rounding: làm tròn phút theo bước (5/10/15 phút) — cấu hình.
- Breaks: nếu break bắt buộc, trừ tự động; nếu không check-out/check-in giữa break thì flag exception.
- OT: chỉ tính khi làm việc vượt quá `shift.end + otThreshold`; OT có thể cần duyệt; phân loại OT thường/ngày lễ.
- Duplicate events: chặn check-in/checkout lặp trong window nhỏ (ví dụ 1 phút).
- Shift cross-day: xử lý khi `endTime` < `startTime` (qua ngày tiếp theo) — chuẩn hóa lưu UTC + store shift date range.
- Leave interaction: nếu đơn nghỉ (leave) trùng thời gian, check-in tự bị chặn hoặc tự động gán `excused`.
- Geo/device constraints: tuỳ chọn geofence (lat/lng + radius) hoặc allow-list các device id.
- Manual edits: chỉ qua API `correction` kèm lý do và require approver; lưu audit trail (who, when, old/new).

3. Thiết kế DB (gợi ý)

- Bảng `Shifts` (shift mẫu): id, name, startTime (time), endTime (time), timezone, breaks(json), graceMinutes, roundMinutes, createdAt, updatedAt.
- Bảng `Attendance`:
  - id, userId, shiftId (nullable), checkIn (timestamp UTC), checkOut (timestamp UTC), source (web/mobile/biometric), geo (json), deviceId, status (Normal/Excused/Exception), approvedBy, approvalComment, createdAt, updatedAt
  - derived fields (optional stored): workedMinutes, lateMinutes, earlyMinutes, otMinutes
- Bảng `AttendanceCorrections`: id, attendanceId (nullable), userId, requestedCheckIn, requestedCheckOut, reason, status (Pending/Approved/Rejected), approverId, approverComment, createdAt, updatedAt
- Bảng `AttendanceConfigs` (global/tenant): defaultGrace, roundStep, preWindow, postWindow, otThreshold, holidayRules
- Audit logs: `AttendanceEventsLog` lưu mọi hành động (checkin/checkout/correction/edit) với who/when/ip/device

4. API endpoints (gợi ý)

- POST /api/attendance/checkin
  - body: { userId?, shiftId?, timestamp?, geo?, deviceId? }
  - server: validate token/user, resolve shift (if not provided), validate window, detect duplicate, store checkIn
  - response: attendance record, notifications
- POST /api/attendance/checkout
  - body: { userId?, attendanceId?, timestamp?, geo?, deviceId? }
  - server: match to last open attendance for user (same day/shift), set checkOut, compute derived fields, trigger OT calculation
- GET /api/attendance?userId=&date=
  - trả về danh sách hoặc ngày cụ thể, kèm derived fields
- POST /api/attendance/correction
  - body: { attendanceId?, requestedCheckIn, requestedCheckOut, reason }
  - tạo request vào `AttendanceCorrections` (Pending)
- PATCH /api/attendance/correction/{id}/status
  - body: { status, approverId, approverComment } — require role Personnel/Manager
- GET /api/attendance/report?from=&to=&userId=
  - trả báo cáo cho payroll

5. Server-side validation & calculation

- Luôn tính trên server (single source of truth). Không tin client time.
- Tính toán: workedMinutes, lateMinutes, earlyMinutes, otMinutes, round theo config.
- Xử lý cross-day: quy về UTC, tính khoảng thời gian chính xác giữa timestamps.
- Nếu checkIn/checkOut không hợp lệ (outside window), trả lỗi kèm code và message business.
- Nếu có leave request trùng thời gian, trả status `excused` hoặc chặn tùy chính sách.

6. Realtime & thông báo

- SignalR hub groups: `user-{id}` và `role-{roleName}`.
- Sự kiện cần broadcast:
  - `AttendanceCheckedIn` (short) → nhóm user và role (Attendance/Personnel/Manager) nếu cấu hình notify
  - `AttendanceCheckedOut` (short)
  - `AttendanceCorrectionRequested` (short + full) → role Personnel/Manager
  - `AttendanceCorrectionApproved/Rejected` → user
- FE: layout kết nối hub với JWT; dispatch DOM event hoặc dùng `NotificationProvider` để các page subscribe.

7. Frontend (FE) yêu cầu

- Nút check-in / check-out: hiển thị trạng thái, disable nếu ngoài window hoặc đang có leave.
- Hiển thị real-time notifications (snackbar) và cập nhật bảng (fetch lại khi event đến).
- Trang attendance user: show history, status, ability to request correction.
- Trang manager/personnel: show pending corrections, approve/reject, filter theo date/user.
- Audit UI: hiển thị `approvedBy`, `approvalComment`, `createdAt`.

8. Approval workflow

- Correction/OT/Manual edits require approver (Personnel/Manager/Admin).
- Approver can edit attendance but chừa audit trail.
- Notifications sent on request/approval/rejection.

9. Jobs / Batch processing

- Job hàng đêm/periodic để:
  - tổng hợp OT cho payroll,
  - detect anomalies (missing checkout, suspicious short shifts),
  - recalc derived fields if configs thay đổi.

10. Testing cases (must có)

- Normal day checkin/out on-time
- Late check-in within grace / beyond grace
- Early checkout
- Overnight shift checkin day1 checkout day2
- Duplicate checkin / rapid toggles
- Leave overlapping with shift
- Correction request → approve/reject flows
- OT calculation edge cases (work til boundary, exact threshold)
- Timezone change / DST

11. Security & operational

- Lưu timestamps UTC; hiển thị bằng local của user.
- Rate-limit endpoints (prevent spam check-ins).
- Validate JWT and user identity server-side.
- Log and store IP/device for forensic.

12. Deliverables cho dev

- Migration SQL/EF model cho `Attendance`, `AttendanceCorrections`, `Shifts`, `AttendanceConfigs`.
- API controllers + service layer (business logic separated) + unit tests.
- SignalR notifications integration and sample FE handler.
- FE components: CheckInButton, CheckOutButton, AttendanceTable, CorrectionDialog, ManagerApprovalPanel.
- Docs: README triển khai cấu hình (grace, rounding, windows), Postman collection sample requests.

13. Ưu tiên triển khai (MVP)

- M1: Check-in / Check-out cơ bản (server validation, store UTC), Attendance history user
- M2: Late/early calculation, basic rounding, display in UI
- M3: Corrections with approval workflow
- M4: OT calculation & nightly job
- M5: Geo/device rules, advanced reporting

---

Ghi chú: Tôi có thể tạo migration mẫu (EF Core) và skeleton API + FE components nếu bạn muốn. Bạn muốn tôi bắt đầu với phần nào (tạo migration mẫu / triển khai API checkin/checkout / xây component FE)?

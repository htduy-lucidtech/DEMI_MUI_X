# Hệ thống Chấm công (Attendance)

Tài liệu này mô tả chi tiết nghiệp vụ, cấu trúc dữ liệu và cách triển khai hệ thống chấm công trong HRM.

## 1. Tóm tắt và Cách hoạt động

### Mục tiêu
Ghi nhận chính xác thời gian vào (check-in) và ra (check-out) của nhân viên, từ đó tính toán công xá, đi muộn, về sớm và tăng ca (OT).

### Quy tắc nghiệp vụ chính
- **Ca làm việc (Shift)**: Xác định thời gian bắt đầu và kết thúc tiêu chuẩn. Hỗ trợ ca gãy và ca qua đêm.
- **Grace Period (Thời gian ân hạn)**: Khoảng thời gian cho phép đi muộn mà không bị tính là vi phạm (ví dụ: 15 phút).
- **Làm tròn (Rounding)**: Làm tròn thời gian chấm công theo bước (ví dụ: 5 hoặc 15 phút) để đơn giản hóa tính toán lương.
- **Chỉnh sửa (Correction)**: Cho phép nhân viên gửi yêu cầu điều chỉnh dữ liệu chấm công khi có sai sót, cần được cấp quản lý duyệt.

### Luồng hoạt động
1. **Chấm công**: Nhân viên thực hiện Check-in/Check-out trên giao diện web. Hệ thống ghi lại thời điểm UTC và thông tin thiết bị/vị trí.
2. **Tính toán**: Server tự động tính toán số phút đi muộn, về sớm và tổng giờ làm việc dựa trên cấu hình ca.
3. **Phê duyệt**: Các yêu cầu chỉnh sửa hoặc tăng ca được gửi tới quản lý/nhân sự để xét duyệt realtime.
4. **Báo cáo**: Dữ liệu sau khi chốt sẽ được dùng làm căn cứ tính lương (Payroll).

---

## 2. Chi tiết triển khai vào code

### Cấu trúc dữ liệu (Backend)
Các bảng chính trong Database:
- `Attendances`: Lưu dữ liệu chấm công thực tế.
- `Shifts`: Định nghĩa các ca làm việc mẫu.
- `AttendanceCorrections`: Lưu các yêu cầu điều chỉnh chấm công.
- `AttendanceConfigs`: Lưu cấu hình chung (thời gian ân hạn, quy tắc làm tròn).

### Logic tính toán (Server-side)
Toàn bộ việc tính toán số phút trễ (`LateMinutes`) và về sớm (`EarlyMinutes`) được thực hiện tại Backend để đảm bảo tính trung thực.
```csharp
// Ví dụ tính toán trễ
lateMinutes = max(0, actualCheckIn - shift.start - graceMinutes);
```

### Chức năng Realtime
Sử dụng SignalR để thông báo cho quản lý khi có yêu cầu chỉnh sửa mới. Trang quản lý sẽ tự động làm mới danh sách nhờ hook `useRealtimeRefresh`.

### Các Component Frontend chính
- `AttendancePanel`: Hiển thị lịch sử chấm công cá nhân.
- `CheckInButton / CheckOutButton`: Nút bấm thực hiện chấm công với logic kiểm tra điều kiện (ngoài giờ, đã chấm hay chưa).
- `CorrectionsPanel`: Giao diện duyệt các yêu cầu điều chỉnh chấm công.

### API Endpoints
- `POST /api/Attendance/checkin`: Thực hiện vào ca.
- `POST /api/Attendance/checkout`: Thực hiện ra ca.
- `GET /api/Attendance/corrections`: Lấy danh sách yêu cầu cần duyệt.
- `POST /api/Attendance/correction/{id}/approve`: Duyệt điều chỉnh.

---
*Lưu ý: Luôn sử dụng thời gian Server (UTC) để ghi nhận, không tin tưởng thời gian gửi lên từ trình duyệt của Client.*

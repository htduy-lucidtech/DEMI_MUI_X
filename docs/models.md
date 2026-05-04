# Mô hình Dữ liệu (Core Models)

Dưới đây là các thực thể chính trong hệ thống HRM và các trường dữ liệu quan trọng, đã được cập nhật theo kiến trúc tính lương theo giờ.

## 1. Nhân sự (Employee)
- `Id`: Định danh duy nhất.
- `FullName`: Họ và tên.
- `Email`: Địa chỉ email công việc.
- `Position`: Chức vụ hiện tại.
- `DepartmentId`: ID phòng ban (FK).
- `BaseSalary`: Lương cơ bản tháng (dùng để tham chiếu).
- `HourlyRate`: Mức lương tính theo giờ làm việc thực tế.
- `HourlyRateOT`: Mức lương tính cho mỗi giờ tăng ca (thường = 1.5x HourlyRate).
- `Allowance`: Phụ cấp cố định.
- `Account`: Thông tin tài khoản đăng nhập (liên kết 1-1 với User).

## 2. Chấm công (Attendance)
- `UserId`: ID người dùng (FK).
- `CheckInTime`: Thời gian vào thực tế.
- `CheckOutTime`: Thời gian ra thực tế.
- `IsLate`: Đánh dấu đi muộn so với quy định.
- `LateReason`: Lý do đi muộn.
- `WorkedMinutes`: Tổng số phút làm việc trong ngày (tính từ CheckIn đến CheckOut).
- `OtMinutes`: Số phút làm việc ngoài giờ (vượt quá 8h tiêu chuẩn hoặc sau khung giờ quy định).

## 3. Chỉnh sửa chấm công (AttendanceCorrection)
- `UserId`: Người gửi yêu cầu chỉnh sửa.
- `AttendanceId`: ID bản ghi chấm công gốc (nếu có).
- `RequestedCheckIn` / `RequestedCheckOut`: Thời gian mong muốn điều chỉnh.
- `Reason`: Lý do yêu cầu chỉnh sửa.
- `Status`: Trạng thái duyệt (`Pending`, `Approved`, `Rejected`).
- `ApproverId`: Người duyệt yêu cầu.

## 4. Nghỉ phép (LeaveRequest)
- `UserId`: Người gửi yêu cầu.
- `LeaveType`: Loại nghỉ (Annual, Sick, Personal).
- `StartDate` / `EndDate`: Khoảng thời gian nghỉ.
- `Status`: Trạng thái (`Pending`, `Approved`, `Rejected`).

## 5. Tuyển dụng (Recruitment)
- `JobPosting`: Thông tin tin tuyển dụng (Vị trí, Lương, Hạn nộp).
- `Candidate`: Thông tin ứng viên và trạng thái quy trình tuyển dụng.

## 6. Thông báo (Notification)
- `UserId`: Người nhận đích danh.
- `Type`: Loại thông báo (`Info`, `Success`, `Warning`, `Error`).
- `CreatedAt`: Thời gian tạo thông báo.

---
*Lưu ý: Thực thể Contract đã được loại bỏ để chuyển sang mô hình tính lương linh hoạt theo giờ.*

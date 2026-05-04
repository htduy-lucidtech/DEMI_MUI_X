# Mô hình Dữ liệu (Core Models)

Dưới đây là các thực thể chính trong hệ thống HRM và các trường dữ liệu quan trọng.

## 1. Nhân sự (Employee)
- `Id`: Định danh duy nhất.
- `FullName`: Họ và tên.
- `Email`: Địa chỉ email công việc.
- `Position`: Chức vụ hiện tại.
- `DepartmentId`: ID phòng ban (FK).
- `BaseSalary`: Lương cơ bản.
- `Allowance`: Phụ cấp.
- `Account`: Thông tin tài khoản đăng nhập (liên kết 1-1 với User).

## 2. Chấm công (Attendance)
- `UserId`: ID người dùng (FK).
- `CheckInTime`: Thời gian vào.
- `CheckOutTime`: Thời gian ra.
- `IsLate`: Đánh dấu đi muộn.
- `LateReason`: Lý do đi muộn.

## 3. Nghỉ phép (LeaveRequest)
- `UserId`: Người gửi yêu cầu.
- `LeaveType`: Loại nghỉ (Annual, Sick, Personal).
- `StartDate` / `EndDate`: Khoảng thời gian nghỉ.
- `Status`: Trạng thái (Pending, Approved, Rejected).

## 4. Tuyển dụng (Recruitment)
- `JobPosting`: Thông tin tin tuyển dụng.
- `Candidate`: Thông tin ứng viên và trạng thái hồ sơ.

## 5. Thông báo (Notification)
- `UserId`: Người nhận (null nếu gửi cho Role).
- `Role`: Vai trò nhận (null nếu gửi cho cá nhân).
- `Type`: Loại thông báo (Info, Success, Warning, Error).
- `MetaJson`: Dữ liệu bổ sung dưới dạng JSON (dùng để truyền link hoặc ID liên quan).

---
*Lưu ý: Thực thể Contract đã được loại bỏ để đơn giản hóa hệ thống theo yêu cầu tối ưu hóa.*

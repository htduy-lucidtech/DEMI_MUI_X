# ✨ Tính năng & Nghiệp vụ (Features)

Tài liệu này chi tiết các tính năng nghiệp vụ cốt lõi và các cơ chế kỹ thuật hỗ trợ trải nghiệm người dùng trong HRM Pro.

## 1. Hệ thống Chấm công (Attendance)
Ghi nhận và tính toán công xá dựa trên thời gian làm việc thực tế của nhân viên.
- **Check-in/out**: Ghi nhận thời gian Server (UTC) để đảm bảo tính trung thực.
- **Tính toán tự động**: Backend tự động tính số phút đi muộn (Late), về sớm (Early) và tổng số phút làm việc thực tế.
- **Duyệt điều chỉnh (Correction)**: Cho phép nhân viên gửi yêu cầu sửa dữ liệu chấm công khi quên hoặc sai sót.

---

## 2. Thông báo & Realtime (SignalR)
Hệ thống sử dụng **SignalR** để tạo ra trải nghiệm ứng dụng thời gian thực.
- **Cơ chế**: Backend phát tín hiệu qua `NotificationHub` -> Frontend Layout nhận và hiển thị Snackbar + phát Custom Event `notification:short`.
- **Auto-refresh**: Các trang sử dụng hook `useRealtimeRefresh` để tự động tải lại dữ liệu khi có thay đổi liên quan mà không cần F5.

---

## 3. Quản lý Nghỉ phép (Leave Management)
- **Đăng ký nghỉ**: Hỗ trợ nhiều loại nghỉ (Phép năm, Nghỉ ốm, Việc riêng).
- **Quy trình phê duyệt**: Đơn nghỉ sau khi nộp sẽ ở trạng thái `Pending` và gửi thông báo Realtime tới quản lý.

---

## 4. Tuyển dụng (Recruitment)
- **Job Posting**: Quản lý tin tuyển dụng và vị trí cần tuyển.
- **Candidate Tracking**: Quản lý thông tin ứng viên và trạng thái quy trình phỏng vấn.

---

## 5. Giao diện & Layout
Sử dụng **Material UI v6** với thiết kế hiện đại, hỗ trợ Responsive đầy đủ trên Mobile và Desktop. Sidebar thông minh hỗ trợ thu gọn để tối ưu diện tích làm việc.

# ✨ Tính năng Hệ thống (System Features)

Tài liệu này chi tiết các tính năng nghiệp vụ cốt lõi và các cơ chế kỹ thuật hỗ trợ trải nghiệm người dùng trong HRM Pro.

## 1. Hệ thống Chấm công (Attendance)

Hệ thống ghi nhận và tính toán công xá dựa trên thời gian làm việc thực tế của nhân viên.

- **Check-in/out**: Ghi nhận thời gian Server (UTC) để đảm bảo tính trung thực.
- **Tính toán tự động**: Backend tự động tính số phút đi muộn (Late), về sớm (Early) và tổng số phút làm việc thực tế.
- **Duyệt điều chỉnh (Correction)**: Cho phép nhân viên gửi yêu cầu sửa dữ liệu chấm công khi quên hoặc sai sót. Quản lý duyệt thông qua giao diện `CorrectionsPanel`.

---

## 2. Thông báo & Realtime (SignalR)

Hệ thống sử dụng **SignalR** để tạo ra trải nghiệm ứng dụng "Sống" (Alive).

### Cơ chế hoạt động:
1. **Backend**: Phát tín hiệu thông qua `NotificationHub` tới cá nhân hoặc nhóm vai trò.
2. **Frontend Layout**: Lắng nghe tín hiệu và hiển thị Snackbar (thông báo nhanh).
3. **Custom Events**: Khi nhận tín hiệu, Layout phát đi một Event toàn hệ thống (`notification:short`).
4. **Auto-refresh**: Các trang (Nhân sự, Chấm công, Lương) sử dụng hook `useRealtimeRefresh` để tự động tải lại dữ liệu khi có thông báo liên quan mà không cần F5.

---

## 3. Quản lý Nghỉ phép (Leave Management)

- **Đăng ký nghỉ**: Hỗ trợ nhiều loại nghỉ (Phép năm, Nghỉ ốm, Việc riêng).
- **Quy trình phê duyệt**: Đơn nghỉ sau khi nộp sẽ ở trạng thái `Pending`. Quản lý sẽ nhận được thông báo Realtime để duyệt hoặc từ chối.
- **Tính toán số dư**: (Đang phát triển) Tự động trừ số ngày nghỉ vào quỹ phép năm của nhân viên.

---

## 4. Tuyển dụng (Recruitment)

- **Job Posting**: Quản lý tin tuyển dụng, vị trí cần người và hạn nộp hồ sơ.
- **Candidate Tracking**: Quản lý thông tin ứng viên và cập nhật trạng thái theo từng giai đoạn (Phỏng vấn, Thử việc, Đạt/Trượt).

---

## 5. Dashboard & Báo cáo

- **Thống kê tổng quan**: Hiển thị biểu đồ và các chỉ số quan trọng tại trang chủ (Số nhân viên đang làm việc, tỷ lệ đi muộn, đơn nghỉ cần duyệt).
- **Responsive Tables**: Sử dụng MUI DataGrid với khả năng phân trang, lọc và sắp xếp dữ liệu mạnh mẽ.

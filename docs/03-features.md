# ✨ Tính năng & Nghiệp vụ (Features)

Tài liệu này chi tiết các tính năng nghiệp vụ cốt lõi và các cơ chế kỹ thuật hỗ trợ trải nghiệm người dùng trong HRM Pro.

## 1. Hệ thống Chấm công (Attendance)
Ghi nhận và tính toán công xá dựa trên thời gian làm việc thực tế của nhân viên.
- **Check-in/out**: Ghi nhận thời gian Server (UTC) để đảm bảo tính trung thực.
- **Tính toán tự động**: Backend tự động tính số phút đi muộn (Late), về sớm (Early) và tổng số phút làm việc thực tế.
- **Duyệt điều chỉnh (Correction)**: Cho phép nhân viên gửi yêu cầu sửa dữ liệu chấm công khi quên hoặc sai sót qua hệ thống phê duyệt.

---

## 2. Thông báo & Realtime (SignalR)
Hệ thống sử dụng **SignalR** để tạo ra trải nghiệm ứng dụng thời gian thực.
- **Cơ chế**: Backend phát tín hiệu qua `NotificationHub` -> Frontend Layout nhận và hiển thị Snackbar + phát Custom Event `notification:short`.
- **Auto-refresh**: Các trang sử dụng hook `useRealtimeRefresh` để tự động tải lại dữ liệu khi có thay đổi liên quan mà không cần F5.

---

## 3. Quản lý Nghỉ phép (Leave Management)
- **Đăng ký nghỉ**: Hỗ trợ nhiều loại nghỉ (Phép năm, Nghỉ ốm, Việc riêng).
- **Quy trình phê duyệt**: Đơn nghỉ sau khi nộp sẽ ở trạng thái `Pending` và được quản lý trực tiếp tại trung tâm Phê duyệt.

---

## 4. Trung tâm Phê duyệt (Centralized Approvals)
Đây là tính năng quan trọng giúp bảo vệ dữ liệu hệ thống.
- **Cơ chế kiểm soát**: Các hành động Create/Update/Delete đối với các thực thể quan trọng (Nhân viên, Lương, Phòng ban) không áp dụng ngay.
- **Approval Request**: Một yêu cầu phê duyệt được tạo ra. Dữ liệu thay đổi được lưu tạm dưới dạng JSON.
- **Phê duyệt đa cấp**: Admin hoặc Manager có thẩm quyền sẽ kiểm tra và phê duyệt/từ chối. Khi được duyệt, dữ liệu mới chính thức được cập nhật vào bảng chính.

---

## 5. Cơ cấu Tổ chức & Sơ đồ (Org Chart)
- **Quản lý phân cấp**: Hỗ trợ cấu trúc phòng ban cha-con không giới hạn cấp độ.
- **Org Chart**: Sơ đồ tổ chức trực quan, cho phép xem nhanh cấu trúc nhân sự và vị trí trong công ty.
- **Tương tác**: Cho phép tìm kiếm và xem nhanh thông tin phòng ban trực tiếp trên sơ đồ.

---

## 6. Đa ngôn ngữ (i18n)
- **Hỗ trợ**: Tiếng Việt (VI) và Tiếng Anh (EN).
- **Phạm vi**: Toàn bộ giao diện, thông báo lỗi, và dữ liệu danh mục đều được bản dịch hóa.
- **Cơ chế**: Sử dụng `react-i18next` với cấu hình theo module để dễ dàng mở rộng và bảo trì.

---

## 7. Giao diện & Trải nghiệm (UI/UX)
- **MUI v6**: Sử dụng thư viện Material UI mới nhất với thiết kế Premium.
- **Responsive**: Tối ưu hóa cho mọi thiết bị (Desktop, Tablet, Mobile).
- **Dark Mode**: Hỗ trợ giao diện tối/sáng linh hoạt theo sở hữu người dùng.

# Cấu trúc Giao diện (Layout)

Tài liệu này mô tả cấu trúc giao diện người dùng và cách tổ chức các thành phần UI chính trong hệ thống HRM.

## 1. Tóm tắt và Cách hoạt động

### Kiến trúc tổng quát
Giao diện hệ thống được chia thành 3 phần chính:
- **Sidebar (Thanh bên)**: Chứa logo và danh sách các module chức năng. Có thể thu gọn (collapse) để tăng diện tích hiển thị.
- **Navbar (Thanh điều hướng)**: Nằm ở phía trên, chứa tiêu đề trang, bộ chọn vai trò (cho Admin), chuyển đổi ngôn ngữ, thông báo và thông tin người dùng.
- **Main Content (Nội dung chính)**: Khu vực hiển thị nội dung chi tiết của từng module.

### Luồng hoạt động
1. **Authenticated Layout**: Khi người dùng đăng nhập, `app/(authenticated)/layout.tsx` sẽ bọc toàn bộ các trang bên trong để cung cấp Sidebar và Navbar.
2. **Responsive Design**: Trên máy tính, Sidebar có thể thu gọn. Trên thiết bị di động, Sidebar sẽ biến thành một lớp phủ (overlay) và điều khiển thông qua nút Menu trên Navbar.
3. **State Management**: Trạng thái đóng/mở của Sidebar được quản lý tập trung tại Layout để đảm bảo tính đồng bộ khi chuyển trang.

---

## 2. Chi tiết triển khai vào code

### Sidebar Components (`web/app/components/layout/Sidebar.tsx`)
- Danh sách menu được định nghĩa động dựa trên vai trò của người dùng (`Role-based Menu`).
- Sử dụng MUI `Drawer` để triển khai hiệu ứng trượt và thu gọn.

### Navbar Components (`web/app/components/layout/Navbar.tsx`)
- **Breadcrumbs**: Tự động sinh ra dựa trên đường dẫn URL hiện tại.
- **Language Toggle**: Chuyển đổi giữa `vi` và `en`, lưu vào Cookie và reload trang.
- **Notification Bell**: Hiển thị số lượng thông báo chưa đọc và danh sách thông báo nhanh.

### Main Content Area
- Sử dụng thẻ `<Box component="main">` với thuộc tính `flexGrow: 1` để tự động lấp đầy khoảng trống còn lại.
- Các trang được bọc trong `NotificationProvider` để nhận thông báo realtime.

---
*Lưu ý: Luôn tuân thủ quy tắc thiết kế Premium với Border Radius 6px và bảng màu Sleek Dark/Light để đảm bảo tính thẩm mỹ.*

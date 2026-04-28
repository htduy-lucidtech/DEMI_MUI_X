# Yêu cầu triển khai tiếp theo (Giai đoạn 6 & Tối ưu hóa)

Sau khi hoàn thiện Giai đoạn 5.5 (Đánh giá KPI & Cài đặt hệ thống Admin), hệ thống HRM Pro đã có nền tảng rất vững chắc. Dưới đây là các phân vân và câu hỏi gợi ý để chúng ta chốt phương án cho các bước tiếp theo:

## 1. Về tính năng Xuất báo cáo (Export/Reporting)
Hệ thống hiện tại đã có Nút "Export" bằng file Excel (`.xlsx`) ở một số màn hình sử dụng thư viện `xlsx` ở client-side.
**Câu hỏi:**
- Bạn muốn duy trì việc xuất Excel tại Client-side (nhanh, dễ làm nhưng giới hạn định dạng phức tạp) hay chuyển sang xuất báo cáo từ Server-side (C# tạo file Excel/PDF chuẩn format công ty với header/footer/logo)?
- Có cần làm tính năng xuất "Phiếu lương cá nhân" (Payslip) ra định dạng PDF cho từng nhân viên không?

## 2. Về tính năng Thông báo thời gian thực (Real-time Notifications)
Giao diện `layout.tsx` hiện đang có code kết nối đến SignalR Hub (`/notificationHub`), nhưng backend dường như chưa được sử dụng triệt để để đẩy thông báo cho các nghiệp vụ (vd: Có đơn xin nghỉ phép mới, Lương đã được duyệt...).
**Câu hỏi:**
- Chúng ta có nên bắt đầu thiết lập luồng thông báo tự động (Ví dụ: Khi Manager duyệt đơn nghỉ phép -> Đẩy thông báo tức thời cho Employee qua SignalR)?
- Bạn có muốn thêm một Dropdown Notification trên `Navbar` để lưu trữ lịch sử thông báo chưa đọc không?

## 3. Về Quản lý Phân quyền (Role-based Access Control - RBAC) nâng cao
Chúng ta đang hardcode mảng `roles: ["Admin", "Manager", ...]` ở phía Frontend (trong `Sidebar.tsx`, `Navbar.tsx`).
**Câu hỏi:**
- Có cần làm một giao diện "Quản lý Vai trò" riêng trong Admin Settings để linh hoạt gán từng quyền (Xem/Thêm/Sửa/Xóa) cho từng màn hình không? Hay mô hình phân quyền cứng hiện tại là đủ cho dự án này?

## 4. Về chuẩn bị Triển khai (Deployment & Docker)
Ứng dụng hiện tại đang chạy tốt trên local. Giai đoạn cuối thường là đóng gói (Containerization).
**Câu hỏi:**
- Bạn có muốn tôi bắt đầu viết `Dockerfile` và `docker-compose.yml` để đóng gói Frontend, Backend và Postgres Database thành một cụm dịch vụ chạy với 1 câu lệnh không?
- Bạn có định host dự án này lên môi trường Cloud nào cụ thể không (AWS, Azure, DigitalOcean, VPS Linux...)?

---

### 💡 Gợi ý lộ trình ngay tiếp theo:
Nếu bạn đồng ý, tôi đề xuất chúng ta sẽ làm:
1. **Hoàn thiện tính năng Thông báo (Notification Bell)**: Tích hợp SignalR với UI thông báo trên Navbar.
2. **Hoàn thiện xuất báo cáo (PDF Payslip)**: Giúp nhân viên có thể tải phiếu lương của họ.
3. **Đóng gói Docker**: Chuẩn bị sẵn sàng đưa sản phẩm lên môi trường Production.

Vui lòng cho tôi biết lựa chọn của bạn hoặc bất kỳ yêu cầu cụ thể nào bạn muốn ưu tiên trước!

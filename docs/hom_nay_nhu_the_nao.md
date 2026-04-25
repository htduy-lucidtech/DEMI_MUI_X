# Nhật ký hoàn thành công việc tổng hợp

## ✅ Những gì đã làm được hôm nay:
1. **Hoàn thiện Giai đoạn 4 (Phase 4):**
   - Triển khai thành công **Xuất file Excel (.xlsx)** cho danh sách nhân sự.
   - Xây dựng **Sơ đồ tổ chức (Org Chart)** tương tác bằng React Flow.
   - Thiết lập hệ thống **Thông báo Realtime** bằng SignalR (kèm SnackBar hiển thị tức thời).
2. **Khởi động Giai đoạn 5 (Advanced Modules):**
   - Triển khai thành công **Giai đoạn 5.2: Quản lý Đơn từ (Leave Requests)**.
   - Hỗ trợ gửi đơn nghỉ phép, phê duyệt đơn và thông báo realtime cho nhân viên.
3. **Nâng cấp UX (Trải nghiệm người dùng):**
   - Bổ sung **Trạng thái Loading toàn cục** (`FullPageLoading`) giúp tránh cảm giác trang bị treo khi chuyển module.
   - Tận dụng cơ chế `loading.tsx` của Next.js cho toàn bộ Dashboard.
4. **Xử lý sự cố hạ tầng Backend:**
   - Khắc phục lỗi xung đột thư viện Swagger trên .NET 9 bằng cách hạ cấp về bản ổn định (v6.6.2).
   - Giải quyết lỗi `Microsoft.OpenApi.Models` bằng cách ép phiên bản thư viện chuẩn.
   - Cấu hình lại CORS hỗ trợ `AllowCredentials` cho SignalR.

## ❓ Tại sao (Rationale):
- **Loading state**: Rất quan trọng để giảm "cognitive load" cho người dùng, làm hệ thống có cảm giác nhanh và mượt hơn.
- **Workflow (Leave)**: Là nền tảng để xây dựng các quy trình nghiệp vụ tự động hóa sau này.

---

# Báo cáo hằng ngày 

## Ngày 25/04/2026 (Hoàn thành Phase 5.2 & Fix lỗi hạ tầng)
### Bạn đã làm được những gì??
- Triển khai toàn diện tính năng Nghỉ phép (Backend + Frontend).
- Sửa lỗi build và runtime của Backend .NET 9.
- Thêm hiệu ứng Loading cho toàn bộ Dashboard.

### Hôm nay bạn sẽ làm gì?
- Tiếp tục **Giai đoạn 5.1: Chấm công nâng cao & Tính lương tự động**.

### Có điều gì đang cản trở tiến độ công việc của bạn không?
- Không có
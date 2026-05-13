# Hệ Thống Components & Kiến Trúc Trang (Next.js App Router)

Tài liệu này thống kê cách tổ chức các thành phần (Components) và kiến trúc hiện tại của ứng dụng HRM.

## 1. Nguyên Tắc Thiết Kế (Cập Nhật: Single-File Page)
Ứng dụng sử dụng mô hình **Single-File Client Components** cho các trang Dashboard:
- **Tất cả logic nằm trong `page.tsx`**: Để đơn giản hóa cấu trúc thư mục, mỗi folder trang trong `app/(authenticated)/dashboard/` chỉ chứa duy nhất một file `page.tsx`.
- **"use client"**: Tất cả các trang này được đánh dấu là Client Components để sử dụng đầy đủ các tính năng của React (Hooks), Material UI (DataGrid, Dialogs), và Internationalization (`next-intl`).
- **Client-side Fetching**: Dữ liệu được fetch tại Client thông qua `useEffect` khi trang được mount.

---

## 2. Thống Kê Trang (Pages)

| Trang (Route) | File duy nhất | Chức năng chính | Trạng thái |
| :--- | :--- | :--- | :--- |
| `/dashboard` | `web/app/.../dashboard/page.tsx` | Tổng quan, biểu đồ thống kê | Hoàn thiện |
| `/dashboard/attendance` | `web/app/.../attendance/page.tsx` | Chấm công, lịch sử, sửa giờ | Hoàn thiện |
| `/dashboard/leave` | `web/app/.../leave/page.tsx` | Quản lý đơn xin nghỉ | Hoàn thiện |
| `/dashboard/approvals` | `web/app/.../approvals/page.tsx` | Trung tâm phê duyệt (C/U/D) | Hoàn thiện |
| `/dashboard/departments` | `web/app/.../departments/page.tsx` | Quản lý phòng ban phân cấp | Hoàn thiện |
| `/dashboard/org-chart` | `web/app/.../org-chart/page.tsx` | Sơ đồ tổ chức trực quan | Hoàn thiện |
| `/dashboard/payroll` | `web/app/.../payroll/page.tsx` | Bảng lương, thanh toán | Hoàn thiện |
| `/dashboard/personnel` | `web/app/.../personnel/page.tsx` | Danh sách nhân viên, hồ sơ | Hoàn thiện |
| `/dashboard/performance` | `web/app/.../performance/page.tsx` | Đánh giá hiệu suất | Hoàn thiện |
| `/dashboard/users` | `web/app/.../users/page.tsx` | Quản lý tài khoản, phân quyền | Hoàn thiện |

---

## 3. Thành Phần Dùng Chung (Shared Components)

### Layout & Core
- **MainLayout.tsx** (Client): Layout chính bao bọc các trang đã đăng nhập.
- **Navbar.tsx** (Client): Thanh điều hướng trên cùng (Ngôn ngữ, Profile, Thông báo).
- **Sidebar.tsx** (Client): Menu điều hướng bên trái.
- **Providers.tsx** (Client): Bọc các Context (Auth, Theme, i18n).

### Business Components (Tái sử dụng)
- **attendance/CorrectionsPanel.tsx**: Bảng xử lý yêu cầu chỉnh sửa giờ công.
- **personnel/EmployeeDialog.tsx**: Form thêm/sửa thông tin nhân viên.
- **CustomNoRowsOverlay.tsx**: Giao diện trống cho DataGrid.

---

## 4. Cơ Chế Gọi API (`web/lib/api.ts`)

### Client-side API (`api`)
Dùng trực tiếp trong các `page.tsx`. Tự động lấy Token từ LocalStorage/Cookies để gửi kèm request.
- Tự động lọc dữ liệu tại Backend dựa trên Token (Role/UserId).
- Hỗ trợ realtime refresh qua SignalR.

---

## 5. Luồng Dữ Liệu (Data Flow)
1. Người dùng truy cập trang (VD: `/attendance`).
2. Trang `page.tsx` (Client) được tải.
3. `useEffect` gọi API tương ứng thông qua Service Layer (VD: `attendanceService.getAll()`).
4. Backend nhận Token, thực hiện xác thực và lọc dữ liệu (theo quyền hạn) trước khi trả về.
5. Trang cập nhật state và hiển thị dữ liệu lên DataGrid.

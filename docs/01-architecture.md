# 🏗 Kiến trúc Hệ thống (System Architecture)

Tài liệu này cung cấp cái nhìn tổng quan về cấu trúc kỹ thuật, mô hình dữ liệu và cách tổ chức thư mục của dự án HRM Pro.

## 1. Cấu trúc Thư mục Tổng quát

Dự án được tổ chức theo mô hình Centralized (Tập trung) để tối ưu hóa việc tái sử dụng code và quản lý đa ngôn ngữ.

```text
.
├── src/                         # BACKEND (ASP.NET Core 9)
│   ├── Hrm.Api/                 # Lớp Giao tiếp (Controllers, Hubs, Extensions)
│   ├── Hrm.Domain/              # Lớp Lõi (Entities, Enums, Interfaces)
│   ├── Hrm.Infrastructure/      # Lớp Hạ tầng (DbContext, Migrations, Repositories)
│   └── Hrm.Service/             # Lớp Nghiệp vụ (Business Logic Implementations)
├── web/                         # FRONTEND (Next.js 15 App Router)
│   ├── app/                     # Routing & Layouts
│   ├── components/              # UI Components tập trung (MUI v6)
│   ├── locales/                 # Tài nguyên đa ngôn ngữ (vi/en)
│   ├── services/                # Tầng gọi API (Axios Centralized)
│   └── hooks/                   # Custom Hooks (Realtime, State)
└── docs/                        # Tài liệu hệ thống
```

---

## 2. Kiến trúc Backend (Clean Architecture)

Backend được xây dựng trên ASP.NET Core 9 với 4 Project tách biệt:

- **Lớp Domain**: Trái tim của hệ thống, chứa các Entity đại diện cho bảng Database và các Enum. Không phụ thuộc vào bất kỳ thư viện ngoài nào.
- **Lớp Infrastructure**: Quản lý truy cập dữ liệu thông qua Entity Framework Core. Chứa cấu hình SQL Server và các script khởi tạo dữ liệu mẫu (Seeding).
- **Lớp Service**: Nơi thực hiện các nghiệp vụ tính toán phức tạp (như tính lương theo giờ, kiểm tra quy tắc chấm công).
- **Lớp API**: Cổng giao tiếp duy nhất với Frontend. Chứa các Controller, SignalR Hubs và cấu hình bảo mật (JWT, CORS).

---

## 3. Kiến trúc Frontend (Modern Next.js)

Frontend sử dụng Next.js 15 với các tiêu chuẩn mới nhất:

- **App Router**: Sử dụng các Route Groups như `(authenticated)` để quản lý quyền truy cập và Layout một cách hiệu quả.
- **Centralized Components**: Toàn bộ Dialog, Form, Table được đặt tại `web/components/` thay vì rải rác trong các thư mục route, giúp giảm 40% sự trùng lặp code.
- **Centralized Locales**: Quản lý đa ngôn ngữ tập trung tại `web/locales/`. Sử dụng `next-intl` để cung cấp bản dịch đồng bộ cho cả Server và Client side.
- **State Management**: Kết hợp giữa React Context (cho Auth/Notification) và Local State cho các Page cụ thể.

---

## 4. Mô hình Dữ liệu (Core Models)

Dưới đây là các thực thể chính được thiết kế để hỗ trợ mô hình tính lương linh hoạt theo giờ:

| Thực thể | Mô tả chính |
| :--- | :--- |
| **Employee** | Thông tin nhân sự, mức lương giờ (`HourlyRate`), lương OT (`HourlyRateOT`). |
| **Attendance** | Ghi nhận Check-in/out, số phút đi muộn, tổng giờ làm việc thực tế. |
| **LeaveRequest** | Quản lý yêu cầu nghỉ phép và trạng thái phê duyệt. |
| **Notification** | Lưu trữ thông báo, phân loại theo `Info`, `Success`, `Warning`, `Error`. |
| **User** | Tài khoản hệ thống, liên kết 1-1 với nhân viên, phân quyền qua `Role`. |

---

## 5. Layout & Giao diện

Hệ thống sử dụng **Material UI (MUI) v6** với phong cách thiết kế hiện đại:
- **Sidebar**: Điều hướng thông minh, hỗ trợ thu gọn (Collapsed) để tăng diện tích làm việc.
- **Navbar**: Tích hợp chuông thông báo Realtime, chuyển đổi ngôn ngữ và thông tin User.
- **Responsive**: Giao diện tự động tối ưu hóa cho Mobile, Tablet và Desktop.

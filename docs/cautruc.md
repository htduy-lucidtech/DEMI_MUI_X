# Cấu trúc Thư mục Dự án HRM

## Sơ đồ cấu trúc (Tree View)

```text
Hrm/
├── Hrm.slnx                     # Solution chính
├── Hrm.Api/                     # [PROJECT] Web API
│   ├── Controllers/             # API Endpoints
│   │   ├── AttendanceController.cs
│   │   ├── AuthController.cs
│   │   ├── DashboardController.cs
│   │   └── UsersController.cs
│   ├── Data/                    # Seed data
│   │   └── DbInitializer.cs
│   ├── Properties/              # Launch settings
│   │   └── launchSettings.json
│   ├── appsettings.json         # Config
│   └── Program.cs               # Main Entry
├── Hrm.Domain/                  # [PROJECT] Entities
│   ├── Entities/                # Database Models
│   │   ├── Attendance.cs
│   │   ├── Department.cs
│   │   ├── LeaveRequest.cs
│   │   └── User.cs
│   └── Enums/                   # Types
│       ├── LeaveStatus.cs
│       └── UserRole.cs
├── Hrm.Infrastructure/          # [PROJECT] DB Access
│   └── Data/
│       └── HrmDbContext.cs      # EF Core Context
├── Hrm.Service/                 # [PROJECT] Business Logic
│   ├── Implementations/
│   │   ├── AttendanceService.cs
│   │   └── AuthService.cs
│   └── Interfaces/
│       ├── IAttendanceService.cs
│       └── IAuthService.cs
└── hrm.web/                     # [PROJECT] Next.js 15
    ├── app/                     # App Router
    │   ├── (authenticated)/     # Protected Routes
    │   │   ├── dashboard/       # Dashboard Modules
    │   │   │   ├── personnel/   # [MODULE] Nhân sự
    │   │   │   │   ├── locales/ # Ngôn ngữ module
    │   │   │   │   └── page.tsx
    │   │   │   ├── attendance/  # [MODULE] Chấm công
    │   │   │   │   ├── locales/
    │   │   │   │   └── page.tsx
    │   │   │   └── ...          # (Các module khác tương tự)
    │   │   └── layout.tsx       # Auth Layout (Sidebar/Navbar)
    │   ├── components/          # Shared Components
    │   │   └── layout/          # Layout Components
    │   │       ├── Navbar.tsx
    │   │       └── Sidebar.tsx
    │   ├── context/             # React Context
    │   │   └── AuthContext.tsx  # Quản lý Login/Roles
    │   └── login/               # [MODULE] Đăng nhập
    │       ├── locales/
    │       └── page.tsx
    ├── services/                # API Service Layer
    │   ├── auth.service.ts
    │   ├── user.service.ts
    │   └── dashboard.service.ts
    ├── lib/                     # Utilities
    │   └── api.ts               # Axios config
    ├── i18n.ts                  # i18n Config
    ├── middleware.ts            # Auth & i18n Middleware
    └── package.json
```

---

## Danh sách mô tả chi tiết

Dưới đây là danh sách toàn bộ các folder và file trong dự án kèm mô tả chi tiết:

## 1. Gốc dự án (Root)
- `Hrm.slnx` : File Solution quản lý toàn bộ các Project Backend.
- `.env.local` : File chứa các biến môi trường của hệ thống.
- `docs/kehoach.md` : Tài liệu lộ trình triển khai dự án qua các giai đoạn.
- `docs/cautruc.md` : Tài liệu mô tả cấu trúc thư mục (file này).

## 2. Hrm.Api (Web API Project)
- `Hrm.Api/Program.cs` : File khởi chạy và cấu hình chính của API (DI, Auth, CORS, Database).
- `Hrm.Api/appsettings.json` : Cấu hình ứng dụng, Connection String và JWT Secret.
- `Hrm.Api/Controllers/AuthController.cs` : Xử lý các request đăng nhập và cấp token.
- `Hrm.Api/Controllers/UsersController.cs` : API quản lý danh sách người dùng và nhân viên.
- `Hrm.Api/Controllers/DashboardController.cs` : API cung cấp dữ liệu thống kê cho Dashboard.
- `Hrm.Api/Controllers/AttendanceController.cs` : API xử lý dữ liệu chấm công.
- `Hrm.Api/Data/DbInitializer.cs` : Script khởi tạo và seed dữ liệu mẫu vào Database.
- `Hrm.Api/Properties/launchSettings.json` : Cấu hình môi trường chạy (IIS, Kestrel, port).

## 3. Hrm.Domain (Entities & Interfaces)
- `Hrm.Domain/Entities/User.cs` : Định nghĩa bảng người dùng trong Database.
- `Hrm.Domain/Entities/Attendance.cs` : Định nghĩa bảng dữ liệu chấm công.
- `Hrm.Domain/Entities/Department.cs` : Định nghĩa bảng phòng ban.
- `Hrm.Domain/Entities/LeaveRequest.cs` : Định nghĩa bảng yêu cầu nghỉ phép.
- `Hrm.Domain/Enums/UserRole.cs` : Danh sách các vai trò (Admin, Manager, Employee, ...).
- `Hrm.Domain/Enums/LeaveStatus.cs` : Các trạng thái của đơn từ (Pending, Approved, Rejected).

## 4. Hrm.Infrastructure (Database Context)
- `Hrm.Infrastructure/Data/HrmDbContext.cs` : Lớp kết nối Database chính sử dụng EF Core.
- `Hrm.Infrastructure/Hrm.Infrastructure.csproj` : Quản lý các package liên quan đến DB.

## 5. Hrm.Service (Business Logic)
- `Hrm.Service/Interfaces/IAuthService.cs` : Interface định nghĩa các chức năng xác thực.
- `Hrm.Service/Implementations/AuthService.cs` : Logic chi tiết xử lý đăng nhập và mã hóa.
- `Hrm.Service/Interfaces/IAttendanceService.cs` : Interface định nghĩa các chức năng chấm công.
- `Hrm.Service/Implementations/AttendanceService.cs` : Logic xử lý tính toán ngày công.

## 6. hrm.web (Next.js Frontend)
- `hrm.web/package.json` : Danh sách thư viện và scripts chạy frontend.
- `hrm.web/i18n.ts` : Cấu hình load đa ngôn ngữ cho ứng dụng.
- `hrm.web/middleware.ts` : Middleware xử lý routing và bảo mật đa ngôn ngữ.
- `hrm.web/lib/api.ts` : Cấu hình Axios instance để gọi API backend.
- `hrm.web/app/layout.tsx` : Layout gốc của toàn bộ ứng dụng web.
- `hrm.web/app/page.tsx` : Trang điều hướng mặc định.
- `hrm.web/app/context/AuthContext.tsx` : Quản lý trạng thái đăng nhập toàn cục.

### hrm.web/app/(authenticated) - Các trang yêu cầu đăng nhập
- `hrm.web/app/(authenticated)/layout.tsx` : Layout chính có Sidebar và Navbar.
- `hrm.web/app/(authenticated)/dashboard/page.tsx` : Trang Dashboard thống kê.
- `hrm.web/app/(authenticated)/dashboard/personnel/page.tsx` : Trang danh sách nhân viên.
- `hrm.web/app/(authenticated)/dashboard/attendance/page.tsx` : Trang quản lý chấm công.
- `hrm.web/app/(authenticated)/dashboard/departments/page.tsx` : Trang quản lý phòng ban.
- `hrm.web/app/(authenticated)/dashboard/leave/page.tsx` : Trang quản lý nghỉ phép.
- `hrm.web/app/(authenticated)/dashboard/users/page.tsx` : Trang quản lý tài khoản hệ thống.
- `hrm.web/app/(authenticated)/dashboard/admin/page.tsx` : Trang cài đặt quản trị.
- `hrm.web/app/(authenticated)/profile/page.tsx` : Trang thông tin cá nhân.
- `hrm.web/app/(authenticated)/settings/page.tsx` : Trang cài đặt tài khoản người dùng.

### Components & Locales
- `hrm.web/app/components/layout/Sidebar.tsx` : Thanh điều hướng bên trái (Menu động).
- `hrm.web/app/components/layout/Navbar.tsx` : Thanh công cụ phía trên (Role preview, Ngôn ngữ).
- `hrm.web/app/login/page.tsx` : Giao diện trang đăng nhập.
- `hrm.web/app/login/locales/vi.ts` : Bản dịch tiếng Việt cho trang login.
- `hrm.web/app/login/locales/en.ts` : Bản dịch tiếng Anh cho trang login.

# Cấu trúc Thư mục Dự án HRM

## Sơ đồ cấu trúc (Tree View)

```text
.
├── src/                         # [FOLDER] Backend Projects
│   ├── Hrm.slnx                 # Solution chính
│   ├── Hrm.Api/                 # [PROJECT] Web API
│   │   ├── Controllers/         # API Endpoints
│   │   ├── Data/                # Data related files
│   │   ├── Properties/          # Launch settings
│   │   ├── appsettings.json     # Config
│   │   └── Program.cs           # Main Entry
│   ├── Hrm.Domain/              # [PROJECT] Entities
│   │   ├── Entities/            # Database Models
│   │   └── Enums/               # Types
│   ├── Hrm.Infrastructure/      # [PROJECT] DB Access
│   │   └── Data/
│   │       ├── HrmDbContext.cs  # EF Core Context
│   │       └── DbInitializer.cs # Database Seeding Logic
│   └── Hrm.Service/             # [PROJECT] Business Logic
│       ├── Implementations/
│       └── Interfaces/
├── web/                         # [FOLDER] Frontend (Next.js)
│   ├── app/                     # App Router
│   │   ├── (authenticated)/     # Protected Routes
│   │   │   ├── dashboard/       # Dashboard Modules
│   │   │   ├── layout.tsx       # Auth Layout
│   │   │   └── loading.tsx      # Global loading state
│   │   ├── components/          # Shared Components
│   │   ├── context/             # React Context
│   │   └── login/               # [MODULE] Đăng nhập
│   ├── services/                # API Service Layer
│   ├── lib/                     # Utilities
│   ├── i18n.ts                  # i18n Config
│   ├── middleware.ts            # Auth & i18n Middleware
│   └── package.json
└── docs/                        # [FOLDER] Documentation
    ├── cautruc.md
    └── kehoach.md
```

---

## Danh sách mô tả chi tiết

Dưới đây là danh sách toàn bộ các folder và file trong dự án kèm mô tả chi tiết:

## 1. Gốc dự án (Root)
- `src/Hrm.slnx` : File Solution quản lý toàn bộ các Project Backend.
- `src/.env.local` : File chứa các biến môi trường của hệ thống (Backend).
- `web/.env.local` : File chứa các biến môi trường của hệ thống (Frontend).
- `docs/kehoach.md` : Tài liệu lộ trình triển khai dự án qua các giai đoạn.
- `docs/cautruc.md` : Tài liệu mô tả cấu trúc thư mục (file này).

## 2. src (Web API Projects)
- `src/Hrm.slnx` : File Solution quản lý toàn bộ các Project Backend.
- `src/Hrm.Api/Program.cs` : File khởi chạy và cấu hình chính của API (DI, Auth, CORS, Database).
- `src/Hrm.Api/appsettings.json` : Cấu hình ứng dụng, Connection String và JWT Secret.
- `src/Hrm.Api/Controllers/` : Các API Endpoints xử lý logic.

## 3. Hrm.Domain (Entities & Interfaces)
- `src/Hrm.Domain/Entities/` : Định nghĩa các bảng Database (User, Employee, Attendance, ...).
- `src/Hrm.Domain/Enums/` : Danh sách các kiểu dữ liệu enum (UserRole, LeaveStatus).

## 4. Hrm.Infrastructure (Database Context)
- `src/Hrm.Infrastructure/Data/HrmDbContext.cs` : Lớp kết nối Database chính sử dụng EF Core.
- `src/Hrm.Infrastructure/Data/DbInitializer.cs` : Script khởi tạo và seed dữ liệu mẫu vào Database.

## 5. Hrm.Service (Business Logic)
- `src/Hrm.Service/Interfaces/` : Định nghĩa các interface cho Business Logic.
- `src/Hrm.Service/Implementations/` : Logic chi tiết xử lý nghiệp vụ.

## 6. web (Next.js Frontend)
- `web/package.json` : Danh sách thư viện và scripts chạy frontend.
- `web/i18n.ts` : Cấu hình load đa ngôn ngữ cho ứng dụng.
- `web/middleware.ts` : Middleware xử lý routing và bảo mật đa ngôn ngữ.
- `web/lib/api.ts` : Cấu hình Axios instance để gọi API backend.
- `web/app/layout.tsx` : Layout gốc của toàn bộ ứng dụng web.
- `web/app/page.tsx` : Trang điều hướng mặc định.
- `web/app/context/AuthContext.tsx` : Quản lý trạng thái đăng nhập toàn cục.
- `web/services/` : Các service gọi API backend (auth, user, employee, ...).

### web/app/(authenticated) - Các trang yêu cầu đăng nhập
- `web/app/(authenticated)/layout.tsx` : Layout chính có Sidebar và Navbar.
- `web/app/(authenticated)/dashboard/` : Các trang chức năng (personnel, attendance, ...).

### Components & Locales
- `web/app/components/layout/` : Các thành phần UI của layout (Sidebar, Navbar).
- `web/app/login/page.tsx` : Giao diện trang đăng nhập.
- `web/app/login/locales/` : Bản dịch đa ngôn ngữ cho trang login.
- `web/app/(authenticated)/dashboard/[module]/locales/` : Bản dịch đa ngôn ngữ riêng cho từng module (nhân sự, chấm công, lương, ...).
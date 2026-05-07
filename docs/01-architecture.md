# 🏗 Kiến trúc Hệ thống (Architecture)

Tài liệu này cung cấp cái nhìn tổng quan về cấu trúc kỹ thuật, mô hình dữ liệu và cách tổ chức dự án HRM Pro.

## 1. Cấu trúc Thư mục (Detailed Tree View)

```text
.
├── src/                             # [BACKEND] .NET 9 Clean Architecture
│   ├── Hrm.Api/                     # Lớp Giao tiếp (Entry Point)
│   │   ├── Controllers/             # API Endpoints
│   │   │   ├── AttendanceController.cs
│   │   │   ├── AuthController.cs
│   │   │   ├── DashboardController.cs
│   │   │   ├── DepartmentsController.cs
│   │   │   ├── EmployeeController.cs
│   │   │   ├── LeaveController.cs
│   │   │   ├── NotificationController.cs
│   │   │   ├── PayrollController.cs
│   │   │   ├── PerformanceController.cs
│   │   │   ├── PromotionsController.cs
│   │   │   ├── RecruitmentController.cs
│   │   │   ├── SettingsController.cs
│   │   │   └── UsersController.cs
│   │   ├── Extensions/              # DI & Configuration Extensions
│   │   │   └── DependencyInjection.cs
│   │   ├── Hubs/                    # SignalR Realtime Hubs
│   │   │   └── NotificationHub.cs
│   │   ├── Program.cs               # Khởi tạo Server & Middleware
│   │   └── appsettings.json         # Cấu hình Database, JWT, Logging
|   |
│   ├── Hrm.Domain/                  # Lớp Lõi (Entities & Enums)
│   │   ├── Entities/                # Database Models (Employee.cs, User.cs...)
│   │   |    ├── Attendance.cs
│   │   |    ├── AttendanceConfig.cs
│   │   |    ├── AttendanceCorrection.cs
│   │   |    ├── Department.cs
│   │   |    ├── Employee.cs
│   │   |    ├── LeaveRequest.cs
│   │   |    ├── Notification.cs
│   │   |    ├── PerformanceReview.cs
│   │   |    ├── Recruitment.cs
│   │   |    ├── Shift.cs
│   │   |    ├── SystemSetting.cs
│   │   |    └── User.cs
│   │   └── DependencyInjection.cs
|   |
│   ├── Hrm.Infrastructure/          # Lớp Hạ tầng (Data Access)
│   │   ├── Data/                    # DbContext, Seeding & Migrations
|   |   |    ├── DbInitializer.cs
|   |   |    └── HrmDbContext.cs
│   │   ├── Migrations/             # Database Migrations     
│   │   └── DependencyInjection.cs
|   |
│   ├── Hrm.Service/                 # Lớp Nghiệp vụ (Business Logic)
│   │   ├── Implementations/         # Cài đặt xử lý logic (EmployeeService.cs...)
│   │   |    ├── AttendanceService.cs
│   │   |    └── AuthService.cs
│   │   ├── Interfaces/              # Khai báo Hợp đồng (IEmployeeService.cs...)
│   │   |    ├── IAttendanceService.cs
│   │   |    ├── IAuthService.cs
│   │   |    └── INotificationService.cs
│   │   └── DependencyInjection.cs
├── web/                             # [FRONTEND] Next.js 15 App Router
│   ├── app/                         # Routing & Pages
│   │   ├── (authenticated)/         # Protected Routes (Auth Required)
│   │   │   ├── dashboard/           # Các Module chức năng
│   │   │   │   ├── admin/           # Quản trị hệ thống
│   │   │   │   │   └── page.tsx     # Giao diện quản trị
│   │   │   │   ├── attendance/      # Chấm công
│   │   │   │   │   └── page.tsx     # Giao diện chấm công
│   │   │   │   ├── leave/           # Nghỉ phép
│   │   │   │   │   └── page.tsx     # Giao diện quản lý nghỉ phép
│   │   │   │   ├── personnel/       # Nhân sự
│   │   │   │   │   └── page.tsx     # Giao diện hồ sơ nhân viên
│   │   │   │   ├── payroll/         # Lương
│   │   │   │   │   └── page.tsx     # Giao diện bảng lương
│   │   │   │   ├── promotions/      # Thăng chức
│   │   │   │   │   └── page.tsx     # Giao diện thăng chức
│   │   │   │   ├── recruitment/     # Tuyển dụng
│   │   │   │   │   └── page.tsx     # Giao diện tuyển dụng
│   │   │   │   └── users/           # Người dùng
│   │   │   │       └── page.tsx     # Giao diện người dùng
│   │   │   ├── layout.tsx           # Layout có Sidebar, Navbar & SignalR Listener
│   │   │   └── loading.tsx          # Hiệu ứng loading toàn cục
│   │   ├── context/                 # Quản lý trạng thái (Auth, Notification)
│   │   ├── login/                   # Trang Đăng nhập
│   │   │   └── page.tsx
│   │   ├── layout.tsx               # Root Layout & Provider setup
│   │   └── globals.css              # Global styles
│   ├── components/                  # Centralized UI Components (Shared)
│   │   ├── layout/                  # Sidebar, Navbar, SidebarItem
│   │   ├── common/                  # Buttons, Modals, Tables dùng chung
│   │   └── [module]/                # Components đặc thù: EmployeeDialog, AttendanceTable...
│   ├── locales/                     # Centralized Internationalization (i18n)
│   │   ├── personnel/               # vi.ts & en.ts cho module nhân sự
│   │   ├── attendance/              # vi.ts & en.ts cho module chấm công
│   │   └── notification/            # Bản dịch cho thông báo Realtime
│   ├── services/                    # API Service Layer (Axios)
│   │   ├── api.ts                   # Cấu hình Axios Instance & Interceptors
│   │   └── [module].service.ts      # Ví dụ: employee.service.ts, auth.service.ts
│   ├── hooks/                       # Custom React Hooks (useRealtimeRefresh.ts...)
│   └── i18n.ts                      # Cấu hình middleware next-intl
└── docs/                            # Tài liệu dự án (01-04)
```

---

## 2. Mô hình Dữ liệu (Core Models)
Hệ thống được thiết kế theo mô hình tính lương theo giờ linh hoạt:
- **Employee**: Nhân sự, mức lương giờ (`HourlyRate`), lương OT.
- **Attendance**: Check-in/out, số phút đi muộn, tổng giờ làm việc.
- **LeaveRequest**: Yêu cầu nghỉ phép (Annual, Sick, Personal).
- **Notification**: Thông báo (Info, Success, Warning, Error).
- **User**: Tài khoản, phân quyền Role.

---

## 3. Kiến trúc Backend (Clean Architecture)
- **Domain**: Lớp lõi chứa thực thể. Không phụ thuộc vào các lớp khác.
- **Infrastructure**: Truy cập dữ liệu qua EF Core, Migration và Repository.
- **Service**: Xử lý logic nghiệp vụ, tính toán lương, kiểm tra quy tắc.
- **API**: Cổng giao tiếp RESTful cho Frontend và SignalR Hub cho thông báo.

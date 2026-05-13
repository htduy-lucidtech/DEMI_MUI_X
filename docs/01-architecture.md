# 🏗 Kiến trúc Hệ thống (Architecture)

Tài liệu này cung cấp cái nhìn tổng quan về cấu trúc kỹ thuật, mô hình dữ liệu và cách tổ chức dự án HRM Pro.

## 1. Cấu trúc Thư mục (Detailed Tree View)

```text
.
├── src/                             # [BACKEND] .NET 9 Clean Architecture
│   ├── Hrm.Api/                     # Lớp Giao tiếp (Entry Point)
│   │   ├── Controllers/             # API Endpoints
│   │   │   ├── ApprovalsController.cs    # Duyệt yêu cầu hệ thống
│   │   │   ├── AttendanceController.cs   # Chấm công & OT
│   │   │   ├── AuthController.cs         # Đăng nhập & Token
│   │   │   ├── DashboardController.cs    # Thống kê & Analytics
│   │   │   ├── DepartmentsController.cs  # Quản lý Phòng ban (Hierarchical)
│   │   │   ├── EmployeesController.cs    # Hồ sơ nhân viên
│   │   │   ├── LeaveRequestsController.cs # Quản lý nghỉ phép
│   │   │   ├── NotificationsController.cs # Thông báo hệ thống
│   │   │   ├── PayrollController.cs      # Tính lương
│   │   │   ├── PerformanceReviewsController.cs # Đánh giá hiệu suất
│   │   │   ├── RecruitmentController.cs  # Tuyển dụng
│   │   │   ├── RolesController.cs        # Quản lý Nhóm quyền (RBAC)
│   │   │   ├── SettingsController.cs     # Cấu hình hệ thống
│   │   │   └── UsersController.cs        # Quản lý tài khoản
│   │   ├── Extensions/              # DI & Configuration Extensions
│   │   ├── Hubs/                    # SignalR Realtime Hubs (NotificationHub.cs)
│   │   ├── Program.cs               # Khởi tạo Server & Middleware
│   │   └── appsettings.json         # Cấu hình Database, JWT, Logging
│   |
│   ├── Hrm.Domain/                  # Lớp Lõi (Entities & Enums)
│   │   ├── Entities/                # Database Models
│   │   |    ├── ApprovalRequest.cs  # Yêu cầu phê duyệt (C/U/D)
│   │   |    ├── Attendance.cs       # Dữ liệu chấm công
│   │   |    ├── AuditLog.cs         # Nhật ký thao tác
│   │   |    ├── Branch.cs           # Chi nhánh
│   │   |    ├── Department.cs       # Phòng ban (Hỗ trợ Parent/Children)
│   │   |    ├── Employee.cs         # Thông tin nhân sự
│   │   |    ├── LeaveRequest.cs     # Đơn nghỉ phép
│   │   |    ├── Notification.cs     # Thông báo người dùng
│   │   |    ├── PerformanceReview.cs # Đánh giá nhân viên
│   │   |    ├── Recruitment.cs      # Tin tuyển dụng & Ứng viên
│   │   |    ├── Role.cs             # Vai trò hệ thống
│   │   |    ├── User.cs             # Tài khoản người dùng
│   │   |    └── ... (Entities khác)
│   |
│   ├── Hrm.Infrastructure/          # Lớp Hạ tầng (Data Access)
│   │   ├── Data/                    # DbContext, Seeding (DbInitializer.cs)
│   │   ├── Migrations/              # Database Migrations     
│   │   └── DependencyInjection.cs
│   |
│   ├── Hrm.Service/                 # Lớp Nghiệp vụ (Business Logic)
│   │   ├── Implementations/         # Cài đặt logic xử lý
│   │   ├── Interfaces/              # Khai báo Hợp đồng (Interfaces)
│   │   └── DependencyInjection.cs
│   |
├── web/                             # [FRONTEND] Next.js 15 App Router
│   ├── app/                         # Routing & Pages
│   │   ├── (authenticated)/         # Protected Routes (Auth Required)
│   │   │   ├── dashboard/           # Các Module chức năng
│   │   │   │   ├── admin/           # Cấu hình hệ thống & Audit Logs
│   │   │   │   ├── approvals/       # Trung tâm Phê duyệt (Duyệt C/U/D)
│   │   │   │   ├── attendance/      # Quản lý Chấm công
│   │   │   │   ├── departments/     # Quản lý Phòng ban
│   │   │   │   ├── leave/           # Quản lý Nghỉ phép
│   │   │   │   ├── org-chart/       # Sơ đồ Tổ chức (Dynamic Chart)
│   │   │   │   ├── personnel/       # Quản lý Nhân sự
│   │   │   │   ├── payroll/         # Quản lý Lương
│   │   │   │   ├── performance/     # Đánh giá hiệu suất
│   │   │   │   ├── recruitment/     # Tuyển dụng
│   │   │   │   └── users/           # Quản lý Tài khoản & Roles
│   │   │   ├── layout.tsx           # Layout chính (Sidebar, Navbar, Realtime)
│   │   ├── context/                 # AuthContext, NotificationContext
│   │   ├── login/                   # Trang Đăng nhập
│   │   ├── layout.tsx               # Root Layout & Providers setup
│   │   └── globals.css              # Global styles (Vanilla CSS)
│   ├── components/                  # UI Components
│   │   ├── layout/                  # Sidebar, Navbar, Breadcrumbs
│   │   ├── common/                  # Buttons, Modals, Tables, Forms
│   │   └── [module]/                # Components đặc thù theo module
│   ├── locales/                     # Hệ thống Đa ngôn ngữ (i18n)
│   │   ├── [module]/                # Bản dịch vi.ts & en.ts cho từng module
│   │   └── index.ts                 # Cấu hình i18next
│   ├── services/                    # API Service Layer (Axios)
│   ├── hooks/                       # Custom React Hooks
│   └── lib/                         # Utilities & Helpers
├── tests/                           # [TESTING] Hệ thống Unit Test tập trung
│   ├── Hrm.Tests/                   # Unit Tests cho Backend (.NET 9)
│   ├── web/                         # Unit Tests cho Frontend (Vitest)
│   ├── vitest.config.ts             # Cấu hình Vitest cho Frontend
│   └── vitest.setup.ts              # Thiết lập môi trường Test (Matchers, Mocks)
└── docs/                            # Tài liệu dự án
```

---

## 2. Mô hình Dữ liệu Core (Core Entities)

Hệ thống xoay quanh các thực thể chính sau:
- **Employee & User**: Tách biệt hồ sơ nhân sự (lương, vị trí) và tài khoản đăng nhập (role, quyền).
- **Department**: Cấu trúc phân cấp (Hierarchy). Một phòng ban có thể có phòng ban con.
- **ApprovalRequest**: Cơ chế kiểm duyệt tập trung. Mọi thay đổi dữ liệu (tạo mới nhân viên, sửa lương...) đều tạo yêu cầu phê duyệt trước khi lưu chính thức.
- **Attendance**: Ghi nhận thời gian làm việc, hỗ trợ tính toán đi muộn, về sớm và làm thêm giờ (OT).
- **Role & Permission**: Hệ thống RBAC động, cho phép gán quyền chi tiết đến từng hành động.

---

## 3. Kiến trúc Backend (Clean Architecture)
- **Domain**: Chứa Business Entities, Enums và Interfaces cốt lõi.
- **Infrastructure**: Thực thi truy cập dữ liệu (EF Core), Migrations và tích hợp dịch vụ bên thứ ba.
- **Service**: Chứa logic nghiệp vụ phức tạp (ví dụ: tính lương theo giờ, logic duyệt đa cấp).
- **API**: RESTful API sử dụng ASP.NET Core 9, tích hợp SignalR cho thông báo thời gian thực.

---

## 4. Tối ưu hóa Database (Performance Optimization)

Để đảm bảo hệ thống hoạt động mượt mà khi dữ liệu lớn, các chỉ mục (Indexes) đã được thiết lập chiến lược:

- **Unique Indexes**: Áp dụng cho `User.Username`, `User.Email` và `Employee.Email` để đảm bảo tính duy nhất và tăng tốc độ tìm kiếm tài khoản.
- **Composite Indexes**:
  - `Attendance(UserId, CheckInTime)`: Tối ưu cho các truy vấn báo cáo chấm công theo tháng/năm của nhân viên.
  - `LeaveRequest(UserId, StartDate)`: Tối ưu cho việc tra cứu lịch sử nghỉ phép.
- **Foreign Key Indexes**: Tự động hoặc thủ công thêm index cho các trường như `Employee.DepartmentId`, `ApprovalRequest.Status` để tăng tốc độ Join và Filter.
- **Audit Logging**: Index trên `AuditLog.Timestamp` hỗ trợ truy xuất nhanh nhật ký hệ thống cho mục đích đối soát.

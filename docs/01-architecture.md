# 🏗 Kiến trúc Hệ thống (Architecture)

Tài liệu này cung cấp cái nhìn tổng quan về cấu trúc kỹ thuật, mô hình dữ liệu và cách tổ chức dự án HRM Pro.

## 1. Cấu trúc Thư mục (Tree View)
```text
.
├── src/                         # BACKEND (.NET 9)
│   ├── Hrm.Api/                 # API, Hubs, Controllers
│   ├── Hrm.Domain/              # Entities, Enums
│   ├── Hrm.Infrastructure/      # DbContext, Migrations
│   └── Hrm.Service/             # Business Logic
├── web/                         # FRONTEND (Next.js 15)
│   ├── components/              # Centralized UI Components
│   ├── locales/                 # Centralized i18n
│   ├── services/                # API Service Layer
│   └── hooks/                   # Custom Hooks
└── docs/                        # Tài liệu hệ thống
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
- **Domain**: Lớp lõi chứa thực thể.
- **Infrastructure**: Truy cập dữ liệu qua EF Core.
- **Service**: Xử lý logic nghiệp vụ.
- **API**: Cổng giao tiếp RESTful & SignalR.

---

## 4. Kiến trúc Frontend (Modern Next.js)
- **App Router**: Quản lý routing hiệu quả.
- **Centralized Assets**: Toàn bộ Component và Locale được tập trung để dễ bảo trì.
- **State Management**: Sử dụng Context API cho Auth và Global Notifications.

# Kế hoạch Dự án HRM

## 1. Kiến trúc dự án

Sử dụng MUI cho giao diện frontend
Đồng nhất cấu trúc i18n: Tất cả các module dùng chung thư mục `web/locales/`.
Ví dụ:

├── app/
│   └──login
|      └──page.tsx
├── locales/
|   └── login/
|       ├──vi.ts
|       └──en.ts
└── i18n.ts

.
├── src/                        # File Solution quản lý 4 Project Backend
│   ├── Hrm.slnx
│   ├── Hrm.Api/
│   ├── Hrm.Service/
│   ├── Hrm.Infrastructure/
│   └── Hrm.Domain/
│
└── web/                        # (Next.js 16) - Giao diện người dùng
    ├── app/                    # App Router (pages & layouts)
    ├── components/             # Component dùng chung
    ├── i18n.ts                 # Cấu hình đa ngôn ngữ (vi, en)
    ├── public/                 # Ảnh, icons, file tĩnh
    ├── package.json
    └── tailwind.config.ts

## 2. Công nghệ sử dụng

| Thành phần        | Công nghệ                     | Ghi chú                                |
| ----------------- | ------------------------------ | -------------------------------------- |
| **Frontend**      | Next.js 15 (App Router)       | React Server Components                |
| **UI Library**    | MUI (Material UI) v6          | Sử dụng Grid v2, slotProps             |
| **Đa ngôn ngữ**  | next-intl                     | vi / en                                |
| **Backend**       | ASP.NET Core Web API (.NET 9) | Clean Architecture                     |
| **Database**      | PostgreSQL (Supabase/Docker)  |                                        |
| **Auth**          | JWT Bearer Token              | Hỗ trợ đa nhóm quyền (RBAC)           |

## 3. Tài khoản Test (Dữ liệu mẫu chất lượng cao)

| Role               | Username          | Password     | Mô tả                             |
| ------------------ | ----------------- | ------------ | --------------------------------- |
| **Admin**          | admin             | Password@123 | Quản trị viên toàn quyền          |
| **General Manager**| gen_manager       | Password@123 | Quản lý cấp cao toàn công ty      |
| **Dept Manager IT**| dept_manager_it   | Password@123 | Quản lý phòng Công nghệ           |
| **Dept Manager HR**| dept_manager_hr   | Password@123 | Quản lý phòng Nhân sự             |
| **Employee IT**    | emp_it            | Password@123 | Nhân viên lập trình               |
| **Employee HR**    | emp_hr            | Password@123 | Nhân viên tuyển dụng              |

---

## 4. Hệ thống phân quyền (RBAC) & Kiểm duyệt

### 4.1. Sơ đồ cấp bậc mới
```
Admin (Hệ thống)
  └── General Manager (Toàn công ty)
        └── Department Manager (Phòng ban)
              └── Employee (Cá nhân)
```

### 4.2. Hệ thống Phê duyệt (Approval Flow)
- Mọi thay đổi quan trọng (nhân sự, lương, đơn từ) có thể được cấu hình qua luồng duyệt.
- **Admin/General Manager**: Duyệt mọi yêu cầu trong hệ thống.
- **Department Manager**: Duyệt yêu cầu thuộc phòng ban mình quản lý.

---

## 5. Lộ trình triển khai

### Giai đoạn 1 - 6: Hoàn thiện tính năng cơ bản & UX
- ✅ Đã hoàn thành toàn bộ các module: Nhân sự, Chấm công, Lương, Đơn từ, Tuyển dụng, KPI, Cấu hình.

### Giai đoạn 7: Bảo mật & RBAC Nâng cao (Đã hoàn thành)
| Bước | Công việc                                        | Output                              | Trạng thái |
| ---- | ------------------------------------------------ | ----------------------------------- | ---------- |
| 7.1  | API Security & RBAC chặt chẽ                     | Phân quyền Endpoint `[Authorize]`   | ✅ Hoàn thành |
| 7.2  | Quản lý Quyền (Roles & Permissions)              | Giao diện Settings tùy chỉnh quyền  | ✅ Hoàn thành |
| 7.3  | Hệ thống Kiểm duyệt (Approval Request)           | Luồng duyệt 2 cấp (Toàn cty/Phòng ban)| ✅ Hoàn thành |
| 7.4  | Nhật ký hoạt động (Audit Logs)                   | Theo dõi lịch sử thay đổi dữ liệu   | ✅ Hoàn thành |

### Giai đoạn 8: Đa chi nhánh & Triển khai Docker
| Bước | Công việc                                        | Output                              | Trạng thái |
| ---- | ------------------------------------------------ | ----------------------------------- | ---------- |
| 8.1  | Quản lý Đa chi nhánh (Multi-branch)              | Lọc dữ liệu theo `BranchId`         | ✅ Hoàn thành |
| 8.2  | Tối ưu hóa Database (Indexing & Partitioning)    | Hiệu năng xử lý dữ liệu lớn         | ⏳ Tiếp theo  |
| 8.3  | Dockerize & CI/CD                                | File docker-compose hoàn thiện      | ✅ Hoàn thành |
| 8.4  | Unit Test & Integration Test                    | Độ phủ code > 70%                   | ⏳ Tiếp theo  |

# Kế hoạch Dự án HRM Pro

## 1. Kiến trúc dự án

Dự án tuân thủ mô hình **Clean Architecture** ở Backend và **App Router Modern** ở Frontend.

```text
.
├── src/                        # Backend .NET 9
│   ├── Hrm.Api/                # API & Hubs
│   ├── Hrm.Service/            # Business Logic
│   ├── Hrm.Infrastructure/     # Data Access
│   └── Hrm.Domain/             # Entities
└── web/                        # Frontend Next.js 15
    ├── app/                    # Pages & Layouts
    ├── components/             # Reusable UI
    ├── locales/                # i18n Messages (Centralized)
    └── services/               # API Call Layer
```

---

## 2. Công nghệ sử dụng

| Thành phần        | Công nghệ                     | Trạng thái |
| ----------------- | ------------------------------ | ---------- |
| **Frontend**      | Next.js 15 (App Router)       | ✅ Đã áp dụng |
| **UI Library**    | MUI (Material UI) v6          | ✅ Đã áp dụng |
| **Đa ngôn ngữ**  | next-intl                     | ✅ Đã áp dụng |
| **Backend**       | ASP.NET Core Web API (.NET 9) | ✅ Đã áp dụng |
| **Database**      | SQL Server (EF Core)          | ✅ Đã áp dụng |
| **Realtime**      | SignalR                       | ✅ Đã áp dụng |

---

## 3. Tài khoản Thử nghiệm

| Role               | Username          | Password     | Phạm vi quyền hạn                 |
| ----------------- | ----------------- | ------------ | --------------------------------- |
| **Admin**          | admin             | Password@123 | Toàn quyền hệ thống               |
| **General Manager**| gen_manager       | Password@123 | Quản lý toàn bộ công ty           |
| **Dept Manager**   | dept_manager_it   | Password@123 | Quản lý phòng Công nghệ           |
| **Employee**       | emp_it            | Password@123 | Nhân viên cá nhân                 |

---

## 4. Lộ trình triển khai (Roadmap)

### Giai đoạn 1-6: Tính năng Cốt lõi (Hoàn thành)
- ✅ **Nhân sự**: Quản lý hồ sơ, hợp đồng, chi nhánh.
- ✅ **Phòng ban**: Cấu trúc phân cấp (Hierarchy) & **Sơ đồ tổ chức (Org Chart)**.
- ✅ **Chấm công**: Check-in/out, tính giờ làm, quản lý OT.
- ✅ **Lương**: Tính lương theo giờ, bảng lương hàng tháng.
- ✅ **Phê duyệt**: Hệ thống phê duyệt trung tâm cho mọi thay đổi dữ liệu (Centralized Approvals).

### Giai đoạn 7: Đa ngôn ngữ & UX (Hoàn thành)
- ✅ Triển khai **i18n** toàn hệ thống (VI/EN).
- ✅ Tối ưu hóa UI với MUI v6 & Responsive Layout.
- ✅ Hệ thống thông báo Realtime với SignalR.

### Giai đoạn 8: Bảo mật & Hạ tầng (Trong tiến trình)
| Bước | Công việc                                        | Trạng thái |
| ---- | ------------------------------------------------ | ---------- |
| 8.1  | Audit Logs chi tiết (Tracking changes)           | ✅ Hoàn thành |
| 8.2  | Multi-branch (Lọc dữ liệu theo chi nhánh)        | ✅ Hoàn thành |
| 8.3  | Dockerization & Deployment Scripts               | ✅ Hoàn thành |
| 8.4  | Unit Tests (Backend & Frontend)                  | ✅ Hoàn thành |
| 8.5  | Tối ưu hóa hiệu năng Database (Indexing)         | ✅ Hoàn thành |

---

### Giai đoạn 9: Tinh chỉnh Chấm công & Lương (Refined Attendance & Payroll)
| Bước | Công việc                                        | Trạng thái |
| ---- | ------------------------------------------------ | ---------- |
| 9.1  | Logic tính khấu trừ đi muộn/về sớm (Deductions)  | 🔄 Đang chờ duyệt |
| 9.2  | Tích hợp Nghỉ phép vào bảng lương (Leave Sync)   | 🔄 Đang chờ duyệt |
| 9.3  | Dashboard Lương & Công dự kiến (Live Dashboard)  | 🔄 Đang chờ duyệt |
| 9.4  | Hệ thống Chốt & Khóa bảng lương (Lock Payroll)  | 🔄 Đang chờ duyệt |

---

## 5. Mục tiêu tương lai
- Tích hợp AI hỗ trợ phân tích hiệu suất nhân viên.
- Ứng dụng di động (Mobile App) dành cho nhân viên.
- Mở rộng hệ thống API cho tích hợp bên thứ ba.

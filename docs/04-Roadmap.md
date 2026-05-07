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
| **UI Library**    | MUI (Material UI)             |                                        |
| **Icons**         | MUI Icons / Lucide React      |                                        |
| **Styling**       | Tailwind CSS + MUI Theme      |                                        |
| **Đa ngôn ngữ**  | next-intl                     | vi / en                                |
| **Backend**       | ASP.NET Core Web API (.NET 8) | Clean Architecture                     |
| **ORM**           | Entity Framework Core         |                                        |
| **Database**      | Supabase (PostgreSQL)         | Hosted DB                              |
| **Auth**          | JWT Bearer Token              | Lưu trong localStorage                 |
| **Biểu đồ**      | Recharts hoặc MUI X Charts   |                                        |
| **Sơ đồ tổ chức** | React Flow                   | Phóng to, thu nhỏ, kéo thả            |

## 3. Tài khoản Test

| Role       | Username   | Password       | Email                         | Mô tả             |
| ---------- | ---------- | -------------- | ----------------------------- | ------------------ |
| Admin      | admin      | Admin@123      | admin@example.com             | Quản trị viên      |
| Manager    | manager    | Manager@123    | manager@example.com           | Quản lý            |
| Personnel  | personnel  | personnel@123  | personnel@example.com         | Quản lý nhân sự    |
| Attendance | attendance | attendance@123 | attendance@example.com        | Quản lý chấm công  |
| Employee   | employee   | Employee@123   | employee@example.com          | Nhân viên          |

## 4. Hệ thống phân quyền (RBAC)

### 4.1. Sơ đồ cấp bậc

```
Admin (Quản trị viên)
  └── Manager (Quản lý)
        ├── Personnel (Quản lý nhân sự)
        └── Attendance (Quản lý chấm công)
              └── Employee (Nhân viên)
```

### 4.2. Ma trận quyền truy cập theo Module

| Module              | Admin | Manager | Personnel | Attendance | Employee |
| ------------------- | :---: | :-----: | :-------: | :--------: | :------: |
| Dashboard (Tổng quan) | ✅   | ✅      | ✅        | ✅         | ✅       |
| Nhân sự             | ✅    | ✅      | ✅        | ❌         | ❌       |
| Chấm công           | ✅    | ✅      | ❌        | ✅         | 👁️ (xem) |
| Lương               | ✅    | ✅      | ❌        | ✅         | 👁️ (cá nhân) |
| Yêu cầu / Đơn từ   | ✅    | ✅      | ✅        | ✅         | ✅       |
| Cài đặt hệ thống   | ✅    | ❌      | ❌        | ❌         | ❌       |
| Profile (cá nhân)   | ✅    | ✅      | ✅        | ✅         | ✅       |

### 4.3. Quy tắc đặc biệt

- **Admin**: Truy cập toàn bộ hệ thống. Có dropdown chọn Role trên Navbar để xem giao diện của từng Role (chế độ preview).
- **Admin & Manager**: Chỉnh sửa thông tin cá nhân **không cần duyệt**.
- **Personnel, Attendance, Employee**: Chỉnh sửa thông tin cá nhân phải gửi yêu cầu → Personnel duyệt → mới cập nhật DB.

---

## 5. Mô tả chi tiết các Module

### 5.1. Module: Authentication

| API              | Method | Mô tả                                       |
| ---------------- | ------ | -------------------------------------------- |
| `/api/auth/login`  | POST   | Nhận username + password → trả JWT Token + UserInfo |
| `/api/auth/refresh` | POST  | Làm mới token khi hết hạn                   |

**Frontend:** Trang `/login` → Form (username, password) → Gọi API → Lưu token → Redirect `/dashboard`.

### 5.2. Module: Dashboard (Trang chủ)

Nội dung Dashboard thay đổi theo Role:

| Thành phần            | Admin | Manager | Personnel | Attendance | Employee |
| --------------------- | :---: | :-----: | :-------: | :--------: | :------: |
| Thông báo (inbox)     | Tất cả | Của tôi + cấp dưới | Của tôi | Của tôi | Của tôi |
| Sơ đồ tổ chức         | ✅    | ✅      | ✅        | ✅         | ✅       |
| Thống kê nhân sự      | ✅ (toàn hệ thống) | ✅ (phòng ban) | ✅ (phòng ban) | ❌ | ❌ |
| Thống kê chấm công    | ✅ (toàn hệ thống) | ✅ (phòng ban) | ❌ | ✅ (phòng ban) | ❌ |
| Thống kê lương cá nhân | ❌   | ❌      | ❌        | ❌         | ✅       |
| Thống kê chi phí lương | ✅   | ✅      | ❌        | ✅         | ❌       |

**Thống kê nhân sự bao gồm:**
- Tổng nhân viên (hoạt động / nghỉ việc / mới trong tháng)
- Tỉ lệ đi làm / nghỉ phép / đi trễ hôm nay
- Biểu đồ xu hướng theo tháng

**Thống kê chấm công bao gồm:**
- Số ngày công, ngày nghỉ, làm thêm giờ (tháng hiện tại, có thể đổi tháng/năm)
- Biểu đồ chi phí lương theo phòng ban / chức vụ

### 5.3. Module: Quản lý Nhân sự

> Truy cập: Admin, Manager, Personnel

**Danh sách nhân viên:**
- Bảng dữ liệu: Họ tên, Mã NV, Phòng ban, Chức vụ, Email, SĐT, Trạng thái
- Tìm kiếm, lọc theo phòng ban / chức vụ / trạng thái
- Phân trang

**Thao tác CRUD:**
- Thêm mới nhân viên
- Xem chi tiết nhân viên
- Chỉnh sửa thông tin
- Xóa mềm (soft delete) → Có thể khôi phục
- Xuất danh sách Excel

### 5.4. Module: Chấm công & Lương

> Truy cập: Admin, Manager, Attendance | Employee chỉ xem cá nhân

**Bảng chấm công:**

| Cột              | Mô tả                        |
| ----------------- | ----------------------------- |
| Họ tên            | Tên nhân viên                 |
| Mã NV             | Mã nhân viên                  |
| Phòng ban          | Phòng ban                     |
| Chức vụ           | Chức vụ                       |
| Tổng ngày công     | Số ngày trong kỳ              |
| Ngày đi làm       | Số ngày đi làm thực tế        |
| Ngày nghỉ phép     | Có phép (không trừ lương)      |
| Ngày làm thêm giờ  | Overtime                      |

**Bảng lương:** (có thể lọc từ ngày → đến ngày, xuất Excel/PDF)

| Cột              | Mô tả                        |
| ----------------- | ----------------------------- |
| Lương cơ bản      | Theo hợp đồng                 |
| Phụ cấp / Thưởng  | Tiền thưởng, phụ cấp          |
| Khấu trừ / Phạt   | Vi phạm, trừ lương            |
| Tổng lương         | = Cơ bản + Thưởng - Khấu trừ  |
| Đã ứng            | Tiền đã ứng trước              |
| Còn nhận          | = Tổng - Đã ứng               |

### 5.5. Module: Yêu cầu / Đơn từ

> Truy cập: Tất cả Role

**Loại yêu cầu:**
- Nghỉ phép (annual leave)
- Nghỉ ốm (sick leave)
- Nghỉ lễ (holiday leave)
- Nghỉ việc (resignation)
- Yêu cầu chỉnh giờ vào/ra (check-in/out adjustment)
- Yêu cầu cập nhật thông tin cá nhân

**Luồng xử lý:**
```
Employee tạo yêu cầu → Personnel / Attendance duyệt → Cập nhật DB
                                                     → Từ chối (ghi lý do)
```

**Trạng thái đơn:** Chờ duyệt → Đã duyệt / Từ chối / Đã hủy

### 5.6. Module: Profile (Thông tin cá nhân)

**Các trường có thể xem/sửa:**
- Ảnh đại diện (upload → lưu DB)
- Họ tên, Username
- Email, Số điện thoại
- Địa chỉ, Giới tính, Ngày sinh
- Mật khẩu (tự do thay đổi, không cần duyệt)

**Quy tắc cập nhật:**
- Admin & Manager → cập nhật trực tiếp.
- Các Role khác → gửi yêu cầu → Personnel duyệt.
- Mật khẩu → tất cả tự đổi, không cần duyệt.

---

## 6. Lộ trình triển khai
i18n sẽ lòng vào từng fodel trong page theo cấu trúc: login/locales/vi.ts, login/locales/en.ts, page.tsx

### Giai đoạn 1 - 4: Nền tảng đến Hoàn thiện
- (Đã hoàn thành trước đó: Khởi tạo src/Frontend, Phân quyền, Các module cơ bản CRUD).

### Giai đoạn 5: Module nâng cao

| Bước | Công việc                                        | Output                              | Trạng thái |
| ---- | ------------------------------------------------ | ----------------------------------- | ---------- |
| 5.1  | Chấm công nâng cao & Tính lương tự động          | Bảng lương tính theo ngày công      | ✅ Hoàn thành |
| 5.2  | Quản lý Đơn từ (Leave Workflow)                  | Luồng duyệt đơn realtime            | ✅ Hoàn thành |
| 5.3  | Quản lý Tuyển dụng (Recruitment)                 | Tin tuyển dụng + Hồ sơ ứng viên     | ✅ Hoàn thành |
| 5.4  | Hoàn thiện Chấm công & Phòng ban                 | Widget Check-in + CRUD Phòng ban    | ✅ Hoàn thành |
| 5.5  | Đánh giá KPI & Performance                       | Hệ thống đánh giá hiệu suất         | ✅ Hoàn thành |
| 5.6  | Cài đặt Hệ thống (Admin Settings)                | Cấu hình giờ giấc, lịch nghỉ lễ     | ✅ Hoàn thành |

### Giai đoạn 6: Tối ưu hóa Kiến trúc & UX/UI
| Bước | Công việc                                        | Output                              | Trạng thái |
| ---- | ------------------------------------------------ | ----------------------------------- | ---------- |
| 6.1  | Service-Oriented Architecture                    | Di dời API calls sang `services/`   | ✅ Hoàn thành |
| 6.2  | Xuất Báo cáo Server-side (Excel & PDF)           | Bảng lương, Nhân sự, Payslip        | ✅ Hoàn thành |
| 6.3  | Hệ thống Thông báo (SignalR) & Smart Routing     | UI Navbar chuông thông báo          | ✅ Hoàn thành |
| 6.4  | Dashboard Dữ liệu thực & i18n toàn diện          | Biểu đồ kết nối DB, i18n 100%       | ✅ Hoàn thành |
| 6.5  | Chuẩn hóa UI & UX (Density & Radius)             | Đồng bộ 6px radius, Compact UI      | ✅ Hoàn thành |
| 6.6  | Rà soát và Làm sạch Code (Consistency Audit)     | Unify Realtime hook, remove dead code| ✅ Hoàn thành |

### Giai đoạn 7: Bảo mật, Biểu đồ & DevOps
| Bước | Công việc                                        | Output                              | Trạng thái |
| ---- | ------------------------------------------------ | ----------------------------------- | ---------- |
| 7.1  | API Security & RBAC chặt chẽ                     | Phân quyền Endpoint `[Authorize]`   | ⏳ Đang làm   |
| 7.2  | Quản lý Quyền (Roles & Permissions)              | Giao diện Settings tùy chỉnh quyền  | ⏳ Sắp tới   |
| 7.3  | Trực quan hóa dữ liệu (Advanced Charts)          | MUI X Charts cho Dashboard          | ⏳ Sắp tới   |
| 7.4  | Dockerize & Triển khai (CI/CD)                   | Đóng gói Docker, Staging deploy     | ⏳ Dự kiến  |

# Kế hoạch Dự án HRM

## 1. Kiến trúc dự án

Sử dụng MUI cho giao diện frontend
i18n viết theo cấu trúc :
Ví dụ:
    login
    ├── locales
    │    ├──vi.ts
    │    └──en.ts
    └── page.tsx

```
Hrm/
├── Hrm.slnx                    # File Solution quản lý 4 Project Backend
├── Hrm.Api/                    # (Web API) - Tầng giao tiếp, xử lý request/response
├── Hrm.Service/                # (Class Library) - Tầng xử lý nghiệp vụ (Business Logic)
├── Hrm.Infrastructure/         # (Class Library) - Tầng kết nối Database (EF Core)
├── Hrm.Domain/                 # (Class Library) - Tầng chứa Entities & Interfaces
│
└── hrm.web/                    # (Next.js 15) - Giao diện người dùng
    ├── app/                    # App Router (pages & layouts)
    ├── components/             # Component dùng chung
    ├── i18n/                   # Cấu hình đa ngôn ngữ (vi, en)
    ├── public/                 # Ảnh, icons, file tĩnh
    ├── package.json
    └── tailwind.config.ts
```

## 2. Công nghệ sử dụng

| Thành phần        | Công nghệ                     | Ghi chú                                |
| ----------------- | ------------------------------ | -------------------------------------- |
| **Frontend**      | Next.js 15 (App Router)       | React Server Components                |
| **UI Library**    | MUI (Material UI)             | ~~HeroUI~~ — đã loại bỏ               |
| **Icons**         | MUI Icons / Lucide React      |                                        |
| **Styling**       | Tailwind CSS + MUI Theme      |                                        |
| **Đa ngôn ngữ**  | next-intl                     | vi / en                                |
| **Backend**       | ASP.NET Core Web API (.NET 8) | Clean Architecture                     |
| **ORM**           | Entity Framework Core         | ~~Prisma~~ — không dùng cho .NET       |
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

**Bảng lương:** (có thể lọc từ ngày → đến ngày, xuất Excel)

| Cột              | Mô tả                        |
| ----------------- | ----------------------------- |
| Lương cơ bản      | Theo hợp đồng                 |
| Phụ cấp / Thưởng  | Tiền thưởng, phụ cấp          |
| Khấu trừ / Phạt   | Vi phạm, trừ lương            |
| Tổng lương         | = Cơ bản + Thưởng - Khấu trừ  |
| Đã ứng            | Tiền đã ứng trước              |
| Còn nhận          | = Tổng - Đã ứng               |

**Ứng lương:**
- Danh sách yêu cầu ứng lương (số tiền, ngày ứng, trạng thái)
- Lọc theo năm

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
### Giai đoạn 1: Nền tảng (Foundation)

| Bước | Công việc                                        | Output                              |
| ---- | ------------------------------------------------ | ----------------------------------- |
| 1.1  | Khởi tạo Backend: Solution + 4 Projects          | Hrm.slnx chạy được                 |
| 1.2  | Thiết lập EF Core + kết nối Supabase              | DbContext + connection string       |
| 1.3  | Migration: Bảng Users, Roles                     | DB có 2 bảng, data seed 5 tài khoản |
| 1.4  | API Login (POST `/api/auth/login`)                | Trả JWT Token + UserInfo            |
| 1.5  | Khởi tạo Frontend: Next.js 15 + MUI + next-intl  | Trang trắng chạy được               |
| 1.6  | Trang Login + gọi API + lưu token + redirect     | Login hoạt động end-to-end           |
| 1.7  | Thiết lập Swagger (UI + JWT Auth support)        | API documentation chuyên nghiệp      |

### Giai đoạn 2: Layout & Phân quyền

| Bước | Công việc                                        | Output                              |
| ---- | ------------------------------------------------ | ----------------------------------- |
| 2.1  | Layout chính: Sidebar + Navbar + Content area    | Layout responsive                    |
| 2.2  | Sidebar động theo Role (dựa trên ma trận §4.2)  | Menu thay đổi theo quyền             |
| 2.3  | Admin: Dropdown chọn Role preview trên Navbar    | Admin có thể xem giao diện từng Role |
| 2.4  | Đa ngôn ngữ: Tích hợp next-intl vào layout      | Chuyển đổi vi/en                     |

### Giai đoạn 3: Các Module nghiệp vụ

| Bước | Công việc                                        | Output                              |
| ---- | ------------------------------------------------ | ----------------------------------- |
| 3.1  | Module Dashboard: Thông báo + Sơ đồ + Thống kê  | Dashboard hoàn chỉnh theo Role       |
| 3.2  | Module Nhân sự: CRUD nhân viên                   | Bảng + Form + Tìm kiếm              |
| 3.3  | Module Chấm công: Bảng công + Lương              | Bảng chấm công + Bảng lương          |
| 3.4  | Module Yêu cầu: Tạo + Duyệt đơn từ              | Luồng tạo-duyệt hoàn chỉnh          |
| 3.5  | Module Profile: Xem + Sửa thông tin cá nhân     | Profile + luồng duyệt cập nhật      |

### Giai đoạn 4: Hoàn thiện

| Bước | Công việc                                        | Output                              |
| ---- | ------------------------------------------------ | ----------------------------------- |
| 4.1  | Xuất Excel (danh sách NV, bảng lương)            | Download file .xlsx                  |
| 4.2  | Sơ đồ tổ chức với React Flow                    | Sơ đồ interactive                    |
| 4.3  | Thông báo realtime (SignalR hoặc polling)        | Inbox cập nhật tự động               |
| 4.4  | Testing + Fix bug + Tối ưu performance          | Hệ thống ổn định                     |

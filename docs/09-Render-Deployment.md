# Hướng dẫn triển khai lên Render (Render Deployment Guide)

Tài liệu này hướng dẫn chi tiết cách triển khai hệ thống HRM lên nền tảng Render sử dụng Docker.

## Thứ tự triển khai
Hệ thống cần được triển khai theo thứ tự: **Database -> Backend (API) -> Frontend (Web)**.

---

## 1. Triển khai Database (PostgreSQL)

Render cung cấp dịch vụ PostgreSQL quản lý sẵn, giúp dữ liệu ổn định hơn so với việc chạy trong Docker container.

1.  Truy cập Dashboard Render -> **New** -> **PostgreSQL**.
2.  Thiết lập:
    *   **Name:** `hrm-db`
    *   **Database:** `Hrm_MUI`
    *   **User:** `postgres`
    *   **Region:** `Singapore (Southeast Asia)`
3.  Sau khi tạo xong, lưu lại **Internal Database URL** (dùng cho Backend) và **External Database URL** (dùng để quản lý từ máy cá nhân).

---

## 2. Triển khai Backend (ASP.NET Core API)

1.  **New** -> **Web Service**.
2.  Kết nối với Repository GitHub của bạn.
3.  Thiết lập cấu hình:
    *   **Name:** `hrm-api`
    *   **Region:** `Singapore`
    *   **Runtime:** `Docker`
    *   **Root Directory:** (Để trống)
    *   **Dockerfile Path:** `src/Hrm.Api/Dockerfile`
4.  **Environment Variables:**
    | Key | Value | Ghi chú |
    | :--- | :--- | :--- |
    | `ConnectionStrings__DefaultConnection` | `postgresql://...` | Dán **Internal Database URL** từ bước 1 |
    | `ASPNETCORE_ENVIRONMENT` | `Production` | Chế độ chạy sản xuất |
    | `Jwt__Key` | `Chuỗi_Bí_Mật_Trên_32_Ký_Tự` | Khóa bảo mật cho Token |
    | `SeedDatabase` | `true` | Tự động tạo dữ liệu mẫu lần đầu |
    | `ApplyMigrationsOnStartup` | `true` | Tự động cập nhật Database schema |

---

## 3. Triển khai Frontend (Next.js)

1.  **New** -> **Web Service**.
2.  Kết nối với cùng Repository GitHub.
3.  Thiết lập cấu hình:
    *   **Name:** `hrm-web`
    *   **Region:** `Singapore`
    *   **Runtime:** `Docker`
    *   **Root Directory:** `web`
    *   **Dockerfile Path:** `Dockerfile`
4.  **Environment Variables:**
    | Key | Value | Ghi chú |
    | :--- | :--- | :--- |
    | `NEXT_PUBLIC_API_URL` | `https://hrm-api.onrender.com/api` | URL của Backend đã tạo ở bước 2 |

---

## 4. Cấu hình CORS (Sau khi hoàn tất)

Sau khi `hrm-web` đã khởi chạy thành công và có URL chính thức, bạn cần quay lại cấu hình Backend để cho phép Frontend truy cập:

1.  Mở Web Service `hrm-api` -> **Environment**.
2.  Cập nhật biến môi trường:
    *   `CORS__AllowedOrigins`: `https://hrm-web.onrender.com` (Thay bằng URL thực tế của bạn).

---

## Lưu ý cho bản Free
*   **Cold Start:** Các dịch vụ sẽ "ngủ" sau 15 phút không có lượt truy cập. Lần gọi đầu tiên sẽ mất 30-60 giây để khởi động lại.
*   **Health Checks:** Đảm bảo Backend lắng nghe ở cổng `8080` (đã cấu hình sẵn trong Dockerfile).
*   **Build Context:** Backend dùng root directory làm build context, trong khi Frontend dùng thư mục `web`.

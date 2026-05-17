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
    *   **Database:** `hrmmui`
    *   **User:** `postgres1`
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
    | `ConnectionStrings__DefaultConnection` | `Host=...;Port=5432;Database=...;Username=...;Password=...` | **Lưu ý:** Không dán nguyên link URL `postgresql://`! Bạn phải chuyển đổi Internal URL của Render sang định dạng chuẩn này. Xem ví dụ bên dưới. |
    | `ASPNETCORE_ENVIRONMENT` | `Production` | Chế độ chạy sản xuất |
    | `Jwt__Key` | `Chuỗi_Bí_Mật_Trên_32_Ký_Tự` | Khóa bảo mật cho Token |
    | `SeedDatabase` | `true` | Tự động tạo dữ liệu mẫu lần đầu |
    | `ApplyMigrationsOnStartup` | `true` | Tự động cập nhật Database schema |

> 💡 **Cách chuyển đổi Connection String của Render cho Backend C#:**
> Render sẽ cung cấp Internal URL có dạng: `postgres://userABC:pass123@dpg-cxyz-a/dbname`
> Bạn cần tách các thông số ra và điền vào theo mẫu:
> `Host=dpg-cxyz-a;Port=5432;Database=dbname;Username=userABC;Password=pass123`
postgresql://postgres1:7E91m3UmB7ICK4LdWmxt9EumRiZWkjrO@dpg-d84mf1jeo5us73ef1esg-a/hrmmui

Host=dpg-d84mf1jeo5us73ef1esg-a;Port=5432;Database=hrmmui;Username=postgres1;Password=7E91m3UmB7ICK4LdWmxt9EumRiZWkjrO

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
    *   `CORS__AllowedOrigins`: `https://hrm-web.onrender.com` (Thay bằng URL thực tế của Frontend).
    *   *Lưu ý*: Nếu có nhiều URL (ví dụ cả local và production), ngăn cách bằng dấu phẩy: `https://hrm-web.onrender.com,http://localhost:3000`

---

## 5. Cấu hình khi triển khai nơi khác hoặc đổi Domain

Khi bạn **chuyển server**, **đổi domain/tên miền**, hoặc triển khai lên một nhà cung cấp khác ngoài Render (Vps, AWS, Vercel,...), hãy chú ý cập nhật các biến môi trường sau:

### Thay đổi Backend (C# API)
- **`ConnectionStrings__DefaultConnection`**: Cập nhật lại URL kết nối tới Database mới.
- **`CORS__AllowedOrigins`**: Cập nhật Domain mới của Frontend để tránh lỗi CORS chặn API.
- **`Jwt__Key`**, **`Jwt__Issuer`**, **`Jwt__Audience`**: Nên thiết lập lại khóa mới bảo mật hơn và khớp với domain mới (không bắt buộc nhưng khuyến nghị).

### Thay đổi Frontend (Next.js)
- **`NEXT_PUBLIC_API_URL`**: Đây là biến quan trọng nhất. Nếu backend đổi URL, bạn **phải** cập nhật lại biến này ở môi trường triển khai của Frontend thành URL Backend mới (VD: `https://api.yourdomain.com/api`).
  *Lưu ý: Sau khi đổi biến này trên môi trường như Vercel hoặc Render, bạn bắt buộc phải Trigger Deploy / Build lại để Next.js nhận cấu hình tĩnh mới.*

---

## Lưu ý cho bản Free
*   **Cold Start:** Các dịch vụ sẽ "ngủ" sau 15 phút không có lượt truy cập. Lần gọi đầu tiên sẽ mất 30-60 giây để khởi động lại.
*   **Health Checks:** Đảm bảo Backend lắng nghe ở cổng `8080` (đã cấu hình sẵn trong Dockerfile).
*   **Build Context:** Backend dùng root directory làm build context, trong khi Frontend dùng thư mục `web`.

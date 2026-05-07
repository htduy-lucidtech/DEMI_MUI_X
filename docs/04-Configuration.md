# ⚙️ Cấu hình Hệ thống (Configuration)

Tài liệu này hướng dẫn cách cấu hình các tham số môi trường cho cả Backend và Frontend để hệ thống vận hành chính xác.

## 1. Backend Configuration (ASP.NET Core)

Các cấu hình chính nằm trong file `src/Hrm.Api/appsettings.json`.

### Kết nối Cơ sở dữ liệu (Connection Strings)
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=HrmDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```
*Lưu ý: Đảm bảo SQL Server của bạn đã được khởi động và cho phép kết nối.*

### Bảo mật JWT (JSON Web Token)
```json
"Jwt": {
  "Key": "YourVerySecretKeyHere...",
  "Issuer": "HrmApi",
  "Audience": "HrmWeb"
}
```
*Lưu ý: Key phải đủ độ dài và bảo mật để đảm bảo tính an toàn cho hệ thống định danh.*

---

## 2. Frontend Configuration (Next.js)

Các biến môi trường được đặt trong file `web/.env.local`.

### Kết nối API
```env
NEXT_PUBLIC_API_URL=http://localhost:5181/api
```
- **NEXT_PUBLIC_API_URL**: Địa chỉ URL của Backend API. Frontend sẽ sử dụng địa chỉ này để thực hiện các yêu cầu dữ liệu.

### Ngôn ngữ mặc định
Cấu hình ngôn ngữ được quản lý qua Cookie `NEXT_LOCALE`, tuy nhiên giá trị khởi tạo mặc định được quy định trong `web/i18n.ts` là `vi`.

---

## 3. Cấu hình Realtime (SignalR)

- **CORS**: Backend phải cho phép Origin từ Frontend (thường là `http://localhost:3000`) để SignalR có thể kết nối thành công.
- **Hub Endpoint**: Mặc định là `/notificationHub`.

---

## 4. Lưu ý khi triển khai (Deployment)

Khi chuyển từ môi trường Phát triển (Development) sang Sản xuất (Production):
1. Cập nhật Connection String tới Database Production.
2. Thay đổi JWT Key sang một chuỗi ngẫu nhiên cực kỳ bảo mật.
3. Cập nhật `NEXT_PUBLIC_API_URL` tới domain thật của Backend API.
4. Đảm bảo cấu hình HTTPS cho cả 2 phía.

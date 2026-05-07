# HRM Pro - Hệ thống Quản trị Nhân sự Hiện đại

Dự án quản lý nhân sự (HRM) được xây dựng trên nền tảng **ASP.NET Core 9** (Backend) và **Next.js 15** (Frontend).

## 📚 Tài liệu Hệ thống

Vui lòng tham khảo bộ tài liệu được chuẩn hóa dưới đây:

1. **[01. Kiến trúc Hệ thống](docs/01-Architecture.md)**: Tổng quan về cấu trúc thư mục, mô hình dữ liệu và sơ đồ khối.
2. **[02. Hướng dẫn Phát triển](docs/02-Development.md)**: Tiêu chuẩn lập trình, quy tắc đa ngôn ngữ và quy trình thêm module mới.
3. **[03. Tính năng & Nghiệp vụ](docs/03-Features.md)**: Chi tiết về Chấm công, Nghỉ phép, Tuyển dụng và SignalR Realtime.
4. **[04. Cấu hình Hệ thống](docs/04-Configuration.md)**: Hướng dẫn thiết lập biến môi trường và kết nối API.
5. **[05. Kế hoạch & Roadmap](docs/05-Roadmap.md)**: Trạng thái dự án và các đầu việc sắp tới.

## 🛠 Công nghệ cốt lõi

### Backend (.NET 9)
- Clean Architecture (Domain, Infrastructure, Service, API).
- Entity Framework Core & SQL Server.
- SignalR Realtime Communication.

### Frontend (Next.js 15)
- App Router & Material UI v6.
- next-intl (Centralized Locales).
- Axios (Centralized API Service).

## 🚀 Cách chạy dự án

### Backend
1. Mở `src/Hrm.slnx` bằng Visual Studio.
2. Chạy Project `Hrm.Api`.

### Frontend
1. Mở thư mục `web/`.
2. Chạy `npm install` và `npm run dev`.

---
*Duy trì và phát triển bởi Đội ngũ Kỹ thuật HRM Pro.*

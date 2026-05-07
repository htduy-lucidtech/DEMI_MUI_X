# HRM Pro - Hệ thống Quản trị Nhân sự Hiện đại

Dự án quản lý nhân sự (HRM) được xây dựng trên nền tảng **ASP.NET Core 9** (Backend) và **Next.js 15** (Frontend).

## 📚 Tài liệu Hệ thống

Vui lòng tham khảo các tài liệu chuyên sâu dưới đây để nắm vững dự án:

1. **[01. Kiến trúc Hệ thống](docs/01-architecture.md)**: Tổng quan về Tech Stack, sơ đồ thư mục và mô hình dữ liệu (BE & FE).
2. **[02. Hướng dẫn Phát triển](docs/02-development.md)**: Các tiêu chuẩn lập trình, quy tắc đa ngôn ngữ và quy trình thêm tính năng mới.
3. **[03. Tính năng & Nghiệp vụ](docs/03-features.md)**: Chi tiết về Chấm công, Nghỉ phép, Tuyển dụng và cơ chế Realtime SignalR.
4. **[04. Kế hoạch & Roadmap](docs/04-roadmap.md)**: Trạng thái triển khai và các hạng mục công việc trong tương lai.

## 🛠 Công nghệ cốt lõi

### Backend (.NET 9)
- Clean Architecture (Domain, Infrastructure, Service, API).
- Entity Framework Core (SQL Server).
- SignalR (Realtime Communication).
- JWT Authentication.

### Frontend (Next.js 15)
- App Router & Server Components.
- Material UI (MUI) v6.
- next-intl (Centralized Localization).
- Axios (Centralized API Service).

## 🚀 Cách chạy dự án

### Backend
1. Mở `src/Hrm.slnx` bằng Visual Studio.
2. Cấu hình Connection String trong `appsettings.json`.
3. Chạy Project `Hrm.Api`.

### Frontend
1. Mở thư mục `web/`.
2. Chạy `npm install`.
3. Chạy `npm run dev` (truy cập `localhost:3000`).

---
*Duy trì và phát triển bởi Đội ngũ Kỹ thuật HRM Pro.*

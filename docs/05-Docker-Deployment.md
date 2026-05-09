# Kế hoạch Triển khai Docker (Docker Deployment Plan)

Tài liệu này trình bày kế hoạch chi tiết để đóng gói (containerize) và triển khai hệ thống HRM (Human Resource Management) bằng Docker và Docker Compose.

## 1. Kiến trúc Triển khai

Hệ thống sẽ được chia thành các container riêng biệt để đảm bảo tính module và dễ quản lý:

- **Frontend Container**: Chạy ứng dụng Next.js (chế độ Production).
- **Backend Container**: Chạy ứng dụng ASP.NET Core API.
- **Database Container**: Chạy Microsoft SQL Server (Linux-based).

## 2. Chiến lược Container hóa

### 2.1 Backend (ASP.NET Core)
- **Dockerfile**: Sử dụng Multi-stage build.
  - Stage 1: Build bằng `.NET SDK 8.0`.
  - Stage 2: Publish output.
  - Stage 3: Runtime bằng `.NET ASPNET 8.0` (Alpine/Debian Slim để tối ưu dung lượng).
- **Cấu hình**: Sử dụng Environment Variables để ghi đè `appsettings.json` cho Connection String và JWT Secrets.

### 2.2 Frontend (Next.js)
- **Dockerfile**: Multi-stage build.
  - Stage 1: Install dependencies (`node:18-alpine` hoặc mới hơn).
  - Stage 2: Build ứng dụng (`npm run build`).
  - Stage 3: Chạy bằng `standalone mode` (tính năng của Next.js giúp giảm dung lượng image đáng kể).
- **Cấu hình**: Sử dụng `.env.production` để cấu hình API URL trỏ đến Backend container.

### 2.3 Database (SQL Server)
- **Image**: `mcr.microsoft.com/mssql/server:2022-latest`.
- **Dữ liệu**: Gắn Volume (`docker volume`) để đảm bảo dữ liệu không bị mất khi container restart hoặc delete.

## 3. Cấu hình Docker Compose

Tệp `docker-compose.yml` sẽ điều phối các dịch vụ:

```yaml
version: '3.8'

services:
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: hrm-db
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=YourStrongPassword123!
    ports:
      - "1433:1433"
    volumes:
      - mssql_data:/var/opt/mssql

  backend:
    build:
      context: .
      dockerfile: src/Hrm.Api/Dockerfile
    container_name: hrm-api
    depends_on:
      - db
    environment:
      - ConnectionStrings__DefaultConnection=Server=db;Database=HrmDb;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=True
      - ASPNETCORE_ENVIRONMENT=Production
    ports:
      - "8203:8080"

  frontend:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: hrm-web
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8203/api
    ports:
      - "3000:3000"

volumes:
  mssql_data:
```

## 4. Lộ trình Triển khai (Roadmap)

### Bước 1: Chuẩn bị (Ngày 1)
- Tạo `.dockerignore` cho cả Frontend và Backend để tối ưu tốc độ build.
- Viết `Dockerfile` cho Backend API.
- Viết `Dockerfile` cho Frontend Next.js.

### Bước 2: Cấu hình Môi trường (Ngày 1-2)
- Thiết lập `docker-compose.yml`.
- Cấu hình mạng (Networks) để Backend có thể kết nối với DB qua tên dịch vụ (`db`).
- Kiểm tra kết nối và seeding dữ liệu ban đầu.

### Bước 3: Tối ưu hóa & Bảo mật (Ngày 2)
- Chuyển sang sử dụng `non-root user` trong container để tăng tính bảo mật.
- Cấu hình Nginx làm Reverse Proxy (nếu cần) để hỗ trợ HTTPS/SSL.
- Tối ưu kích thước image (sử dụng Alpine images).

### Bước 4: Kiểm thử & Bàn giao (Ngày 3)
- Kiểm tra hiệu năng container.
- Viết hướng dẫn lệnh `docker compose up -d` để triển khai một chạm.

## 5. Lưu ý Quan trọng
- **Bảo mật**: Tuyệt đối không lưu mật khẩu SA hoặc JWT Secret trong git. Sử dụng tệp `.env` hoặc Docker Secrets.
- **Tốc độ**: Sử dụng Cache Layer hiệu quả bằng cách copy `package.json` hoặc `.csproj` trước khi copy toàn bộ code.

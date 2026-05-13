# Kế hoạch Triển khai Docker (Docker Deployment Plan)

Tài liệu này trình bày kế hoạch chi tiết để đóng gói (containerize) và triển khai hệ thống HRM (Human Resource Management) bằng Docker và Docker Compose.

## 1. Kiến trúc Triển khai

Hệ thống sẽ được chia thành các container riêng biệt để đảm bảo tính module và dễ quản lý:

- **Frontend Container**: Chạy ứng dụng Next.js (chế độ Production).
- **Backend Container**: Chạy ứng dụng ASP.NET Core API.
- **Database Container**: Chạy **PostgreSQL 16** (Alpine-based).

## 2. Chiến lược Container hóa

### 2.1 Backend (ASP.NET Core)
- **Dockerfile**: Sử dụng Multi-stage build.
  - Stage 1: Build bằng `.NET SDK 9.0`.
  - Stage 2: Publish output.
  - Stage 3: Runtime bằng `.NET ASPNET 9.0` (Alpine).
- **Cấu hình**: Sử dụng Environment Variables để ghi đè `appsettings.json` cho Connection String (PostgreSQL) và JWT Secrets.

### 2.2 Frontend (Next.js)
- **Dockerfile**: Multi-stage build.
  - Stage 1: Install dependencies (`node:24-alpine`).
  - Stage 2: Build ứng dụng (`npm run build`).
  - Stage 3: Chạy bằng `standalone mode`.
- **Cấu hình**: Sử dụng `.env.production` để cấu hình API URL.

### 2.3 Database (PostgreSQL)
- **Image**: `postgres:16-alpine`.
- **Dữ liệu**: Gắn Volume (`hrm_postgres_data`) để đảm bảo dữ liệu không bị mất khi container restart.
- **Khởi tạo**: Tự động tạo database `Hrm_MUI` khi khởi chạy lần đầu.

## 3. Cấu hình Docker Compose

Tệp `docker-compose.yml` điều phối các dịch vụ:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: hrm-db
    environment:
      POSTGRES_DB: Hrm_MUI
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: src/Hrm.Api/Dockerfile
    container_name: hrm-api
    depends_on:
      db:
        condition: service_healthy
    environment:
      ConnectionStrings__DefaultConnection: "Host=db;Port=5432;Database=Hrm_MUI;Username=postgres;Password=${DB_PASSWORD:-postgres}"
      ASPNETCORE_ENVIRONMENT: Production
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
  postgres_data:
```

## 4. Lộ trình Triển khai (Roadmap)

### Bước 1: Chuẩn bị (Hoàn thành)
- Tạo `.dockerignore` tối ưu.
- Viết `Dockerfile` cho Backend & Frontend.

### Bước 2: Cấu hình Môi trường (Hoàn thành)
- Thiết lập `docker-compose.yml` sử dụng PostgreSQL.
- Cấu hình Healthcheck cho database để đảm bảo Backend chỉ chạy khi DB đã sẵn sàng.

### Bước 3: Tối ưu hóa (Hoàn thành)
- Sử dụng Alpine images để giảm dung lượng.
- Tự động chạy Migration và Seed data khi khởi động (`ApplyMigrationsOnStartup`).

### Bước 4: Triển khai (Bàn giao)
- Lệnh triển khai: `docker compose up -d --build`.

## 5. Lưu ý Quan trọng
- **PostgreSQL**: Sử dụng chuẩn kết nối Npgsql. Các bảng và cột được tự động tạo theo migration.
- **Bảo mật**: Sử dụng biến môi trường cho mật khẩu nhạy cảm.
- **Volume**: Dữ liệu PostgreSQL được lưu trữ tại `hrm_postgres_data` để bảo toàn dữ liệu.

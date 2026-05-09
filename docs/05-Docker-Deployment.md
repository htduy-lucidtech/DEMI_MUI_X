# Kế hoạch Triển khai Docker (Docker Deployment Plan)

Tài liệu này trình bày kế hoạch chi tiết để đóng gói (containerize) và triển khai hệ thống HRM bằng Docker và Docker Compose.

> **Trạng thái**: ✅ Đã hoàn thành triển khai

## 1. Kiến trúc Triển khai

Hệ thống được chia thành 3 container riêng biệt, giao tiếp qua internal network `hrm-network`:

```
┌─────────────────────────────────────────────────────┐
│  Host Machine                                       │
│                                                     │
│   :3000 ──► [hrm-web]   Next.js Frontend           │
│   :8203 ──► [hrm-api]   ASP.NET Core 9 API         │
│   :5432 ──► [hrm-db]    PostgreSQL 16               │
│                                                     │
│  [ hrm-network (bridge) ] ─────────────────────     │
└─────────────────────────────────────────────────────┘
```

| Container   | Image                   | Port  | Role          |
|-------------|------------------------|-------|---------------|
| `hrm-db`    | `postgres:16-alpine`   | 5432  | Database      |
| `hrm-api`   | Custom (built locally) | 8203  | REST API      |
| `hrm-web`   | Custom (built locally) | 3000  | Frontend UI   |

## 2. Chiến lược Container hóa

### 2.1 Backend (ASP.NET Core 9)

**File**: `src/Hrm.Api/Dockerfile`

- **Stage 1 (restore)**: Copy `.csproj` files → `dotnet restore` → cache layer.
- **Stage 2 (publish)**: Copy source code → `dotnet publish -c Release`.
- **Stage 3 (final)**: Runtime image `aspnet:9.0`, non-root user `appuser`.

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
# ... restore only
FROM restore AS publish
# ... full build + publish
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
# ... runtime only (smallest image)
```

### 2.2 Frontend (Next.js)

**File**: `web/Dockerfile`

- **Stage 1 (deps)**: `node:20-alpine`, copy `package.json` → `npm ci`.
- **Stage 2 (builder)**: Build với `npm run build` (Next.js standalone mode).
- **Stage 3 (runner)**: Copy `.next/standalone` chỉ (~10MB vs ~300MB đầy đủ).

> **Standalone mode** được bật trong `next.config.ts`:
> ```ts
> output: "standalone"
> ```

### 2.3 Database (PostgreSQL 16)

- **Image**: `postgres:16-alpine` (phù hợp với Npgsql đang dùng trong project).
- **Volume**: `hrm_postgres_data` đảm bảo dữ liệu bền vững.
- **Health check**: Backend `depends_on` DB với `condition: service_healthy`.

## 3. Cấu hình Docker Compose

**File**: `docker-compose.yml`

```yaml
services:
  db:       # PostgreSQL với health check
  backend:  # ASP.NET API, chờ DB healthy mới start
  frontend: # Next.js standalone

networks:
  hrm-network: { driver: bridge }

volumes:
  postgres_data: { name: hrm_postgres_data }
```

**Thứ tự khởi động**: `db` → `backend` (sau khi DB healthy) → `frontend`

## 4. Quản lý Secrets / Biến Môi Trường

**File**: `.env.example` → Copy thành `.env` (không commit vào git).

| Biến                | Mô tả                              | Default         |
|---------------------|------------------------------------|-----------------|
| `DB_PASSWORD`       | Mật khẩu PostgreSQL                | `postgres`      |
| `JWT_SECRET`        | JWT signing key (≥ 32 ký tự)      | (placeholder)   |

> ⚠️ File `.env` đã được thêm vào `.gitignore`. **KHÔNG BAO GIỜ commit file `.env`**.

## 5. Lệnh Triển khai

### Lần đầu tiên
```bash
# 1. Copy và cấu hình biến môi trường
cp .env.example .env
# (Chỉnh sửa .env với mật khẩu mạnh)

# 2. Build và khởi chạy toàn bộ hệ thống
docker compose up -d --build

# 3. Kiểm tra trạng thái
docker compose ps
docker compose logs -f backend
```

### Các lệnh thường dùng
```bash
# Xem logs real-time
docker compose logs -f

# Restart một service
docker compose restart backend

# Dừng hệ thống (giữ data)
docker compose down

# Dừng và xóa sạch data
docker compose down -v

# Rebuild chỉ 1 service
docker compose up -d --build backend
```

## 6. Lưu ý Quan trọng

- **CORS**: Backend tự đọc `CORS__AllowedOrigins` từ biến môi trường, không cần sửa code khi đổi domain.
- **Migration**: `ApplyMigrationsOnStartup=true` trong compose — backend tự chạy EF migration khi start.
- **Seeding**: `SeedDatabase=true` — dữ liệu mẫu tự được tạo lần đầu.
- **API URL Frontend**: `NEXT_PUBLIC_API_URL` trong Dockerfile được truyền vào lúc build. Khi deploy lên server thật, đổi `http://localhost:8203/api` thành domain thực tế.

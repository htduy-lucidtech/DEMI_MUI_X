# Hướng dẫn Phát triển (Development Guide)

Tài liệu này hướng dẫn các tiêu chuẩn lập trình, quy trình thêm module mới và cách quản lý đa ngôn ngữ trong hệ thống HRM Pro.

## 1. Tiêu chuẩn Lập trình (Coding Standards)

### Backend (.NET 9)
- **Clean Architecture**: Tuân thủ tách biệt các lớp (Domain, Service, Infrastructure, Api). Không gọi trực tiếp DbContext từ Controller.
- **Naming**: Sử dụng `PascalCase` cho Class, Method, Property. Sử dụng `camelCase` cho biến local và tham số.
- **Duyệt dữ liệu**: Mọi thay đổi dữ liệu nhạy cảm phải thông qua `IApprovalService` thay vì lưu trực tiếp vào database.
- **Async/Await**: Sử dụng lập trình bất đồng bộ cho tất cả các thao tác I/O (Database, API call).

### Frontend (Next.js 15)
- **MUI v6**: Sử dụng các component từ `@mui/material`. Ưu tiên sử dụng `sx` prop hoặc Vanilla CSS trong `globals.css` thay vì Tailwind nếu không cần thiết.
- **Components**: Chia nhỏ component (Atom -> Molecule). Các component dùng chung đặt trong `components/common/`.
- **I18n**: Không viết cứng (Hard-code) chuỗi văn bản. Luôn sử dụng hook `useTranslations`.

---

## 2. Quy trình thêm Module mới

### Bước 1: Backend (Domain & API)
1. Tạo Entity mới trong `Hrm.Domain/Entities`.
2. Khai báo `DbSet` trong `HrmDbContext`.
3. Tạo Controller trong `Hrm.Api/Controllers` để expose API.
4. (Tùy chọn) Thêm logic phê duyệt nếu module yêu cầu kiểm duyệt dữ liệu.

### Bước 2: Frontend (Service & Locales)
1. Tạo file service trong `web/services/[module].service.ts`.
2. Tạo thư mục locales mới trong `web/locales/[module]/` với file `vi.ts` và `en.ts`.
3. Đăng ký module locales vào `web/i18n.ts`.

### Bước 3: Frontend (UI & Routing)
1. Tạo folder module trong `web/app/(authenticated)/dashboard/[module]/`.
2. Tạo file `page.tsx` và các component hỗ trợ.
3. Cập nhật Sidebar/Navbar nếu cần thiết.

---

## 3. Hướng dẫn Đa ngôn ngữ (i18n)

Hệ thống sử dụng `next-intl` với chiến lược "Không tiền tố" (No-prefix), lưu locale trong Cookie `NEXT_LOCALE`.

### Cách sử dụng trong Client Component:
```tsx
"use client";
import { useTranslations } from "next-intl";

const t = useTranslations("MyModule");
return <span>{t("label")}</span>;
```

### Cách sử dụng trong Server Component:
```tsx
import { getTranslations } from "next-intl/server";

const t = await getTranslations("MyModule");
return <div>{t("title")}</div>;
```

---

## 4. Chạy dự án Local

### Yêu cầu:
- .NET 9 SDK
- Node.js 20+
- SQL Server (Local hoặc Docker)

### Lệnh chạy:
- **Backend**: `dotnet run --project src/Hrm.Api/Hrm.Api.csproj` (hoặc F5 trong VS).
- **Frontend**: `cd web && npm run dev`.

---

## 5. Kiểm thử (Unit Testing)

Hệ thống sử dụng các bộ công cụ kiểm thử hiện đại để đảm bảo chất lượng code.

### Backend (xUnit, Moq, EF Core In-Memory)
- **Vị trí**: `tests/Hrm.Tests/`
- **Tiêu chuẩn**: Mỗi Service cần có ít nhất một bộ test cover các case chính (Success, Fail, Validation).
- **Lệnh chạy**: `dotnet test` từ root hoặc trong thư mục `tests/Hrm.Tests/`.

### Frontend (Vitest, React Testing Library)
- **Vị trí**: `tests/web/`
- **Cấu hình**: `tests/vitest.config.ts` (Sử dụng alias `@/` trỏ về thư mục `web/`).
- **Tiêu chuẩn**: Các component logic quan trọng (Auth, Permission) cần được unit test.
- **Lệnh chạy**: `cd web && npm run test`.
- **Lưu ý**: Đã thiết lập Junction link cho `node_modules` trong thư mục `tests` để hỗ trợ Intellisense trong IDE.

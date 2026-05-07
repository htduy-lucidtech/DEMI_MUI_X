# 💻 Hướng dẫn Phát triển (Development Guide)

Tài liệu này quy định các tiêu chuẩn lập trình, quy trình thêm mới tính năng và cách vận hành hệ thống HRM Pro dành cho lập trình viên.

## 1. Tiêu chuẩn Backend (API Standards)

- **DTO First**: Tuyệt đối không trả về Entity trực tiếp. Luôn sử dụng DTO để tránh lỗi vòng lặp JSON và bảo mật thông tin.
- **Dependency Injection**: Luôn đăng ký Service vào file `DependencyInjection.cs` của Project tương ứng. Giữ `Program.cs` sạch nhất có thể.
- **Response**: Trả về đúng mã lỗi HTTP (400 cho lỗi logic, 401 cho Auth, 404 cho dữ liệu không tồn tại).
- **DateTime**: Luôn sử dụng định dạng UTC (ISO 8601) khi lưu trữ và trả về API.

---

## 2. Tiêu chuẩn Frontend (UI Standards)

- **No Hardcoded Text**: Tuyệt đối không viết chữ trực tiếp vào file `.tsx`. Mọi nội dung hiển thị phải thông qua `next-intl`.
- **Component Reuse**: Nếu một thành phần UI xuất hiện ở 2 trang trở lên, hãy đưa nó vào `web/components/`.
- **API Services**: Không gọi Axios trực tiếp trong Component. Luôn khai báo hàm trong `web/services/` và sử dụng tại Component.

---

## 3. Hệ thống Đa ngôn ngữ (i18n)

Chúng ta sử dụng `next-intl` với cấu trúc tập trung:
- **Vị trí**: `web/locales/[module]/[vi|en].ts`.
- **Sử dụng**: 
  ```tsx
  const t = useTranslations("Personnel");
  return <span>{t("fullName")}</span>;
  ```
- **Lưu ý**: Khi thêm module mới, bắt buộc phải khai báo file locale và đăng ký vào `web/i18n.ts`.

---

## 4. Quy trình thêm Module mới

Để thêm một module chức năng mới (Ví dụ: `Insurance` - Bảo hiểm):

1. **Backend**: 
   - Tạo Entity trong `Hrm.Domain`.
   - Tạo Service/Interface trong `Hrm.Service`.
   - Tạo Controller trong `Hrm.Api`.
2. **Frontend Service**: Tạo `web/services/insurance.service.ts`.
3. **Frontend Locales**: Tạo `web/locales/insurance/` (vi.ts, en.ts) và đăng ký vào `i18n.ts`.
4. **Frontend UI**:
   - Tạo folder `web/components/insurance/` cho các Dialog/Table.
   - Tạo Page tại `web/app/(authenticated)/dashboard/insurance/page.tsx`.
5. **Navigation**: Cập nhật `web/components/layout/NavLinks.tsx` để hiển thị trên Sidebar.

---

## 5. Kết nối BE - FE

- **API URL**: Cấu hình tại `web/.env.local` thông qua biến `NEXT_PUBLIC_API_URL`.
- **Authentication**: Token JWT được tự động đính kèm vào Header của mọi request thông qua cấu hình trong `web/services/api.ts`.

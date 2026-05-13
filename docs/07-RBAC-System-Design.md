# Hệ thống Phân quyền (RBAC) & Phê duyệt - MUI HRM Pro

Hệ thống đã triển khai hoàn thiện mô hình RBAC động và quy trình phê duyệt tập trung để đảm bảo tính an toàn dữ liệu.

## 1. Mô hình Phân quyền (Dynamic RBAC)

Hệ thống sử dụng mô hình **User -> Roles -> Permissions**. Mỗi người dùng có thể được gán một hoặc nhiều vai trò, và mỗi vai trò chứa tập hợp các quyền cụ thể.

### Các vai trò chính (Standard Roles):
*   **Admin:** Quản trị viên tối cao, có toàn quyền trên hệ thống (Full Access).
*   **General Manager:** Quản lý cấp cao, có quyền xem và duyệt dữ liệu trên toàn bộ công ty.
*   **Department Manager:** Quản lý phòng ban, có quyền hạn giới hạn trong phạm vi phòng ban được phân công.
*   **Employee:** Nhân viên, chỉ có quyền truy cập dữ liệu cá nhân và thực hiện các chức năng cơ bản (Check-in, Leave Request).

### Danh sách Quyền hạn (Permissions Example):
| Mã quyền (Code) | Mô tả | Phạm vi áp dụng |
| :--- | :--- | :--- |
| `USERS_MANAGE` | Quản lý tài khoản và vai trò | Admin |
| `EMP_MANAGE_ALL` | Quản lý toàn bộ nhân sự công ty | Admin, Gen Manager |
| `APPROVE_ALL` | Phê duyệt mọi yêu cầu trong hệ thống | Admin, Gen Manager |
| `APPROVE_DEPT` | Phê duyệt yêu cầu thuộc phòng ban | Dept Manager |
| `ATT_VIEW_ALL` | Xem chấm công toàn công ty | Admin, Gen Manager |
| `ATT_VIEW_DEPT` | Xem chấm công phòng ban | Dept Manager |

---

## 2. Hệ thống Phê duyệt Trung tâm (Centralized Approval System)

Cơ chế này ngăn chặn việc sửa đổi dữ liệu trực tiếp từ các cấp độ không có thẩm quyền tối cao.

### Quy trình hoạt động:
1.  **Phát sinh yêu cầu:** Khi người dùng thực hiện tạo mới/cập nhật/xóa (ví dụ: Sửa hồ sơ nhân viên), thay vì cập nhật ngay vào bảng `Employees`, hệ thống tạo một `ApprovalRequest`.
2.  **Lưu trữ tạm:** Dữ liệu thay đổi được đóng gói vào trường `JsonData` của yêu cầu.
3.  **Thông báo Realtime:** Quản lý có thẩm quyền sẽ nhận được thông báo ngay lập tức qua SignalR.
4.  **Kiểm duyệt:**
    *   `General Manager` có thể duyệt mọi yêu cầu.
    *   `Department Manager` chỉ thấy và duyệt các yêu cầu từ nhân viên thuộc phòng ban mình.
5.  **Thực thi:** Khi ấn **Duyệt**, backend sẽ thực thi logic để áp dụng dữ liệu từ JSON vào bản ghi chính thức.

---

## 3. Nhật ký hoạt động & Audit Logs

Mọi thao tác quan trọng đều được ghi lại trong bảng `AuditLogs`:
*   **Action:** Create, Update, Delete, Login, Approve, Reject.
*   **Entity:** Tên thực thể bị tác động.
*   **UserId:** Người thực hiện.
*   **Changes:** Chi tiết các trường thay đổi (Before/After).

---

## 4. Phân cấp Phòng ban & Quản lý Scoped

Dữ liệu được lọc theo cấp bậc (Hierarchy):
*   Phòng ban cha có thể xem dữ liệu của tất cả phòng ban con trực thuộc.
*   Manager của phòng ban cấp cao tự động có quyền trên các đơn vị cấp dưới.

---

## 5. Trạng thái Triển khai
*   ✅ **Backend**: Core Logic (RBAC Middleware, Approval Engine, Audit Service).
*   ✅ **Frontend**: UI Management (Role/Permission mapping), Trung tâm Phê duyệt, Audit Log Viewer.
*   ✅ **Seed Data**: Cấu hình sẵn 4 vai trò tiêu chuẩn và tập hợp quyền tương ứng.

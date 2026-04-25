# Yêu cầu Triển khai Dự án HRM Pro

## 1. Mục tiêu Giai đoạn Hiện tại (Phase 5: Refactor & Workflow)
- [x] **Cấu trúc Nhân sự mới**: Tách biệt `User` (Tài khoản) và `Employee` (Hồ sơ nhân sự).
- [x] **Dữ liệu mẫu toàn hệ thống**: Seed 5 tài khoản test chính và dữ liệu nghiệp vụ cho tất cả các module.
- [x] **Đa ngôn ngữ nâng cao**: 
    - [x] Dịch thuật các giá trị động từ API (Status, Type).
    - [x] Loại bỏ hoàn toàn hardcoded strings.
- [x] **Trạng thái bảng trống**: Tích hợp `CustomNoRowsOverlay` cho toàn bộ các DataGrid.

## 2. Trạng thái các Module
| Module | Trạng thái | Ghi chú |
| :--- | :--- | :--- |
| **Dashboard** | Hoàn thành | Thống kê thời gian thực & Hoạt động gần đây |
| **Nhân sự** | Hoàn thành | Hồ sơ chi tiết (Personal, Work, Bank, Salary) |
| **Chấm công** | Hoàn thành | Check-in/out thời gian thực & Lịch sử |
| **Nghỉ phép** | Hoàn thành | Workflow Gửi -> Duyệt/Từ chối + i18n động |
| **Bảng lương** | Hoàn thành | Tự động tính toán dựa trên ngày công & lương cơ bản |
| **Tuyển dụng** | Hoàn thành | Quản lý Tin tuyển dụng & Ứng viên |
| **Tài khoản** | Hoàn thành | Phân quyền (Admin, Manager, Personnel, Employee) |

## 3. Kế hoạch tiếp theo (Phase 5.5 - 6)
- [ ] **Đánh giá KPI**: Thiết lập tiêu chí và thực hiện đánh giá định kỳ.
- [ ] **Báo cáo chuyên sâu**: Xuất báo cáo PDF/Excel cho chấm công và lương.
- [ ] **Dockerization**: Đóng gói ứng dụng để triển khai môi trường Production.
- [ ] **CI/CD**: Tự động hóa quy trình kiểm thử và deploy.

## 4. Danh sách tài khoản Test
| Username | Password | Role | Quyền hạn |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin@123` | Admin | Toàn quyền hệ thống |
| `manager` | `Manager@123` | Manager | Quản lý dự án & duyệt đơn |
| `personnel` | `Personnel@123` | Personnel | Quản trị nhân sự & tuyển dụng |
| `attendance` | `Attendance@123` | Attendance | Chuyên viên chấm công |
| `employee` | `Employee@123` | Employee | Nhân viên (Chỉ xem dữ liệu cá nhân) |

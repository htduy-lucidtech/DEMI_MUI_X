Hrm/
├── Hrm.sln                     # File Solution quản lý 4 Project Backend
├── Hrm.Api/                    # (Project Web API) - Tầng giao tiếp UI
├── Hrm.Service/                # (Project Class Library) - Tầng xử lý nghiệp vụ
├── Hrm.Infrastructure/         # (Project Class Library) - Tầng kết nối Database (EF Core)
├── Hrm.Domain/                 # (Project Class Library) - Tầng chứa Entities & Interfaces
│
└── hrm.web/                    # (Next.js 15 Project) - Giao diện người dùng
    ├── app/                    # App Router (Dashboard, Personnel, Payroll...)
    ├── components/             # Các Component dùng chung (Navbar, Sidebar, CustomButton)
    ├── i18n/                   # Cấu hình đa ngôn ngữ (vi.ts, en.ts)
    ├── public/                 # Chứa ảnh, icons, file tĩnh
    ├── .next/                  # (Folder tự sinh khi chạy dev/build - không cần sửa)
    ├── node_modules/           # (Folder tự sinh khi cài thư viện)
    ├── package.json            # Quản lý thư viện Frontend
    └── tailwind.config.ts      # Cấu hình Tailwind CSS

## Chạy Nextjs:
    cd hrm.web
    npm install
    npm run dev

## Chạy Backend:
    Tạo Database:
        Tài khoản test Role: 
            Tên đăng nhập - mật khẩu 
            admin - Admin@123
            attendance - attendance@123
            personnel - personnel@123
            manager - Manager@123
            employee - Employee@123    
    Chạy migration lần đầu:
        cd Hrm.Infrastructure
        dotnet ef migrations add InitialCreate
        dotnet ef database update
    Chạy API:
        cd Hrm.Api  
        dotnet restore
        dotnet run
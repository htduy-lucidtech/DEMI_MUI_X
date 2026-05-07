# HRM Project Structure

## Directories:
- `src/`: Backend Projects (.NET Core)
  - `Hrm.Api/`: Web API Controllers & Endpoints
  - `Hrm.Domain/`: Entities, Enums & Core Logic
  - `Hrm.Infrastructure/`: DB Context, Migrations & Data Access
  - `Hrm.Service/`: Business Service Implementations
- `web/`: Frontend Project (Next.js 16)
  - `app/`: App Router, Pages & Layouts
  - `components/`: Shared UI Components
  - `services/`: API client services
  - `lib/`: Utilities and Shared Logic
- `docs/`: Project documentation

## Development Commands:

### Frontend (web):
```powershell
cd web
npm run dev
```

### Backend (src):
```powershell
cd src/Hrm.Api
dotnet run
```

## Database Setup:
1. Ensure the connection string in `src/Hrm.Api/appsettings.json` is correct.
2. Apply migrations:
```powershell
cd src/Hrm.Infrastructure
dotnet ef database update
```

## Default Test Accounts:
- admin / Admin@123
- manager / Manager@123
- employee / Employee@123
Realtime notifications

- SignalR hub: `/notificationHub` on the API server.
- FE: `app/(authenticated)/layout.tsx` connects to hub and dispatches DOM CustomEvents `notification:short` and `notification:full`.
- Use `web/lib/useRealtime.ts` to listen for short/full events in client components.
- Alternatively use `NotificationProvider` (`app/(authenticated)/context/NotificationContext.tsx`) and `useNotifications()` to subscribe programmatically.

Quick verification steps:

1. Start API server:

```powershell
cd src\Hrm.Api
dotnet run
```

2. Start frontend:

```bash
cd web
npm run dev
```

3. Login and perform actions that create/modify data (create leave, approve leave, update employee). Short snackbar should appear and pages using realtime hook/context should refresh automatically.

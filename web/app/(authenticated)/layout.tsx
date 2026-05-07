"use client";

import React from "react";
import { NotificationProvider } from "./context/NotificationContext";
import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { Snackbar, Alert } from "@mui/material";
import { translate } from "@/locales/notification-i18n";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    user: string;
  } | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return; // wait until token available

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5181/api";
    const hubUrl = baseUrl.replace(/\/api\/?$/, "") + "/notificationHub";

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token ?? "",
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    let mounted = true;

    const startConnection = async () => {
      try {
        if (!mounted) return;
        if (newConnection.state === signalR.HubConnectionState.Disconnected) {
          await newConnection.start();
          console.log("SignalR Connected to:", hubUrl);

          const formatIncoming = (msg: any) => {
            if (!msg && msg !== 0) return "";
            if (typeof msg === "string") return msg;
            if (typeof msg === "object") {
              const metaRaw = (msg.meta ?? msg.MetaJson) as any;
              let meta: any = null;
              if (metaRaw) {
                if (typeof metaRaw === "string") {
                  try {
                    meta = JSON.parse(metaRaw);
                  } catch {
                    meta = null;
                  }
                } else {
                  meta = metaRaw;
                }
              }
              if (meta?.messageKey) {
                return translate(meta.messageKey, meta.messageParams);
              }
              if (typeof msg.message === "string") return msg.message;
              if (typeof msg.title === "string") return msg.title;
              try {
                return JSON.stringify(msg);
              } catch {
                return String(msg);
              }
            }
            return String(msg);
          };

          newConnection.on("ReceiveNotification", (user, message) => {
            setNotification({ open: true, user, message: formatIncoming(message) });
          });
          // Short and full notifications — show short as snackbar and dispatch events for pages to refresh
          newConnection.on("ReceiveNotificationShort", (message) => {
            const display = formatIncoming(message);
            setNotification({ open: true, user: "Hệ thống", message: display });
            try {
              window.dispatchEvent(
                new CustomEvent("notification:short", { detail: { message } }),
              );
            } catch {}
          });

          newConnection.on("ReceiveNotificationFull", (message) => {
            const display = formatIncoming(message) || (message?.type || "Thông báo");
            // show snackbar for full notifications as well and also emit short event so pages using "short" refresh
            setNotification({ open: true, user: "Hệ thống", message: display });
            try {
              window.dispatchEvent(
                new CustomEvent("notification:full", { detail: { message } }),
              );
            } catch {}
            try {
              window.dispatchEvent(
                new CustomEvent("notification:short", { detail: { message } }),
              );
            } catch {}
          });
        }
      } catch (err) {
        if (mounted) {
          console.error("SignalR Connection Error: ", err);
        }
      }
    };

    startConnection();

    return () => {
      mounted = false;
      if (newConnection.state === signalR.HubConnectionState.Connected || 
          newConnection.state === signalR.HubConnectionState.Connecting) {
        newConnection.stop().catch(() => {});
      }
    };
  }, [token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  // On mobile: sidebar is a temporary overlay (open/closed via toggle)
  // On desktop: sidebar is permanent (collapsed/expanded)
  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Desktop: sidebar shifts content via margin; Mobile: sidebar overlays
  const desktopSidebarWidth = isSidebarCollapsed ? 64 : 240;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <CssBaseline />

      {/* Sidebar */}
      <Sidebar
        isSidebarCollapsed={isMobile ? !isSidebarOpen : isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Right Side: Header + Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          // On desktop, sidebar is permanent so we don't need extra margin (flex handles it)
          // On mobile, sidebar is overlay so this fills full width
        }}
      >
        {/* Fixed Navbar */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            // Desktop: offset by sidebar width. Mobile: full width (left: 0)
            left: {
              xs: 0,
              md: `${desktopSidebarWidth}px`,
            },
            zIndex: (theme) => theme.zIndex.appBar,
            transition: (theme) =>
              theme.transitions.create(["left"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          }}
        >
          <Navbar
            isSidebarCollapsed={isMobile ? !isSidebarOpen : isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
          />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            overflowX: "hidden",
            pt: "56px",
            pb: 4,
          }}
        >
          <Box sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 2.5 } }}>
            <NotificationProvider>{children}</NotificationProvider>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={notification?.open}
        autoHideDuration={6000}
        onClose={() =>
          setNotification((prev) => (prev ? { ...prev, open: false } : null))
        }
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="info"
          sx={{ width: "100%", borderRadius: 1, fontWeight: 700 }}
        >
          {notification?.user}: {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

"use client";

import React from "react";
import { Box, CssBaseline, Toolbar, Breadcrumbs, Typography, Link } from "@mui/material";
import Sidebar from "@/app/components/layout/Sidebar";
import Navbar from "@/app/components/layout/Navbar";
import { usePathname, useRouter } from "next/navigation";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { Snackbar, Alert } from "@mui/material";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const t = useTranslations("Layout.breadcrumbs");
  const pathArray = pathname.split("/").filter((x) => x);
  
  const [notification, setNotification] = useState<{ open: boolean; message: string; user: string } | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5181/api';
    const hubUrl = baseUrl.replace(/\/api\/?$/, '') + "/notificationHub";

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        if (newConnection.state === signalR.HubConnectionState.Disconnected) {
          await newConnection.start();
          console.log("SignalR Connected to:", hubUrl);
          
          newConnection.on("ReceiveNotification", (user, message) => {
            setNotification({ open: true, user, message });
          });
        }
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
        // Retry logic is handled by withAutomaticReconnect() if it started once, 
        // but if it fails to start initially, we might want a manual retry.
      }
    };

    startConnection();

    return () => {
      if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null; // Hoặc một màn hình loading đẹp
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, md: 2.5 },
          backgroundColor: "background.default",
          minHeight: "100vh",
          width: { sm: `calc(100% - 260px)` },
        }}
      >
        <Toolbar /> {/* Spacer for fixed Navbar */}
        
        {/* Breadcrumbs Section */}
        <Box sx={{ mb: 1.5 }}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 1 }}
          >
            <Link underline="hover" color="inherit" href="/dashboard" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {t("home")}
            </Link>
            {pathArray.map((path, index) => {
              const isLast = index === pathArray.length - 1;
              const href = `/${pathArray.slice(0, index + 1).join("/")}`;
              
              // Cố gắng lấy bản dịch, nếu không có thì lấy tên gốc viết hoa chữ đầu
              const label = t.has(path) ? t(path) : path.charAt(0).toUpperCase() + path.slice(1);
              
              return isLast ? (
                <Typography key={path} color="text.primary" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                  {label}
                </Typography>
              ) : (
                <Link key={path} underline="hover" color="inherit" href={href} sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {children}
      </Box>

      <Snackbar 
        open={notification?.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification(prev => prev ? { ...prev, open: false } : null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="info" sx={{ width: '100%', borderRadius: 2, fontWeight: 700 }}>
          {notification?.user}: {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

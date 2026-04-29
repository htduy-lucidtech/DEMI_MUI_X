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
import NextLink from "next/link";


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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      <CssBaseline />

      {/* 1. Sidebar - Far Left, Full Height */}
      <Sidebar isSidebarCollapsed={isSidebarCollapsed} />

      {/* 2. Right Side: Header + Content */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column",
          minWidth: 0, // Prevent flex items from overflowing
          ml: { xs: 0, sm: 0 }, // Sidebar is already in the flex row
        }}
      >
        {/* Header (Navbar) */}
        <Box 
          sx={{ 
            position: "fixed", 
            top: 0, 
            right: 0, 
            left: { xs: 0, sm: `${isSidebarCollapsed ? 64 : 240}px` },
            zIndex: (theme) => theme.zIndex.appBar, // Lower than Drawer (1200)
            transition: (theme) => theme.transitions.create(['left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >

          <Navbar
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </Box>

        {/* Main Content Wrapper */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            overflowX: "hidden",
            pt: "56px", // Space for fixed Navbar
            pb: 4,
          }}
        >
          {/* Page Content - Trải rộng toàn màn hình */}
          <Box sx={{ flexGrow: 1, px: { xs: 2, md: 3 }, pt: 3 }}>
            {children}
          </Box>
        </Box>
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

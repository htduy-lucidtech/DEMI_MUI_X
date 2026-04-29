"use client";

import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Paid as PaidIcon,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth, Role } from "@/app/context/AuthContext";

interface SidebarProps {
  isSidebarCollapsed: boolean;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: Role[];
  key: string;
}

export default function Sidebar({ isSidebarCollapsed }: SidebarProps) {
  const drawerWidth = isSidebarCollapsed ? 64 : 240;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Layout.sidebar");
  const { activeRole } = useAuth();

  const menuItems: MenuItem[] = [
    {
      key: "dashboard",
      text: t("dashboard"),
      icon: <DashboardIcon />,
      path: "/dashboard",
      roles: ["Admin", "Manager", "Personnel", "Attendance", "Employee"],
    },
    {
      key: "personnel",
      text: t("personnel"),
      icon: <PeopleIcon />,
      path: "/dashboard/personnel",
      roles: ["Admin", "Manager", "Personnel"],
    },
    {
      key: "attendance",
      text: t("attendance"),
      icon: <CalendarIcon />,
      path: "/dashboard/attendance",
      roles: ["Admin", "Manager", "Attendance", "Employee"],
    },
    {
      key: "department",
      text: t("department"),
      icon: <BusinessIcon />,
      path: "/dashboard/departments",
      roles: ["Admin"],
    },
    {
      key: "leave",
      text: t("leave"),
      icon: <AssignmentIcon />,
      path: "/dashboard/leave",
      roles: ["Admin", "Manager", "Personnel", "Attendance", "Employee"],
    },
    {
      key: "users",
      text: t("users"),
      icon: <AdminIcon />,
      path: "/dashboard/users",
      roles: ["Admin", "Personnel"],
    },
    {
      key: "payroll",
      text: t("payroll"),
      icon: <PaidIcon />,
      path: "/dashboard/payroll",
      roles: ["Admin", "Manager", "Personnel"],
    },
    {
      key: "recruitment",
      text: t("recruitment"),
      icon: <AssignmentIcon />,
      path: "/dashboard/recruitment",
      roles: ["Admin", "Manager", "Personnel"],
    },
    {
      key: "admin",
      text: t("admin"),
      icon: <SettingsIcon />,
      path: "/dashboard/admin",
      roles: ["Admin"],
    },
    {
      key: "org-chart",
      text: t("org_chart"),
      icon: <BusinessIcon />,
      path: "/dashboard/org-chart",
      roles: ["Admin", "Manager", "Personnel", "Attendance", "Employee"],
    },
    {
      key: "performance",
      text: t("performance"),
      icon: <AssignmentIcon />,
      path: "/dashboard/performance",
      roles: ["Admin", "Manager", "Personnel"],
    },
    {
      key: "settings",
      text: t("settings"),
      icon: <SettingsIcon />,
      path: "/settings",
      roles: ["Admin"],
    },
  ];

  const filteredItems = activeRole
    ? menuItems.filter((item) => item.roles.includes(activeRole))
    : [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#1e293b",
          color: "rgba(255, 255, 255, 0.65)",
          borderRight: "none",
          top: 0,
          height: "100vh",

          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflowX: 'hidden',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
          },
        },
      }}
    >
      {/* 1. Fixed Logo Section */}
      <Box sx={{
        p: isSidebarCollapsed ? 1.5 : 2.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        justifyContent: isSidebarCollapsed ? "center" : "flex-start",
        transition: (theme) => theme.transitions.create(['padding', 'justify-content'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}>
        <Box sx={{
          width: 32,
          height: 32,
          bgcolor: "primary.main",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          flexShrink: 0
        }}>
          H
        </Box>
        {!isSidebarCollapsed && (
          <Typography variant="h6" sx={{ fontWeight: 800, color: "white", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
            HRM Pro
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: isSidebarCollapsed ? 1 : 2, mb: 1 }} />
      {/* 2. Scrollable Menu Section */}
      <Box sx={{ overflowY: "auto", overflowX: "hidden", px: isSidebarCollapsed ? 0 : 2, pb: 2 }}>
        {!isSidebarCollapsed && (
          <Typography variant="caption" sx={{ px: 2, mb: 1, mt: 1, display: "block", color: "rgba(255, 255, 255, 0.4)", fontWeight: 700, textTransform: "uppercase" }}>
            {t("mainMenu")}
          </Typography>
        )}

        <List disablePadding sx={{ px: isSidebarCollapsed ? 0 : 1 }}>
          {filteredItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => router.push(item.path)}
                  selected={isActive}
                  sx={{
                    borderRadius: isSidebarCollapsed ? 1.5 : 1.25,
                    py: 0.5,
                    mx: isSidebarCollapsed ? "auto" : 0.75,
                    width: isSidebarCollapsed ? 40 : "auto",
                    minHeight: 40,
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                    transition: (theme) => theme.transitions.create(['width', 'background-color', 'padding', 'margin'], {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.leavingScreen,
                    }),
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "#ffffff",
                      "& .MuiListItemIcon-root": {
                        color: "#ffffff",
                      },
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      color: "#ffffff",
                      "& .MuiListItemIcon-root": {
                        color: "#ffffff",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    color: isActive ? "#ffffff" : "inherit",
                    minWidth: isSidebarCollapsed ? 0 : 32,
                    justifyContent: 'center',
                    transition: "inherit",
                    mr: isSidebarCollapsed ? 0 : 0
                  }}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { sx: { fontSize: 20 } })}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{
                        fontSize: "0.875rem",
                        fontWeight: isActive ? 600 : 500,
                        whiteSpace: 'nowrap',
                        opacity: isSidebarCollapsed ? 0 : 1,
                        transition: (theme) => theme.transitions.create('opacity', {
                          easing: theme.transitions.easing.sharp,
                          duration: theme.transitions.duration.leavingScreen,
                        }),
                      }}>
                        {item.text}
                      </Typography>
                    }
                    sx={{
                      m: 0,
                      opacity: isSidebarCollapsed ? 0 : 1,
                      width: isSidebarCollapsed ? 0 : 'auto',
                      overflow: 'hidden',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

    </Drawer>
  );
}

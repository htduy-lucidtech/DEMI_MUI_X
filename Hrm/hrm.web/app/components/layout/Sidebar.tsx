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

const drawerWidth = 250; // Giảm xuống 250px để tối ưu không gian nội dung

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: Role[];
  key: string;
}

export default function Sidebar() {
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
          backgroundColor: "#1e293b", // Slate Navy - Dịu và hiện đại hơn Navy thuần
          color: "rgba(255, 255, 255, 0.65)",
          borderRight: "none",
        },
      }}
    >
      <Toolbar sx={{ px: [2, 3], mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: "primary.main", 
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold"
          }}>
            H
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.5px", color: "#ffffff" }}>
            HRM Pro
          </Typography>
        </Box>
      </Toolbar>
      <Box sx={{ overflow: "auto", px: 2 }}>
        <Typography variant="caption" sx={{ px: 2, mb: 0.5, display: "block", color: "rgba(255, 255, 255, 0.4)", fontWeight: 700, textTransform: "uppercase" }}>
          {t("mainMenu")}
        </Typography>
        <List disablePadding>
          {filteredItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.key} disablePadding sx={{ mb: 0 }}>
                <ListItemButton
                  onClick={() => router.push(item.path)}
                  selected={isActive}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.75,
                    mx: 1,
                    transition: "all 0.2s",
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
                    minWidth: 40,
                    transition: "inherit"
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500 }}>
                        {item.text}
                      </Typography>
                    }
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

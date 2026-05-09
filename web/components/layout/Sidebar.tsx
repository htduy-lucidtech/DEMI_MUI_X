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
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
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
  Timeline as PerformanceIcon,
  AccountTree as OrgChartIcon,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth, Role } from "@/app/context/AuthContext";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  onClose?: () => void;
}

interface MenuItem {
  key: string;
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: Role[];
  section: "sectionCommon" | "sectionManagement" | "sectionSystem";
}

export default function Sidebar({ isSidebarCollapsed, onClose }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const drawerWidth = isSidebarCollapsed ? 64 : 240;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Layout.sidebar");
  const { activeRole } = useAuth();

  const menuItems: MenuItem[] = [
    // --- COMMON SECTION ---
    {
      key: "dashboard",
      text: t("dashboard"),
      icon: <DashboardIcon />,
      path: "/dashboard",
      roles: ["Admin", "Manager", "Employee"],
      section: "sectionCommon",
    },
    {
      key: "attendance",
      text: t("attendance"),
      icon: <CalendarIcon />,
      path: "/dashboard/attendance",
      roles: ["Admin", "Manager", "Employee"],
      section: "sectionCommon",
    },
    {
      key: "leave",
      text: t("leave"),
      icon: <AssignmentIcon />,
      path: "/dashboard/leave",
      roles: ["Admin", "Manager", "Employee"],
      section: "sectionCommon",
    },
    {
      key: "org-chart",
      text: t("org_chart"),
      icon: <OrgChartIcon />,
      path: "/dashboard/org-chart",
      roles: ["Admin", "Manager", "Employee"],
      section: "sectionCommon",
    },
    // --- MANAGEMENT SECTION ---
    {
      key: "personnel",
      text: t("personnel"),
      icon: <PeopleIcon />,
      path: "/dashboard/personnel",
      roles: ["Admin", "Manager"],
      section: "sectionManagement",
    },
    {
      key: "payroll",
      text: t("payroll"),
      icon: <PaidIcon />,
      path: "/dashboard/payroll",
      roles: ["Admin", "Manager"],
      section: "sectionManagement",
    },
    {
      key: "recruitment",
      text: t("recruitment"),
      icon: <AssignmentIcon />,
      path: "/dashboard/recruitment",
      roles: ["Admin", "Manager"],
      section: "sectionManagement",
    },
    {
      key: "performance",
      text: t("performance"),
      icon: <PerformanceIcon />,
      path: "/dashboard/performance",
      roles: ["Admin", "Manager"],
      section: "sectionManagement",
    },
    // --- SYSTEM SECTION ---
    {
      key: "users",
      text: t("users"),
      icon: <AdminIcon />,
      path: "/dashboard/users",
      roles: ["Admin", "Manager"],
      section: "sectionSystem",
    },
    {
      key: "department",
      text: t("department"),
      icon: <BusinessIcon />,
      path: "/dashboard/departments",
      roles: ["Admin"],
      section: "sectionSystem",
    },
    {
      key: "admin",
      text: t("admin"),
      icon: <SettingsIcon />,
      path: "/dashboard/admin",
      roles: ["Admin"],
      section: "sectionSystem",
    },
    {
      key: "settings",
      text: t("settings"),
      icon: <SettingsIcon />,
      path: "/settings",
      roles: ["Admin"],
      section: "sectionSystem",
    },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile && onClose) onClose();
  };

  const sections: { key: MenuItem["section"]; label: string }[] = [
    { key: "sectionCommon", label: t("sectionCommon") },
    { key: "sectionManagement", label: t("sectionManagement") },
    { key: "sectionSystem", label: t("sectionSystem") },
  ];

  const drawerContent = (
    <>
      <Box sx={{ p: isMobile ? 2.5 : isSidebarCollapsed ? 1.5 : 2.5, display: "flex", alignItems: "center", gap: 1.5, justifyContent: isMobile ? "flex-start" : isSidebarCollapsed ? "center" : "flex-start" }}>
        <Box sx={{ width: 32, height: 32, bgcolor: "primary.main", borderRadius: 0.75, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", flexShrink: 0 }}>H</Box>
        {(isMobile || !isSidebarCollapsed) && <Typography variant="h6" sx={{ fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>HRM Pro</Typography>}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: isMobile ? 2 : isSidebarCollapsed ? 1 : 2, mb: 1 }} />

      <Box sx={{ 
        flexGrow: 1, 
        overflowY: "auto", 
        overflowX: "hidden", 
        px: isMobile ? 2 : isSidebarCollapsed ? 0 : 2, 
        pb: 2,
        "&::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}>
        {sections.map((section) => {
          const items = menuItems.filter(item => item.section === section.key && (activeRole ? item.roles.includes(activeRole) : false));
          if (items.length === 0) return null;

          return (
            <React.Fragment key={section.key}>
              {(isMobile || !isSidebarCollapsed) && (
                <Typography variant="caption" sx={{ px: 2, mb: 1, mt: 1, display: "block", color: "rgba(255, 255, 255, 0.4)", fontWeight: 700, textTransform: "uppercase" }}>
                  {section.label}
                </Typography>
              )}
              <List disablePadding sx={{ px: isMobile ? 0 : isSidebarCollapsed ? 0 : 1 }}>
                {items.map((item) => {
                  const isActive = pathname === item.path;
                  const collapsed = !isMobile && isSidebarCollapsed;
                  return (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleNavigate(item.path)}
                        selected={isActive}
                        sx={{
                          borderRadius: collapsed ? 1 : 0.75,
                          py: 0.5,
                          mx: collapsed ? "auto" : 0.75,
                          width: collapsed ? 40 : "auto",
                          minHeight: 40,
                          justifyContent: collapsed ? "center" : "flex-start",
                          "&.Mui-selected": { backgroundColor: "primary.main", color: "#ffffff", "& .MuiListItemIcon-root": { color: "#ffffff" }, "&:hover": { backgroundColor: "primary.dark" } },
                          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#ffffff", "& .MuiListItemIcon-root": { color: "#ffffff" } },
                        }}
                      >
                        <ListItemIcon sx={{ color: isActive ? "#ffffff" : "inherit", minWidth: collapsed ? 0 : 32, justifyContent: "center" }}>
                          {React.cloneElement(item.icon as React.ReactElement<any>, { sx: { fontSize: 20 } })}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                fontWeight: isActive ? 600 : 500,
                                whiteSpace: "nowrap",
                                opacity: collapsed ? 0 : 1,
                                m: 0,
                                overflow: "hidden"
                              }}
                            >
                              {item.text}
                            </Typography>
                          }
                          sx={{ m: 0, opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </React.Fragment>
          );
        })}
      </Box>
    </>
  );

  const drawerStyles = {
    backgroundColor: "#1e293b",
    color: "rgba(255, 255, 255, 0.65)",
    borderRight: "none",
    height: "100vh",
    "&::-webkit-scrollbar": { display: "none" },
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? !isSidebarCollapsed : true}
      onClose={onClose}
      sx={{
        display: isMobile ? { xs: "block", md: "none" } : { xs: "none", md: "block" },
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          transition: (theme) => theme.transitions.create("width", { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
          ...drawerStyles,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

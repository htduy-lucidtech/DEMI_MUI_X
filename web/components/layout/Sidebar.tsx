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
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth, Role } from "@/app/context/AuthContext";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  onClose?: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: Role[];
  key: string;
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

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <>
      {/* Logo Section */}
      <Box
        sx={{
          p: isMobile ? 2.5 : isSidebarCollapsed ? 1.5 : 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          justifyContent: isMobile ? "flex-start" : isSidebarCollapsed ? "center" : "flex-start",
          transition: (theme) =>
            theme.transitions.create(["padding"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: "primary.main",
            borderRadius: 0.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          H
        </Box>
        {(isMobile || !isSidebarCollapsed) && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.5px",
              whiteSpace: "nowrap",
            }}
          >
            HRM Pro
          </Typography>
        )}
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.1)",
          mx: isMobile ? 2 : isSidebarCollapsed ? 1 : 2,
          mb: 1,
        }}
      />

      {/* Scrollable Menu Section */}
      <Box
        sx={{
          overflowY: "auto",
          overflowX: "hidden",
          px: isMobile ? 2 : isSidebarCollapsed ? 0 : 2,
          pb: 2,
          flexGrow: 1,
        }}
      >
        {(isMobile || !isSidebarCollapsed) && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              mb: 1,
              mt: 1,
              display: "block",
              color: "rgba(255, 255, 255, 0.4)",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {t("mainMenu")}
          </Typography>
        )}

        <List disablePadding sx={{ px: isMobile ? 0 : isSidebarCollapsed ? 0 : 1 }}>
          {filteredItems.map((item) => {
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
                    transition: (theme) =>
                      theme.transitions.create(
                        ["width", "background-color", "padding", "margin"],
                        {
                          easing: theme.transitions.easing.sharp,
                          duration: theme.transitions.duration.leavingScreen,
                        }
                      ),
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
                  <ListItemIcon
                    sx={{
                      color: isActive ? "#ffffff" : "inherit",
                      minWidth: collapsed ? 0 : 32,
                      justifyContent: "center",
                      transition: "inherit",
                    }}
                  >
                    {React.cloneElement(item.icon as React.ReactElement<any>, {
                      sx: { fontSize: 20 },
                    })}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: isActive ? 600 : 500,
                          whiteSpace: "nowrap",
                          opacity: collapsed ? 0 : 1,
                          transition: (theme) =>
                            theme.transitions.create("opacity", {
                              easing: theme.transitions.easing.sharp,
                              duration: theme.transitions.duration.leavingScreen,
                            }),
                        }}
                      >
                        {item.text}
                      </Typography>
                    }
                    sx={{
                      m: 0,
                      opacity: collapsed ? 0 : 1,
                      width: collapsed ? 0 : "auto",
                      overflow: "hidden",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </>
  );

  const drawerStyles = {
    backgroundColor: "#1e293b",
    color: "rgba(255, 255, 255, 0.65)",
    borderRight: "none",
    top: 0,
    height: "100vh",
    overflowX: "hidden" as const,
    overflowY: "auto" as const,
    "&::-webkit-scrollbar": { width: "4px" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: "10px",
    },
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={!isSidebarCollapsed}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            ...drawerStyles,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...drawerStyles,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

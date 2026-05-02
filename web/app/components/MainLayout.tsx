"use client";

import React from "react";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  MenuItem,
  TextField,
  Breadcrumbs,
  Link,
  Menu,
  Divider,
} from "@mui/material";
import NavLinks from "@/app/nav-links";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth, Role } from "@/app/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import ShieldMoonIcon from "@mui/icons-material/ShieldMoon";
import PersonIcon from "@mui/icons-material/Person";

import { useLocale } from "next-intl";
import Cookies from "js-cookie";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("App");
  const locale = useLocale();
  const router = useRouter();
  const { activeRole: userRole, setActiveRole: setUserRole, user, logout } = useAuth();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const fullName = user?.fullName || "User";

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLocale: string) => {
    Cookies.set("NEXT_LOCALE", newLocale, { expires: 365 });
    window.location.reload();
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* SIDEBAR CỐ ĐỊNH */}
        <Box
          sx={{
            width: 280,
            p: 3,
            borderRight: "1px solid #e0e0e0",
            bgcolor: "white",
            position: "fixed",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            zIndex: 1100,
          }}
        >
          {/* PHẦN TRÊN (LOGO + MENU CHÍNH) */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontWeight: "bold", mb: 4 }}
            >
              {t("title")}
            </Typography>
            <Stack spacing={1}>
              <NavLinks type="main" />
            </Stack>
          </Box>

          {/* PHẦN DƯỚI: Nút Logout (Dính đáy) */}
          <Box sx={{ pt: 2, borderTop: "1px solid #f0f0f0" }}>
            <NavLinks type="footer" />
          </Box>
        </Box>

        {/* VÙNG NỘI DUNG CHÍNH */}
        <Box
          sx={{
            flexGrow: 1,
            ml: "280px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* TOP HEADER */}
          <Box
            sx={{
              height: 64,
              bgcolor: "white",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 4,
              position: "sticky",
              top: 0,
              zIndex: 1000,
            }}
          >
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                underline="hover"
                color="inherit"
                href="/dashboard"
                sx={{ fontSize: "0.875rem" }}
              >
                {t("title")}
              </Link>
              {pathname !== "/dashboard" && (
                <Typography color="text.primary" sx={{ fontSize: "0.875rem" }}>
                  {pathname === "/dashboard/personnel" && t("role_personnel")}
                  {pathname === "/dashboard/attendance" && t("role_attendance")}
                  {pathname === "/null" && "Empty"}
                </Typography>
              )}
            </Breadcrumbs>

            {/* Right side: Role, Language, Account */}
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
              {/* Role Selector */}
              <TextField
                select
                size="small"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as Role)}
                sx={{ width: locale === "vi" ? 180 : 160 }}
                variant="outlined"
                slotProps={{
                  select: {
                    renderValue: (selected: any) => (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center" }}
                      >
                        <Typography
                          sx={{
                            color: "primary.main",
                            fontSize: "1.1rem",
                            display: "flex",
                          }}
                        >
                          {selected === "Admin" ? (
                            <ShieldMoonIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <PersonIcon sx={{ fontSize: 18 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selected === "Admin" ? t("role_admin") : t("role_employee")}
                        </Typography>
                      </Stack>
                    ),
                  },
                }}
              >
                <MenuItem value="Admin">
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <ShieldMoonIcon sx={{ fontSize: 20, color: "#1a237e" }} />
                    <Typography variant="body2">{t("role_admin")}</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="Employee">
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <PersonIcon sx={{ fontSize: 20, color: "#666" }} />
                    <Typography variant="body2">{t("role_employee")}</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="Attendance">
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <PersonIcon sx={{ fontSize: 20, color: "#666" }} />
                    <Typography variant="body2">{t("role_attendance")}</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="Manager">
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <PersonIcon sx={{ fontSize: 20, color: "#666" }} />
                    <Typography variant="body2">{t("role_manager")}</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="Personnel">
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <PersonIcon sx={{ fontSize: 20, color: "#666" }} />
                    <Typography variant="body2">{t("role_personnel")}</Typography>
                  </Stack>
                </MenuItem>
              </TextField>

              {/* Language Switcher */}
              <TextField
                select
                size="small"
                value={locale}
                onChange={(e) => handleLanguageChange(e.target.value)}
                sx={{ width: locale === "vi" ? 160 : 130 }}
                slotProps={{
                  select: {
                    renderValue: (selected: any) => (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center" }}
                      >
                        <Typography sx={{ fontSize: "1.2rem", lineHeight: 1 }}>
                          {selected === "vi" ? "🇻🇳" : "🇺🇸"}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selected === "vi"
                            ? "Tiếng Việt"
                            : "English"}
                        </Typography>
                      </Stack>
                    ),
                  },
                }}
              >
                <MenuItem value="vi">
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <Typography sx={{ fontSize: "1.2rem" }}>🇻🇳</Typography>
                    <Typography variant="body2">Tiếng Việt</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="en">
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <Typography sx={{ fontSize: "1.2rem" }}>🇺🇸</Typography>
                    <Typography variant="body2">English</Typography>
                  </Stack>
                </MenuItem>
              </TextField>

              {/* Account Avatar */}
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1.5, 
                  cursor: "pointer",
                  p: 0.5,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                }}
                onClick={handleProfileMenuOpen}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "primary.main",
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                  }}
                >
                  {fullName?.substring(0, 2).toUpperCase() || "U"}
                </Avatar>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, lineHeight: 1.2 }}
                  >
                    {fullName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {userRole}
                  </Typography>
                </Box>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={() => { handleMenuClose(); router.push("/profile"); }}>
                  {t("profile")}
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); logout(); router.push("/login"); }}>
                  {t("logout")}
                </MenuItem>
              </Menu>
            </Stack>
          </Box>

          {/* VÙNG NỘI DUNG THAY ĐỔI */}
          <Box sx={{ p: 4, bgcolor: "#f8f9fa", flexGrow: 1 }}>{children}</Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}

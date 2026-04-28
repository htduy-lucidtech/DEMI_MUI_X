"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Badge,
} from "@mui/material";
import {
  NotificationsOutlined as NotificationsIcon,
  Language as LanguageIcon,
  Translate as TranslateIcon,
  Logout as LogoutIcon,
  PersonOutlined as PersonIcon,
  SettingsOutlined as SettingsIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/app/context/AuthContext";
import Cookies from "js-cookie";

export default function Navbar() {
  const router = useRouter();
  const t = useTranslations("Layout.navbar");
  const tr = useTranslations("Layout.roles");
  const { activeRole, setActiveRole, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = () => {
    const currentLocale = Cookies.get("NEXT_LOCALE") || "vi";
    const newLocale = currentLocale === "vi" ? "en" : "vi";
    Cookies.set("NEXT_LOCALE", newLocale);
    window.location.reload();
  };

  const roles: Role[] = ["Admin", "Manager", "Personnel", "Attendance", "Employee"];
  const currentLocale = (Cookies.get("NEXT_LOCALE") || "vi").toUpperCase();

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        backgroundColor: "rgba(255, 255, 255, 0.8)", 
        backdropFilter: "blur(8px)",
        color: "text.primary", 
        boxShadow: "none",
        borderBottom: "1px solid #e2e8f0"
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: 64 }}>
        {/* Left Side: Brand/Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", display: { xs: "none", sm: "block" } }}>
            {t("title")}
          </Typography>
        </Box>

        {/* Right Side: Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
          
          {/* Role Preview - Premium Look */}
          {user?.role === "Admin" && (
            <FormControl size="small" sx={{ minWidth: 160, display: { xs: "none", md: "flex" } }}>
              <InputLabel id="role-select-label" sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{t("preview_role")}</InputLabel>
              <Select
                labelId="role-select-label"
                value={activeRole}
                label={t("preview_role")}
                onChange={(e) => setActiveRole(e.target.value as Role)}
                sx={{ 
                  borderRadius: 2, 
                  height: 38,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  bgcolor: "background.default"
                }}
              >
                {roles.map((r) => (
                  <MenuItem key={r} value={r} sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    {tr(r)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Language Toggle */}
          <IconButton onClick={handleLanguageChange} sx={{ color: "text.secondary", bgcolor: "background.default", borderRadius: 2 }}>
            <LanguageIcon fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 800 }}>
              {currentLocale}
            </Typography>
          </IconButton>

          {/* Notifications */}
          <IconButton sx={{ color: "text.secondary", bgcolor: "background.default", borderRadius: 2 }}>
            <Badge variant="dot" color="error">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, my: "auto" }} />

          {/* User Profile */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              p: 0.5,
              pr: { sm: 1.5 },
              borderRadius: 3,
              transition: "all 0.2s",
              '&:hover': { bgcolor: 'primary.light' }
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: "primary.main",
                boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)",
                fontSize: "0.875rem",
                fontWeight: 800
              }}
            >
              {user?.fullName?.substring(0, 1).toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1, mb: 0.2 }}>
                {user?.fullName || "User"}
              </Typography>
              <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
                {activeRole ? tr(activeRole as string) : ""}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            elevation={3}
            sx={{ mt: 1.5 }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 3,
                  minWidth: 200,
                  p: 1
                }
              }
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); router.push("/profile"); }} sx={{ borderRadius: 2, gap: 1.5, py: 1.2 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{t("profile")}</Typography>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); router.push("/settings"); }} sx={{ borderRadius: 2, gap: 1.5, py: 1.2 }}>
              <SettingsIcon fontSize="small" color="action" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{t("settings")}</Typography>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem 
              onClick={() => {
                handleMenuClose();
                logout();
                window.location.href = "/login";
              }}
              sx={{ borderRadius: 2, gap: 1.5, py: 1.2, color: "error.main" }}
            >
              <LogoutIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{t("logout")}</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

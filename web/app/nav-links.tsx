"use client";

import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

export default function NavLinks({ type }: { type: "main" | "footer" }) {
  const pathname = usePathname();
  const t = useTranslations("App");
  const router = useRouter();

  const mainLinks = [
    { name: t("profile"), href: "/dashboard", icon: HomeIcon }, // Placeholder names, will fix later
    { name: t("role_personnel"), href: "/dashboard/personnel", icon: TableChartIcon },
    { name: t("role_attendance"), href: "/dashboard/attendance", icon: BarChartIcon },
  ];

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    router.push("/login");
  };


  if (type === "footer") {
    return (
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => router.push("/profile")}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={t("profile")} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t("logout")} />
          </ListItemButton>
        </ListItem>
      </List>
    );
  }

  return (
    <List>
      {mainLinks.map((item) => {
        const isActive = pathname === item.href;
        return (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={isActive}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.light",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon>
                <item.icon style={{ width: 24 }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 400 }}>
                    {item.name}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

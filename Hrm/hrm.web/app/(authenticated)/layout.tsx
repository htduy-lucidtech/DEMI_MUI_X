"use client";

import React from "react";
import { Box, CssBaseline, Toolbar, Breadcrumbs, Typography, Link } from "@mui/material";
import Sidebar from "@/app/components/layout/Sidebar";
import Navbar from "@/app/components/layout/Navbar";
import { usePathname, useRouter } from "next/navigation";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

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
          p: { xs: 2, md: 4 },
          backgroundColor: "background.default",
          minHeight: "100vh",
          width: { sm: `calc(100% - 260px)` },
        }}
      >
        <Toolbar /> {/* Spacer for fixed Navbar */}
        
        {/* Breadcrumbs Section */}
        <Box sx={{ mb: 3 }}>
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
    </Box>
  );
}

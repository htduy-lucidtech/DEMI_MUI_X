"use client";

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  LinearProgress,
  Button,
  Paper,
} from "@mui/material";
import {
  People as PeopleIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  
  const stats = [
    { name: t("stats.total_employees"), value: "128", subValue: "+4% so với tháng trước", icon: PeopleIcon, color: "#4f46e5", trend: "up" },
    { name: t("stats.attendance_today"), value: "112/128", subValue: "87.5% tỉ lệ có mặt", icon: CalendarMonthIcon, color: "#10b981", trend: "up" },
    { name: t("stats.late_today"), value: "3", subValue: "-2% so với hôm qua", icon: AccessTimeIcon, color: "#f59e0b", trend: "down" },
    { name: t("stats.leave_requests"), value: "8", subValue: "5 đơn đang chờ duyệt", icon: AssignmentIcon, color: "#ec4899", trend: "neutral" },
  ];

  const recentActivities = [
    { id: 1, user: "Nguyễn Văn An", action: "Check-in", time: "08:00 AM", status: "success" },
    { id: 2, user: "Trần Thị Bình", action: "Nghỉ phép", time: "08:15 AM", status: "warning" },
    { id: 3, user: "Lê Văn Cường", action: "Check-in trễ", time: "08:45 AM", status: "error" },
    { id: 4, user: "Phạm Minh Đức", action: "Check-in", time: "09:00 AM", status: "success" },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
            {t("title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("welcome")}, hôm nay là một ngày làm việc tuyệt vời.
          </Typography>
        </Box>
        <Button variant="contained" size="large" sx={{ borderRadius: 3 }}>
          Xuất báo cáo
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.name}>
            <Card sx={{ 
              transition: "transform 0.2s", 
              "&:hover": { transform: "translateY(-4px)" } 
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}15`, // Lighten background
                      color: stat.color,
                      width: 44,
                      height: 44,
                      borderRadius: 2
                    }}
                  >
                    <stat.icon />
                  </Avatar>
                  <TrendingUpIcon sx={{ color: stat.trend === "up" ? "success.main" : "text.disabled", fontSize: 20 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}>
                  {stat.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" sx={{ 
                    color: stat.trend === "up" ? "success.main" : stat.trend === "down" ? "error.main" : "text.secondary",
                    fontWeight: 700 
                  }}>
                    {stat.subValue}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Attendance Timeline */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6">
                  {t("recent_attendance")}
                </Typography>
                <Button size="small">Xem tất cả</Button>
              </Box>
              
              <List disablePadding>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "background.default", color: "text.primary" }}>
                          {activity.user.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activity.user}</Typography>}
                        secondary={activity.action}
                      />
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activity.time}</Typography>
                        <Chip 
                          size="small" 
                          label={activity.status === "success" ? "Đúng giờ" : activity.status === "error" ? "Muộn" : "Đơn nghỉ"}
                          color={activity.status as any}
                          sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                        />
                      </Box>
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Rate / Stats */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Hiệu suất làm việc
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tỉ lệ chuyên cần</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>92%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Hoàn thành KPI</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>78%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={78} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Paper sx={{ p: 2, bgcolor: "primary.main", color: "white", borderRadius: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircleIcon />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Thông báo</Typography>
                    <Typography variant="caption">Hệ thống đã tự động chốt công tháng 4.</Typography>
                  </Box>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Shorthand for Chip if not imported
const Chip = ({ label, size, color, sx }: any) => {
  const colors: any = {
    success: { bg: "#dcfce7", text: "#166534" },
    error: { bg: "#fee2e2", text: "#991b1b" },
    warning: { bg: "#fef3c7", text: "#92400e" },
  };
  const c = colors[color] || colors.success;
  return (
    <Box sx={{ 
      display: "inline-flex", 
      alignItems: "center", 
      px: 1, 
      borderRadius: 1, 
      bgcolor: c.bg, 
      color: c.text,
      ...sx 
    }}>
      <Typography sx={{ fontSize: "inherit", fontWeight: "inherit" }}>{label}</Typography>
    </Box>
  );
};

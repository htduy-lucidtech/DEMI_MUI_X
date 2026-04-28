"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
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
  CircularProgress,
  Chip,
  Stack,
  FormControl,
  Select,
  MenuItem
} from "@mui/material";
import {
  People as PeopleIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { dashboardService } from "@/services/dashboard.service";
import { useAuth } from "@/app/context/AuthContext";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, [user, selectedMonth]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userId = user?.role === "Employee" ? user.id : undefined;
      const data = await dashboardService.getStats(userId);
      setStatsData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !statsData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const isPersonal = statsData?.isPersonal || user?.role === "Employee";

  const stats = [
    // Total Employees - Only show for Admin/HR
    ...(!isPersonal ? [{
      name: t("stats.total_employees"),
      value: statsData?.totalEmployees || 0,
      subValue: `${statsData?.activeEmployees || 0} ${t('stats_sub.active')}`,
      icon: PeopleIcon,
      color: "#4f46e5",
      trend: "up",
      link: "/dashboard/personnel"
    }] : []),
    {
      name: t("stats.attendance_today"),
      value: isPersonal
        ? (statsData?.attendanceToday > 0 ? t("stats.checked_in") : t("stats.not_checked_in"))
        : `${statsData?.attendanceToday || 0}/${statsData?.totalEmployees || 0}`,
      subValue: isPersonal
        ? (statsData?.attendanceToday > 0 ? t('status.on_time') : t('status.leave'))
        : `${((statsData?.attendanceToday / (statsData?.totalEmployees || 1)) * 100 || 0).toFixed(1)}${t('stats_sub.attendance_rate')}`,
      icon: CalendarMonthIcon,
      color: "#10b981",
      trend: "up",
      link: "/dashboard/attendance"
    },
    {
      name: isPersonal ? t("stats.total_late") : t("stats.late_today"),
      value: statsData?.lateToday || 0,
      subValue: t('stats_sub.real_time'),
      icon: AccessTimeIcon,
      color: "#f59e0b",
      trend: "down",
      link: "/dashboard/attendance"
    },
    {
      name: t("stats.leave_requests"),
      value: isPersonal
        ? t("stats.total_leave_days", { count: statsData?.totalLeaveDays || 0 })
        : statsData?.leaveRequests || 0,
      subValue: isPersonal
        ? (statsData?.leaveRequests > 0
          ? t("stats.leave_pending", { count: statsData?.leaveRequests })
          : t("stats.leave_approved_all"))
        : t('stats_sub.pending_approval'),
      icon: AssignmentIcon,
      color: "#ec4899",
      trend: "neutral",
      link: "/dashboard/leave",
      extra: isPersonal ? (
        <FormControl size="small" sx={{ minWidth: 100, mt: 1 }}>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            sx={{ height: 24, fontSize: '0.75rem' }}
          >
            {[...Array(12)].map((_, i) => (
              <MenuItem key={i + 1} value={i + 1}>{t("month", { month: i + 1 })}</MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
            {t("title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isPersonal ? t("welcome_personal", { name: user?.username || "" }) : t("welcome")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          sx={{ borderRadius: 3, px: 4 }}
          onClick={() => dashboardService.testNotification()}
        >
          {t('test_notification')}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: isPersonal ? "repeat(3, 1fr)" : "repeat(4, 1fr)"
        },
        gap: 3
      }}>
        {stats.map((stat) => (
          <Card
            key={stat.name}
            sx={{
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 28px rgba(0,0,0,0.12)" }
            }}
          >
            <CardContent sx={{ p: 3 }} onClick={() => router.push(stat.link)}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: `${stat.color}15`,
                    color: stat.color,
                    width: 48,
                    height: 48,
                    borderRadius: 2
                  }}
                >
                  <stat.icon />
                </Avatar>
                <TrendingUpIcon sx={{ color: stat.trend === "up" ? "success.main" : "text.disabled", fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}>
                {stat.name}
              </Typography>
              <Typography variant="caption" sx={{
                color: stat.trend === "up" ? "success.main" : stat.trend === "down" ? "error.main" : "text.secondary",
                fontWeight: 700
              }}>
                {stat.subValue}
              </Typography>
            </CardContent>
            {stat.extra && (
              <Box sx={{ px: 3, pb: 2, mt: -1 }}>
                {stat.extra}
              </Box>
            )}
          </Card>
        ))}
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Recent Attendance */}
        <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {isPersonal ? t("recent_attendance_personal") : t("recent_attendance")}
              </Typography>
              <Button size="small" onClick={() => router.push("/dashboard/attendance")}>{t('view_all')}  </Button>
            </Box>

            <List disablePadding>
              {(statsData?.recentActivities || []).map((activity: any, index: number) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.light", color: "primary.main", fontWeight: 700 }}>
                        {activity.user?.charAt(0)}
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
                        label={activity.status === "success" ? t('status.on_time') : activity.status === "error" ? t('status.late') : t('status.leave')}
                        color={activity.status as any}
                        sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, borderRadius: 1 }}
                      />
                    </Box>
                  </ListItem>
                  {index < (statsData?.recentActivities?.length - 1) && <Divider component="li" />}
                </React.Fragment>
              ))}
              {(!statsData?.recentActivities || statsData.recentActivities.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  {t('no_activities_today')}
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              {isPersonal ? t('performance.title_personal') : t('performance.title')}
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">{t('performance.attendance_rate')}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{statsData?.attendanceRate || 0}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={statsData?.attendanceRate || 0} sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">{t('performance.kpi_completion')}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{statsData?.kpiCompletion || 0}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={statsData?.kpiCompletion || 0} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            <Paper sx={{ p: 2, bgcolor: "primary.main", color: "white", borderRadius: 3, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <CheckCircleIcon />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t('system_notification.title')}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>{t('system_notification.desc')}</Typography>
                </Box>
              </Stack>
            </Paper>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

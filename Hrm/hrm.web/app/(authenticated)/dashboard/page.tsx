"use client";

import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Chip
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

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStatsData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const router = useRouter();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    { 
      name: t("stats.total_employees"), 
      value: statsData?.totalEmployees || 0, 
      subValue: `${statsData?.activeEmployees || 0} ${t('stats_sub.active')}`, 
      icon: PeopleIcon, 
      color: "#4f46e5", 
      trend: "up",
      link: "/dashboard/personnel"
    },
    { 
      name: t("stats.attendance_today"), 
      value: `${statsData?.attendanceToday || 0}/${statsData?.totalEmployees || 0}`, 
      subValue: `${((statsData?.attendanceToday / statsData?.totalEmployees) * 100 || 0).toFixed(1)}${t('stats_sub.attendance_rate')}`, 
      icon: CalendarMonthIcon, 
      color: "#10b981", 
      trend: "up",
      link: "/dashboard/attendance"
    },
    { 
      name: t("stats.late_today"), 
      value: statsData?.lateToday || 0, 
      subValue: t('stats_sub.real_time'), 
      icon: AccessTimeIcon, 
      color: "#f59e0b", 
      trend: "down",
      link: "/dashboard/attendance"
    },
    { 
      name: t("stats.leave_requests"), 
      value: statsData?.leaveRequests || 0, 
      subValue: t('stats_sub.pending_approval'), 
      icon: AssignmentIcon, 
      color: "#ec4899", 
      trend: "neutral",
      link: "/dashboard/leave"
    },
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
            {t("welcome")}
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.name}>
            <Card 
              onClick={() => router.push(stat.link)}
              sx={{ 
                borderRadius: 4,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", 
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 28px rgba(0,0,0,0.12)" } 
              }}
            >
              <CardContent sx={{ p: 3 }}>
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
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
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
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {t("recent_attendance")}
                </Typography>
                <Button size="small">{t('view_all')}</Button>
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
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                {t('performance.title')}
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircleIcon />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t('system_notification.title')}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>{t('system_notification.desc')}</Typography>
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

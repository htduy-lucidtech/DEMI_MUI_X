"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from "@/hooks/useRealtime";
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
  MenuItem,
} from "@mui/material";
import {
  People as PeopleIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  PieChart as PieIcon,
} from "@mui/icons-material";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";

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

  useEffect(() => {
    fetchStats();
  }, [user, selectedMonth]);

  // Refresh dashboard when notifications arrive
  useRealtimeRefresh(fetchStats, ["short"]);

  const isPersonal = statsData?.isPersonal || user?.role === "Employee";

  const stats = React.useMemo(
    () => [
      // Total Employees - Only show for Admin/HR
      ...(!isPersonal
        ? [
            {
              name: t("stats.total_employees"),
              value: statsData?.totalEmployees || 0,
              subValue: `${statsData?.activeEmployees || 0} ${t("stats_sub.active")}`,
              icon: PeopleIcon,
              color: "#4f46e5",
              trend: "up",
              link: "/dashboard/personnel",
            },
          ]
        : []),
      {
        name: t("stats.attendance_today"),
        value: isPersonal
          ? statsData?.attendanceToday > 0
            ? t("stats.checked_in")
            : t("stats.not_checked_in")
          : `${statsData?.attendanceToday || 0}/${statsData?.totalEmployees || 0}`,
        subValue: isPersonal
          ? statsData?.attendanceToday > 0
            ? t("status.on_time")
            : t("status.leave")
          : `${((statsData?.attendanceToday / (statsData?.totalEmployees || 1)) * 100 || 0).toFixed(1)}${t("stats_sub.attendance_rate")}`,
        icon: CalendarMonthIcon,
        color: "#10b981",
        trend: "up",
        link: "/dashboard/attendance",
      },
      {
        name: isPersonal ? t("stats.total_late") : t("stats.late_today"),
        value: statsData?.lateToday || 0,
        subValue: t("stats_sub.real_time"),
        icon: AccessTimeIcon,
        color: "#f59e0b",
        trend: "down",
        link: "/dashboard/attendance",
      },
      {
        name: t("stats.leave_requests"),
        value: isPersonal
          ? t("stats.total_leave_days", {
              count: statsData?.totalLeaveDays || 0,
            })
          : statsData?.leaveRequests || 0,
        subValue: isPersonal
          ? statsData?.leaveRequests > 0
            ? t("stats.leave_pending", { count: statsData?.leaveRequests })
            : t("stats.leave_approved_all")
          : t("stats_sub.pending_approval"),
        icon: AssignmentIcon,
        color: "#ec4899",
        trend: "neutral",
        link: "/dashboard/leave",
        extra: isPersonal ? (
          <FormControl size="small" sx={{ minWidth: 100, mt: 1 }}>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={{ height: 24, fontSize: "0.75rem" }}
            >
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {t("month", { month: i + 1 })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null,
      },
    ],
    [isPersonal, statsData, t, selectedMonth],
  );

  if (loading && !statsData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Stats Cards - Compact */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: isPersonal ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
          },
          gap: 1,
        }}
      >
        {stats.map((stat) => (
          <Card
            key={stat.name}
            sx={{
              borderRadius: 1.5,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
              },
            }}
          >
            <CardContent
              sx={{ p: 1.2, "&:last-child": { pb: 1.2 } }}
              onClick={() => router.push(stat.link)}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${stat.color}15`,
                    color: stat.color,
                    width: 28,
                    height: 28,
                    borderRadius: 0.75,
                  }}
                >
                  <stat.icon sx={{ fontSize: 18 }} />
                </Avatar>
                <TrendingUpIcon
                  sx={{
                    color:
                      stat.trend === "up" ? "success.main" : "text.disabled",
                    fontSize: 18,
                  }}
                />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0 }}>
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  display: "block",
                  mb: 0.5,
                }}
              >
                {stat.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color:
                    stat.trend === "up"
                      ? "success.main"
                      : stat.trend === "down"
                        ? "error.main"
                        : "text.secondary",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              >
                {stat.subValue}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts Section */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" },
          gap: 1,
        }}
      >
        {/* Attendance Trend Line Chart */}
        <Card
          sx={{
            borderRadius: 1.5,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                textTransform: "uppercase",
              }}
            >
              <BarChartIcon fontSize="inherit" color="primary" />
              {t("attendance_trend")}
            </Typography>
            <Box sx={{ width: "100%", height: 200 }}>
              <LineChart
                xAxis={[
                  {
                    data: [1, 2, 3, 4, 5, 6, 7],
                    scaleType: "point",
                    valueFormatter: (v) => `${t("day")} ${v}`,
                  },
                ]}
                series={[
                  {
                    data: statsData?.attendanceTrend || [
                      85, 92, 88, 95, 89, 94, 91,
                    ],
                    area: true,
                    color: "#4f46e5",
                    label: t("stats.attendance_today"),
                    showMark: true,
                  },
                ]}
                height={200}
                margin={{ left: 25, right: 5, top: 10, bottom: 20 }}
                slotProps={{
                  legend: { hidden: true } as any,
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                display: "block",
                mt: 1,
                fontStyle: "italic",
              }}
            >
              * {t("notes.attendance")}
            </Typography>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card
          sx={{
            borderRadius: 1.5,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                textTransform: "uppercase",
              }}
            >
              <PieIcon fontSize="inherit" color="secondary" />
              {t("status_distribution")}
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: 200,
                display: "flex",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <PieChart
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: statsData?.attendanceToday || 0,
                        label: t("status.on_time"),
                        color: "#10b981",
                      },
                      {
                        id: 1,
                        value: statsData?.lateToday || 0,
                        label: t("status.late"),
                        color: "#f59e0b",
                      },
                      {
                        id: 2,
                        value: statsData?.leaveRequests || 0,
                        label: t("status.leave"),
                        color: "#ec4899",
                      },
                    ],
                    innerRadius: 60,
                    outerRadius: 85,
                    paddingAngle: 2,
                    cornerRadius: 2,
                  },
                ]}
                height={200}
                slotProps={{
                  legend: { hidden: true } as any,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, lineHeight: 1 }}
                >
                  {(statsData?.attendanceToday || 0) +
                    (statsData?.lateToday || 0) +
                    (statsData?.leaveRequests || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("stats.total_employees")}
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                display: "block",
                mt: 1,
                fontStyle: "italic",
              }}
            >
              * {t("notes.status")}
            </Typography>
          </CardContent>
        </Card>

        {/* Leave Requests Bar Chart */}
        <Card
          sx={{
            borderRadius: 1.5,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                textTransform: "uppercase",
              }}
            >
              <TrendingUpIcon fontSize="inherit" color="info" />
              {t("leave_distribution")}
            </Typography>
            <Box sx={{ width: "100%", height: 200 }}>
              <BarChart
                xAxis={[
                  {
                    data: Object.values(t.raw("months_short")).slice(
                      0,
                      new Date().getMonth() + 1,
                    ),
                    scaleType: "band",
                  },
                ]}
                series={[
                  {
                    data: [4, 3, 5, 2, 6, 4, 3, 5, 2, 6, 4, 3].slice(
                      0,
                      new Date().getMonth() + 1,
                    ),
                    color: "#4f46e5",
                    label: t("stats.leave_requests"),
                    barLabel: "value",
                  },
                ]}
                height={200}
                margin={{ left: 20, right: 5, top: 20, bottom: 20 }}
                slotProps={{
                  legend: { hidden: true } as any,
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                display: "block",
                mt: 1,
                fontStyle: "italic",
              }}
            >
              * {t("notes.leave")}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Lower Section: Recent & Performance */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.8fr 1.2fr" },
          gap: 1,
        }}
      >
        {/* Recent Attendance */}
        <Card
          sx={{
            borderRadius: 1.5,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {isPersonal
                  ? t("recent_attendance_personal")
                  : t("recent_attendance")}
              </Typography>
              <Button
                size="small"
                sx={{ fontSize: "0.75rem" }}
                onClick={() => router.push("/dashboard/attendance")}
              >
                {t("view_all")}
              </Button>
            </Box>

            <List disablePadding>
              {(statsData?.recentActivities || [])
                .slice(0, 5)
                .map((activity: any, index: number) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar
                          sx={{
                            bgcolor: "primary.light",
                            color: "primary.main",
                            fontWeight: 700,
                            width: 32,
                            height: 32,
                            fontSize: "0.875rem",
                          }}
                        >
                          {activity.user?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {activity.user}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {activity.action}
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: "block" }}
                        >
                          {activity.time}
                        </Typography>
                        <Chip
                          size="small"
                          label={
                            activity.status === "success"
                              ? t("status.on_time")
                              : activity.status === "error"
                                ? t("status.late")
                                : t("status.leave")
                          }
                          color={activity.status as any}
                          sx={{
                            height: 18,
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            borderRadius: 0.75,
                          }}
                        />
                      </Box>
                    </ListItem>
                    {index <
                      Math.min(5, statsData?.recentActivities?.length) - 1 && (
                      <Divider component="li" />
                    )}
                  </React.Fragment>
                ))}
            </List>
          </CardContent>
        </Card>

        {/* Performance & Notifications */}
        <Stack spacing={1}>
          <Card
            sx={{
              borderRadius: 1.5,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                {isPersonal
                  ? t("performance.title_personal")
                  : t("performance.title")}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("performance.attendance_rate")}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {statsData?.attendanceRate || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statsData?.attendanceRate || 0}
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>

              <Box sx={{ mb: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("performance.kpi_completion")}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {statsData?.kpiCompletion || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statsData?.kpiCompletion || 0}
                  color="secondary"
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>
            </CardContent>
          </Card>

          <Paper
            sx={{
              p: 1.5,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 1.5,
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <CheckCircleIcon fontSize="small" />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, display: "block" }}
                >
                  {t("system_notification.title")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, fontSize: "0.65rem" }}
                >
                  {t("system_notification.desc")}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}

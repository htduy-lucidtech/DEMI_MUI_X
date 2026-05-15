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
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  People as PeopleIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  DateRange as DateRangeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  History as TodayIcon,
} from "@mui/icons-material";
import { LineChart } from "@mui/x-charts/LineChart";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { dashboardService } from "@/services/dashboard.service";
import { useAuth } from "@/app/context/AuthContext";
import FormGrid from "@/components/common/FormGrid";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("week");
  const [anchorDate, setAnchorDate] = useState(new Date());
  const router = useRouter();

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [stats, analytics] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getAnalytics({
          range,
          referenceDate: anchorDate.toISOString().split('T')[0]
        })
      ]);
      setStatsData(stats);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, range, anchorDate]);

  useRealtimeRefresh(fetchData, ["short"]);

  const isPersonal = statsData?.isPersonal || user?.role === "Employee";

  const handleNavigate = (direction: number) => {
    const newDate = new Date(anchorDate);
    if (range === "week") {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setAnchorDate(newDate);
  };

  const handleResetDate = () => setAnchorDate(new Date());

  const stats = React.useMemo(
    () => [
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
          : `${((statsData?.attendanceToday / (statsData?.totalEmployees || 1)) * 100 || 0).toFixed(1)}% ${t("stats_sub.attendance_rate")}`,
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
      },
    ],
    [isPersonal, statsData, t],
  );

  const dateRangeDisplay = React.useMemo(() => {
    if (analyticsData.length === 0) return "";
    const firstDate = analyticsData[0].date;
    const lastDate = analyticsData[analyticsData.length - 1].date;
    const year = anchorDate.getFullYear();
    return range === "week"
      ? `${t("range.week")} (${firstDate} - ${lastDate}, ${year})`
      : `${t("range.month")} ${anchorDate.getMonth() + 1}/${year} (${firstDate} - ${lastDate})`;
  }, [analyticsData, range, anchorDate, t]);

  if (loading && !statsData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Stats Cards */}
      <FormGrid columns={{ xs: 1, sm: 2, md: 2, lg: isPersonal ? 3 : 4 }} gap={1.5}>
        {stats.map((stat) => (
          <Card key={stat.name} sx={{ transition: "all 0.2s ease", "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" } }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, cursor: "pointer" }} onClick={() => router.push(stat.link)}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 32, height: 32, borderRadius: 1 }}>
                  <stat.icon sx={{ fontSize: 20 }} />
                </Avatar>
                <TrendingUpIcon sx={{ color: stat.trend === "up" ? "success.main" : "text.disabled", fontSize: 18 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}>{stat.name}</Typography>
              <Typography variant="caption" sx={{ color: stat.trend === "up" ? "success.main" : stat.trend === "down" ? "error.main" : "text.secondary", fontWeight: 700, fontSize: "0.7rem" }}>{stat.subValue}</Typography>
            </CardContent>
          </Card>
        ))}
      </FormGrid>

      {/* Main Content Grid: 7/3 Ratio */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "7fr 3fr" }, gap: 1.5 }}>

        {/* Left Column: Analytics Chart */}
        <Stack spacing={1.5}>
          <Card>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon color="primary" /> {t("analytics_title", { fallback: "Biểu đồ xu hướng vận hành" })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{dateRangeDisplay}</Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box sx={{ display: "flex", alignItems: "center", bgcolor: "grey.100", borderRadius: 1.5, p: 0.5, mr: 1 }}>
                    <Tooltip title="Tuần trước">
                      <IconButton size="small" onClick={() => handleNavigate(-1)}><ChevronLeftIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Hiện tại">
                      <IconButton size="small" onClick={handleResetDate}><TodayIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Tuần sau">
                      <IconButton size="small" onClick={() => handleNavigate(1)}><ChevronRightIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>

                  <ToggleButtonGroup
                    value={range}
                    exclusive
                    onChange={(_, v) => v && setRange(v)}
                    size="small"
                    sx={{ height: 32 }}
                  >
                    <ToggleButton value="week" sx={{ px: 2, fontSize: '0.75rem' }}>{t("range.week", { fallback: "Tuần" })}</ToggleButton>
                    <ToggleButton value="month" sx={{ px: 2, fontSize: '0.75rem' }}>{t("range.month", { fallback: "Tháng" })}</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Box>

              <Box sx={{ width: "100%", height: 380 }}>
                <LineChart
                  xAxis={[{
                    data: analyticsData.map(d => d.date),
                    scaleType: "point",
                    tickInterval: (value, index) => range === 'month' ? index % 5 === 0 : true
                  }]}
                  series={[
                    { data: analyticsData.map(d => d.attendance), label: "Đi làm", color: "#10b981", area: true, showMark: range === 'week' },
                    { data: analyticsData.map(d => d.late), label: "Muộn", color: "#f59e0b", showMark: range === 'week' },
                    { data: analyticsData.map(d => d.leave), label: "Nghỉ", color: "#ec4899", showMark: range === 'week' },
                  ]}
                  height={380}
                  margin={{ left: 40, right: 40, top: 40, bottom: 30 }}
                  slotProps={{
                    legend: {
                      direction: 'row' as any,
                      position: { vertical: 'top', horizontal: 'center' }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{t("recent_activity")}</Typography>
                <Button size="small" onClick={() => router.push("/dashboard/attendance")}>{t("view_all")}</Button>
              </Box>
              <List disablePadding>
                {statsData?.recentActivities?.map((activity: any, index: number) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "grey.100", color: "primary.main", width: 36, height: 36 }}>{activity.user[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{activity.user}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">{activity.action} • {activity.time}</Typography>}
                      />
                      <Box>
                        <Chip label={activity.status === "success" ? t("status.on_time") : t("status.late")} color={activity.status as any} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
                      </Box>
                    </ListItem>
                    {index < statsData.recentActivities.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>

        {/* Right Column: Performance & Info (3 Ratio) */}
        <Stack spacing={1.5}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800 }}>{isPersonal ? t("performance.title_personal") : t("performance.title")}</Typography>
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">{t("performance.attendance_rate")}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{statsData?.attendanceRate || 0}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={statsData?.attendanceRate || 0} sx={{ height: 6, borderRadius: 1, bgcolor: "grey.100" }} />
              </Box>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">{t("performance.kpi_completion")}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{statsData?.kpiCompletion || 0}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={statsData?.kpiCompletion || 0} color="secondary" sx={{ height: 6, borderRadius: 1, bgcolor: "grey.100" }} />
              </Box>
            </CardContent>
          </Card>

          <Paper sx={{ p: 2, bgcolor: "primary.main", color: "white", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Mẹo hệ thống</Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>Duy trì tỉ lệ đi làm trên 95% để nhận thưởng chuyên cần cuối tháng!</Typography>
          </Paper>

          <Card sx={{ bgcolor: "grey.50", border: "1px dashed", borderColor: "divider" }}>
            <CardContent sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>PHIÊN BẢN HRM PRO V2.0</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "grey.300", mt: 1 }}>2026</Typography>
            </CardContent>
          </Card>
        </Stack>

      </Box>
    </Box>
  );
}

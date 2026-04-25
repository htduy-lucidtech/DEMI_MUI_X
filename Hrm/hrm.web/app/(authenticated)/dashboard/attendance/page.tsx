"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Stack,
  Card,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { attendanceService, AttendanceRecord, TodayStatus } from "@/services/attendance.service";
import CustomNoRowsOverlay from "@/app/components/CustomNoRowsOverlay";

export default function AttendancePage() {
  const t = useTranslations("Attendance");
  const { user } = useAuth();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [status, setStatus] = useState<TodayStatus>({ hasCheckedIn: false, hasCheckedOut: false });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [histData, statusData] = await Promise.all([
        attendanceService.getAll(),
        attendanceService.getTodayStatus(user.id)
      ]);
      setHistory(histData);
      setStatus(statusData);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn(user?.id || 0);
      fetchData();
    } catch (error) {
      alert(t("messages.error"));
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut(user?.id || 0);
      fetchData();
    } catch (error) {
      alert(t("messages.error"));
    }
  };

  const columns: GridColDef[] = [
    { 
      field: "fullName", 
      headerName: t("columns.employee"), 
      flex: 1
    },
    { 
      field: "checkInTime", 
      headerName: t("columns.checkIn"), 
      width: 200,
      valueFormatter: (value) => value ? new Date(value).toLocaleString() : "-"
    },
    { 
      field: "checkOutTime", 
      headerName: t("columns.checkOut"), 
      width: 200,
      valueFormatter: (value) => value ? new Date(value).toLocaleString() : "-"
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>{t("title")}</Typography>
        <Typography variant="body2" color="text.secondary">{t("description")}</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, height: "100%", bgcolor: "primary.main", color: "white" }}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                {currentTime.toLocaleTimeString()}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
                {!status.hasCheckedIn ? (
                  <Button 
                    variant="contained" 
                    color="inherit" 
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={handleCheckIn}
                    sx={{ color: "primary.main", fontWeight: 700, borderRadius: 3, px: 4 }}
                  >
                    {t("checkIn")}
                  </Button>
                ) : !status.hasCheckedOut ? (
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    startIcon={<LogoutIcon />}
                    onClick={handleCheckOut}
                    sx={{ fontWeight: 700, borderRadius: 3, px: 4 }}
                  >
                    {t("checkOut")}
                  </Button>
                ) : (
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ✨ {t("status.checkedOut")} {new Date(status.checkOutTime!).toLocaleTimeString()}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t("status.title")}</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">{t("columns.checkIn")}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {status.checkInTime ? new Date(status.checkInTime).toLocaleTimeString() : "--:--"}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">{t("columns.checkOut")}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {status.checkOutTime ? new Date(status.checkOutTime).toLocaleTimeString() : "--:--"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("history")}</Typography>
        </Box>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={history}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{ border: 'none' }}
          />
        </Box>
      </Paper>
    </Box>
  );
}

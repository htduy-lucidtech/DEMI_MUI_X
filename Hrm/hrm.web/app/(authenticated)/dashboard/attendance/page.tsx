"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Drawer,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ErrorOutlined as WarningIcon,
  CheckCircleOutlined as CheckIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { attendanceService, AttendanceRecord, TodayStatus, SystemSetting } from "@/services/attendance.service";
import CustomNoRowsOverlay from "@/app/components/CustomNoRowsOverlay";

export default function AttendancePage() {
  const t = useTranslations("Attendance");
  const { user } = useAuth();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [status, setStatus] = useState<TodayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Late Reason Dialog
  const [lateDialogOpen, setLateDialogOpen] = useState(false);
  const [lateReason, setLateReason] = useState("");

  // HR Settings Dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [regulationSettings, setRegulationSettings] = useState<SystemSetting[]>([]);

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
      
      // Role-based filtering: Employee only sees their own records
      const rawHistory = histData || [];
      const filteredHistory = user.role === "Employee" 
        ? rawHistory.filter(item => item.userId === user.id)
        : rawHistory;

      setHistory(filteredHistory);
      setStatus(statusData);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInAttempt = () => {
    if (!status) return;
    
    const now = new Date();
    const [hours, minutes] = status.regulations.checkIn.split(':').map(Number);
    const standardTime = new Date();
    standardTime.setHours(hours, minutes, 0, 0);

    if (now > standardTime) {
      setLateDialogOpen(true);
    } else {
      performCheckIn();
    }
  };

  const performCheckIn = async () => {
    try {
      await attendanceService.checkIn(user?.id || 0, lateReason);
      setLateDialogOpen(false);
      setLateReason("");
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

  const handleOpenSettings = async () => {
    try {
      const data = await attendanceService.getRegulations();
      setRegulationSettings(data);
      setSettingsOpen(true);
    } catch (error) {
      console.error("Failed to fetch regulations:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await attendanceService.updateRegulations(regulationSettings);
      setSettingsOpen(false);
      fetchData();
    } catch (error) {
      alert(t("messages.error"));
    }
  };

  const columns: GridColDef[] = [
    { 
      field: "fullName", 
      headerName: t("columns.employee") || "Nhân viên", 
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", height: "100%" }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.light' }}>
            {params.value?.toString().charAt(0) || "U"}
          </Avatar>
          <Typography variant="body2">{params.value || "N/A"}</Typography>
        </Stack>
      )
    },
    { 
      field: "checkInTimeDate", 
      headerName: t("columns.date") || "Ngày", 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.row.checkInTime ? new Date(params.row.checkInTime).toLocaleDateString('vi-VN') : "-"}
        </Typography>
      )
    },
    { 
      field: "checkInTime", 
      headerName: t("columns.checkIn") || "Giờ vào", 
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value.toString()).toLocaleTimeString() : "-"}
        </Typography>
      )
    },
    { 
      field: "checkOutTime", 
      headerName: t("columns.checkOut") || "Giờ ra", 
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value.toString()).toLocaleTimeString() : "-"}
        </Typography>
      )
    },
    {
      field: "isLate",
      headerName: t("columns.status") || "Trạng thái",
      width: 130,
      renderCell: (params) => (
        <Chip 
          size="small"
          icon={params.value ? <WarningIcon /> : <CheckIcon />}
          label={params.value ? t("status.late") : t("status.onTime")}
          color={params.value ? "error" : "success"}
          variant="outlined"
        />
      )
    },
    {
      field: "lateReason",
      headerName: t("columns.lateReason") || "Lý do",
      flex: 1.5,
      renderCell: (params) => (
        params.value ? (
          <Tooltip title={params.value.toString()}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: 'text.secondary', height: '100%' }}>
              <CommentIcon fontSize="inherit" />
              <Typography variant="caption" noWrap>{params.value.toString()}</Typography>
            </Stack>
          </Tooltip>
        ) : null
      )
    }
  ];

  const isHR = user?.role === "Admin" || user?.role === "Personnel" || user?.role === "Manager";

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{t("title")}</Typography>
          <Typography variant="body2" color="text.secondary">{t("description")}</Typography>
        </Box>
        {isHR && (
          <Button 
            variant="outlined" 
            startIcon={<SettingsIcon />} 
            onClick={handleOpenSettings}
            sx={{ borderRadius: 2.5 }}
          >
            {t("regulations.edit")}
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {/* Clock Card */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
          <Card sx={{ 
            borderRadius: 4, 
            height: "100%", 
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", 
            color: "white",
            boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)"
          }}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: 2 }}>
                {currentTime.toLocaleTimeString()}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mb: 4 }}>
                {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
                {status && !status.hasCheckedIn ? (
                  <Button 
                    variant="contained" 
                    color="inherit" 
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={handleCheckInAttempt}
                    sx={{ color: "primary.main", fontWeight: 700, borderRadius: 3, px: 4, py: 1.5 }}
                  >
                    {t("checkIn")}
                  </Button>
                ) : status && !status.hasCheckedOut ? (
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    startIcon={<LogoutIcon />}
                    onClick={handleCheckOut}
                    sx={{ fontWeight: 700, borderRadius: 3, px: 4, py: 1.5 }}
                  >
                    {t("checkOut")}
                  </Button>
                ) : (
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 3, width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      ✨ {t("status.checkedOut")}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {status?.checkOutTime ? new Date(status.checkOutTime).toLocaleTimeString() : "--:--"}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Status & Regulations */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ borderRadius: 4, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon color="primary" /> {t("status.title")}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("columns.checkIn")}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {status?.checkInTime ? new Date(status.checkInTime).toLocaleTimeString() : "--:--"}
                  </Typography>
                  {status?.isLate && (
                    <Chip label={t("status.late")} color="error" size="small" sx={{ mt: 1 }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("columns.checkOut")}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {status?.checkOutTime ? new Date(status.checkOutTime).toLocaleTimeString() : "--:--"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, flex: 1, borderLeft: '4px solid #2563eb' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t("regulations.title")}</Typography>
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("regulations.checkInTime")}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {status?.regulations.checkIn || "--:--"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("regulations.checkOutTime")}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {status?.regulations.checkOut || "--:--"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* History Table */}
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("history")}</Typography>
        </Box>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={history}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{ 
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: '#f8fafc',
                color: 'text.secondary',
                fontWeight: 600
              }
            }}
          />
        </Box>
      </Paper>

      {/* Late Reason Dialog */}
      <Dialog open={lateDialogOpen} onClose={() => setLateDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <WarningIcon /> {t("late.title")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Giờ vào làm tiêu chuẩn là <strong>{status?.regulations.checkIn}</strong>. Hiện tại đã quá giờ quy định, vui lòng nhập lý do.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t("late.reasonLabel") || "Lý do đi muộn"}
            placeholder={t("late.reasonPlaceholder") || "Nhập lý do..."}
            value={lateReason}
            onChange={(e) => setLateReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setLateDialogOpen(false)}>{t("dialog.cancel")}</Button>
          <Button 
            onClick={performCheckIn} 
            variant="contained" 
            color="error" 
            disabled={!lateReason.trim()}
          >
            {t("late.submit")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t("regulations.edit")}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {regulationSettings.map((setting, index) => (
              <TextField
                key={setting.key}
                label={setting.description || setting.key}
                type="time"
                value={setting.value}
                onChange={(e) => {
                  const newSettings = [...regulationSettings];
                  newSettings[index].value = e.target.value;
                  setRegulationSettings(newSettings);
                }}
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSettingsOpen(false)}>{t("dialog.cancel")}</Button>
          <Button onClick={handleSaveSettings} variant="contained" color="primary">
            {t("dialog.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

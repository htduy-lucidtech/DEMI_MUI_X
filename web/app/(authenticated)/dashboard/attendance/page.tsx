"use client";

import React, { useState, useEffect, useRef } from "react";
import useRealtimeRefresh from "@/hooks/useRealtime";
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
import {
  attendanceService,
  AttendanceRecord,
  TodayStatus,
  SystemSetting,
} from "@/services/attendance.service";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";
import CorrectionsPanel from "@/components/attendance/CorrectionsPanel";
import CheckInOut from "@/components/attendance/CheckInOut";

export default function AttendancePage() {
  const t = useTranslations("Attendance");
  const { user } = useAuth();
  const isHR = user?.role === "Admin" || user?.role === "Personnel" || user?.role === "Manager";
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [status, setStatus] = useState<TodayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Selection state
  const [selectionModel, setSelectionModel] = useState<any>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const getSelectedIds = (): number[] => {
    if (!selectionModel) return [];
    if (Array.isArray(selectionModel)) return selectionModel as number[];
    if (typeof selectionModel === "object") {
      if ("ids" in selectionModel && selectionModel.ids) {
        const ids = selectionModel.ids;
        return Array.isArray(ids) ? (ids as number[]) : Array.from(ids as any);
      }
      if (selectionModel instanceof Set) return Array.from(selectionModel) as number[];
    }
    return [];
  };
  const selectedCount = getSelectedIds().length;

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [histData, statusData] = await Promise.all([
        attendanceService.getAll(),
        attendanceService.getTodayStatus(user.id),
      ]);

      // Role-based filtering: Employee only sees their own records
      const rawHistory = histData || [];
      const filteredHistory =
        user.role === "Employee"
          ? rawHistory.filter((item) => item.userId === user.id)
          : rawHistory;

      setHistory(filteredHistory);
      setStatus(statusData);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // Late Reason Dialog
  const [lateDialogOpen, setLateDialogOpen] = useState(false);
  const [lateReason, setLateReason] = useState("");

  // HR Settings Dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [regulationSettings, setRegulationSettings] = useState<SystemSetting[]>(
    [],
  );

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Auto-refresh data every 60 seconds to keep it "real-time"
    const refreshTimer = setInterval(() => {
      fetchData();
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  // Refresh attendance when notifications arrive
  useRealtimeRefresh(fetchData, ["short"]);

  const handleCheckInAttempt = () => {
    if (!status) return;

    const now = new Date();
    const [hours, minutes] = status.regulations.checkIn.split(":").map(Number);
    const standardTime = new Date();
    standardTime.setHours(hours, minutes, 0, 0);

    if (now > standardTime) {
      setLateDialogOpen(true);
    } else {
      performCheckIn();
    }
  };

  const performCheckIn = async () => {
    setLoading(true);
    try {
      const attendance = await attendanceService.checkIn(
        user?.id || 0,
        lateReason,
      );
      // optimistic UI update: update today's status and history immediately
      setLateDialogOpen(false);
      setLateReason("");
      setStatus(
        (prev) =>
          ({
            ...prev,
            hasCheckedIn: true,
            hasCheckedOut: false,
            checkInTime: attendance?.checkInTime,
            isLate: attendance?.isLate ?? false,
            lateReason: attendance?.lateReason ?? null,
          }) as any,
      );
      setHistory((prev) => [attendance as any, ...prev]);
      // then refresh authoritative data
      await fetchData();
    } catch (error) {
      alert(t("messages.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const attendance = await attendanceService.checkOut(user?.id || 0);
      // optimistic update
      setStatus(
        (prev) =>
          ({
            ...prev,
            hasCheckedOut: true,
            checkOutTime: attendance?.checkOutTime,
          }) as any,
      );
      setHistory((prev) =>
        prev.map((h) =>
          h.userId === attendance.userId &&
            new Date(h.checkInTime).toDateString() ===
            new Date(attendance.checkInTime).toDateString()
            ? (attendance as any)
            : h,
        ),
      );
      await fetchData();
    } catch (error) {
      alert(t("messages.error"));
    } finally {
      setLoading(false);
    }
  };

  const formatUTCHourToLocal = (utcStr: string) => {
    // Backend returns "08:30" which is ALREADY in local format.
    // Treating it as UTC and shifting by +7 causes the UI to show "15:30".
    // Therefore, we just return the string as is.
    return utcStr || "--:--";
  };

  const calculateDuration = (checkIn?: string | null) => {
    if (!checkIn) return "00:00:00";
    const start = new Date(checkIn).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - start);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleOpenSettings = async () => {
    try {
      const data = await attendanceService.getRegulations();
      setRegulationSettings(data || []);
      setSettingsOpen(true);
    } catch (error) {
      console.error("Failed to fetch regulations:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await attendanceService.updateRegulations(regulationSettings);
      setSettingsOpen(false);
      await fetchData();
    } catch (error) {
      alert(t("messages.error"));
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await attendanceService.bulkDelete(getSelectedIds());
      fetchData();
      setSelectionModel([]);
      setBulkDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Failed to bulk delete attendances:", error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: t("columns.employee"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", height: "100%" }}
        >
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: "0.75rem",
              bgcolor: "primary.light",
            }}
          >
            {params.value?.toString().charAt(0) || "U"}
          </Avatar>
          <Typography variant="body2">{params.value || "N/A"}</Typography>
        </Stack>
      ),
    },
    {
      field: "checkInTimeDate",
      headerName: t("columns.date"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.row.checkInTime
            ? new Date(params.row.checkInTime).toLocaleDateString("vi-VN")
            : "-"}
        </Typography>
      ),
    },
    {
      field: "checkInTime",
      headerName: t("columns.checkIn"),
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value
            ? new Date(params.value.toString()).toLocaleTimeString()
            : "-"}
        </Typography>
      ),
    },
    {
      field: "checkOutTime",
      headerName: t("columns.checkOut"),
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value
            ? new Date(params.value.toString()).toLocaleTimeString()
            : "-"}
        </Typography>
      ),
    },
    {
      field: "workedMinutes",
      headerName: t("columns.workHours"),
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value ? (params.value / 60.0).toFixed(1) : "-"}
        </Typography>
      ),
    },
    {
      field: "otMinutes",
      headerName: t("columns.otHours"),
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: "secondary.main" }}>
          {params.value ? (params.value / 60.0).toFixed(1) : "-"}
        </Typography>
      ),
    },
    {
      field: "isLate",
      headerName: t("columns.status"),
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          icon={params.value ? <WarningIcon /> : <CheckIcon />}
          label={params.value ? t("status.late") : t("status.onTime")}
          color={params.value ? "error" : "success"}
          variant="outlined"
        />
      ),
    },
    {
      field: "lateReason",
      headerName: t("columns.lateReason"),
      flex: 1.5,
      renderCell: (params) =>
        params.value ? (
          <Tooltip title={params.value.toString()}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                color: "text.secondary",
                height: "100%",
              }}
            >
              <CommentIcon fontSize="inherit" />
              <Typography variant="caption" noWrap>
                {params.value.toString()}
              </Typography>
            </Stack>
          </Tooltip>
        ) : null,
    },
  ];


  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          gap: 1.5,
        }}
      >
        {/* Clock Card */}
        <Box sx={{ gridColumn: { xs: "span 1", md: "span 1" } }}>
          <Card
            sx={{
              borderRadius: 1.5,
              height: "100%",
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              color: "white",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            <CardContent
              sx={{ textAlign: "center", py: 1.5, "&:last-child": { pb: 1.5 } }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
                {mounted
                  ? currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                  : "--:--:--"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, mb: 2, display: "block" }}
              >
                {mounted
                  ? currentTime.toLocaleDateString("vi-VN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                  : "..."}
              </Typography>

              <Box sx={{ mt: 1 }}>
                {status && !status.hasCheckedIn ? (
                  <Button
                    variant="contained"
                    color="inherit"
                    size="medium"
                    startIcon={<LoginIcon />}
                    onClick={handleCheckInAttempt}
                    sx={{
                      color: "primary.main",
                      fontWeight: 700,
                      borderRadius: 1,
                      width: "100%",
                    }}
                  >
                    {t("checkIn")}
                  </Button>
                ) : status && !status.hasCheckedOut ? (
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {t("status.workingTime")}:{" "}
                      {mounted
                        ? calculateDuration(status.checkInTime)
                        : "00:00:00"}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="medium"
                      startIcon={<LogoutIcon />}
                      onClick={handleCheckOut}
                      disabled={loading}
                      sx={{ fontWeight: 700, borderRadius: 1, width: "100%" }}
                    >
                      {loading ? "..." : t("checkOut")}
                    </Button>
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {t("status.checkedOut")}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {status?.checkOutTime
                        ? new Date(status.checkOutTime).toLocaleTimeString(
                          "vi-VN",
                        )
                        : "--:--"}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Info & Stats Summary */}
        <Box
          sx={{
            gridColumn: { xs: "span 1", md: "span 3" },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" },
            gap: 1.5,
          }}
        >
          <Card
            sx={{ borderRadius: 1.5, display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TimeIcon color="primary" fontSize="small" />{" "}
                {t("status.title")} & {t("regulations.title")}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("columns.checkIn")}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {status?.checkInTime
                      ? new Date(status.checkInTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "--:--"}
                  </Typography>
                  {status?.isLate && (
                    <Chip
                      label={t("status.late")}
                      color="error"
                      size="small"
                      sx={{ height: 20, fontSize: "0.625rem" }}
                    />
                  )}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("columns.checkOut")}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {status?.checkOutTime
                      ? new Date(status.checkOutTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "--:--"}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("regulations.shortTitle")}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    {formatUTCHourToLocal(status?.regulations.checkIn || "")} -{" "}
                    {formatUTCHourToLocal(status?.regulations.checkOut || "")}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                {isHR && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={handleOpenSettings}
                    sx={{ borderRadius: 1, mt: 2 }}
                  >
                    {t("regulations.edit")}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Corrections panel (managers/personnel) */}
          {isHR && <CorrectionsPanel />}

          <Card
            sx={{
              borderRadius: 1.5,
              bgcolor: "primary.50",
              border: "1px dashed",
              borderColor: "primary.main",
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                {t("stats.monthly")}
              </Typography>
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="caption">
                    {t("stats.workingDays")}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {
                      history.filter(
                        (h) =>
                          new Date(h.checkInTime).getMonth() ===
                          new Date().getMonth(),
                      ).length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="caption">
                    {t("stats.workingHours")}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {history
                      .filter(
                        (h) =>
                          new Date(h.checkInTime).getMonth() ===
                          new Date().getMonth(),
                      )
                      .reduce((acc, h) => acc + (h.workedMinutes || 0), 0) / 60}
                    h
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="caption">
                    {t("stats.otHours")}:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "secondary.main" }}
                  >
                    {history
                      .filter(
                        (h) =>
                          new Date(h.checkInTime).getMonth() ===
                          new Date().getMonth(),
                      )
                      .reduce((acc, h) => acc + (h.otMinutes || 0), 0) / 60}
                    h
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="caption">
                    {t("stats.lateDays")}:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "error.main" }}
                  >
                    {
                      history.filter(
                        (h) =>
                          h.isLate &&
                          new Date(h.checkInTime).getMonth() ===
                          new Date().getMonth(),
                      ).length
                    }
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* History Table */}
      <Paper
        sx={{
          borderRadius: 1.5,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t("history")}
          </Typography>
          {isHR && selectedCount > 0 && (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => setBulkDeleteConfirmOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              {t("dialog.delete_all") || `Delete (${selectedCount})`}
            </Button>
          )}
        </Box>
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={history}
            columns={columns}
            loading={loading}
            density="compact"
            disableRowSelectionOnClick
            checkboxSelection={user?.role === "Admin" || user?.role === "Personnel"}
            onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#f8fafc",
                color: "text.secondary",
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Bulk Delete Confirm */}
      <Dialog
        open={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
      >
        <DialogTitle>{t("dialog.delete_bulk_title") || "Xác nhận xóa hàng loạt"}</DialogTitle>
        <DialogContent>
          {t("dialog.delete_bulk_confirm", { count: selectedCount }) || `Bạn có chắc muốn xóa ${selectedCount} bản ghi đã chọn?`}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBulkDeleteConfirmOpen(false)} variant="outlined">
            {t("dialog.cancel") || "Hủy"}
          </Button>
          <Button onClick={handleBulkDeleteConfirm} variant="contained" color="error">
            {t("dialog.delete_all") || "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Late Reason Dialog */}
      <Dialog
        open={lateDialogOpen}
        onClose={() => setLateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "error.main",
          }}
        >
          <WarningIcon /> {t("late.title")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            {t.rich("late.description", {
              time: status?.regulations.checkIn || "08:30",
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t("late.reasonLabel")}
            placeholder={t("late.reasonPlaceholder")}
            value={lateReason}
            onChange={(e) => setLateReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setLateDialogOpen(false)}>
            {t("dialog.cancel")}
          </Button>
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
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t("regulations.edit")}
        </DialogTitle>
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
                  inputLabel: { shrink: true },
                }}
              />
            ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSettingsOpen(false)}>
            {t("dialog.cancel")}
          </Button>
          <Button
            onClick={handleSaveSettings}
            variant="contained"
            color="primary"
          >
            {t("dialog.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

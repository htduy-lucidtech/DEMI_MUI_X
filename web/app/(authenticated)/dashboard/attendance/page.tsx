"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from "@/hooks/useRealtime";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Settings as SettingsIcon,
  ErrorOutlined as WarningIcon,
  CheckCircleOutlined as CheckIcon,
  Search as SearchIcon,
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
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import FormGrid from "@/components/common/FormGrid";

export default function AttendancePage() {
  const t = useTranslations("Attendance");
  const tc = useTranslations("Attendance.dialog");
  const locale = useTranslations("Layout").raw("locale") || "vi";
  const { user, hasPermission } = useAuth();
  const isHR = hasPermission("ATT_MANAGE_ALL") || hasPermission("ATT_VIEW_ALL");

  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [status, setStatus] = useState<TodayStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Selection state
  const [selectionModel, setSelectionModel] = useState<any>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Dialog states
  const [lateDialogOpen, setLateDialogOpen] = useState(false);
  const [lateReason, setLateReason] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [regulationSettings, setRegulationSettings] = useState<SystemSetting[]>([]);

  const getSelectedIds = (): number[] => {
    if (!selectionModel) return [];
    if (Array.isArray(selectionModel)) return selectionModel as number[];
    if (typeof selectionModel === "object") {
      if ("ids" in selectionModel && selectionModel.ids) {
        return Array.isArray(selectionModel.ids) ? selectionModel.ids : Array.from(selectionModel.ids);
      }
      if (selectionModel instanceof Set) return Array.from(selectionModel) as any;
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
        attendanceService.getTodayStatus(),
      ]);

      setHistory(histData || []);
      setStatus(statusData);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const refreshTimer = setInterval(() => fetchData(), 60000);

    if (user) fetchData();

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, [user]);

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
      await attendanceService.checkIn(lateReason);
      setLateDialogOpen(false);
      setLateReason("");
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
      await attendanceService.checkOut();
      await fetchData();
    } catch (error) {
      alert(t("messages.error"));
    } finally {
      setLoading(false);
    }
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

  const calculateDuration = (checkIn?: string | null) => {
    if (!checkIn) return "00:00:00";
    const start = new Date(checkIn).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - start);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const filteredHistory = history.filter(item => {
    const q = searchQuery.toLowerCase();

    // Search query check
    const matchesSearch = item.fullName?.toLowerCase().includes(q) ||
      item.checkInTime?.toLowerCase().includes(q) ||
      item.note?.toLowerCase().includes(q) ||
      item.lateReason?.toLowerCase().includes(q);

    // Date filter check
    const matchesDate = !filterDate || (item.checkInTime && new Date(item.checkInTime).toLocaleDateString('en-CA') === filterDate);

    // Status filter check
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "late" && item.isLate) ||
      (filterStatus === "onTime" && !item.isLate);

    return matchesSearch && matchesDate && matchesStatus;
  });

  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: t("columns.employee"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", height: "100%" }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem", bgcolor: "primary.light" }}>
            {params.value?.toString().charAt(0) || "U"}
          </Avatar>
          <Typography variant="body2">{params.value || tc("notAvailable")}</Typography>
        </Stack>
      ),
    },
    {
      field: "checkInTimeDate",
      headerName: t("columns.date"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.row.checkInTime ? new Date(params.row.checkInTime).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US") : "-"}
        </Typography>
      ),
    },
    {
      field: "checkInTime",
      headerName: t("columns.checkIn"),
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value.toString()).toLocaleTimeString() : "-"}
        </Typography>
      ),
    },
    {
      field: "checkOutTime",
      headerName: t("columns.checkOut"),
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value.toString()).toLocaleTimeString() : "-"}
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
      field: "isLate",
      headerName: t("columns.status"),
      width: 130,
      renderCell: (params) => (
        <StatusChip
          status={params.value ? "error" : "success"}
          label={params.value ? t("status.late") : t("status.onTime")}
          icon={params.value ? <WarningIcon sx={{ fontSize: '0.9rem !important' }} /> : <CheckIcon sx={{ fontSize: '0.9rem !important' }} />}
        />
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <FormGrid sx={{ gridTemplateColumns: { xs: "1fr", md: "1fr 3fr" } }}>
        {/* Clock Card */}
        <Card sx={{ borderRadius: 1.5, background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white" }}>
          <CardContent sx={{ textAlign: "center", py: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {mounted ? currentTime.toLocaleTimeString() : "--:--:--"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: "block", mb: 2 }}>
              {mounted ? currentTime.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "..."}
            </Typography>
            <Box>
              {status && !status.hasCheckedIn ? (
                <Button variant="contained" color="inherit" onClick={handleCheckInAttempt} sx={{ color: "primary.main", fontWeight: 700, width: "100%" }}>
                  {t("checkIn")}
                </Button>
              ) : status && !status.hasCheckedOut ? (
                <Stack spacing={1}>
                  <Typography variant="caption">{t("status.workingTime")}: {mounted ? calculateDuration(status.checkInTime) : "00:00:00"}</Typography>
                  <Button variant="contained" color="secondary" onClick={handleCheckOut} disabled={loading} sx={{ fontWeight: 700, width: "100%" }}>
                    {t("checkOut")}
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", p: 1, borderRadius: 1 }}>
                  <Typography variant="subtitle2">{t("status.checkedOut")}</Typography>
                  <Typography variant="caption">{status?.checkOutTime ? new Date(status.checkOutTime).toLocaleTimeString() : "--:--"}</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Info & Stats Summary */}
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 1.5 }}>
          <Card sx={{ borderRadius: 1.5, p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}><TimeIcon fontSize="small" /> {t("status.title")}</Typography>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">{t("columns.checkIn")}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{status?.checkInTime ? new Date(status.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t("columns.checkOut")}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{status?.checkOutTime ? new Date(status.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="caption" color="text.secondary">{t("regulations.shortTitle")}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "primary.main" }}>{status?.regulations.checkIn} - {status?.regulations.checkOut}</Typography>
              </Box>
            </Stack>
            {isHR && (
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button size="small" startIcon={<SettingsIcon />} onClick={handleOpenSettings}>{t("regulations.edit")}</Button>
                <Button size="small" startIcon={<TimeIcon />} onClick={() => setCorrectionOpen(true)} color="warning">{t("corrections.openButton")}</Button>
              </Stack>
            )}
          </Card>

          {isHR && <CorrectionsPanel open={correctionOpen} onClose={() => setCorrectionOpen(false)} />}
        </Box>
      </FormGrid>

      {/* History Table */}
      <Paper sx={{ borderRadius: 1.5, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <PageHeader
          title={t("history")}
          searchPlaceholder={tc("search_placeholder")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          actions={
            <>
              <TextField
                type="date"
                size="small"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                sx={{ width: 170 }}
              />

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel shrink>{t("columns.status")}</InputLabel>
                <Select
                  value={filterStatus}
                  label={t("columns.status")}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="all">{tc("filter_all") || "Tất cả trạng thái"}</MenuItem>
                  <MenuItem value="onTime">{t("status.onTime")}</MenuItem>
                  <MenuItem value="late">{t("status.late")}</MenuItem>
                </Select>
              </FormControl>

              {(searchQuery || filterDate || filterStatus !== "all") && (
                <Button size="small" onClick={() => { setSearchQuery(""); setFilterDate(""); setFilterStatus("all"); }}>
                  {tc("clear_filters") || "Xóa lọc"}
                </Button>
              )}

              {isHR && selectedCount > 0 && (
                <Button variant="contained" color="error" size="small" onClick={() => setBulkDeleteConfirmOpen(true)}>{t("dialog.delete_all")} ({selectedCount})</Button>
              )}
            </>
          }
        />
        <Box sx={{ height: 400 }}>
          <DataGrid
            rows={filteredHistory}
            columns={columns}
            loading={loading}
            density="compact"
            checkboxSelection={isHR}
            onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            sx={{ border: "none" }}
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

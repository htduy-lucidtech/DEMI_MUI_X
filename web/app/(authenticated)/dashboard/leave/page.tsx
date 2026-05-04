"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from "@/lib/useRealtime";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { leaveService, LeaveRequest } from "@/services/leave.service";
import { useAuth } from "@/app/context/AuthContext";

export default function LeaveRequestsPage() {
  const t = useTranslations("Leave");
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<LeaveRequest>({
    userId: user?.id || 0,
    leaveType: "Annual",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
    status: "Pending",
  });

  const formatLocal = (dateStr: string | number | Date) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleOpenDialog = (request?: LeaveRequest) => {
    if (request) {
      setEditingId(request.id!);
      setFormData({
        ...formData,
        leaveType: request.leaveType,
        startDate: formatLocal(request.startDate),
        endDate: formatLocal(request.endDate),
        reason: request.reason,
        status: request.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        userId: user?.id || 0,
        leaveType: "Annual",
        startDate: formatLocal(new Date()),
        endDate: formatLocal(new Date()),
        reason: "",
        status: "Pending",
      });
    }
    setOpen(true);
  };

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

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Náº¿u lÃ  Admin/Personnel thÃ¬ xem táº¥t cáº£, náº¿u lÃ  Employee thÃ¬ chá»‰ xem cá»§a mÃ¬nh
      const data =
        user?.role === "Admin" || user?.role === "Personnel"
          ? await leaveService.getAll()
          : await leaveService.getByUserId(user?.id || 0);
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  useRealtimeRefresh(() => fetchRequests(), ["short"]);

  const handleSubmit = async () => {
    const toUtcIso = (dateStr: string) => {
      const parts = dateStr.split("-").map(Number);
      if (parts.length < 3) return new Date(dateStr).toISOString();
      const [y, m, d] = parts;
      return new Date(Date.UTC(y, m - 1, d)).toISOString();
    };

    try {
      const payload: Partial<LeaveRequest> = {
        leaveType: formData.leaveType,
        startDate: toUtcIso(formData.startDate as string),
        endDate: toUtcIso(formData.endDate as string),
        reason: formData.reason,
        status: "Pending",
      };

      await leaveService.create(payload as LeaveRequest);
      showSnackbar(t("messages.success"), "success");
      setOpen(false);
      fetchRequests();
      try {
        const startLabel = payload.startDate
          ? new Date(payload.startDate).toLocaleDateString()
          : "";
        const endLabel = payload.endDate
          ? new Date(payload.endDate).toLocaleDateString()
          : "";
        const msg = `${user?.fullName || "Người dùng"} đã gửi đơn nghỉ: ${payload.leaveType} ${startLabel} - ${endLabel}`;
        window.dispatchEvent(
          new CustomEvent("notification:short", { detail: { message: msg } }),
        );
      } catch {}
    } catch (error) {
      console.error(error);
      showSnackbar(t("messages.error"), "error");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await leaveService.updateStatus(id, status, user?.fullName || "System");
      showSnackbar(t("messages.updateSuccess"), "success");
      // Refresh list immediately so manager sees update
      fetchRequests();
      try {
        const msg = `${user?.fullName || "Quản lý"} đã ${status === "Approved" ? "duyệt" : "từ chối"} đơn nghỉ #${id}`;
        window.dispatchEvent(
          new CustomEvent("notification:short", { detail: { message: msg } }),
        );
      } catch {}
    } catch (error) {
      showSnackbar(t("messages.updateError"), "error");
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await leaveService.bulkDelete(getSelectedIds());
      fetchRequests();
      setSelectionModel([]);
      setBulkDeleteConfirmOpen(false);
      showSnackbar(t("messages.deleteSuccess") || "Xóa thành công", "success");
    } catch (error) {
      console.error("Failed to bulk delete leaves:", error);
      showSnackbar(t("messages.deleteError") || "Lỗi khi xóa", "error");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: t("columns.fullName"),
      flex: 1,
    },
    {
      field: "reason",
      headerName: t("columns.reason"),
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.875rem" }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "leaveType",
      headerName: t("columns.type"),
      width: 150,
      renderCell: (params) => t(`data.type.${params.value}`),
    },
    {
      field: "startDate",
      headerName: t("columns.startDate"),
      width: 130,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : "-",
    },
    {
      field: "endDate",
      headerName: t("columns.endDate"),
      width: 130,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : "-",
    },
    {
      field: "status",
      headerName: t("columns.status"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string;
        let color: "warning" | "success" | "error" | "default" = "warning";
        if (status === "Approved") color = "success";
        if (status === "Rejected") color = "error";
        return (
          <Chip
            label={t(`data.status.${status}`)}
            color={color}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
      },
    },
    {
      field: "approvedBy",
      headerName: t("columns.approvedBy"),
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value || "-"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: t("columns.actions"),
      width: 150,
      renderCell: (params: GridRenderCellParams) =>
        (user?.role === "Admin" || user?.role === "Personnel") &&
        params.row.status === "Pending" ? (
          <Stack direction="row" spacing={1}>
            <Tooltip title={t("common.approve")}>
              <IconButton
                color="success"
                size="small"
                onClick={() => handleUpdateStatus(params.row.id, "Approved")}
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("common.reject")}>
              <IconButton
                color="error"
                size="small"
                onClick={() => handleUpdateStatus(params.row.id, "Rejected")}
              >
                <RejectIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Actions Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "stretch", sm: "flex-end" },
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
          {(user?.role === "Admin" || user?.role === "Personnel") && selectedCount > 0 && (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => setBulkDeleteConfirmOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              {t("common.delete_all") || `Xóa (${selectedCount})`}
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchRequests}
            sx={{ borderRadius: 2, flex: 1 }}
          >
            {t("common.refresh")}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 2, flex: 1 }}
          >
            {t("createRequest")}
          </Button>
        </Stack>
      </Box>

      <Paper
        sx={{
          height: 500,
          width: "100%",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        <DataGrid
          rows={requests}
          columns={columns}
          loading={loading}
          getRowId={(row) => row?.id ?? `fallback-${row.userId}-${row.startDate}`}
          disableRowSelectionOnClick
          checkboxSelection={user?.role === "Admin" || user?.role === "Personnel"}
          onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
          sx={{ border: "none" }}
        />
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
            {t("common.delete_all") || "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{t("dialog.title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label={t("dialog.type")}
              fullWidth
              value={formData.leaveType}
              onChange={(e) =>
                setFormData({ ...formData, leaveType: e.target.value })
              }
            >
              <MenuItem value="Annual">{t("data.type.Annual")}</MenuItem>
              <MenuItem value="Sick">{t("data.type.Sick")}</MenuItem>
              <MenuItem value="Personal">{t("data.type.Personal")}</MenuItem>
            </TextField>
            <TextField
              type="date"
              label={t("dialog.startDate")}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
            <TextField
              type="date"
              label={t("dialog.endDate")}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
            <TextField
              label={t("dialog.reason")}
              fullWidth
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {t("dialog.submit")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

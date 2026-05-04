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
  const [formData, setFormData] = useState<LeaveRequest>({
    userId: user?.id || 0,
    leaveType: "Annual",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
    status: "Pending",
  });

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
      alert(t("messages.success"));
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
      alert(t("messages.error"));
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await leaveService.updateStatus(id, status, user?.fullName || "System");
      alert(t("messages.updateSuccess"));
      // Refresh list immediately so manager sees update
      fetchRequests();
      try {
        const msg = `${user?.fullName || "Quản lý"} đã ${status === "Approved" ? "duyệt" : "từ chối"} đơn nghỉ #${id}`;
        window.dispatchEvent(
          new CustomEvent("notification:short", { detail: { message: msg } }),
        );
      } catch {}
    } catch (error) {
      alert(t("messages.updateError"));
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
    { field: "startDate", headerName: t("columns.startDate"), width: 130 },
    { field: "endDate", headerName: t("columns.endDate"), width: 130 },
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
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchRequests}
            sx={{ borderRadius: 2 }}
          >
            {t("common.refresh")}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 2 }}
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
          disableRowSelectionOnClick
          sx={{ border: "none" }}
        />
      </Paper>

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
    </Box>
  );
}

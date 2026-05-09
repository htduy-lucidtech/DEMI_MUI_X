"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from "@/hooks/useRealtime";
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
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";

interface LeaveRequestsClientProps {
  initialData: LeaveRequest[];
}

export default function LeaveRequestsClient({ initialData }: LeaveRequestsClientProps) {
  const t = useTranslations("Leave");
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>(initialData || []);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<LeaveRequest>({
    userId: user?.id || 0,
    leaveType: "Annual",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
    status: "Pending",
  });

  const [selectionModel, setSelectionModel] = useState<any>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

  const getSelectedIds = (): number[] => Array.isArray(selectionModel) ? selectionModel as number[] : [];
  const selectedCount = getSelectedIds().length;

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data =
        user?.role === "Admin" || user?.role === "Manager"
          ? await leaveService.getAll()
          : await leaveService.getByUserId(user?.id || 0);
      setRequests(data || []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      fetchRequests();
    }
  }, [user]);

  useRealtimeRefresh(() => fetchRequests(), ["short"]);

  const handleSubmit = async () => {
    try {
      await leaveService.create({ ...formData, userId: user?.id || 0 });
      showSnackbar(t("messages.success"));
      setOpen(false);
      fetchRequests();
    } catch (error) {
      showSnackbar(t("messages.error"), "error");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await leaveService.updateStatus(id, status, user?.fullName || "System");
      showSnackbar(t("messages.updateSuccess"));
      fetchRequests();
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
      showSnackbar(t("messages.deleteSuccess"));
    } catch (error) {
      showSnackbar(t("messages.deleteError"), "error");
    }
  };

  const columns: GridColDef[] = [
    { field: "fullName", headerName: t("columns.fullName"), flex: 1 },
    { field: "leaveType", headerName: t("columns.type"), width: 150, renderCell: (params) => t(`data.type.${params.value}`) },
    { field: "startDate", headerName: t("columns.startDate"), width: 130, renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-" },
    { field: "endDate", headerName: t("columns.endDate"), width: 130, renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-" },
    {
      field: "status",
      headerName: t("columns.status"),
      width: 120,
      renderCell: (params) => (
        <Chip label={t(`data.status.${params.value}`)} color={params.value === "Approved" ? "success" : params.value === "Rejected" ? "error" : "warning"} size="small" />
      ),
    },
    {
      field: "actions",
      headerName: t("columns.actions"),
      width: 150,
      renderCell: (params) =>
        (user?.role === "Admin" || user?.role === "Manager") && params.row.status === "Pending" ? (
          <Stack direction="row" spacing={1}>
            <IconButton color="success" size="small" onClick={() => handleUpdateStatus(params.row.id, "Approved")}><ApproveIcon fontSize="small" /></IconButton>
            <IconButton color="error" size="small" onClick={() => handleUpdateStatus(params.row.id, "Rejected")}><RejectIcon fontSize="small" /></IconButton>
          </Stack>
        ) : null,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        {(user?.role === "Admin" || user?.role === "Manager") && selectedCount > 0 && (
          <Button variant="contained" color="error" size="small" onClick={() => setBulkDeleteConfirmOpen(true)}>{t("common.delete_all")} ({selectedCount})</Button>
        )}
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>{t("createRequest")}</Button>
      </Box>

      <Paper sx={{ height: 600, borderRadius: 2 }}>
        <DataGrid
          rows={requests}
          columns={columns}
          loading={loading}
          checkboxSelection={user?.role === "Admin" || user?.role === "Manager"}
          onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
          slots={{ noRowsOverlay: CustomNoRowsOverlay }}
          sx={{ border: "none" }}
        />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t("dialog.title")}</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField select label={t("dialog.type")} fullWidth value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}>
                    <MenuItem value="Annual">{t("data.type.Annual")}</MenuItem>
                    <MenuItem value="Sick">{t("data.type.Sick")}</MenuItem>
                    <MenuItem value="Personal">{t("data.type.Personal")}</MenuItem>
                </TextField>
                <TextField type="date" label={t("dialog.startDate")} fullWidth slotProps={{ inputLabel: { shrink: true } }} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                <TextField type="date" label={t("dialog.endDate")} fullWidth slotProps={{ inputLabel: { shrink: true } }} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                <TextField label={t("dialog.reason")} fullWidth multiline rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>{t("dialog.cancel")}</Button>
          <Button onClick={handleSubmit} variant="contained">{t("dialog.submit")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

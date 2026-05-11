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
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { FormControl, InputLabel, Select } from "@mui/material";
import { leaveService, LeaveRequest } from "@/services/leave.service";
import { useAuth } from "@/app/context/AuthContext";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";

export default function LeaveRequestsPage() {
  const t = useTranslations("Leave");
  const { user, activeRole } = useAuth();
  const isHR = activeRole === "Admin" || activeRole === "Manager" || activeRole === "General Manager" || activeRole === "Department Manager";
  
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
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

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");



  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await leaveService.getAll();
      setRequests(data || []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
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



  const filteredRequests = requests.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.fullName?.toLowerCase().includes(q) ||
      item.reason?.toLowerCase().includes(q) ||
      item.approvedBy?.toLowerCase().includes(q) ||
      t(`data.type.${item.leaveType}`).toLowerCase().includes(q) ||
      t(`data.status.${item.status}`).toLowerCase().includes(q);

    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const columns: GridColDef[] = [
    { field: "fullName", headerName: t("columns.fullName"), width: 200 },
    { field: "leaveType", headerName: t("columns.type"), width: 140, renderCell: (params) => t(`data.type.${params.value}`) },
    { field: "startDate", headerName: t("columns.startDate"), width: 110, renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-" },
    { field: "endDate", headerName: t("columns.endDate"), width: 110, renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-" },
    { field: "reason", headerName: t("columns.reason"), flex: 1, minWidth: 200 },
    { field: "approvedBy", headerName: t("columns.approvedBy"), width: 140, renderCell: (params) => params.value || "-" },
    {
      field: "status",
      headerName: t("columns.status"),
      width: 110,
      renderCell: (params) => (
        <Chip label={t(`data.status.${params.value}`)} color={params.value === "Approved" ? "success" : params.value === "Rejected" ? "error" : "warning"} size="small" />
      ),
    },
    {
      field: "actions",
      headerName: t("columns.actions"),
      width: 150,
      renderCell: (params) =>
        isHR && params.row.status === "Pending" ? (
          <Stack direction="row" spacing={1}>
            <IconButton color="success" size="small" onClick={() => handleUpdateStatus(params.row.id, "Approved")}><ApproveIcon fontSize="small" /></IconButton>
            <IconButton color="error" size="small" onClick={() => handleUpdateStatus(params.row.id, "Rejected")}><RejectIcon fontSize="small" /></IconButton>
          </Stack>
        ) : null,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexGrow: 1, flexWrap: "wrap" }}>
          <TextField
            placeholder={t("dialog.search_placeholder")}
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ color: "text.disabled", mr: 1, fontSize: 18 }} />
              }
            }}
            sx={{ width: { xs: "100%", md: 400 } }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel shrink>{t("columns.status")}</InputLabel>
            <Select
              value={filterStatus}
              label={t("columns.status")}
              onChange={(e) => setFilterStatus(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">{t("dialog.filter_all")}</MenuItem>
              <MenuItem value="Pending">{t("data.status.Pending")}</MenuItem>
              <MenuItem value="Approved">{t("data.status.Approved")}</MenuItem>
              <MenuItem value="Rejected">{t("data.status.Rejected")}</MenuItem>
            </Select>
          </FormControl>

          {(searchQuery || filterStatus !== "all") && (
            <Button size="small" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}>
              {t("dialog.clear_filters")}
            </Button>
          )}
        </Stack>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>{t("createRequest")}</Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, borderRadius: 2 }}>
        <DataGrid
          rows={filteredRequests}
          columns={columns}
          loading={loading}
          checkboxSelection={false}
          onRowSelectionModelChange={() => {}}
          slots={{ noRowsOverlay: CustomNoRowsOverlay }}
          sx={{ border: "none" }}
        />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t("dialog.title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label={t("dialog.type")} fullWidth value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}>
              <MenuItem value="Yearly Leave">{t("data.type.Yearly Leave")}</MenuItem>
              <MenuItem value="Sick Leave">{t("data.type.Sick Leave")}</MenuItem>
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

"use client";

import React, { useState, useEffect } from "react";
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
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: "",
    status: "Pending"
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Nếu là Admin/Personnel thì xem tất cả, nếu là Employee thì chỉ xem của mình
      const data = (user?.role === 'Admin' || user?.role === 'Personnel') 
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

  const handleSubmit = async () => {
    try {
      await leaveService.create(formData);
      fetchRequests();
      setOpen(false);
    } catch (error) {
      alert("Failed to create request");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await leaveService.updateStatus(id, status, user?.fullName || "System");
      fetchRequests();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const columns: GridColDef[] = [
    { 
      field: "user", 
      headerName: "Nhân viên", 
      flex: 1,
      valueGetter: (params: any) => params?.fullName || "N/A"
    },
    { field: "leaveType", headerName: "Loại nghỉ", width: 120 },
    { field: "startDate", headerName: "Từ ngày", width: 130 },
    { field: "endDate", headerName: "Đến ngày", width: 130 },
    { 
      field: "status", 
      headerName: "Trạng thái", 
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string;
        let color: "warning" | "success" | "error" | "default" = "warning";
        if (status === "Approved") color = "success";
        if (status === "Rejected") color = "error";
        return <Chip label={status} color={color} size="small" sx={{ fontWeight: 700 }} />;
      }
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        (user?.role === 'Admin' || user?.role === 'Personnel') && params.row.status === 'Pending' ? (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Duyệt">
              <IconButton color="success" size="small" onClick={() => handleUpdateStatus(params.row.id, 'Approved')}>
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Từ chối">
              <IconButton color="error" size="small" onClick={() => handleUpdateStatus(params.row.id, 'Rejected')}>
                <RejectIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Quản lý Nghỉ phép</Typography>
          <Typography variant="body2" color="text.secondary">Danh sách và phê duyệt đơn từ</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchRequests}>Tải lại</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Tạo đơn mới</Button>
        </Stack>
      </Box>

      <Paper sx={{ height: 500, width: '100%', borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <DataGrid
          rows={requests}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Tạo đơn nghỉ phép</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label="Loại nghỉ"
              fullWidth
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            >
              <MenuItem value="Annual">Nghỉ phép năm</MenuItem>
              <MenuItem value="Sick">Nghỉ ốm</MenuItem>
              <MenuItem value="Personal">Nghỉ việc riêng</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Từ ngày"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <TextField
              type="date"
              label="Đến ngày"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <TextField
              label="Lý do"
              fullWidth
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">Gửi đơn</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

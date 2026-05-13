"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Tabs,
  Tab,
  Snackbar,
  Avatar,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  PlaylistAddCheck as ApprovalIcon,
  History as HistoryIcon,
  PendingActions as PendingIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { approvalService, ApprovalRequest, ApprovalStatus } from "@/services/approval.service";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";

export default function ApprovalsPage() {
  const t = useTranslations("Approvals");
  const { user } = useAuth();
  const canManage = user?.role === "Admin" || user?.role === "Manager";
  
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [note, setNote] = useState("");
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await approvalService.getPending();
      setRequests(data);
    } catch (err) {
      setError(t("messages.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: "approve" | "reject") => {
    if (!selectedRequest) return;
    try {
      setActioning(true);
      if (status === "approve") {
        await approvalService.approve(selectedRequest.id, note);
      } else {
        await approvalService.reject(selectedRequest.id, note);
      }
      setSuccess(t("messages.success"));
      setSelectedRequest(null);
      setNote("");
      fetchData();
    } catch (err) {
      setError(t("messages.error"));
    } finally {
      setActioning(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (tabValue === 0) return req.status === ApprovalStatus.Pending;
    return req.status !== ApprovalStatus.Pending;
  });

  const getStatusChip = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.Pending:
        return (
          <Chip
            label={t("status.Pending")}
            color="warning"
            size="small"
            variant="filled"
            sx={{ fontWeight: 600, borderRadius: '6px' }}
            icon={<PendingIcon sx={{ fontSize: '1rem !important' }} />}
          />
        );
      case ApprovalStatus.Approved:
        return (
          <Chip
            label={t("status.Approved")}
            color="success"
            size="small"
            sx={{ fontWeight: 600, borderRadius: '6px' }}
            icon={<CheckIcon sx={{ fontSize: '1rem !important' }} />}
          />
        );
      case ApprovalStatus.Rejected:
        return (
          <Chip
            label={t("status.Rejected")}
            color="error"
            size="small"
            sx={{ fontWeight: 600, borderRadius: '6px' }}
            icon={<CancelIcon sx={{ fontSize: '1rem !important' }} />}
          />
        );
      default:
        return <Chip label="N/A" size="small" variant="outlined" />;
    }
  };

  const renderDataDiff = (dataJson: string) => {
    try {
      const data = JSON.parse(dataJson);
      return (
        <Grid container spacing={2}>
          {Object.entries(data).map(([key, value]) => {
            if (value === null || typeof value === 'object' || key.toLowerCase().includes('id')) return null;

            let displayValue = String(value);
            if (typeof value === 'boolean') {
              displayValue = value ? 'Yes' : 'No';
            } else if (typeof value === 'string' && (value.includes('T') && value.endsWith('Z'))) {
              displayValue = new Date(value).toLocaleString();
            }

            return (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <Box sx={{ p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem', mb: 0.5 }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-all' }}>
                    {displayValue}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      );
    } catch (e) {
      return <Typography variant="body2" color="error">Invalid Data</Typography>;
    }
  };

  const columns: GridColDef[] = [
    {
      field: "requestType",
      headerName: t("columns.type"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: params.value === 'Leave' ? 'info.main' : 'primary.main'
          }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              {t(`types.${params.value}`, { fallback: params.value as string })}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5 }}>
              {params.row.entityName}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: "requesterName",
      headerName: t("columns.requester"),
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light', fontSize: '0.7rem', fontWeight: 700 }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography>
        </Box>
      )
    },
    {
      field: "createdAt",
      headerName: t("columns.createdAt"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
            {new Date(params.value).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(params.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      )
    },
    {
      field: "status",
      headerName: t("columns.status"),
      width: 130,
      renderCell: (params: GridRenderCellParams) => getStatusChip(params.value)
    },
    {
      field: "actions",
      headerName: t("columns.actions"),
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton size="small" color="primary" onClick={() => setSelectedRequest(params.row)}>
          <InfoIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: 'column', alignItems: 'center', justifyContent: "center", mt: 10, gap: 2 }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary">Loading requests...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Paper sx={{ borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t("title")}</Typography>
              <Typography variant="caption" color="text.secondary">{t("subtitle")}</Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              sx={{ borderRadius: 2 }}
            >
              {t("common.refresh") || "Refresh"}
            </Button>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              sx={{ minHeight: 40 }}
            >
              <Tab icon={<PendingIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label={t("tabs.pending")} />
              <Tab icon={<HistoryIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label={t("tabs.history")} />
            </Tabs>
          </Box>
        </Box>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredRequests}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            density="compact"
            onRowClick={(params) => setSelectedRequest(params.row)}
            slots={{ noRowsOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                <PendingIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2">{t("common.noData")}</Typography>
              </Box>
            ) }}
            sx={{ border: "none" }}
          />
        </Box>
      </Paper>

      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 4, boxShadow: '0 24px 48px rgba(0,0,0,0.12)' } }
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{t("dialog.title")}</Typography>
            <Typography variant="body2" color="text.secondary">Review the request details below</Typography>
          </Box>
          {selectedRequest && getStatusChip(selectedRequest.status)}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedRequest && (
            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, fontSize: '0.7rem' }}>{t("columns.type")}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{t(`types.${selectedRequest.requestType}`, { fallback: selectedRequest.requestType })}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, fontSize: '0.7rem' }}>{t("columns.createdAt")}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{new Date(selectedRequest.createdAt).toLocaleString()}</Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, fontSize: '0.7rem', mb: 1, display: 'block' }}>{t("dialog.info")}</Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ fontStyle: selectedRequest.description ? 'normal' : 'italic' }}>
                    {selectedRequest.description || "No description provided"}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, fontSize: '0.7rem', mb: 1, display: "block" }}>{t("dialog.data")}</Typography>
                {renderDataDiff(selectedRequest.dataJson)}
              </Box>

              {selectedRequest.status === ApprovalStatus.Pending && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, fontSize: '0.7rem', mb: 1, display: 'block' }}>{t("dialog.notes")}</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("dialog.placeholder")}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 3 }
                    }}
                  />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSelectedRequest(null)} color="inherit" sx={{ fontWeight: 700 }}>{t("dialog.close")}</Button>
          <Box sx={{ flexGrow: 1 }} />
          {canManage && selectedRequest?.status === ApprovalStatus.Pending && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleAction("reject")}
                disabled={actioning}
                sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
              >
                {t("dialog.reject")}
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={() => handleAction("approve")}
                disabled={actioning}
                sx={{ borderRadius: 2, fontWeight: 700, px: 3, boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)' }}
              >
                {t("dialog.approve")}
              </Button>
            </Stack>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

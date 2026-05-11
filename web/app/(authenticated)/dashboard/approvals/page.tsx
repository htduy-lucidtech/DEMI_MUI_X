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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  PlaylistAddCheck as ApprovalIcon,
} from "@mui/icons-material";
import { approvalService, ApprovalRequest, ApprovalStatus } from "@/services/approval.service";
import { useTranslations } from "next-intl";

export default function ApprovalsPage() {
  const t = useTranslations("Approvals");
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setSelectedRequest(null);
      setNote("");
      fetchData();
    } catch (err) {
      setError(t("messages.error"));
    } finally {
      setActioning(false);
    }
  };

  const getStatusChip = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.Pending:
        return <Chip label={t("status.Pending")} color="warning" size="small" variant="outlined" />;
      case ApprovalStatus.Approved:
        return <Chip label={t("status.Approved")} color="success" size="small" />;
      case ApprovalStatus.Rejected:
        return <Chip label={t("status.Rejected")} color="error" size="small" />;
      default:
        return <Chip label="N/A" size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <ApprovalIcon color="primary" fontSize="large" />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{t("title")}</Typography>
          <Typography variant="body2" color="text.secondary">{t("subtitle")}</Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t("columns.type")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("columns.requester")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("columns.createdAt")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("columns.status")}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{t("columns.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">{t("common.noData", { fallback: "Không có yêu cầu nào đang chờ xử lý" })}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>{t(`types.${req.requestType}`, { fallback: req.requestType })}</Typography>
                        <Typography variant="caption" color="text.secondary">{req.entityName}</Typography>
                      </TableCell>
                      <TableCell>{req.requesterName}</TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusChip(req.status)}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<InfoIcon />}
                          onClick={() => setSelectedRequest(req)}
                        >
                          {t("dialog.close", { fallback: "Chi tiết" })}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {t("dialog.title")}
          {selectedRequest && getStatusChip(selectedRequest.status)}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box sx={{ py: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700 }}>{t("columns.type")}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{t(`types.${selectedRequest.requestType}`, { fallback: selectedRequest.requestType })}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700 }}>{t("dialog.info")}</Typography>
                  <Typography variant="body2">{selectedRequest.description || "N/A"}</Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, mb: 1, display: "block" }}>{t("dialog.data")}</Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.900", color: "success.light", overflow: "auto", maxHeight: 200 }}>
                    <pre style={{ margin: 0, fontSize: "0.8rem", fontFamily: "monospace" }}>
                      {JSON.stringify(JSON.parse(selectedRequest.dataJson || "{}"), null, 2)}
                    </pre>
                  </Paper>
                </Box>

                {selectedRequest.status === ApprovalStatus.Pending && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label={t("dialog.notes")}
                      fullWidth
                      multiline
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t("dialog.placeholder")}
                    />
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setSelectedRequest(null)} color="inherit">{t("dialog.close")}</Button>
          {selectedRequest?.status === ApprovalStatus.Pending && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleAction("reject")}
                disabled={actioning}
              >
                {t("dialog.reject")}
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={() => handleAction("approve")}
                disabled={actioning}
              >
                {t("dialog.approve")}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

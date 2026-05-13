"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from "@/hooks/useRealtime";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";
import { useTranslations } from "next-intl";
import {
  performanceService,
  PerformanceReview,
} from "@/services/performance.service";
import { employeeService, Employee } from "@/services/employee.service";

export default function PerformancePage() {
  const t = useTranslations("Performance");
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newReview, setNewReview] = useState<Partial<PerformanceReview>>({
    workQuality: 5,
    teamwork: 5,
    punctuality: 5,
    status: "Pending",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revData, empData] = await Promise.all([
        performanceService.getAll(),
        employeeService.getAll(),
      ]);
      setReviews(revData);
      setEmployees(empData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh performance data on realtime notifications
  useRealtimeRefresh(fetchData, ["short"]);

  const handleSave = async () => {
    try {
      await performanceService.create(newReview);
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const columns: GridColDef[] = [
    { field: "employeeName", headerName: t("employeeName"), flex: 1 },
    { field: "reviewerName", headerName: t("reviewerName"), flex: 1 },
    {
      field: "reviewDate",
      headerName: t("reviewDate"),
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "totalScore",
      headerName: t("totalScore"),
      width: 100,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: "bold",
            color: params.value >= 4 ? "success.main" : "warning.main",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    { field: "status", headerName: t("status"), width: 150 },
  ];

  return (
      <Paper sx={{ borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexGrow: 1, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t("title")}</Typography>
              <Typography variant="caption" color="text.secondary">{t("subtitle")}</Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            {t("createReview")}
          </Button>
        </Box>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={reviews}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            density="compact"
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            sx={{ border: "none" }}
          />
        </Box>
      </Paper>

      {/* Dialog Thêm đánh giá */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t("newReviewTitle")}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label={t("evaluatedEmployee")}
              fullWidth
              value={newReview.employeeId || ""}
              onChange={(e) =>
                setNewReview({
                  ...newReview,
                  employeeId: Number(e.target.value),
                })
              }
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.fullName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t("reviewerName")}
              fullWidth
              value={newReview.reviewerId || ""}
              onChange={(e) =>
                setNewReview({
                  ...newReview,
                  reviewerId: Number(e.target.value),
                })
              }
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.fullName}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <TextField
                type="number"
                label={t("workQuality")}
                value={newReview.workQuality}
                onChange={(e) =>
                  setNewReview({
                    ...newReview,
                    workQuality: Number(e.target.value),
                  })
                }
                fullWidth
              />
              <TextField
                type="number"
                label={t("teamwork")}
                value={newReview.teamwork}
                onChange={(e) =>
                  setNewReview({
                    ...newReview,
                    teamwork: Number(e.target.value),
                  })
                }
                fullWidth
              />
              <TextField
                type="number"
                label={t("punctuality")}
                value={newReview.punctuality}
                onChange={(e) =>
                  setNewReview({
                    ...newReview,
                    punctuality: Number(e.target.value),
                  })
                }
                fullWidth
              />
            </Box>

            <TextField
              label={t("comments")}
              multiline
              rows={3}
              value={newReview.comments || ""}
              onChange={(e) =>
                setNewReview({ ...newReview, comments: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            {t("cancel")}
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from "@/hooks/useRealtime";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
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
import PageHeader from "@/components/common/PageHeader";
import FormGrid from "@/components/common/FormGrid";
import StatusChip from "@/components/common/StatusChip";

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
    {
      field: "status",
      headerName: t("status"),
      width: 150,
      renderCell: (params) => (
        <StatusChip
          status={params.value === "Approved" ? "success" : "warning"}
          label={params.value}
        />
      )
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Paper sx={{ borderRadius: 1.5, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actions={
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              {t("createReview")}
            </Button>
          }
        />
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
          <FormGrid gap={3}>
            <TextField
              select
              label={t("evaluatedEmployee")}
              fullWidth
              size="small"
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
              size="small"
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

            <TextField
              type="number"
              label={t("workQuality")}
              value={newReview.workQuality}
              size="small"
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
              size="small"
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
              size="small"
              onChange={(e) =>
                setNewReview({
                  ...newReview,
                  punctuality: Number(e.target.value),
                })
              }
              fullWidth
            />

            <Box sx={{ gridColumn: "span 2" }}>
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
            </Box>
          </FormGrid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
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

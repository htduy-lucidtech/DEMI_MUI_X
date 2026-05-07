"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from "@/lib/useRealtime";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  recruitmentService,
  JobPosting,
  Candidate,
} from "@/services/recruitment.service";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";
import { useTranslations } from "next-intl";

export default function RecruitmentPage() {
  const t = useTranslations("Recruitment");
  const [tab, setTab] = useState(0);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [newJob, setNewJob] = useState<Partial<JobPosting>>({
    title: "",
    department: "",
    location: "Hà Nội",
    minSalary: 0,
    maxSalary: 0,
    status: "Open",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const data = await recruitmentService.getJobs();
        setJobs(data);
      } else {
        const data = await recruitmentService.getCandidates();
        setCandidates(data);
      }
    } catch (error) {
      console.error("Failed to fetch recruitment data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    try {
      await recruitmentService.createJob(newJob as JobPosting);
      setOpenJobDialog(false);
      fetchData();
    } catch (error) {
      alert("Failed to create job");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await recruitmentService.updateCandidateStatus(id, status);
      fetchData();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const jobColumns: GridColDef[] = [
    { field: "title", headerName: t("columns.title"), flex: 1 },
    { field: "department", headerName: t("columns.dept"), width: 150 },
    { field: "location", headerName: t("columns.loc"), width: 120 },
    {
      field: "status",
      headerName: t("columns.status"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={t(`data.status.${params.value}`)}
          color={params.value === "Open" ? "success" : "default"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "expiryDate",
      headerName: t("columns.expiry"),
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString("vi-VN"),
    },
  ];

  const candidateColumns: GridColDef<Candidate>[] = [
    { field: "fullName", headerName: t("columns.fullName"), flex: 1 },
    { field: "email", headerName: t("columns.email"), width: 200 },
    {
      field: "jobPosting",
      headerName: t("columns.position"),
      width: 180,
      valueGetter: (value: any) => value?.title,
    },
    {
      field: "status",
      headerName: t("columns.status"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={t(`data.status.${params.value}`)}
          color={
            params.value === "Hired"
              ? "success"
              : params.value === "Interviewing"
                ? "warning"
                : params.value === "Rejected"
                  ? "error"
                  : "primary"
          }
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: t("columns.actions"),
      width: 150,
      renderCell: (params: GridRenderCellParams<Candidate>) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="success"
            onClick={() => handleUpdateStatus(params.row.id!, "Interviewing")}
          >
            <ApproveIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleUpdateStatus(params.row.id!, "Rejected")}
          >
            <RejectIcon />
          </IconButton>
        </Stack>
      ),
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
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setOpenJobDialog(true)}
          sx={{ borderRadius: 2, px: 2, width: { xs: "100%", sm: "auto" } }}
        >
          {t("postNew")}
        </Button>
      </Box>

      <Paper
        sx={{
          mb: 3,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={t("tabs.jobs")} />
          <Tab label={t("tabs.candidates")} />
        </Tabs>
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={tab === 0 ? jobs : candidates}
            columns={tab === 0 ? jobColumns : candidateColumns}
            loading={loading}
            disableRowSelectionOnClick
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{ border: "none" }}
          />
        </Box>
      </Paper>

      {/* Dialog Đăng tin */}
      <Dialog
        open={openJobDialog}
        onClose={() => setOpenJobDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("dialog.title")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label={t("dialog.jobTitle")}
                value={newJob.title}
                onChange={(e) =>
                  setNewJob({ ...newJob, title: e.target.value })
                }
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t("dialog.department")}
                value={newJob.department}
                onChange={(e) =>
                  setNewJob({ ...newJob, department: e.target.value })
                }
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t("dialog.location")}
                value={newJob.location}
                onChange={(e) =>
                  setNewJob({ ...newJob, location: e.target.value })
                }
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t("dialog.minSalary")}
                type="number"
                value={newJob.minSalary}
                onChange={(e) =>
                  setNewJob({ ...newJob, minSalary: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t("dialog.maxSalary")}
                type="number"
                value={newJob.maxSalary}
                onChange={(e) =>
                  setNewJob({ ...newJob, maxSalary: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label={t("dialog.expiryDate")}
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={newJob.expiryDate}
                onChange={(e) =>
                  setNewJob({ ...newJob, expiryDate: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label={t("dialog.description")}
                multiline
                rows={4}
                value={newJob.description}
                onChange={(e) =>
                  setNewJob({ ...newJob, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJobDialog(false)}>
            {t("dialog.cancel")}
          </Button>
          <Button variant="contained" onClick={handleCreateJob}>
            {t("dialog.submit")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

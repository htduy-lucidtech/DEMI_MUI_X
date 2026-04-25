"use client";

import React, { useState, useEffect } from "react";
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
import { recruitmentService, JobPosting, Candidate } from "@/services/recruitment.service";

export default function RecruitmentPage() {
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
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, [tab]);

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
    { field: "title", headerName: "Tiêu đề", flex: 1 },
    { field: "department", headerName: "Phòng ban", width: 150 },
    { field: "location", headerName: "Địa điểm", width: 120 },
    { 
      field: "status", 
      headerName: "Trạng thái", 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === "Open" ? "success" : "default"} 
          size="small" 
        />
      )
    },
    { 
      field: "expiryDate", 
      headerName: "Hạn cuối", 
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString("vi-VN")
    },
  ];

  const candidateColumns: GridColDef<Candidate>[] = [
    { field: "fullName", headerName: "Ứng viên", flex: 1 },
    { field: "email", headerName: "Email", width: 200 },
    { 
      field: "jobPosting", 
      headerName: "Vị trí", 
      width: 180,
      valueGetter: (value: any) => value?.title 
    },
    { 
      field: "status", 
      headerName: "Trạng thái", 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === "Hired" ? "success" : 
            params.value === "Interviewing" ? "warning" : 
            params.value === "Rejected" ? "error" : "primary"
          } 
          size="small" 
        />
      )
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 150,
      renderCell: (params: GridRenderCellParams<Candidate>) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="success" onClick={() => handleUpdateStatus(params.row.id!, "Interviewing")}>
            <ApproveIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleUpdateStatus(params.row.id!, "Rejected")}>
            <RejectIcon />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Tuyển dụng</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý tin tuyển dụng và hồ sơ ứng viên</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpenJobDialog(true)}
        >
          Đăng tin mới
        </Button>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Tin tuyển dụng" />
          <Tab label="Ứng viên" />
        </Tabs>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={tab === 0 ? jobs : candidates}
            columns={tab === 0 ? jobColumns : candidateColumns}
            loading={loading}
            disableRowSelectionOnClick
            sx={{ border: 'none' }}
          />
        </Box>
      </Paper>

      {/* Dialog Đăng tin */}
      <Dialog open={openJobDialog} onClose={() => setOpenJobDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đăng tin tuyển dụng mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField 
                fullWidth label="Tiêu đề" 
                value={newJob.title} 
                onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              />
            </Grid>
            <Grid size={6}>
              <TextField 
                fullWidth label="Phòng ban" 
                value={newJob.department} 
                onChange={(e) => setNewJob({...newJob, department: e.target.value})}
              />
            </Grid>
            <Grid size={6}>
              <TextField 
                fullWidth label="Địa điểm" 
                value={newJob.location} 
                onChange={(e) => setNewJob({...newJob, location: e.target.value})}
              />
            </Grid>
            <Grid size={6}>
              <TextField 
                fullWidth label="Lương tối thiểu" type="number"
                value={newJob.minSalary} 
                onChange={(e) => setNewJob({...newJob, minSalary: Number(e.target.value)})}
              />
            </Grid>
            <Grid size={6}>
              <TextField 
                fullWidth label="Lương tối đa" type="number"
                value={newJob.maxSalary} 
                onChange={(e) => setNewJob({...newJob, maxSalary: Number(e.target.value)})}
              />
            </Grid>
            <Grid size={12}>
              <TextField 
                fullWidth label="Hạn cuối" type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={newJob.expiryDate} 
                onChange={(e) => setNewJob({...newJob, expiryDate: e.target.value})}
              />
            </Grid>
            <Grid size={12}>
              <TextField 
                fullWidth label="Mô tả công việc" multiline rows={4}
                value={newJob.description} 
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJobDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateJob}>Đăng tin</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

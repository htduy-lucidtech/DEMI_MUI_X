"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Drawer,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { employeeService, Employee } from "@/services/employee.service";
import CustomNoRowsOverlay from "@/app/components/CustomNoRowsOverlay";
import * as XLSX from 'xlsx';

export default function PersonnelPage() {
  const t = useTranslations("Personnel");
  const tr = useTranslations("Layout.roles");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleExportExcel = () => {
    const dataToExport = filteredEmployees.map(e => ({
      [t("table.columns.fullName")]: e.fullName,
      [t("table.columns.email")]: e.email,
      [t("table.columns.position")]: e.position || "N/A",
      [t("table.columns.department")]: e.department?.name || "N/A",
      [t("table.columns.role")]: tr(e.account?.role || "Employee"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personnel");
    XLSX.writeFile(workbook, `HRM_Personnel_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleViewDetails = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDetailDrawerOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: t("table.columns.fullName"),
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => (
        <Stack component="div" direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.75rem" }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
            {params.value}
          </Typography>
        </Stack>
      )
    },
    { field: "email", headerName: t("table.columns.email"), flex: 1.5 },
    { field: "position", headerName: t("table.columns.position"), flex: 1 },
    { 
      field: "department", 
      headerName: t("table.columns.department"), 
      flex: 1,
      valueGetter: (params: any) => params?.name || "N/A"
    },
    {
      field: "role",
      headerName: t("table.columns.role"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={tr(params.row.account?.role || "Employee")}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 700, borderRadius: 1.5 }}
        />
      )
    },
    {
      field: "actions",
      headerName: t("table.columns.actions"),
      flex: 1.2,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title={t("dialog.edit_title")}>
            <IconButton size="small" color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" onClick={() => handleViewDetails(params.row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{t("title")}</Typography>
          <Typography variant="body2" color="text.secondary">{t("description")}</Typography>
        </Box>
        <Stack component="div" direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportExcel} sx={{ borderRadius: 2.5 }}>
            {t("table.export_excel")}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2.5, px: 3 }}>
            {t("table.add_new")}
          </Button>
        </Stack>
      </Box>

      {/* Filter */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <Box component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <TextField
            placeholder={t("table.search_placeholder")}
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 320 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }
            }}
          />
          <IconButton onClick={fetchEmployees} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Table */}
      <Paper sx={{ height: 600, width: "100%", borderRadius: 4, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          sx={{ border: "none" }}
        />
      </Paper>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": { width: 600, p: 3 }
        }}
      >
        {selectedEmployee && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{t("details.title")}</Typography>
              <IconButton onClick={() => setDetailDrawerOpen(false)}><CloseIcon /></IconButton>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: "2rem" }}>
                {selectedEmployee.fullName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedEmployee.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedEmployee.position}</Typography>
                <Chip label={selectedEmployee.department?.name || "N/A"} size="small" sx={{ mt: 1 }} />
              </Box>
              <Button variant="contained" startIcon={<EditIcon />} sx={{ ml: "auto" }}>Sửa</Button>
            </Box>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
              <Tab label={t("details.tabs.personal")} />
              <Tab label={t("details.tabs.work")} />
              <Tab label={t("details.tabs.bank_salary")} />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.gender")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedEmployee.gender || "N/A"}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.dob")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : "N/A"}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.address")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedEmployee.address || "N/A"}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.phone")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedEmployee.phoneNumber || "N/A"}</Typography>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.position")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedEmployee.position || "N/A"}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.department")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedEmployee.department?.name || "N/A"}</Typography>
                  </Grid>
                </Grid>
              )}

              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.bankName")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedEmployee.bankName || "N/A"}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.bankAccount")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedEmployee.bankAccountNumber || "N/A"}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.baseSalary")}</Typography>
                    <Typography sx={{ fontWeight: 600, color: "primary.main" }}>
                      {selectedEmployee.baseSalary.toLocaleString()} VND
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">{t("details.fields.allowance")}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.allowance.toLocaleString()} VND
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

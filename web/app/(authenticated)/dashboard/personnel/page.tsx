"use client";

import React, { useState, useEffect, useRef } from "react";
import useRealtimeRefresh from "@/hooks/useRealtime";
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
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
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
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { employeeService, Employee } from "@/services/employee.service";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";
import EmployeeDialog from "@/components/personnel/EmployeeDialog";
import PageHeader from "@/components/common/PageHeader";
import SectionHeader from "@/components/common/SectionHeader";
import FormGrid from "@/components/common/FormGrid";

export default function PersonnelPage() {
  const t = useTranslations("Personnel");
  const tc = useTranslations("Layout.common");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [selectionModel, setSelectionModel] = useState<any>([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "info" | "warning" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const getSelectedIds = (): number[] => {
    if (!selectionModel) return [];
    if (Array.isArray(selectionModel)) return selectionModel as number[];
    if (typeof selectionModel === "object") {
      if ("ids" in selectionModel && selectionModel.ids) {
        return Array.isArray(selectionModel.ids) ? selectionModel.ids : Array.from(selectionModel.ids);
      }
      if (selectionModel instanceof Set) return Array.from(selectionModel) as any;
    }
    return [];
  };

  const selectedCount = getSelectedIds().length;

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useRealtimeRefresh(fetchEmployees, ["short"]);

  const filteredEmployees = React.useMemo(
    () =>
      (employees || []).filter(
        (emp) =>
          emp?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          emp?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          emp?.position?.toLowerCase().includes(searchText.toLowerCase()) ||
          emp?.department?.name?.toLowerCase().includes(searchText.toLowerCase()),
      ),
    [employees, searchText],
  );

  const handleExportExcel = async () => {
    try {
      const ids = selectedCount > 0 ? getSelectedIds() : undefined;
      const blob = await employeeService.exportExcel(ids);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HRM_Personnel_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export Excel:", error);
    }
  };

  const handleViewDetails = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDetailDrawerOpen(true);
    setTabValue(0);
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setDialogTitle(t("dialog.add_title"));
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setDialogTitle(t("dialog.edit_title"));
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDeleteConfirmOpen(true);
  };

  const handleSaveEmployee = async (data: Partial<Employee>) => {
    try {
      let result;
      if (editingEmployee?.id) {
        result = await employeeService.update(editingEmployee.id, data);
      } else {
        result = await employeeService.create(data);
      }

      // Handle "Accepted" response (approval required)
      if (result && result.requestId) {
        setSnackbar({ open: true, message: t("messages.request_sent"), severity: "info" });
      } else {
        setSnackbar({ open: true, message: t("messages.save_success"), severity: "success" });
        fetchEmployees();
      }
      setFormDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: tc("error") || "Error saving data", severity: "error" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedEmployee?.id) {
      try {
        const result = await employeeService.delete(selectedEmployee.id);
        if (result && result.requestId) {
          setSnackbar({ open: true, message: t("messages.request_sent"), severity: "info" });
        } else {
          setSnackbar({ open: true, message: t("messages.delete_success"), severity: "success" });
          fetchEmployees();
        }
        setDeleteConfirmOpen(false);
      } catch (error) {
        setSnackbar({ open: true, message: "Error deleting data", severity: "error" });
      }
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await employeeService.bulkDelete(getSelectedIds());
      setSnackbar({ open: true, message: t("messages.delete_success"), severity: "success" });
      fetchEmployees();
      setSelectionModel([]);
      setBulkDeleteConfirmOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: "Error in bulk delete", severity: "error" });
    }
  };

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: "fullName",
        headerName: t("table.columns.fullName"),
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => (
          <Stack component="div" direction="row" spacing={1.5} sx={{ alignItems: "center", height: "100%" }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.75rem" }}>{params.row?.fullName?.charAt(0) || "U"}</Avatar>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{params.row?.fullName || tc("notAvailable")}</Typography>
          </Stack>
        ),
      },
      { field: "email", headerName: t("table.columns.email"), flex: 1.5 },
      { field: "position", headerName: t("table.columns.position"), flex: 1 },
      {
        field: "department",
        headerName: t("table.columns.department"),
        flex: 1,
        renderCell: (params: GridRenderCellParams) => <Typography variant="body2">{params.row?.department?.name || tc("notAvailable")}</Typography>,
      },
      {
        field: "actions",
        headerName: t("table.columns.actions"),
        width: 180,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", height: "100%" }}>
            <Tooltip title={t("dialog.edit_title")}><IconButton size="small" color="primary" onClick={() => handleOpenEdit(params.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title={t("details.title")}><IconButton size="small" onClick={() => handleViewDetails(params.row)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title={t("dialog.id_card_title")}><IconButton size="small" color="info" onClick={() => { setSelectedEmployee(params.row); setIdCardOpen(true); }}><BadgeIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title={t("dialog.delete")}><IconButton size="small" color="error" onClick={() => handleOpenDelete(params.row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        ),
      },
    ],
    [t, tc],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Personnel Table */}
      <Paper sx={{ borderRadius: 1.5, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <PageHeader
          title={t("table.title") || "Danh sách nhân viên"}
          searchPlaceholder={t("table.search_placeholder")}
          searchValue={searchText}
          onSearchChange={setSearchText}
          actions={
            <>
              <Button variant="outlined" size="small" startIcon={<ExportIcon />} onClick={handleExportExcel}>
                {t("table.export_excel")}
              </Button>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                {t("table.add_new")}
              </Button>
              <IconButton onClick={fetchEmployees} disabled={loading} size="small">
                <RefreshIcon fontSize="small" />
              </IconButton>
              {selectedCount > 0 && (
                <Button variant="contained" color="error" size="small" onClick={() => setBulkDeleteConfirmOpen(true)}>
                  {tc("delete") || "Xóa"} ({selectedCount})
                </Button>
              )}
            </>
          }
        />
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredEmployees || []}
            columns={columns}
            loading={loading}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
            density="compact"
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            sx={{ border: "none" }}
          />
        </Box>
      </Paper>

      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 550 },
            p: 0,
            bgcolor: 'background.default'
          }
        }}
      >
        {selectedEmployee && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: 'white' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t("details.title")}</Typography>
              <IconButton size="small" onClick={() => setDetailDrawerOpen(false)} sx={{ bgcolor: 'grey.50' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
              {/* Profile Header Card */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3, bgcolor: 'primary.50', border: 'none' }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "primary.main",
                      fontSize: "2rem",
                      boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    {selectedEmployee?.fullName?.charAt(0) || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>{selectedEmployee.fullName}</Typography>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>{selectedEmployee.position}</Typography>
                    <Chip
                      label={selectedEmployee.department?.name || tc("notAvailable")}
                      size="small"
                      variant="filled"
                      sx={{ bgcolor: 'white', fontWeight: 600, border: '1px solid', borderColor: 'primary.light' }}
                    />
                  </Box>
                </Box>
              </Paper>

              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                sx={{
                  mb: 3,
                  borderBottom: 1,
                  borderColor: "divider",
                  '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' }
                }}
              >
                <Tab label={t("details.tabs.personal")} />
                <Tab label={t("details.tabs.work")} />
                <Tab label={t("details.tabs.bank_salary")} />
              </Tabs>

              <Box sx={{ mt: 2 }}>
                {tabValue === 0 && (
                  <FormGrid gap={3}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.fullName")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.fullName}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.gender")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.gender === "Male" ? t("details.genders.male") : selectedEmployee.gender === "Female" ? t("details.genders.female") : t("details.genders.other")}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.dob")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : tc("notAvailable")}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.identityCard")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.identityCardNumber || tc("notAvailable")}</Typography>
                    </Box>
                    <Box sx={{ gridColumn: "span 2", p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.address")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.address || tc("notAvailable")}</Typography>
                    </Box>
                  </FormGrid>
                )}

                {tabValue === 1 && (
                  <FormGrid gap={3}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("table.columns.email")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.email}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.phone")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.phoneNumber || tc("notAvailable")}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.position")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.position || tc("notAvailable")}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.department")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.department?.name || tc("notAvailable")}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.insuranceNumber")}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.socialInsuranceNumber || tc("notAvailable")}</Typography>
                    </Box>
                  </FormGrid>
                )}

                {tabValue === 2 && (
                  <Stack spacing={3}>
                    <Box>
                      <SectionHeader title={t("details.sections.bank_info")} />
                      <FormGrid gap={3}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.bankName")}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.bankName || tc("notAvailable")}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.bankAccount")}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.bankAccountNumber || tc("notAvailable")}</Typography>
                        </Box>
                      </FormGrid>
                    </Box>

                    <Divider />

                    <Box>
                      <SectionHeader title={t("details.sections.salary_info")} />
                      <FormGrid gap={3}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.light' }}>
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.baseSalary")}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.dark' }}>{selectedEmployee.baseSalary?.toLocaleString()} {tc("currency")}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.allowance")}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.allowance?.toLocaleString()} {tc("currency")}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.hourlyRate")}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.hourlyRate?.toLocaleString()} {tc("currency")}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #f1f5f9' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{t("details.fields.hourlyRateOT")}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmployee.hourlyRateOT?.toLocaleString()} {tc("currency")}</Typography>
                        </Box>
                      </FormGrid>
                    </Box>
                  </Stack>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      <EmployeeDialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)} onSave={handleSaveEmployee} employee={editingEmployee} title={dialogTitle} />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t("dialog.delete_title")}</DialogTitle>
        <DialogContent>{t("dialog.delete_confirm")} <strong>{selectedEmployee?.fullName}</strong></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">{t("dialog.cancel")}</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">{t("dialog.delete")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

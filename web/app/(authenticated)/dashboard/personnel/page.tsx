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
  Card,
  CardContent,
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
          emp?.position?.toLowerCase().includes(searchText.toLowerCase()),
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
      if (editingEmployee?.id) {
        await employeeService.update(editingEmployee.id, data);
      } else {
        await employeeService.create(data);
      }
      fetchEmployees();
    } catch (error) {
      console.error("Failed to save employee:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedEmployee?.id) {
      try {
        await employeeService.delete(selectedEmployee.id);
        fetchEmployees();
        setDeleteConfirmOpen(false);
      } catch (error) {
        console.error("Failed to delete employee:", error);
      }
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await employeeService.bulkDelete(getSelectedIds());
      fetchEmployees();
      setSelectionModel([]);
      setBulkDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Failed to bulk delete employees:", error);
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
    [t],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Paper sx={{ p: 1, borderRadius: 2 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, gap: 1.5 }}>
          <TextField placeholder={t("table.search_placeholder")} size="small" value={searchText} onChange={(e) => setSearchText(e.target.value)} sx={{ width: { xs: "100%", md: 320 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>, sx: { borderRadius: 2 } } }} />
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: { xs: "space-between", md: "flex-end" }, width: { xs: "100%", md: "auto" } }}>
            <Stack direction="row" spacing={1}>
              {selectedCount > 0 && <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => setBulkDeleteConfirmOpen(true)} sx={{ borderRadius: 2 }}>{selectedCount}</Button>}
              <Button variant="outlined" size="small" startIcon={<ExportIcon />} onClick={handleExportExcel} sx={{ borderRadius: 2 }}>{t("table.export_excel")}</Button>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenAdd} sx={{ borderRadius: 2, px: 2 }}>{t("table.add_new")}</Button>
            </Stack>
            <IconButton onClick={fetchEmployees} disabled={loading} size="small"><RefreshIcon fontSize="small" /></IconButton>
          </Stack>
        </Box>
      </Paper>

      <Paper sx={{ height: 600, width: "100%", borderRadius: 2, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <DataGrid rows={filteredEmployees || []} columns={columns} loading={loading} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick checkboxSelection onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)} density="compact" slots={{ noRowsOverlay: CustomNoRowsOverlay }} sx={{ border: "none" }} />
      </Paper>

      <Drawer anchor="right" open={detailDrawerOpen} onClose={() => setDetailDrawerOpen(false)} sx={{ "& .MuiDrawer-paper": { width: { xs: "100%", sm: 500 }, p: { xs: 1.5, sm: 2 } } }}>
        {selectedEmployee && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{t("details.title")}</Typography>
              <IconButton onClick={() => setDetailDrawerOpen(false)}><CloseIcon /></IconButton>
            </Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: 2, mb: 2 }}>
              <Avatar sx={{ width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 }, bgcolor: "primary.main", fontSize: "2rem" }}>{selectedEmployee?.fullName?.charAt(0) || "U"}</Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedEmployee.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedEmployee.position}</Typography>
                <Chip label={selectedEmployee.department?.name || tc("notAvailable")} size="small" sx={{ mt: 1 }} />
              </Box>
            </Box>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
              <Tab label={t("details.tabs.personal")} /><Tab label={t("details.tabs.work")} /><Tab label={t("details.tabs.bank_salary")} />
            </Tabs>
            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                  <Box><Typography variant="caption" color="text.secondary">{t("details.fields.gender")}</Typography><Typography sx={{ fontWeight: 600 }}>{selectedEmployee.gender === "Male" ? t("details.genders.male") : selectedEmployee.gender === "Female" ? t("details.genders.female") : t("details.genders.other")}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">{t("details.fields.dob")}</Typography><Typography sx={{ fontWeight: 600 }}>{selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : tc("notAvailable")}</Typography></Box>
                  <Box sx={{ gridColumn: "span 2" }}><Typography variant="caption" color="text.secondary">{t("details.fields.address")}</Typography><Typography sx={{ fontWeight: 600 }}>{selectedEmployee.address || tc("notAvailable")}</Typography></Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      <EmployeeDialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)} onSave={handleSaveEmployee} employee={editingEmployee} title={dialogTitle} />
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t("dialog.delete_title")}</DialogTitle>
        <DialogContent>{t("dialog.delete_confirm")} <strong>{selectedEmployee?.fullName}</strong></DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">{t("dialog.cancel")}</Button><Button onClick={handleDeleteConfirm} variant="contained" color="error">{t("dialog.delete")}</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

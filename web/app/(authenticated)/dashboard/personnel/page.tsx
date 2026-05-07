"use client";

import React, { useState, useEffect, useRef } from "react";
import useRealtimeRefresh from "@/lib/useRealtime";
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
  ContactPage as ContractIcon,
  Badge as BadgeIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { employeeService, Employee } from "@/services/employee.service";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";
import EmployeeDialog from "@/components/personnel/EmployeeDialog";
// Heavy libraries will be imported dynamically

export default function PersonnelPage() {
  const t = useTranslations("Personnel");
  const tr = useTranslations("Layout.roles");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Selection state - Initializing to empty array which is safe for most versions
  const [selectionModel, setSelectionModel] = useState<any>([]);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);

  // Helper to get selected count and IDs safely
  const getSelectedIds = (): number[] => {
    if (!selectionModel) return [];
    if (Array.isArray(selectionModel)) {
      return selectionModel as number[];
    }
    if (typeof selectionModel === "object") {
      if ("ids" in selectionModel && selectionModel.ids) {
        const ids = selectionModel.ids;
        return Array.isArray(ids) ? (ids as number[]) : Array.from(ids as any);
      }
      if (selectionModel instanceof Set) {
        return Array.from(selectionModel) as number[];
      }
    }
    return [];
  };

  const selectedCount = getSelectedIds().length;

  // Ref for ID Card Printing
  const idCardRef = useRef<HTMLDivElement>(null);

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

  // Refresh personnel list on realtime notifications
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
    if (emp?.id) fetchEmployees(); // Refresh list just in case, or just open drawer
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

  const handlePrintCard = () => {
    window.print();
  };

  const handleExportPdfCard = async () => {
    if (idCardRef.current && selectedEmployee) {
      const [html2canvas, { default: jsPDF }] = await Promise.all([
        import("html2canvas").then((m) => m.default),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(idCardRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const fileName = `ID_Card_${selectedEmployee.fullName.trim().replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
    }
  };

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: "fullName",
        headerName: t("table.columns.fullName"),
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => (
          <Stack
            component="div"
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", height: "100%" }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                fontSize: "0.75rem",
              }}
            >
              {params.row?.fullName?.charAt(0) || "U"}
            </Avatar>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {params.row?.fullName || "N/A"}
            </Typography>
          </Stack>
        ),
      },
      { field: "email", headerName: t("table.columns.email"), flex: 1.5 },
      { field: "position", headerName: t("table.columns.position"), flex: 1 },
      {
        field: "department",
        headerName: t("table.columns.department"),
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <Typography variant="body2">
            {params.row?.department?.name || "N/A"}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: t("table.columns.actions"),
        width: 180,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              height: "100%",
            }}
          >
            <Tooltip title={t("dialog.edit_title")}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleOpenEdit(params.row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("details.title")}>
              <IconButton
                size="small"
                onClick={() => handleViewDetails(params.row)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("dialog.id_card_title")}>
              <IconButton
                size="small"
                color="info"
                onClick={() => {
                  setSelectedEmployee(params.row);
                  setIdCardOpen(true);
                }}
              >
                <BadgeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("dialog.delete")}>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenDelete(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [t],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Unified Toolbar: Filter & Actions */}
      <Paper
        sx={{ p: 1, borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            gap: 1.5,
          }}
        >
          {/* Left Side: Search */}
          <TextField
            placeholder={t("table.search_placeholder")}
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: { xs: "100%", md: 320 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              },
            }}
          />

          {/* Right Side: Action Buttons & Refresh */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: { xs: "space-between", md: "flex-end" },
              width: { xs: "100%", md: "auto" }
            }}
          >
            <Stack direction="row" spacing={1}>
              {selectedCount > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => setBulkDeleteConfirmOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  {selectedCount}
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                startIcon={<ExportIcon />}
                onClick={handleExportExcel}
                sx={{ borderRadius: 2 }}
              >
                {t("table.export_excel")}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
                sx={{ borderRadius: 2, px: 2 }}
              >
                {t("table.add_new")}
              </Button>
            </Stack>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ height: 24, my: "auto", display: { xs: "none", md: "block" } }}
            />
            <IconButton
              onClick={fetchEmployees}
              disabled={loading}
              size="small"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Paper>

      {/* Table */}
      <Paper
        sx={{
          height: 600,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        <DataGrid
          rows={filteredEmployees || []}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          checkboxSelection
          getRowId={(row) => row?.id ?? `fallback-${row.email}-${row.fullName}`}
          onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
          density="compact"
          sx={{ border: "none" }}
        />
      </Paper>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": { width: { xs: "100%", sm: 500 }, p: { xs: 1.5, sm: 2 } },
        }}
      >
        {selectedEmployee && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {t("details.title")}
              </Typography>
              <IconButton onClick={() => setDetailDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
                mb: 2
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 64, sm: 80 },
                  height: { xs: 64, sm: 80 },
                  bgcolor: "primary.main",
                  fontSize: "2rem",
                }}
              >
                {selectedEmployee?.fullName?.charAt(0) || "U"}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedEmployee.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedEmployee.position}
                </Typography>
                <Chip
                  label={selectedEmployee.department?.name || "N/A"}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              <Stack direction="row" spacing={1} sx={{ ml: { xs: 0, sm: "auto" }, width: { xs: "100%", sm: "auto" } }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<BadgeIcon />}
                  onClick={() => setIdCardOpen(true)}
                  fullWidth
                >
                  {t("dialog.print_card")}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenEdit(selectedEmployee)}
                  fullWidth
                >
                  {t("dialog.edit_title")}
                </Button>
              </Stack>
            </Box>

            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label={t("details.tabs.personal")} />
              <Tab label={t("details.tabs.work")} />
              <Tab label={t("details.tabs.bank_salary")} />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.gender")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.gender === "Male"
                        ? t("details.genders.male")
                        : selectedEmployee.gender === "Female"
                          ? t("details.genders.female")
                          : t("details.genders.other")}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.dob")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.dateOfBirth
                        ? new Date(
                          selectedEmployee.dateOfBirth,
                        ).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: "span 2" }}>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.address")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.address || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.phone")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.phoneNumber || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.identityCard")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.identityCardNumber || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              )}

              {tabValue === 1 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.position")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.position || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.department")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.department?.name || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              )}

              {tabValue === 2 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.bankName")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.bankName || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.bankAccount")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.bankAccountNumber || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.baseSalary")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "primary.main" }}>
                      {selectedEmployee.baseSalary.toLocaleString()} VND
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("details.fields.allowance")}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedEmployee.allowance.toLocaleString()} VND
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Dialogs */}
      <EmployeeDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
        title={dialogTitle}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>{t("dialog.delete_title")}</DialogTitle>
        <DialogContent>
          {t("dialog.delete_confirm")}{" "}
          <strong>{selectedEmployee?.fullName}</strong>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
          >
            {t("dialog.cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            {t("dialog.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
      >
        <DialogTitle>{t("dialog.delete_bulk_title")}</DialogTitle>
        <DialogContent>
          {t("dialog.delete_bulk_confirm", { count: selectedCount })}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setBulkDeleteConfirmOpen(false)}
            variant="outlined"
          >
            {t("dialog.cancel")}
          </Button>
          <Button
            onClick={handleBulkDeleteConfirm}
            variant="contained"
            color="error"
          >
            {t("dialog.delete_all")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ID Card Modal */}
      <Dialog
        open={idCardOpen}
        onClose={() => setIdCardOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("dialog.id_card_title")}
          <IconButton onClick={() => setIdCardOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            ref={idCardRef}
            sx={{
              p: 4,
              border: "1px solid #ddd",
              borderRadius: 2,
              textAlign: "center",
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 80,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" color="white" sx={{ fontWeight: 800 }}>
                HRM PRO
              </Typography>
            </Box>

            <Box sx={{ mt: 8 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  border: "4px solid white",
                  boxShadow: 3,
                  bgcolor: "primary.dark",
                  fontSize: "3rem",
                }}
              >
                {selectedEmployee?.fullName?.charAt(0) || "U"}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                {selectedEmployee?.fullName}
              </Typography>
              <Typography
                variant="subtitle1"
                color="primary"
                sx={{ fontWeight: 700, mb: 2 }}
              >
                {selectedEmployee?.position}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 1.5,
                  textAlign: "left",
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    MÃ£ nhÃ¢n viÃªn:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    NV{selectedEmployee?.id?.toString().padStart(3, "0")}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    PhÃ²ng ban:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedEmployee?.department?.name || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedEmployee?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            startIcon={<PrintIcon />}
            variant="outlined"
            fullWidth
            onClick={handlePrintCard}
          >
            {t("dialog.print_card")}
          </Button>
          <Button
            startIcon={<PdfIcon />}
            variant="contained"
            fullWidth
            onClick={handleExportPdfCard}
          >
            {t("dialog.export_pdf")}
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .MuiDialog-root,
          .MuiDialog-root * {
            visibility: visible;
          }
          .MuiDialog-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          .MuiDialogActions-root {
            display: none;
          }
        }
      `}</style>
    </Box>
  );
}

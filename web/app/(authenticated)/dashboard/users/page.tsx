"use client";

import React, { useEffect, useState, useMemo } from "react";
import useRealtimeRefresh from '@/hooks/useRealtime';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Avatar,
  Stack,
  Card,
  Tab,
  Tabs,
  InputAdornment,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  AddOutlined as AddIcon,
  ModeEditOutlineOutlined as EditIcon,
  DeleteOutlineOutlined as DeleteIcon,
  LinkOutlined as LinkIcon,
  VisibilityOutlined as VisibilityIcon,
  VisibilityOffOutlined as VisibilityOffIcon,
  WarningAmberOutlined as WarningIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useAuth, Role } from "@/app/context/AuthContext";
import { userService, User as UserData } from "@/services/user.service";
import { employeeService, Employee } from "@/services/employee.service";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export default function UsersPage() {
  const t = useTranslations("Users");
  const tr = useTranslations("Layout.roles");
  const tc = useTranslations("Layout.common");
  const { user: currentUser } = useAuth();
  const canManage = currentUser?.role === "Admin" || currentUser?.role === "Manager";
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [unlinkedEmployees, setUnlinkedEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    username: "",
    employeeId: 0,
    role: "Employee",
    email: "",
    password: "",
    isActive: true,
  });

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkingUser, setLinkingUser] = useState<UserData | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");

  const [selectionModel, setSelectionModel] = useState<any>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data as UserData[]);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnlinkedEmployees = async () => {
    try {
      const employees = await employeeService.getAll();
      const linkedIds = users.map(u => u.employeeId).filter((id): id is number => !!id && id > 0);
      const unlinked = employees.filter(emp => emp.id && !linkedIds.includes(emp.id));
      setUnlinkedEmployees(unlinked);
    } catch (error) {
      console.error("Failed to fetch unlinked employees", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (canManage) fetchUnlinkedEmployees();
  }, [users, canManage]);

  useRealtimeRefresh(fetchUsers, ["short"]);

  const showMsg = (msg: string, sev: "success" | "error" | "warning" = "success") => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  const handleOpen = (u?: UserData) => {
    if (u) {
      setFormData({ ...u, password: "" });
      setIsEdit(true);
    } else {
      setFormData({
        username: "",
        employeeId: 0,
        role: "Employee",
        email: "",
        password: "Password@123",
        isActive: true,
      });
      setIsEdit(false);
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (formData.username.length < 3) return showMsg(t("validation_username"), "error");
    if (!formData.email.includes("@")) return showMsg(t("validation_email"), "error");

    try {
      if (isEdit && formData.id) {
        await userService.update(formData.id, formData);
        showMsg(t("update_success"));
      } else {
        await userService.create(formData);
        showMsg(t("create_success"));
      }
      fetchUsers();
      setOpen(false);
    } catch (error) {
      showMsg(t("unique_error"), "error");
    }
  };

  const handleLinkEmployee = async () => {
    if (!linkingUser || !selectedEmployeeId) return;
    const alreadyLinked = users.some(u => u.employeeId === selectedEmployeeId && u.id !== linkingUser.id);
    if (alreadyLinked) return showMsg(t("already_linked"), "error");

    try {
      await userService.update(linkingUser.id!, { ...linkingUser, employeeId: Number(selectedEmployeeId) });
      showMsg(t("link_success"));
      setLinkDialogOpen(false);
      setLinkingUser(null);
      setSelectedEmployeeId("");
      fetchUsers();
    } catch (error) {
      showMsg(t("link_error"), "error");
    }
  };

  const columns: GridColDef[] = useMemo(() => [
    { field: "username", headerName: t("username"), width: 140, renderCell: (params: GridRenderCellParams) => <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>@{params.value}</Typography> },
    { field: "fullName", headerName: t("linked_profile"), flex: 1, minWidth: 200, renderCell: (params: GridRenderCellParams) => {
        const emp = params.row.employee;
        if (!emp) return <Chip icon={<WarningIcon sx={{ fontSize: '14px !important' }} />} label={t("not_linked")} size="small" color="warning" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />;
        return <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Avatar sx={{ width: 24, height: 24, bgcolor: "primary.light", color: "primary.main", fontSize: '0.75rem', fontWeight: 700 }}>{emp.fullName.charAt(0).toUpperCase()}</Avatar><Typography variant="body2" sx={{ fontWeight: 600 }}>{emp.fullName}</Typography></Box>;
    }},
    { field: "role", headerName: t("role"), width: 120, renderCell: (params: GridRenderCellParams) => <Chip label={tr(params.value)} size="small" variant="filled" sx={{ fontWeight: 600, borderRadius: 1 }} /> },
    { field: "isActive", headerName: t("status"), width: 120, renderCell: (params: GridRenderCellParams) => <Typography variant="body2" sx={{ color: params.value ? "success.main" : "error.main", fontWeight: 700, fontSize: '0.8125rem' }}>{params.value ? t("active") : t("locked")}</Typography> },
    { field: "actions", headerName: t("actions"), width: 180, sortable: false, align: "right", renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
          {canManage && (
            <>
              {!params.row.employeeId || params.row.employeeId === 0 ? <Tooltip title={t("link_profile")}><IconButton size="small" color="warning" onClick={() => { setLinkingUser(params.row); setLinkDialogOpen(true); }}><LinkIcon fontSize="small" /></IconButton></Tooltip> : null}
              <Switch size="small" checked={params.row.isActive} onChange={async () => { try { await userService.update(params.row.id, { isActive: !params.row.isActive }); fetchUsers(); } catch (e) { showMsg("Không thể thay đổi trạng thái", "error"); } }} />
              <IconButton size="small" onClick={() => handleOpen(params.row)} color="primary"><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={async () => { if (window.confirm(t("delete_confirm"))) { try { await userService.delete(params.row.id); fetchUsers(); showMsg(tc("delete") + " " + t("update_success")); } catch (e) { showMsg(tc("delete") + " error", "error"); } } }} color="error"><DeleteIcon fontSize="small" /></IconButton>
            </>
          )}
        </Stack>
    )},
  ], [t, tr, canManage, users]);

  const displayUsers = useMemo(() => {
    let result = users;
    if (activeTab !== "All") result = result.filter(u => u.role === activeTab);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => (u.employee?.fullName || "").toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return result;
  }, [users, activeTab, searchQuery]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{t("title")}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {canManage && selectionModel.length > 0 && <Button variant="contained" color="error" size="small" onClick={() => setBulkDeleteConfirmOpen(true)}>{t("bulk_delete")} ({selectionModel.length})</Button>}
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpen()}>{t("add_temp")}</Button>
        </Box>
      </Box>

      <Card sx={{ mb: 1, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ p: 1, justifyContent: "space-between", alignItems: "center" }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ minHeight: 40 }}><Tab label={t("tabs.all")} value="All" /><Tab label={t("tabs.admin")} value="Admin" /><Tab label={t("tabs.manager")} value="Manager" /><Tab label={t("tabs.employee")} value="Employee" /></Tabs>
            <TextField placeholder={t("search_placeholder")} size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ width: 300 }} slotProps={{ input: { sx: { borderRadius: 2 } } }} />
        </Stack>
      </Card>

      <Paper sx={{ minHeight: 400, borderRadius: 2, overflow: "hidden" }}>
        <DataGrid rows={displayUsers} columns={columns} loading={loading} checkboxSelection={canManage} onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)} slots={{ noRowsOverlay: CustomNoRowsOverlay }} density="comfortable" sx={{ border: "none" }} />
      </Paper>

      {/* Link Employee Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>{t("link_profile")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t("select_emp_desc", { username: linkingUser?.username || "" })}</Typography>
          <TextField select fullWidth label={t("select_emp")} size="small" value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value === "" ? "" : Number(e.target.value))}>
            {unlinkedEmployees.length === 0 ? <MenuItem disabled>{t("no_unlinked_emp")}</MenuItem> : unlinkedEmployees.map((emp) => <MenuItem key={emp.id} value={emp.id}>{emp.fullName} - {emp.position}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setLinkDialogOpen(false)}>{tc("cancel")}</Button><Button onClick={handleLinkEmployee} variant="contained" disabled={!selectedEmployeeId}>{t("link_confirm")}</Button></DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? t("edit_user") : t("add_temp")}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2, mt: 1 }}>
            <TextField label={t("username")} fullWidth size="small" disabled={isEdit} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            <TextField label={t("email")} fullWidth size="small" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            {!isEdit && <TextField label={t("password")} type={showPassword ? "text" : "password"} fullWidth size="small" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> } }} />}
            <TextField select label={t("role")} fullWidth size="small" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}>{["Admin", "Manager", "Employee"].map((r) => <MenuItem key={r} value={r} disabled={currentUser?.role === "Manager" && r === "Admin"}>{tr(r)}</MenuItem>)}</TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpen(false)}>{tc("cancel")}</Button><Button onClick={handleSubmit} variant="contained" sx={{ px: 4 }}>{tc("save")}</Button></DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert></Snackbar>
    </Box>
  );
}

"use client";

import React, { useEffect, useState, useMemo } from "react";
import useRealtimeRefresh from '@/lib/useRealtime';
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
  CardContent,
  Tab,
  Tabs,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  AddOutlined as AddIcon,
  ModeEditOutlineOutlined as EditIcon,
  DeleteOutlineOutlined as DeleteIcon,
  SearchOutlined as SearchIcon,
  VisibilityOutlined as VisibilityIcon,
  VisibilityOffOutlined as VisibilityOffIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useAuth, Role } from "@/app/context/AuthContext";
import { userService, User as UserData } from "@/services/user.service";

export default function UsersPage() {
  const t = useTranslations("Users");
  const tr = useTranslations("Layout.roles");
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  // Selection state
  const [selectionModel, setSelectionModel] = useState<any>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const getSelectedIds = (): number[] => {
    if (!selectionModel) return [];
    if (Array.isArray(selectionModel)) return selectionModel as number[];
    if (typeof selectionModel === "object") {
      if ("ids" in selectionModel && selectionModel.ids) {
        const ids = selectionModel.ids;
        return Array.isArray(ids) ? (ids as number[]) : Array.from(ids as any);
      }
      if (selectionModel instanceof Set) return Array.from(selectionModel) as number[];
    }
    return [];
  };
  const selectedCount = getSelectedIds().length;

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data as UserData[]);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Refresh users list on realtime notifications
  useRealtimeRefresh(fetchUsers, ["short"]);

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

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      if (isEdit && formData.id) {
        await userService.update(formData.id, formData);
      } else {
        await userService.create(formData);
      }
      fetchUsers();
      handleClose();
    } catch (error) {
      alert("Failed to save user");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t("delete_confirm"))) {
      try {
        await userService.delete(id);
        fetchUsers();
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const user = users.find(u => u.id === id);
      if (user) {
        await userService.update(id, { isActive: !user.isActive });
        fetchUsers();
      }
    } catch (error) {
      alert("Failed to toggle status");
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await userService.bulkDelete(getSelectedIds());
      fetchUsers();
      setSelectionModel([]);
      setBulkDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Failed to bulk delete users:", error);
      alert("Failed to bulk delete users");
    }
  };

  const isAdmin = currentUser?.role === "Admin";

  // DataGrid Columns Definition
  const columns: GridColDef[] = useMemo(() => [
    {
      field: "username",
      headerName: t("username"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          @{params.value}
        </Typography>
      ),
    },
    {
      field: "fullName",
      headerName: t("fullname"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const name = params.row.employee?.fullName || params.row.username;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light", color: "primary.main", fontSize: "0.875rem", fontWeight: 700 }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
          </Box>
        );
      },
    },

    {
      field: "email",
      headerName: t("email"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "role",
      headerName: t("role"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={tr(params.value)}
          size="small"
          sx={{
            fontWeight: 600,
            borderRadius: 10,
            fontSize: "0.75rem",
            bgcolor: params.value === "Admin" ? "#e0e7ff" : params.value === "Manager" ? "#fef3c7" : "#f1f5f9",
            color: params.value === "Admin" ? "#4338ca" : params.value === "Manager" ? "#92400e" : "#475569"
          }}
        />
      ),
    },
    {
      field: "isActive",
      headerName: t("status"),
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: params.value ? "success.main" : "error.main" }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: params.value ? "success.main" : "error.main" }}>
            {params.value ? t("active") : t("locked")}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: t("actions"),
      width: 150,
      sortable: false,
      filterable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
          {isAdmin && (
            <>
              <Tooltip title={t("status")}>
                <Switch
                  size="small"
                  checked={params.row.isActive}
                  onChange={() => handleToggleActive(params.row.id!)}
                />
              </Tooltip>
              <IconButton size="small" onClick={() => handleOpen(params.row)} sx={{ color: "primary.main", bgcolor: "primary.light" }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(params.row.id!)} sx={{ color: "error.main", bgcolor: "#fee2e2" }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
          {!isAdmin && params.row.role === "Employee" && currentUser?.role === "Personnel" && (
            <IconButton size="small" color="primary" onClick={() => handleOpen(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ], [t, tr, isAdmin, currentUser]);

  // Filter users by Tab & Search
  const displayUsers = useMemo(() => {
    let result = users;

    if (activeTab !== "All") {
      result = result.filter(u => u.role === activeTab);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        (u.employee?.fullName || "").toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [users, activeTab, searchQuery]);

  // Custom Toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ p: 1.5, gap: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  const availableRoles: Role[] = ["Admin", "Manager", "Personnel", "Attendance", "Employee"];
  const selectRoles = currentUser?.role === "Personnel"
    ? availableRoles.filter(r => r === "Employee")
    : availableRoles;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Actions Row */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
        {isAdmin && selectedCount > 0 && (
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => setBulkDeleteConfirmOpen(true)}
            sx={{ borderRadius: 2, px: 2 }}
          >
            {t("delete") || "Xóa"} ({selectedCount})
          </Button>
        )}
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 2 }}
        >
          {t("add_user")}
        </Button>
      </Box>

      {/* Filter Tabs & Search Toolbar */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: "8px 16px !important" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                minHeight: 40,
                "& .MuiTabs-indicator": { height: 2 },
                "& .MuiTab-root": { minWidth: 80, minHeight: 40, fontSize: "0.875rem", fontWeight: 600, py: 1 }
              }}
            >
              <Tab label={t("tabs.all")} value="All" />
              <Tab label={t("tabs.admin")} value="Admin" />
              <Tab label={t("tabs.manager")} value="Manager" />
              <Tab label={t("tabs.employee")} value="Employee" />
            </Tabs>

            <TextField
              placeholder={t("search_placeholder")}
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: "100%", md: 300 },
                "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Advanced Data Grid */}
      <Paper sx={{ minHeight: 400, width: "100%", borderRadius: 2 }}>
        <DataGrid
          autoHeight
          rows={displayUsers}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 20, 50, 100]}
          disableRowSelectionOnClick
          getRowId={(row) => row?.id ?? `fallback-${row.username}`}
          checkboxSelection={isAdmin}
          onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
          slots={{
            toolbar: CustomToolbar,
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "background.default",
              borderBottom: "2px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "2px solid",
              borderColor: "divider",
            },
          }}
        />
      </Paper>

      {/* Personnel Restriction Warning */}
      {currentUser?.role === "Personnel" && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: "#fffaf0", borderLeft: "4px solid #ed8936", borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: "#9c4221", fontWeight: 600 }}>
            {t("restricted_personnel")}
          </Typography>
        </Paper>
      )}

      {/* Bulk Delete Confirm */}
      <Dialog
        open={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
      >
        <DialogTitle>{t("delete_bulk_title") || "Xác nhận xóa hàng loạt"}</DialogTitle>
        <DialogContent>
          {t("delete_bulk_confirm", { count: selectedCount }) || `Bạn có chắc muốn xóa ${selectedCount} bản ghi đã chọn?`}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBulkDeleteConfirmOpen(false)} variant="outlined">
            {t("cancel") || "Hủy"}
          </Button>
          <Button onClick={handleBulkDeleteConfirm} variant="contained" color="error">
            {t("delete") || "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Add/Edit User */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, maxWidth: 480 } }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pt: 3, px: 3 }}>
          {isEdit ? t("edit_user") : t("add_user")}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("form_subtitle")}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t("username")}
                fullWidth
                disabled={isEdit}
                size="small"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                label={t("fullname")}
                fullWidth
                size="small"
                disabled
                value={formData.employee?.fullName || "N/A"}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={t("email")}
                fullWidth
                size="small"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            {!isEdit && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t("password")}
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  size="small"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label={t("role")}
                fullWidth
                size="small"
                disabled={!isAdmin && currentUser?.role === "Personnel"}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              >
                {selectRoles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {tr(r)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600 }}>{t("cancel")}</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ fontWeight: 600, borderRadius: 2, px: 4 }}>{t("save")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

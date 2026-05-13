"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { roleService, Role, Permission } from "@/services/role.service";
import { useTranslations } from "next-intl";

export default function RolesPage() {
  const t = useTranslations("Admin.roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedPermissions: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permsData] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (role?: Role) => {
    if (role) {
      try {
        const fullRole = await roleService.getRole(role.id);
        setEditingRole(fullRole);
        setFormData({
          name: fullRole.name,
          description: fullRole.description,
          selectedPermissions: fullRole.permissions || [],
        });
      } catch (err) {
        setError("Failed to fetch role details");
        return;
      }
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        selectedPermissions: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRole(null);
  };

  const handlePermissionChange = (code: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedPermissions.includes(code);
      return {
        ...prev,
        selectedPermissions: isSelected
          ? prev.selectedPermissions.filter((p) => p !== code)
          : [...prev.selectedPermissions, code],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        permissions: formData.selectedPermissions,
      };

      if (editingRole) {
        await roleService.updateRole(editingRole.id, payload);
      } else {
        await roleService.createRole(payload);
      }
      handleClose();
      fetchData();
    } catch (err) {
      setError("Failed to save role");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await roleService.deleteRole(id);
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete role");
      }
    }
  };

  const groupedPermissions = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Tên nhóm",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{params.value}</Typography>
      )
    },
    { field: "description", headerName: "Mô tả", flex: 1.5 },
    {
      field: "permissionCount",
      headerName: "Số lượng quyền",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={`${params.value} quyền`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 120,
      sortable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", height: "100%", alignItems: "center" }}>
          <IconButton onClick={() => handleOpen(params.row)} color="primary" size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      )
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      <Paper sx={{ borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <SecurityIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t("title") || "Phân quyền hệ thống"}</Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t("add") || "Thêm nhóm quyền"}
          </Button>
        </Box>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={roles}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            density="compact"
            slots={{ noRowsOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                <SecurityIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2">{t("empty") || "Chưa có nhóm quyền nào"}</Typography>
              </Box>
            ) }}
            sx={{ border: "none" }}
          />
        </Box>
      </Paper>

      {/* Role Edit/Create Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingRole ? (t("edit") || "Chỉnh sửa nhóm quyền") : (t("add") || "Thêm nhóm quyền mới")}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 1 }}>
            <TextField
              label={t("name") || "Tên nhóm quyền"}
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label={t("description") || "Mô tả"}
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
              {t("permissions") || "Danh sách quyền hạn"}
            </Typography>

            <Grid container spacing={3}>
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <Grid size={{ xs: 12, md: 6 }} key={module}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}>
                        Module: {module}
                      </Typography>
                      <FormGroup>
                        {perms.map((p) => (
                          <FormControlLabel
                            key={p.code}
                            control={
                              <Checkbox
                                checked={formData.selectedPermissions.includes(p.code)}
                                onChange={() => handlePermissionChange(p.code)}
                              />
                            }
                            label={p.name}
                          />
                        ))}
                      </FormGroup>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={handleClose} color="inherit">{t("cancel") || "Hủy"}</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ px: 4 }}>{t("save") || "Lưu thay đổi"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

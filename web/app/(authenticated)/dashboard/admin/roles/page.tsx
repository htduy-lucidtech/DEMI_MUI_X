"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Chip,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1.5 }}>
          <SecurityIcon color="primary" fontSize="large" />
          Phân quyền hệ thống
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Thêm nhóm quyền
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tên nhóm</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Số lượng quyền</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{role.name}</Typography>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${role.permissionCount} quyền`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton onClick={() => handleOpen(role)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton onClick={() => handleDelete(role.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Role Edit/Create Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingRole ? "Chỉnh sửa nhóm quyền" : "Thêm nhóm quyền mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 1 }}>
            <TextField
              label="Tên nhóm quyền"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
              Danh sách quyền hạn
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
          <Button onClick={handleClose} color="inherit">Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ px: 4 }}>Lưu thay đổi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

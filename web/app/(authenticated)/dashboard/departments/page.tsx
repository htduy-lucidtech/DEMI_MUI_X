"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { departmentsService, Department } from "@/services/departments.service";

export default function DepartmentsPage() {
  const t = useTranslations("Departments");
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Department>({ name: "", description: "" });

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const data = await departmentsService.getAll();
      setDepts(data);
    } catch (error) {
      console.error("Failed to fetch depts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData(dept);
    } else {
      setEditingDept(null);
      setFormData({ name: "", description: "" });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingDept) {
        await departmentsService.update(editingDept.id!, formData);
      } else {
        await departmentsService.create(formData);
      }
      setOpen(false);
      fetchDepts();
    } catch (error) {
      console.error("Failed to save dept:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure?")) {
      try {
        await departmentsService.delete(id);
        fetchDepts();
      } catch (error) {
        console.error("Failed to delete dept:", error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: t("columns.name"), flex: 1 },
    { field: "description", headerName: t("columns.description"), flex: 1.5 },
    {
      field: "actions",
      headerName: t("columns.actions"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => handleOpen(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Actions Row */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 2 }}
        >
          {t("addDept")}
        </Button>
      </Box>

      <Paper sx={{ height: 500, width: '100%', borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <DataGrid
          rows={depts}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingDept ? t("editDept") : t("addDept")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label={t("dialog.name")}
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label={t("dialog.description")}
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit">{t("dialog.cancel")}</Button>
          <Button onClick={handleSave} variant="contained">{t("dialog.save")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from '@/hooks/useRealtime';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  const [formData, setFormData] = useState<Department>({ name: "", description: "", parentId: undefined });

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

  useEffect(() => {
    fetchDepts();
  }, []);

  // Refresh departments when notifications arrive
  useRealtimeRefresh(fetchDepts, ["short"]);

  const handleOpen = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData(dept);
    } else {
      setEditingDept(null);
      setFormData({ name: "", description: "", parentId: undefined });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId || null
      } as any;

      if (editingDept) {
        await departmentsService.update(editingDept.id!, dataToSave);
      } else {
        await departmentsService.create(dataToSave);
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

  const columns: GridColDef<Department>[] = [
    { field: "name", headerName: t("columns.name"), flex: 1 },
    {
      field: "parent",
      headerName: t("columns.parent"),
      flex: 1,
      valueGetter: (_value: any, row: any) => row.parent?.name || "-"
    },
    { field: "description", headerName: t("columns.description"), flex: 1.5 },
    {
      field: "actions",
      headerName: t("columns.actions"),
      width: 120,
      renderCell: (params: GridRenderCellParams<Department>) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => handleOpen(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => params.row.id && handleDelete(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
      <Paper sx={{ borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexGrow: 1, flexWrap: "wrap" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 1 }}>{t("title") || "Phòng ban"}</Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t("addDept")}
          </Button>
        </Box>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={depts}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            density="compact"
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            sx={{ border: "none" }}
          />
        </Box>
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
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>{t("dialog.parent")}</InputLabel>
              <Select
                value={formData.parentId || ""}
                label={t("dialog.parent")}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : undefined })}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {depts
                  .filter(d => d.id !== editingDept?.id) // Prevent self-parent
                  .map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
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

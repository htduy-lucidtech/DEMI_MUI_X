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
  Stack
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import * as XLSX from 'xlsx';

interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function PersonnelPage() {
  const t = useTranslations("Personnel");
  const tr = useTranslations("Layout.roles");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleExportExcel = () => {
    const dataToExport = filteredUsers.map(u => ({
      [t("table.columns.fullName")]: u.fullName,
      [t("table.columns.username")]: u.username,
      [t("table.columns.email")]: u.email,
      [t("table.columns.role")]: tr(u.role),
      [t("table.columns.status")]: u.isActive ? t("table.status.active") : t("table.status.inactive")
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personnel");
    XLSX.writeFile(workbook, `HRM_Personnel_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const columns: GridColDef[] = [
    { field: "username", headerName: t("table.columns.username"), flex: 1 },
    {
      field: "fullName",
      headerName: t("table.columns.fullName"),
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
          {params.value}
        </Typography>
      )
    },
    { field: "email", headerName: t("table.columns.email"), flex: 1.5 },
    {
      field: "role",
      headerName: t("table.columns.role"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={tr(params.value as string)}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 700, borderRadius: 1.5 }}
        />
      )
    },
    {
      field: "isActive",
      headerName: t("table.columns.status"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? t("table.status.active") : t("table.status.inactive")}
          color={params.value ? "success" : "default"}
          size="small"
          sx={{ fontWeight: 700, borderRadius: 1.5 }}
        />
      )
    },
    {
      field: "actions",
      headerName: t("table.columns.actions"),
      flex: 1.2,
      sortable: false,
      renderCell: () => (
        <Box>
          <Tooltip title={t("dialog.edit_title")}>
            <IconButton size="small" color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small">
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
      {/* Header & Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            {t("title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("description")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportExcel}
            sx={{ borderRadius: 2.5, px: 2 }}
          >
            {t("table.export_excel")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2.5, px: 3, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)" }}
          >
            {t("table.add_new")}
          </Button>
        </Stack>
      </Box>

      {/* Filter & Search */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
          <IconButton onClick={fetchUsers} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Data Table */}
      <Paper sx={{
        height: 600,
        width: "100%",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid #e2e8f0"
      }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              color: "text.secondary",
              fontWeight: 700
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9"
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f1f5f9"
            }
          }}
        />
      </Paper>
    </Box>
  );
}

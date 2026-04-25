"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Calculate as CalcIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { payrollService, PayrollRecord } from "@/services/payroll.service";
import * as XLSX from "xlsx";

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const data = await payrollService.calculate(month, year);
      setRecords(data);
    } catch (error) {
      alert("Failed to calculate payroll");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    XLSX.writeFile(wb, `Payroll_${month}_${year}.xlsx`);
  };

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Nhân viên", flex: 1 },
    {
      field: "baseSalary",
      headerName: "Lương cơ bản",
      width: 150,
      renderCell: (params: GridRenderCellParams) => params.value.toLocaleString() + " ₫"
    },
    { field: "workDays", headerName: "Ngày công", width: 120 },
    {
      field: "totalSalary",
      headerName: "Thành tiền",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
          {params.value.toLocaleString()} ₫
        </Typography>
      )
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Bảng lương</Typography>
          <Typography variant="body2" color="text.secondary">Tính lương tự động dựa trên ngày công thực tế</Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <TextField
              select
              label="Tháng"
              size="small"
              sx={{ width: 120 }}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>Tháng {i + 1}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Năm"
              size="small"
              sx={{ width: 120 }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026].map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={<CalcIcon />} onClick={handleCalculate} disabled={loading}>
              {loading ? "Đang tính..." : "Tính lương"}
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} disabled={records.length === 0}>
              Xuất Excel
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Paper sx={{ height: 500, width: '100%', borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <DataGrid
          rows={records}
          getRowId={(row) => row.userId}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>
    </Box>
  );
}

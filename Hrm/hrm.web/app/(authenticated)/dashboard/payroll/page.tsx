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
import CustomNoRowsOverlay from "@/app/components/CustomNoRowsOverlay";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

export default function PayrollPage() {
  const t = useTranslations("Payroll");
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
      alert(t("failedToCalculate"));
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5181/api'}/Payroll/export/excel/${month}/${year}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payroll_${month}_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to export Excel");
    }
  };

  const handleExportPdf = async (userId: number, fullName: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5181/api'}/Payroll/export/pdf/${userId}/${month}/${year}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      if (!response.ok) throw new Error('Export PDF failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip_${fullName}_${month}_${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to export PDF");
    }
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
    {
      field: "actions",
      headerName: "Thao tác",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => handleExportPdf(params.row.userId, params.row.fullName)}
        >
          Tải PDF
        </Button>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{t("title")}</Typography>
          <Typography variant="body2" color="text.secondary">{t("subtitle")}</Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <TextField
              select
              label={t("month")}
              size="small"
              sx={{ width: 120 }}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{t("month")} {i + 1}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t("year")}
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
              {loading ? t("calculating") : t("calculate")}
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportExcel} disabled={records.length === 0}>
              {t("export")} Excel
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
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          sx={{ border: 'none' }}
        />
      </Paper>
    </Box>
  );
}

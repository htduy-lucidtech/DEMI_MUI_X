"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from '@/hooks/useRealtime';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Divider,
  Stack,
  MenuItem
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  CalculateOutlined as CalcIcon,
  DownloadOutlined as DownloadIcon
} from "@mui/icons-material";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";
import { useTranslations } from "next-intl";
import { payrollService, PayrollRecord } from "@/services/payroll.service";

export default function PayrollPage() {
  const t = useTranslations("Payroll");
  const tc = useTranslations("Layout.common");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const data = await payrollService.calculate(month, year);
      setRecords(data || []);
    } catch (error) {
      console.error("Failed to calculate payroll:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  const handleExportExcel = async () => {
    try {
      const blob = await payrollService.exportExcel(month, year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payroll_${month}_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export Excel:", error);
    }
  };

  const handleExportPdf = async (userId: number, fullName: string) => {
    try {
      const blob = await payrollService.exportPdf(userId, month, year);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip_${fullName.trim().replace(/\s+/g, '_')}_${month}_${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  useRealtimeRefresh(() => handleCalculate(), ["short"]);

  const columns: GridColDef[] = [
    { field: "fullName", headerName: t("employee"), flex: 1 },
    {
      field: "baseSalary",
      headerName: t("baseSalary"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (params.value?.toLocaleString() || "0") + " " + tc("currency")
    },
    {
      field: "hourlyRate",
      headerName: t("hourlyRate"),
      width: 130,
      renderCell: (params: GridRenderCellParams) => (params.value?.toLocaleString() || "0") + " " + tc("currency")
    },
    { field: "workHours", headerName: t("workHours"), width: 100 },
    { field: "leaveHours", headerName: t("leaveHours"), width: 110, renderCell: (p) => <Typography sx={{ color: 'success.main' }}>{p.value}</Typography> },
    { field: "otHours", headerName: t("otHours"), width: 100 },
    { field: "lateEarlyMinutes", headerName: t("lateEarlyMinutes"), width: 140, renderCell: (p) => <Typography sx={{ color: p.value > 0 ? 'error.main' : 'inherit' }}>{p.value}</Typography> },
    {
      field: "deductions",
      headerName: t("deductions"),
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ color: "error.main" }}>
          -{(params.value?.toLocaleString() || "0")} {tc("currency")}
        </Typography>
      )
    },
    {
      field: "totalSalary",
      headerName: t("totalAmount"),
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ fontWeight: 800, color: "primary.main", fontSize: '1.1rem' }}>
          {(params.value?.toLocaleString() || "0")} {tc("currency")}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: t('actions'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleExportPdf(params.row.userId, params.row.fullName)}
        >
          {t('downloadPdf')}
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(to right, #ffffff, #f8fafc)'
        }}
      >
        <Stack
          direction="row"
          spacing={3}
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Stack direction="row" spacing={4} sx={{ flexGrow: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
                {t('totalAmount')}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {records.reduce((acc, curr) => acc + curr.totalSalary, 0).toLocaleString()} <Typography component="span" variant="caption" sx={{ fontWeight: 700 }}>{tc("currency")}</Typography>
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 40, my: 'auto' }} />

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
                {t('deductions')}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'error.main' }}>
                -{records.reduce((acc, curr) => acc + curr.deductions, 0).toLocaleString()} <Typography component="span" variant="caption" sx={{ fontWeight: 700 }}>{tc("currency")}</Typography>
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 40, my: 'auto' }} />

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
                {t('employee')}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {records.length}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', alignItems: "center" }}
          >
            <TextField
              select
              size="small"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              sx={{ minWidth: 110, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
            >
              {[...Array(12)].map((_, i) => <MenuItem key={i + 1} value={i + 1}>{t("month")} {i + 1}</MenuItem>)}
            </TextField>
            <TextField
              select
              size="small"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              sx={{ minWidth: 100, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
            >
              {[2024, 2025, 2026].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<CalcIcon />}
                onClick={handleCalculate}
                disabled={loading}
                sx={{ borderRadius: 2, fontWeight: 700, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
              >
                {t("calculate")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportExcel}
                disabled={records.length === 0}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                {tc("excel")}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
      <Paper sx={{ borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexGrow: 1, flexWrap: "wrap" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 1 }}>{t("title") || "Bảng lương"}</Typography>
            
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <TextField
                select
                size="small"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                sx={{ minWidth: 120 }}
              >
                {[...Array(12)].map((_, i) => <MenuItem key={i + 1} value={i + 1}>{t("month")} {i + 1}</MenuItem>)}
              </TextField>
              <TextField
                select
                size="small"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                sx={{ minWidth: 100 }}
              >
                {[2024, 2025, 2026].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
              <Button
                variant="contained"
                size="small"
                startIcon={<CalcIcon />}
                onClick={handleCalculate}
                disabled={loading}
              >
                {t("calculate")}
              </Button>
            </Stack>
          </Stack>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            disabled={records.length === 0}
          >
            {tc("excel")}
          </Button>
        </Box>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={records}
            getRowId={(row) => row.userId}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            density="compact"
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            sx={{ border: "none" }}
          />
        </Box>
      </Paper>
    </Box>
  );
}

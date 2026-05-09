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
    { field: "workHours", headerName: t("workHours"), width: 110 },
    { field: "otHours", headerName: t("otHours"), width: 110 },
    {
      field: "totalSalary",
      headerName: t("totalAmount"),
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
            <Stack direction="row" spacing={2}>
              <TextField select label={t("month")} size="small" sx={{ minWidth: 120 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {[...Array(12)].map((_, i) => <MenuItem key={i + 1} value={i + 1}>{t("month")} {i + 1}</MenuItem>)}
              </TextField>
              <TextField select label={t("year")} size="small" sx={{ minWidth: 120 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[2024, 2025, 2026].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: "flex-end" }}>
              <Button variant="contained" startIcon={<CalcIcon />} onClick={handleCalculate} disabled={loading}>{t("calculate")}</Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportExcel} disabled={records.length === 0}>{tc("excel")}</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Paper sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid rows={records} getRowId={(row) => row.userId} columns={columns} loading={loading} disableRowSelectionOnClick slots={{ noRowsOverlay: CustomNoRowsOverlay }} sx={{ border: 'none' }} />
      </Paper>
    </Box>
  );
}

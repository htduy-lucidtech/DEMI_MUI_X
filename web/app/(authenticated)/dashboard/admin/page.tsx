"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Save as SaveIcon,
  Business as CompanyIcon,
  AccessTime as TimeIcon,
  NotificationsActive as NotiIcon,
  SettingsBackupRestore as ResetIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import PageHeader from "@/components/common/PageHeader";
import FormGrid from "@/components/common/FormGrid";
import api from "@/lib/api";

export default function AdminSettingsPage() {
  const t = useTranslations("Admin");
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(t("success"));
    }, 1000);
  };

  const handleResetDatabase = async () => {
    setResetting(true);
    try {
      await api.post("/Settings/reset-database");
      alert("Khôi phục dữ liệu mẫu thành công!");
      window.location.reload();
    } catch (error: any) {
      alert("Lỗi khi khôi phục dữ liệu: " + error.message);
    } finally {
      setResetting(false);
      setOpenConfirm(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title={t("sections.general") || "Cấu hình hệ thống"}
        actions={
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            {t("save")}
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
                <CompanyIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("sections.general")}</Typography>
              </Stack>
              <Stack spacing={3}>
                <TextField 
                  fullWidth 
                  size="small"
                  label={t("fields.companyName")} 
                  defaultValue="HRM Pro Global" 
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Working Time Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
                <TimeIcon color="secondary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("sections.workingTime")}</Typography>
              </Stack>
              <FormGrid gap={2}>
                <TextField 
                  fullWidth 
                  size="small"
                  type="time" 
                  label={t("fields.startTime")} 
                  defaultValue="08:00" 
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField 
                  fullWidth 
                  size="small"
                  type="time" 
                  label={t("fields.endTime")} 
                  defaultValue="17:00" 
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <Box sx={{ gridColumn: "span 2" }}>
                  <TextField 
                    fullWidth 
                    size="small"
                    type="number" 
                    label={t("fields.lateThreshold")} 
                    defaultValue={15} 
                  />
                </Box>
              </FormGrid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
                <NotiIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("sections.notifications")}</Typography>
              </Stack>
              <Stack spacing={2}>
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label={t("fields.emailNotify")} 
                />
                <Divider />
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label={t("fields.realtimeNotify")} 
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance / Data Reset */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', border: '1px dashed #ed6c02', bgcolor: 'rgba(237, 108, 2, 0.02)' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
                <ResetIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  Bảo trì & Khôi phục dữ liệu
                </Typography>
              </Stack>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 'auto' }}>
                Khôi phục cơ sở dữ liệu về trạng thái mẫu ban đầu. Toàn bộ dữ liệu tự tạo mới sẽ bị xóa sạch và thay thế bằng bộ dữ liệu demo chuẩn hóa mới nhất.
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  color="warning" 
                  fullWidth
                  startIcon={<ResetIcon />}
                  onClick={() => setOpenConfirm(true)}
                >
                  Khôi phục dữ liệu mẫu
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirm Reset Dialog */}
      <Dialog
        open={openConfirm}
        onClose={() => !resetting && setOpenConfirm(false)}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ResetIcon color="warning" />
          Xác nhận khôi phục dữ liệu
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hành động này sẽ <strong>xóa toàn bộ dữ liệu hiện tại</strong> trong hệ thống (bao gồm các đơn nghỉ phép mới tạo, bản ghi chấm công, tài khoản, phòng ban...) và nạp lại dữ liệu mẫu chuẩn hóa ban đầu. Bạn có chắc chắn muốn tiếp tục?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenConfirm(false)} 
            disabled={resetting}
            variant="outlined" 
            color="inherit"
          >
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleResetDatabase} 
            disabled={resetting}
            variant="contained" 
            color="warning"
            startIcon={resetting ? undefined : <ResetIcon />}
          >
            {resetting ? "Đang khôi phục..." : "Đồng ý khôi phục"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

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
} from "@mui/material";
import {
  Save as SaveIcon,
  Business as CompanyIcon,
  AccessTime as TimeIcon,
  NotificationsActive as NotiIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

export default function AdminSettingsPage() {
  const t = useTranslations("Admin");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(t("success"));
    }, 1000);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Actions Row */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<SaveIcon />} 
          onClick={handleSave}
          disabled={loading}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {t("save")}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
                <CompanyIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("sections.general")}</Typography>
              </Stack>
              <Stack spacing={3}>
                <TextField 
                  fullWidth 
                  label={t("fields.companyName")} 
                  defaultValue="HRM Pro Global" 
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Working Time Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
                <TimeIcon color="secondary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("sections.workingTime")}</Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField 
                    fullWidth 
                    type="time" 
                    label={t("fields.startTime")} 
                    defaultValue="08:00" 
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField 
                    fullWidth 
                    type="time" 
                    label={t("fields.endTime")} 
                    defaultValue="17:00" 
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField 
                    fullWidth 
                    type="number" 
                    label={t("fields.lateThreshold")} 
                    defaultValue={15} 
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications Settings */}
        <Grid size={12}>
          <Card sx={{ borderRadius: 4 }}>
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
      </Grid>
    </Box>
  );
}

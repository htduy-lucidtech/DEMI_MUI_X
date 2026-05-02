"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from '@/lib/useRealtime';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  ListItemButton as MuiListItemButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Translate as TranslateIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { settingsService, SystemSetting } from "@/services/settings.service";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getAll();
      setSystemSettings(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Refresh settings when a short notification arrives
  useRealtimeRefresh(fetchSettings, ["short"]);

  const handleUpdateSetting = async (id: number, value: string) => {
    const setting = systemSettings.find(s => s.id === id);
    if (!setting) return;

    const updatedSetting = { ...setting, value };
    try {
      await settingsService.update(id, updatedSetting);
      setSystemSettings(systemSettings.map(s => s.id === id ? updatedSetting : s));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px' }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
          {t('subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Section Nav — vertical on desktop, horizontal chips on mobile */}
        <Grid size={{ xs: 12, md: 3 }}>
          {isMobile ? (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'nowrap',
                overflowX: 'auto',
                pb: 0.5,
                mb: 1,
                '&::-webkit-scrollbar': { height: '4px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 4 },
              }}
            >
              <SectionButton selected icon={<PersonIcon />} text={t('account')} compact />
              <SectionButton icon={<NotificationsIcon />} text={t('notifications')} compact />
              <SectionButton icon={<SecurityIcon />} text={t('security')} compact />
              <SectionButton icon={<PaletteIcon />} text={t('appearance')} compact />
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              <SectionButton selected icon={<PersonIcon />} text={t('account')} />
              <SectionButton icon={<NotificationsIcon />} text={t('notifications')} />
              <SectionButton icon={<SecurityIcon />} text={t('security')} />
              <SectionButton icon={<PaletteIcon />} text={t('appearance')} />
            </List>
          )}
        </Grid>

        {/* Right Column: Settings Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Stack spacing={3}>
            {/* System Parameters Card */}
            <Card sx={{ borderRadius: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
                  {t('systemParamsTitle')}
                </Typography>
                <Grid container spacing={2}>
                  {systemSettings.map((setting) => (
                    <Grid size={{ xs: 12 }} key={setting.id}>
                      <TextField
                        fullWidth
                        size="small"
                        label={setting.description || setting.key}
                        value={setting.value || ""}
                        onChange={(e) => {
                          const newSettings = [...systemSettings];
                          const index = newSettings.findIndex(s => s.id === setting.id);
                          newSettings[index].value = e.target.value;
                          setSystemSettings(newSettings);
                        }}
                        onBlur={() => handleUpdateSetting(setting.id, setting.value)}
                        helperText={`Category: ${setting.category}`}
                        slotProps={{
                          formHelperText: { sx: { fontSize: '0.65rem', fontWeight: 600 } }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card sx={{ borderRadius: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                  {t('notifications')}
                </Typography>
                <List disablePadding>
                  <SettingSwitch
                    icon={<EmailIcon color="primary" />}
                    title={t('emailNotifTitle')}
                    subtitle={t('emailNotifSubtitle')}
                    checked={emailNotif}
                    onChange={() => setEmailNotif(!emailNotif)}
                  />
                  <Divider sx={{ my: 1 }} />
                  <SettingSwitch
                    icon={<NotificationsIcon color="primary" />}
                    title={t('pushNotifTitle')}
                    subtitle={t('pushNotifSubtitle')}
                    checked={pushNotif}
                    onChange={() => setPushNotif(!pushNotif)}
                  />
                </List>
              </CardContent>
            </Card>

            {/* Language & Region */}
            <Card sx={{ borderRadius: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
                  {t('langRegionTitle')}
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('displayLang')}</InputLabel>
                      <Select value="vi" label={t('displayLang')} sx={{ borderRadius: 1 }}>
                        <MenuItem value="vi">Tiếng Việt (VI)</MenuItem>
                        <MenuItem value="en">English (EN)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('timezone')}</InputLabel>
                      <Select value="hanoi" label={t('timezone')} sx={{ borderRadius: 1 }}>
                        <MenuItem value="hanoi">(GMT+07:00) Hanoi</MenuItem>
                        <MenuItem value="sg">(GMT+08:00) Singapore</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Security */}
            <Card sx={{ borderRadius: 1.5, border: "1px solid", borderColor: "error.light", bgcolor: "error.50" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: "error.main" }}>
                  {t('securityTitle')}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('changePassword')}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{t('changePasswordDesc')}</Typography>
                  </Box>
                  <Button variant="outlined" color="error" size="small" sx={{ borderRadius: 1, fontWeight: 700, minWidth: 100 }}>
                    {t('updateBtn')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

// Helpers
const SectionButton = ({ icon, text, selected, compact }: any) => (
  <MuiListItemButton
    sx={{
      mb: compact ? 0 : 0.5,
      borderRadius: 1,
      flexShrink: compact ? 0 : undefined,
      px: compact ? 1.5 : undefined,
      bgcolor: selected ? "primary.soft" : "transparent",
      color: selected ? "primary.main" : "text.secondary",
      border: compact ? '1px solid' : 'none',
      borderColor: compact ? (selected ? 'primary.main' : 'divider') : 'transparent',
      '&:hover': { bgcolor: selected ? 'primary.soft' : 'rgba(0,0,0,0.04)' }
    }}
  >
    <ListItemIcon sx={{ color: "inherit", minWidth: compact ? 'unset' : 36, mr: compact ? 0.75 : undefined }}>
      {React.cloneElement(icon, { sx: { fontSize: 18 } })}
    </ListItemIcon>
    <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: selected ? 800 : 600, whiteSpace: 'nowrap' }}>{text}</Typography>} />
  </MuiListItemButton>
);

const SettingSwitch = ({ icon, title, subtitle, checked, onChange }: any) => (
  <ListItem sx={{ px: 0 }}>
    <ListItemIcon sx={{ minWidth: 40 }}>
      {React.cloneElement(icon, { sx: { fontSize: 20 } })}
    </ListItemIcon>
    <ListItemText
      primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{title}</Typography>}
      secondary={<Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    />
    <ListItemSecondaryAction>
      <Switch checked={checked} onChange={onChange} color="primary" size="small" />
    </ListItemSecondaryAction>
  </ListItem>
);


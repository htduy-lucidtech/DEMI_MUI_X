"use client";

import React, { useState, useEffect } from "react";
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
  Paper,
  TextField,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  Translate as TranslateIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { settingsService, SystemSetting } from "@/services/settings.service";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getAll();
      setSystemSettings(data);
    } catch (error) {
      console.error(error);
    }
  };

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
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Sections */}
        <Grid size={{ xs: 12, md: 4 }}>
          <List sx={{ p: 0 }}>
            <ListItemButton selected icon={<PersonIcon />} text={t('account')} />
            <ListItemButton icon={<NotificationsIcon />} text={t('notifications')} />
            <ListItemButton icon={<SecurityIcon />} text={t('security')} />
            <ListItemButton icon={<PaletteIcon />} text={t('appearance')} />
          </List>
        </Grid>

        {/* Right Column: Settings Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {/* System Parameters Card */}
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  {t('systemParamsTitle')}
                </Typography>
                <Grid container spacing={3}>
                  {systemSettings.map((setting) => (
                    <Grid size={{ xs: 12 }} key={setting.id}>
                      <TextField
                        fullWidth
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
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
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
                  <Divider sx={{ my: 2 }} />
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
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  {t('langRegionTitle')}
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('displayLang')}</InputLabel>
                      <Select value="vi" label={t('displayLang')}>
                        <MenuItem value="vi">Tiếng Việt (VI)</MenuItem>
                        <MenuItem value="en">English (EN)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('timezone')}</InputLabel>
                      <Select value="hanoi" label={t('timezone')}>
                        <MenuItem value="hanoi">(GMT+07:00) Hanoi</MenuItem>
                        <MenuItem value="sg">(GMT+08:00) Singapore</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Security */}
            <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "error.light" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: "error.main" }}>
                  {t('securityTitle')}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t('changePassword')}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('changePasswordDesc')}</Typography>
                  </Box>
                  <Button variant="outlined" color="error">{t('updateBtn')}</Button>
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
const ListItemButton = ({ icon, text, selected }: any) => (
  <ListItem sx={{ mb: 1, borderRadius: 2, bgcolor: selected ? "primary.light" : "transparent", color: selected ? "primary.main" : "text.secondary" }}>
    <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{icon}</ListItemIcon>
    <ListItemText primary={<Typography sx={{ fontWeight: 700 }}>{text}</Typography>} />
  </ListItem>
);

const SettingSwitch = ({ icon, title, subtitle, checked, onChange }: any) => (
  <ListItem sx={{ px: 0 }}>
    <ListItemIcon sx={{ minWidth: 48 }}>{icon}</ListItemIcon>
    <ListItemText 
      primary={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>}
      secondary={subtitle}
    />
    <ListItemSecondaryAction>
      <Switch checked={checked} onChange={onChange} color="primary" />
    </ListItemSecondaryAction>
  </ListItem>
);

import { Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";

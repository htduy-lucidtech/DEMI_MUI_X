"use client";

import React, { useState } from "react";
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

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Cài đặt hệ thống
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý các tùy chọn cấu hình và bảo mật tài khoản của bạn.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Sections */}
        <Grid size={{ xs: 12, md: 4 }}>
          <List sx={{ p: 0 }}>
            <ListItemButton selected icon={<PersonIcon />} text="Tài khoản" />
            <ListItemButton icon={<NotificationsIcon />} text="Thông báo" />
            <ListItemButton icon={<SecurityIcon />} text="Bảo mật" />
            <ListItemButton icon={<PaletteIcon />} text="Giao diện" />
          </List>
        </Grid>

        {/* Right Column: Settings Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {/* Notifications Card */}
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  Thông báo
                </Typography>
                <List disablePadding>
                  <SettingSwitch 
                    icon={<EmailIcon color="primary" />} 
                    title="Thông báo qua Email" 
                    subtitle="Nhận cập nhật về các đơn nghỉ phép và tin nhắn qua email."
                    checked={emailNotif}
                    onChange={() => setEmailNotif(!emailNotif)}
                  />
                  <Divider sx={{ my: 2 }} />
                  <SettingSwitch 
                    icon={<NotificationsIcon color="primary" />} 
                    title="Thông báo đẩy (Push)" 
                    subtitle="Hiển thị thông báo trên trình duyệt ngay lập tức."
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
                  Ngôn ngữ & Vùng
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Ngôn ngữ hiển thị</InputLabel>
                      <Select value="vi" label="Ngôn ngữ hiển thị">
                        <MenuItem value="vi">Tiếng Việt (VI)</MenuItem>
                        <MenuItem value="en">English (EN)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Múi giờ</InputLabel>
                      <Select value="hanoi" label="Múi giờ">
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
                  Bảo mật tài khoản
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Thay đổi mật khẩu</Typography>
                    <Typography variant="body2" color="text.secondary">Chúng tôi khuyên bạn nên đổi mật khẩu định kỳ 6 tháng một lần.</Typography>
                  </Box>
                  <Button variant="outlined" color="error">Cập nhật</Button>
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

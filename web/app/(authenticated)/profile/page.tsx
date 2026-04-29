"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  Paper,
  Button,
  Tab,
  Tabs,
  Stack,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  CameraAlt as CameraIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const tr = useTranslations("Layout.roles");
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  const fullName = user.fullName || user.FullName || "User";
  const username = user.username || user.Username || "user";
  const email = user.email || user.Email || "email@example.com";
  const role = user.role || user.Role || "Employee";

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Profile Header Card */}
      <Card sx={{ borderRadius: 4, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", mb: 4 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} sx={{ alignItems: "center" }}>
            <Grid>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "primary.main",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                }}
              >
                {fullName.substring(0, 1).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-1px" }}>
                  {fullName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  @{username} • {tr(role)}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <WorkIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>{tr(role)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>{t("details.location_value")}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
            <Grid>
              <Button variant="contained" startIcon={<EditIcon />}>
                {t("update_profile")}
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label={t("tabs.personal")} sx={{ fontWeight: 700 }} />
              <Tab label={t("tabs.security")} sx={{ fontWeight: 700 }} />
              <Tab label={t("tabs.activity")} sx={{ fontWeight: 700 }} />
            </Tabs>
          </Box>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                {activeTab === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 4, fontWeight: 800 }}>{t("details.title")}</Typography>
                    <Grid container spacing={4}>
                      <ProfileField icon={<PersonIcon color="primary" />} label={t("details.full_name")} value={fullName} />
                      <ProfileField icon={<EmailIcon color="primary" />} label={t("details.email")} value={email} />
                      <ProfileField icon={<PhoneIcon color="primary" />} label={t("details.phone")} value="+84 987 654 321" />
                      <ProfileField icon={<SecurityIcon color="primary" />} label={t("details.role")} value={tr(role)} />
                    </Grid>
                  </Box>
                )}
                {activeTab === 1 && (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <SecurityIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6">{t("tabs.security")}</Typography>
                    <Typography color="text.secondary">{t("status.description")}</Typography>
                    <Button variant="outlined" sx={{ mt: 3 }}>{t("update_profile")}</Button>
                  </Box>
                )}
                {activeTab === 2 && (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">{t("tabs.activity")} - No data.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 4, bgcolor: "primary.main", color: "white" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>{t("status.title")}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>{t("status.description")}</Typography>
                <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 3 }} />
                <Stack spacing={2}>
                  <StatusItem label={t("status.email_verified")} status={t("status.completed")} />
                  <StatusItem label={t("status.personnel_record")} status="90%" />
                  <StatusItem label={t("status.two_fa")} status={t("status.not_enabled")} warning />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

const ProfileField = ({ icon, label, value }: any) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Box sx={{ display: "flex", gap: 2 }}>
      <Avatar sx={{ bgcolor: "background.default", width: 40, height: 40 }}>{icon}</Avatar>
      <Box>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase" }}>{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>{value}</Typography>
      </Box>
    </Box>
  </Grid>
);

const StatusItem = ({ label, status, warning }: any) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
    <Box sx={{
      px: 1.5, py: 0.5, borderRadius: 1,
      bgcolor: warning ? "error.dark" : "rgba(255,255,255,0.2)",
      fontSize: "0.75rem", fontWeight: 800
    }}>
      {status}
    </Box>
  </Box>
);
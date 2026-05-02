"use client";

import React, { useState, useEffect } from "react";
import useRealtimeRefresh from '@/lib/useRealtime';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  Button,
  Tab,
  Tabs,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  useMediaQuery,
  useTheme,

} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  NoteAlt as NoteAltIcon,
  Wc as WcIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  WorkOutlined as WorkOutlineIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { userService } from "@/services/user.service";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const tr = useTranslations("Layout.roles");
  const { user, login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState(0);
  const [fullProfile, setFullProfile] = useState<any>(null);

  const fetchProfile = async () => {
    if (user?.id) {
      try {
        const data = await userService.getById(user.id);
        setFullProfile(data);
      } catch (error) {
        console.error("Failed to fetch full profile:", error);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // Refresh profile when notifications arrive
  useRealtimeRefresh(fetchProfile, ["short"]);

  // Edit Profile State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    identityCardNumber: "",
    bankAccountNumber: "",
    bankName: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Notes Tab State
  const [noteContent, setNoteContent] = useState("");

  // Load notes on mount
  useEffect(() => {
    if (user?.id) {
      const savedNote = localStorage.getItem(`user_note_${user.id}`);
      if (savedNote) setNoteContent(savedNote);
    }
  }, [user?.id]);

  const handleSaveNote = () => {
    if (user?.id) {
      localStorage.setItem(`user_note_${user.id}`, noteContent);
      setSnackbar({ open: true, message: t("notes_tab.save_success") });
    }
  };

  const toggleVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const passwordCriteria = {
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    hasLength: newPassword.length >= 8
  };

  const strengthPoints = Object.values(passwordCriteria).filter(Boolean).length;
  const strengthPercentage = (strengthPoints / 5) * 100;
  const strengthLabel = strengthPoints <= 2 ? t("security_tab.levels.weak") : strengthPoints <= 4 ? t("security_tab.levels.medium") : t("security_tab.levels.strong");
  const strengthColor = strengthPoints <= 2 ? "error.main" : strengthPoints <= 4 ? "warning.main" : "success.main";

  if (!user) return null;

  const fullName = user.fullName || "User";
  const username = user.username || "user";
  const email = user.email || "email@example.com";
  const phone = user.phone || "";
  const role = user.role || "Employee";
  const currentSecurityScore = user.securityScore || 40; // Default to 40 if not set

  const handleOpenEdit = () => {
    setEditForm({
      fullName: fullName,
      email: email,
      phone: phone,
      gender: fullProfile?.employee?.gender || "",
      address: fullProfile?.employee?.address || "",
      identityCardNumber: fullProfile?.employee?.identityCardNumber || "",
      bankAccountNumber: fullProfile?.employee?.bankAccountNumber || "",
      bankName: fullProfile?.employee?.bankName || "",
    });
    setIsEditOpen(true);
  };

  const handleSaveProfile = async () => {
    const currentToken = localStorage.getItem("token") || "";

    try {
      // Logic: 1. Update backend (if user.id exists)
      if (user.id) {
        // Build payload matching the Backend User entity structure
        const updateData = {
          ...user,
          email: editForm.email,
          phone: editForm.phone,
          employee: user.employeeId ? {
            id: user.employeeId,
            fullName: editForm.fullName,
            email: editForm.email,
            gender: editForm.gender,
            address: editForm.address,
            identityCardNumber: editForm.identityCardNumber,
            bankAccountNumber: editForm.bankAccountNumber,
            bankName: editForm.bankName,
          } : undefined
        };

        await userService.update(user.id, updateData);
      }

      // Logic: 2. Update local context & storage
      login(currentToken, { ...user, ...editForm });

      setIsEditOpen(false);
      setSnackbar({ open: true, message: t("messages.update_success") });
    } catch (error: any) {
      console.error("Update failed:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || t("messages.update_failed");
      setSnackbar({ open: true, message: `${t("messages.error")}: ${errorMessage}` });
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setSnackbar({ open: true, message: t("security_tab.missing_info_error") });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: t("security_tab.mismatch_error") });
      return;
    }
    if (currentPassword === newPassword) {
      setSnackbar({ open: true, message: t("security_tab.same_password_error") });
      return;
    }

    const currentToken = localStorage.getItem("token") || "";
    try {
      if (user.id) {
        // Logic: 1. Send dedicated change password request
        await userService.changePassword(user.id, {
          newPassword: newPassword,
          securityScore: strengthPercentage
        });

        // Logic: 2. Update local context & storage
        login(currentToken, { ...user, securityScore: strengthPercentage });

        setNewPassword("");
        setCurrentPassword("");
        setConfirmPassword("");
        setSnackbar({ open: true, message: t("security_tab.update_success") });
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || t("messages.update_failed");
      setSnackbar({ open: true, message: `${t("messages.error")}: ${errorMessage}` });
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Profile Header Card */}
      <Card sx={{ borderRadius: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid", borderColor: "divider", mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Avatar + Info row on mobile: side-by-side */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'row' }, alignItems: 'center', gap: { xs: 2, md: 3 }, mb: 2 }}>
            <Avatar
              sx={{
                width: { xs: 60, sm: 80, md: 100 },
                height: { xs: 60, sm: 80, md: 100 },
                bgcolor: "primary.main",
                fontSize: { xs: '1.5rem', md: '2.5rem' },
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)"
              }}
            >
              {fullName.substring(0, 1).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant={isMobile ? 'h6' : 'h4'}
                sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 0.25, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                @{username}
              </Typography>
              <Stack direction="row" spacing={{ xs: 1.5, sm: 3 }} sx={{ flexWrap: 'wrap' }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <WorkIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>{tr(role)}</Typography>
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: "center", gap: 0.75 }}>
                  <LocationIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>{t("details.location_value")}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <PhoneIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>{phone || t("status.pending")}</Typography>
                </Box>
              </Stack>
            </Box>
            <Button
              variant="contained"
              startIcon={!isMobile ? <EditIcon /> : undefined}
              onClick={handleOpenEdit}
              size={isMobile ? 'small' : 'medium'}
              sx={{ borderRadius: 1, fontWeight: 700, flexShrink: 0, minWidth: { xs: 36, sm: 'auto' }, px: { xs: 1.5, sm: 2 } }}
            >
              {isMobile ? <EditIcon sx={{ fontSize: 18 }} /> : t("update_profile")}
            </Button>
          </Box>

          <Box sx={{ mt: 2, borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant={isMobile ? 'fullWidth' : 'standard'}
              sx={{
                '& .MuiTab-root': { minHeight: 44, fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.875rem' } }
              }}
            >
              <Tab label={t("tabs.personal")} />
              <Tab label={t("tabs.security")} />
              <Tab label={t("tabs.notes")} />
            </Tabs>
          </Box>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Grid container spacing={3} sx={{ flexDirection: { xs: 'column-reverse', md: 'row' } }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 2, md: 1 } }}>
          <Card sx={{ borderRadius: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 800, color: 'primary.main' }}>
                    {t("details.title")}
                  </Typography>
                  <Grid container spacing={3}>
                    <ProfileField icon={<PersonIcon />} label={t("details.full_name")} value={fullName} />
                    <ProfileField icon={<EmailIcon />} label={t("details.email")} value={email} />
                    <ProfileField icon={<PhoneIcon />} label={t("details.phone")} value={phone || t("status.pending")} />
                    <ProfileField icon={<WcIcon />} label={t("details.gender")} value={fullProfile?.employee?.gender || t("status.pending")} />
                    <ProfileField icon={<HomeIcon />} label={t("details.address")} value={fullProfile?.employee?.address || t("status.pending")} />
                    <ProfileField icon={<BadgeIcon />} label={t("details.identityCardNumber")} value={fullProfile?.employee?.identityCardNumber || t("status.pending")} />

                    <Grid size={{ xs: 12 }} sx={{ mt: 1, mb: 1 }}>
                      <Divider><Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{t("details.work_financial_info")}</Typography></Divider>
                    </Grid>

                    <ProfileField icon={<WorkOutlineIcon />} label={t("details.position")} value={fullProfile?.employee?.position || t("status.pending")} />
                    <ProfileField icon={<BusinessIcon />} label={t("details.department")} value={fullProfile?.employee?.department?.name || t("status.pending")} />
                    <ProfileField icon={<SecurityIcon />} label={t("details.role")} value={tr(role)} />
                    <ProfileField icon={<AccountBalanceIcon />} label={t("details.bankName")} value={fullProfile?.employee?.bankName || t("status.pending")} />
                    <ProfileField icon={<AccountBalanceWalletIcon />} label={t("details.bankAccountNumber")} value={fullProfile?.employee?.bankAccountNumber || t("status.pending")} />
                  </Grid>

                  <Alert severity="info" sx={{ mt: 4, borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {t("status.description")}
                    </Typography>
                  </Alert>
                </Box>
              )}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 800, color: 'primary.main' }}>
                    {t("tabs.security")}
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 7 }}>
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>{t("status.two_fa")}</Typography>
                          <Alert severity="warning" sx={{ borderRadius: 1 }}>
                            {t("status.not_enabled")}. {t("status.contact_admin")}
                          </Alert>
                        </Box>

                        <Divider />

                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{t("security_tab.change_password")}</Typography>
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            type={showPasswords.current ? "text" : "password"}
                            label={t("security_tab.current_password")}
                            size="small"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => toggleVisibility('current')} edge="end" size="small">
                                      {showPasswords.current ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                          <TextField
                            fullWidth
                            type={showPasswords.new ? "text" : "password"}
                            label={t("security_tab.new_password")}
                            size="small"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => toggleVisibility('new')} edge="end" size="small">
                                      {showPasswords.new ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                          <TextField
                            fullWidth
                            type={showPasswords.confirm ? "text" : "password"}
                            label={t("security_tab.confirm_password")}
                            size="small"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => toggleVisibility('confirm')} edge="end" size="small">
                                      {showPasswords.confirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                          <Button
                            variant="contained"
                            onClick={handleChangePassword}
                            sx={{ width: 'fit-content', px: 4 }}
                          >
                            {t("security_tab.update_btn")}
                          </Button>
                        </Stack>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                      <Card sx={{ bgcolor: 'grey.50', border: '1px dashed', borderColor: 'divider' }}>
                        <CardContent>
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>{t("security_tab.current_strength")}</Typography>
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: currentSecurityScore <= 40 ? "error.main" : currentSecurityScore <= 70 ? "warning.main" : "success.main" }}>
                              {currentSecurityScore <= 40 ? t("security_tab.levels.weak") : currentSecurityScore <= 70 ? t("security_tab.levels.medium") : t("security_tab.levels.strong")}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{currentSecurityScore}%</Typography>
                          </Box>
                          <Box sx={{ height: 8, bgcolor: 'grey.200', borderRadius: 4, mb: 3, overflow: 'hidden' }}>
                            <Box sx={{ width: `${currentSecurityScore}%`, height: '100%', bgcolor: currentSecurityScore <= 40 ? "error.main" : currentSecurityScore <= 70 ? "warning.main" : "success.main" }} />
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>{t("security_tab.analysis_title")}</Typography>
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: strengthColor }}>{strengthLabel}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{strengthPercentage}%</Typography>
                          </Box>
                          <Box sx={{ height: 8, bgcolor: 'grey.200', borderRadius: 4, mb: 3, overflow: 'hidden' }}>
                            <Box sx={{ width: `${strengthPercentage}%`, height: '100%', bgcolor: strengthColor, transition: 'all 0.3s' }} />
                          </Box>

                          <Stack spacing={1}>
                            <SecurityCheckItem label={t("security_tab.criteria.length")} checked={passwordCriteria.hasLength} />
                            <SecurityCheckItem label={t("security_tab.criteria.upper")} checked={passwordCriteria.hasUpper} />
                            <SecurityCheckItem label={t("security_tab.criteria.lower")} checked={passwordCriteria.hasLower} />
                            <SecurityCheckItem label={t("security_tab.criteria.number")} checked={passwordCriteria.hasNumber} />
                            <SecurityCheckItem label={t("security_tab.criteria.special")} checked={passwordCriteria.hasSpecial} />
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
              {activeTab === 2 && (
                <Box sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>
                    {t("tabs.notes")}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    placeholder={t("notes_tab.placeholder")}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    variant="outlined"
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'grey.50',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveNote}
                      startIcon={<NoteAltIcon />}
                      sx={{ px: 4 }}
                    >
                      {t("notes_tab.save_btn")}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, md: 2 } }}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 1.5, bgcolor: "primary.main", color: "white", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 800 }}>{t("status.title")}</Typography>
                <Stack spacing={2}>
                  <StatusItem
                    label={t("status.email_verified")}
                    status={t("status.completed")}
                    icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  />
                  <StatusItem
                    label={t("status.personnel_record")}
                    status="90%"
                    icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  />
                  <StatusItem
                    label={t("status.two_fa")}
                    status={t("status.not_enabled")}
                    warning
                    icon={<WarningIcon sx={{ fontSize: 16 }} />}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 1.5, border: "1px dashed", borderColor: "primary.main", bgcolor: "primary.50" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", display: 'block', mb: 1 }}>
                  💡 {t("title")}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {t("security_warning")}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{t("update_profile")}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Full Name - full width */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth size="small"
                label={t("details.full_name")}
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            </Grid>
            {/* Email - full width */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth size="small"
                label={t("details.email")}
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Grid>
            {/* Phone + Gender - 2 columns on md */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label={t("details.phone")}
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label={t("details.gender")}
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              />
            </Grid>
            {/* Address - full width */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth size="small"
                label={t("details.address")}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </Grid>
            {/* ID Card - full width */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth size="small"
                label={t("details.identityCardNumber")}
                value={editForm.identityCardNumber}
                onChange={(e) => setEditForm({ ...editForm, identityCardNumber: e.target.value })}
              />
            </Grid>
            {/* Divider */}
            <Grid size={{ xs: 12 }}>
              <Divider>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {t("details.bankName")} & {t("details.bankAccountNumber")}
                </Typography>
              </Divider>
            </Grid>
            {/* Bank Name + Account - 2 columns on sm */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label={t("details.bankName")}
                value={editForm.bankName}
                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label={t("details.bankAccountNumber")}
                value={editForm.bankAccountNumber}
                onChange={(e) => setEditForm({ ...editForm, bankAccountNumber: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setIsEditOpen(false)} sx={{ fontWeight: 700 }}>
            {t("actions.cancel")}
          </Button>
          <Button variant="contained" onClick={handleSaveProfile} sx={{ fontWeight: 700, borderRadius: 1 }}>
            {t("update_profile")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}

const ProfileField = ({ icon, label, value }: any) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Box sx={{ display: "flex", gap: 1.5, alignItems: 'center' }}>
      <Avatar sx={{ bgcolor: "primary.50", color: "primary.main", width: 36, height: 36 }}>
        {React.cloneElement(icon, { sx: { fontSize: 20 } })}
      </Avatar>
      <Box>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: '0.65rem' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  </Grid>
);

const StatusItem = ({ label, status, warning, icon }: any) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {icon}
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
    </Stack>
    <Box sx={{
      px: 1.25, py: 0.25, borderRadius: 1,
      bgcolor: warning ? "error.dark" : "rgba(255,255,255,0.2)",
      fontSize: "0.7rem", fontWeight: 800
    }}>
      {status}
    </Box>
  </Box>
);

const SecurityCheckItem = ({ label, checked }: { label: string; checked: boolean }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
    <CheckCircleIcon sx={{ fontSize: 16, color: checked ? 'success.main' : 'grey.300' }} />
    <Typography variant="caption" sx={{ color: checked ? 'text.primary' : 'text.secondary', fontWeight: 500 }}>
      {label}
    </Typography>
  </Stack>
);
"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Container,
  Paper,
  IconButton,
  InputAdornment
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const { login } = useAuth();
  const t = useTranslations("Login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await authService.login({ username, password });
      
      // authService đã xử lý lưu token vào Cookies/LocalStorage
      // Chúng ta gọi login(context) để cập nhật state toàn cục
      login(data.token, data.user);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t("login_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5"
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 3, borderRadius: 1.5 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "primary.main" }}>
                {t("title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("login")}
              </Typography>
            </Box>

            <form onSubmit={handleLogin}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  fullWidth
                  label={t("username")}
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label={t("password")}
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontWeight: "bold",
                    bgcolor: "primary.main",
                    '&:hover': { bgcolor: "primary.dark" }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t("login_button")
                  )}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";

// Material-UI Components
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Paper,
  Divider,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Fade,
  Grow,
  Zoom,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// Material-UI Icons
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SecurityIcon from "@mui/icons-material/Security";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import StarsIcon from "@mui/icons-material/Stars";

// Emotion Styled Components
import { styled } from "@mui/material/styles";

// Enhanced Responsive Styled Components
const LoginContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: theme.spacing(2),
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(6),
  },
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(8),
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
  },
}));

const LoginCard = styled(Card)(({ theme }) => ({
  borderRadius: 32,
  boxShadow: "0 30px 100px rgba(0, 0, 0, 0.3), 0 15px 45px rgba(102, 126, 234, 0.2)",
  overflow: "hidden",
  width: "100%",
  maxWidth: "1200px",
  position: "relative",
  zIndex: 1,
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(10px)",
  [theme.breakpoints.down('lg')]: {
    maxWidth: "800px",
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: "600px",
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: 24,
    maxWidth: "95%",
    margin: theme.spacing(1),
  },
}));

const LoginGrid = styled(Grid)(({ theme }) => ({
  minHeight: "600px",
  [theme.breakpoints.down('md')]: {
    minHeight: "500px",
  },
}));

const BrandSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: theme.spacing(6),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.05)",
  },
}));

const LogoAvatar = styled(Avatar)(({ theme }) => ({
  width: 90,
  height: 90,
  marginBottom: theme.spacing(3),
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  color: "#667eea",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
  border: "3px solid rgba(255, 255, 255, 0.3)",
  [theme.breakpoints.down('md')]: {
    width: 70,
    height: 70,
  },
}));

const FeaturesList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: "left",
  width: "100%",
  maxWidth: 300,
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  color: "rgba(255, 255, 255, 0.9)",
}));

const FormSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(8),
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: "#2d3748",
  marginBottom: theme.spacing(0.5),
  fontSize: "2rem",
  [theme.breakpoints.down('md')]: {
    fontSize: "1.75rem",
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: "1.5rem",
  },
}));

const FormSubtitle = styled(Typography)(({ theme }) => ({
  color: "#718096",
  marginBottom: theme.spacing(4),
  fontSize: "1.1rem",
  [theme.breakpoints.down('sm')]: {
    fontSize: "1rem",
  },
}));

const FormField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    transition: "all 0.3s ease",
    fontSize: "1rem",
    "&:hover": {
      backgroundColor: "#f1f5f9",
    },
    "&.Mui-focused": {
      backgroundColor: "white",
      boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
    fontWeight: 500,
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  padding: theme.spacing(2),
  borderRadius: 16,
  fontWeight: 600,
  fontSize: "1.1rem",
  height: 56,
  textTransform: "none",
  boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 15px 35px rgba(102, 126, 234, 0.5)",
  },
  "&:active": {
    transform: "translateY(-1px)",
  },
  "&.Mui-disabled": {
    background: "#cbd5e1",
    transform: "none",
    boxShadow: "none",
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: "1rem",
    height: 50,
    padding: theme.spacing(1.5),
  },
}));

const SocialButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(1.75),
  border: "2px solid #e2e8f0",
  fontWeight: 500,
  color: "#4a5568",
  height: 56,
  textTransform: "none",
  backgroundColor: "white",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#667eea",
    backgroundColor: "#f8fafc",
    transform: "translateY(-2px)",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  },
  [theme.breakpoints.down('sm')]: {
    height: 50,
    fontSize: "0.9rem",
  },
}));

const SecurityBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(3),
  backgroundColor: "#f0fdf4",
  borderRadius: 16,
  color: "#059669",
  border: "1px solid #86efac",
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    flexDirection: "column",
    textAlign: "center",
  },
}));

const FloatingElements = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: "none",
  zIndex: 0,
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: "absolute",
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
}));

// Validation Schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // React Query Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("access_token", data.data.access_token);
        localStorage.setItem("refresh_token", data.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        dispatch(
          setCredentials({
            user: data.data.user,
            accessToken: data.data.access_token,
          })
        );
        toast.success("🎉 Login successful! Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    },
    onError: (error) => {
      let errorMessage = "Login failed. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (typeof errors === "object") {
          errorMessage = Object.values(errors)[0] || errorMessage;
        } else if (Array.isArray(errors)) {
          errorMessage = errors[0]?.message || errorMessage;
        }
      }
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  const handleGoogleLogin = () => {
    toast.info("🔐 Google login would be implemented with Firebase");
  };

  const handleMicrosoftLogin = () => {
    toast.info("🔐 Microsoft login would be implemented");
  };

  return (
    <>
      <CssBaseline />
      <LoginContainer maxWidth={false}>
        {/* Floating Background Elements */}
        <FloatingElements>
          <FloatingElement sx={{ top: "10%", left: "5%", width: 100, height: 100, animation: "float 6s ease-in-out infinite" }} />
          <FloatingElement sx={{ top: "20%", right: "10%", width: 150, height: 150, animation: "float 8s ease-in-out infinite 1s" }} />
          <FloatingElement sx={{ bottom: "15%", left: "15%", width: 80, height: 80, animation: "float 7s ease-in-out infinite 2s" }} />
        </FloatingElements>

        <LoginCard>
          <LoginGrid container>
            {/* Left Brand Section */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Grow in={true} timeout={1000}>
                <BrandSection>
                  <LogoAvatar>
                    <CorporateFareIcon fontSize="large" />
                  </LogoAvatar>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 800, 
                    color: "white",
                    fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem', xl: '3.5rem' },
                    mb: 2
                  }}>
                    Company Portal
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: "rgba(255, 255, 255, 0.9)",
                    mb: 4,
                    fontSize: { xs: '1.1rem', lg: '1.3rem' }
                  }}>
                    Secure Business Management Platform
                  </Typography>
                  
                  <FeaturesList>
                    <FeatureItem>
                      <VerifiedUserIcon sx={{ fontSize: 20 }} />
                      <Typography variant="body1">Enterprise-grade Security</Typography>
                    </FeatureItem>
                    <FeatureItem>
                      <StarsIcon sx={{ fontSize: 20 }} />
                      <Typography variant="body1">Real-time Dashboard Analytics</Typography>
                    </FeatureItem>
                    <FeatureItem>
                      <LockOutlinedIcon sx={{ fontSize: 20 }} />
                      <Typography variant="body1">Role-based Access Control</Typography>
                    </FeatureItem>
                    <FeatureItem>
                      <SecurityIcon sx={{ fontSize: 20 }} />
                      <Typography variant="body1">GDPR Compliant</Typography>
                    </FeatureItem>
                  </FeaturesList>
                </BrandSection>
              </Grow>
            </Grid>

            {/* Right Form Section */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Zoom in={true} timeout={1200}>
                <FormSection>
                  <Box sx={{ maxWidth: 500, margin: "0 auto", width: "100%" }}>
                    <FormTitle variant="h1">
                      Welcome Back
                    </FormTitle>
                    <FormSubtitle variant="body1">
                      Sign in to continue to your company dashboard
                    </FormSubtitle>

                    {loginMutation.isError && !loginMutation.error?.response && (
                      <Fade in={true}>
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mb: 3, 
                            borderRadius: 2,
                            backgroundColor: "#fee2e2",
                            border: "1px solid #fca5a5"
                          }}
                        >
                          Network error. Please check your connection.
                        </Alert>
                      </Fade>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                      {/* Email Field */}
                      <FormField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus={!isSmallScreen}
                        {...register("email")}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        sx={{ mb: 3 }}
                      />

                      {/* Password Field */}
                      <FormField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        autoComplete="current-password"
                        {...register("password")}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ color: "#64748b" }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />

                      {/* Remember Me & Forgot Password */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 4,
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              value="remember"
                              color="primary"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              sx={{
                                color: "#667eea",
                                '&.Mui-checked': {
                                  color: "#667eea",
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" color="text.secondary">
                              Remember me for 30 days
                            </Typography>
                          }
                        />
                        <Link
                          href="#"
                          variant="body2"
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info("📧 Password reset email would be sent");
                          }}
                          sx={{ 
                            fontWeight: 600,
                            color: "#667eea",
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" }
                          }}
                        >
                          Forgot password?
                        </Link>
                      </Box>

                      {/* Submit Button */}
                      <SubmitButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loginMutation.isPending}
                        sx={{ mb: 3 }}
                        endIcon={!loginMutation.isPending && <ArrowForwardIcon />}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <CircularProgress size={24} sx={{ mr: 1.5, color: "white" }} />
                            Authenticating...
                          </>
                        ) : (
                          "Sign In to Dashboard"
                        )}
                      </SubmitButton>

                      {/* Divider */}
                      <Box sx={{ position: "relative", my: 4 }}>
                        <Divider>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              backgroundColor: "white", 
                              px: 2,
                              fontWeight: 500
                            }}
                          >
                            Or sign in with
                          </Typography>
                        </Divider>
                      </Box>

                      {/* Social Login Buttons */}
                      <Stack 
                        direction={{ xs: "column", sm: "row" }} 
                        spacing={2} 
                        sx={{ mb: 4 }}
                      >
                        <SocialButton
                          fullWidth
                          variant="outlined"
                          startIcon={<GoogleIcon />}
                          onClick={handleGoogleLogin}
                        >
                          Continue with Google
                        </SocialButton>
                        <SocialButton
                          fullWidth
                          variant="outlined"
                          startIcon={<DesktopWindowsIcon />}
                          onClick={handleMicrosoftLogin}
                        >
                          Continue with Microsoft
                        </SocialButton>
                      </Stack>

                      {/* Register Link */}
                      <Box sx={{ 
                        textAlign: "center", 
                        mt: 4,
                        pt: 3,
                        borderTop: "1px solid #e2e8f0"
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          New to Company Portal?{" "}
                          <Link
                            component="button"
                            variant="body1"
                            onClick={() => navigate("/register")}
                            sx={{ 
                              fontWeight: 700, 
                              color: "#667eea",
                              textDecoration: "none",
                              "&:hover": { 
                                textDecoration: "underline",
                                color: "#764ba2"
                              }
                            }}
                          >
                            Create an account
                          </Link>
                        </Typography>
                      </Box>
                    </Box>

                    {/* Footer Links */}
                    <Box sx={{ 
                      mt: 4, 
                      pt: 2,
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "center",
                      gap: 3,
                      flexWrap: "wrap"
                    }}>
                      <Link
                        href="#"
                        variant="caption"
                        color="text.secondary"
                        onClick={(e) => e.preventDefault()}
                        sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        Terms of Service
                      </Link>
                      <Link
                        href="#"
                        variant="caption"
                        color="text.secondary"
                        onClick={(e) => e.preventDefault()}
                        sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        href="#"
                        variant="caption"
                        color="text.secondary"
                        onClick={(e) => e.preventDefault()}
                        sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        Support
                      </Link>
                      <Link
                        href="#"
                        variant="caption"
                        color="text.secondary"
                        onClick={(e) => e.preventDefault()}
                        sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        Contact Sales
                      </Link>
                    </Box>
                  </Box>
                </FormSection>
              </Zoom>
            </Grid>
          </LoginGrid>
        </LoginCard>
      </LoginContainer>

      {/* Add floating animation keyframes */}
      <style jsx="true">{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
    </>
  );
}
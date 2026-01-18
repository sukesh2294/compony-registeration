import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Avatar,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Link,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { authAPI } from "../api";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength checker
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "None", color: "#ccc" };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  const strength = [
    { label: "Very Weak", color: "#ff0000" },
    { label: "Weak", color: "#ff5722" },
    { label: "Fair", color: "#ff9800" },
    { label: "Good", color: "#4caf50" },
    { label: "Strong", color: "#2e7d32" }
  ];
  
  return { score, ...strength[score] };
};

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  width: 56,
  height: 56,
}));

const StepIcon = styled(Box)(({ active, completed }) => ({
  width: 24,
  height: 24,
  borderRadius: "50%",
  backgroundColor: completed ? "#4caf50" : active ? "#2196f3" : "#e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontSize: 12,
}));

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    mobile_no: "",
    gender: "m",
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "None", color: "#ccc" });

  // Form steps
  const steps = ['Personal Info', 'Account Details', 'Confirmation'];

  // Update password strength on password change
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password));
  }, [formData.password]);

  // Handle input changes
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Personal info validation (Step 0)
    if (activeStep === 0) {
      if (!formData.full_name.trim()) {
        newErrors.full_name = "Full name is required";
      }
      if (!formData.mobile_no.trim()) {
        newErrors.mobile_no = "Mobile number is required";
      } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.mobile_no.replace(/\s/g, ''))) {
        newErrors.mobile_no = "Enter a valid mobile number with country code";
      }
    }

    // Account details validation (Step 1)
    if (activeStep === 1) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (passwordStrength.score < 2) {
        newErrors.password = "Password is too weak";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    return newErrors;
  };

  // Handle step navigation
  const handleNext = () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      if (activeStep < steps.length - 1) {
        setActiveStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Prepare data for backend
      const registrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        gender: formData.gender,
        mobile_no: formData.mobile_no.trim(),
        signup_type: "e", // Email signup type
      };

      // Call backend API
      const response = await authAPI.register(registrationData);
      
      if (response.data.success) {
        // Store tokens if returned
        if (response.data.data?.access_token) {
          localStorage.setItem("access_token", response.data.data.access_token);
        }
        if (response.data.data?.refresh_token) {
          localStorage.setItem("refresh_token", response.data.data.refresh_token);
        }
        
        setSuccess(true);
        setTimeout(() => {
          navigate("/company-registration");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      
      // Handle backend server errors (500) with HTML response
      if (error.isBackendError || (error.response?.status >= 500 && error.response?.data && typeof error.response.data === "string" && error.response.data.includes("<!doctype html>"))) {
        setErrors({ 
          _general: "Server error (500): Backend encountered an internal error. Please try again later or contact support. Check backend logs for details."
        });
        console.error("Backend Server Error - Check backend logs for details");
        setLoading(false);
        return;
      }
      
      // Handle HTML response (configuration issue)
      if (error.isHtmlResponse && !error.isBackendError) {
        setErrors({ 
          _general: "API Configuration Error: VITE_API_URL_PROD is not set. Please check deployment settings."
        });
        setLoading(false);
        return;
      }
      
      // Handle API errors
      if (error.response?.data) {
        const apiErrors = error.response.data;
        
        // Map backend errors to form fields
        const fieldErrors = {};
        if (apiErrors.email) fieldErrors.email = Array.isArray(apiErrors.email) ? apiErrors.email[0] : apiErrors.email;
        if (apiErrors.mobile_no) fieldErrors.mobile_no = Array.isArray(apiErrors.mobile_no) ? apiErrors.mobile_no[0] : apiErrors.mobile_no;
        if (apiErrors.password) fieldErrors.password = Array.isArray(apiErrors.password) ? apiErrors.password[0] : apiErrors.password;
        if (apiErrors.full_name) fieldErrors.full_name = Array.isArray(apiErrors.full_name) ? apiErrors.full_name[0] : apiErrors.full_name;
        
        setErrors(fieldErrors);
        
        // Show general error message
        if (apiErrors.message) {
          setErrors(prev => ({
            ...prev,
            _general: apiErrors.message
          }));
        } else if (apiErrors.errors && typeof apiErrors.errors === "object") {
          // Handle nested errors object
          const firstError = Object.values(apiErrors.errors)[0];
          if (firstError) {
            setErrors(prev => ({
              ...prev,
              _general: Array.isArray(firstError) ? firstError[0] : firstError
            }));
          }
        }
      } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        setErrors({ _general: "Network error. Please check your connection and try again." });
      } else {
        setErrors({ _general: error.message || "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const renderPasswordStrength = () => (
    <Box sx={{ mt: 1, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Password strength:
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            ml: 1, 
            fontWeight: "bold",
            color: passwordStrength.color 
          }}
        >
          {passwordStrength.label}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {[1, 2, 3, 4].map((index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              height: 4,
              backgroundColor: index <= passwordStrength.score ? passwordStrength.color : "#e0e0e0",
              borderRadius: 2,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        • Minimum 8 characters<br/>
        • At least one uppercase letter<br/>
        • At least one number<br/>
        • At least one special character
      </Typography>
    </Box>
  );

  // Step 1: Personal Information
  const renderPersonalInfoStep = () => (
    <>
      <Typography variant="h6" gutterBottom color="primary">
        Personal Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter your personal details to create your account.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange("full_name")}
            error={!!errors.full_name}
            helperText={errors.full_name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            fullWidth
            label="Mobile Number"
            name="mobile_no"
            value={formData.mobile_no}
            onChange={handleChange("mobile_no")}
            error={!!errors.mobile_no}
            helperText={errors.mobile_no || "Include country code (e.g., +91XXXXXXXXXX)"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange("gender")}
            variant="outlined"
            required
          >
            <MenuItem value="m">Male</MenuItem>
            <MenuItem value="f">Female</MenuItem>
            <MenuItem value="o">Other</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </>
  );

  // Step 2: Account Details
  const renderAccountDetailsStep = () => (
    <>
      <Typography variant="h6" gutterBottom color="primary">
        Account Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Set up your login credentials.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            required
          />
        </Grid>
        
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange("password")}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            required
          />
          {renderPasswordStrength()}
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            required
          />
        </Grid>
      </Grid>
    </>
  );

  // Step 3: Confirmation
  const renderConfirmationStep = () => (
    <>
      <Typography variant="h6" gutterBottom color="primary">
        Review & Confirm
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review your information before submitting.
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Personal Information
              </Typography>
              <Typography variant="body1">{formData.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.gender === "m" ? "Male" : formData.gender === "f" ? "Female" : "Other"}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Details
              </Typography>
              <Typography variant="body1">{formData.email}</Typography>
              <Typography variant="body2">{formData.mobile_no}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Box sx={{ bgcolor: "background.default", p: 2, borderRadius: 1 }}>
        <FormControlLabel
          control={<Checkbox />}
          label={
        <Typography variant="caption" color="text.secondary">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </Typography>
          }
          />
      </Box>
    </>
  );

  // Success state
  if (success) {
    return (
      <Container component="main" maxWidth="sm">
        <StyledPaper>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your account has been created successfully.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to company registration...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 2 }} />
          </Box>
        </StyledPaper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <StyledPaper>
        <StyledAvatar>
          <Lock />
        </StyledAvatar>
        
        <Typography component="h1" variant="h5" sx={{ mt: 1, mb: 3 }}>
          Create Company Account
        </Typography>
        
        {/* Stepper */}
        <Box sx={{ width: "100%", mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  <StepIcon 
                    active={index === activeStep ? "true" : "false"}
                    completed={index < activeStep ? "true" : "false"}
                  >
                    {index + 1}
                  </StepIcon>
                  <Typography variant="caption">{label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {/* Error Alert */}
        {errors._general && (
          <Alert 
            severity="error" 
            sx={{ width: "100%", mb: 3 }}
            icon={<ErrorIcon />}
          >
            {errors._general}
          </Alert>
        )}
        
        {/* Form Content */}
        <Box component="form" sx={{ width: "100%" }}>
          {activeStep === 0 && renderPersonalInfoStep()}
          {activeStep === 1 && renderAccountDetailsStep()}
          {activeStep === 2 && renderConfirmationStep()}
          
          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                "Register"
              ) : (
                "Next"
              )}
            </Button>
          </Box>
        </Box>
        
        {/* Divider */}
        <Divider sx={{ my: 3, width: "100%" }} />
        
        {/* Login Link */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => navigate("/login")}
              sx={{ fontWeight: "bold" }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  );
}
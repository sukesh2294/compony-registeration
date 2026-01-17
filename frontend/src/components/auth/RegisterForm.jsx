import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/authService';
import { setCredentials, setUser } from '../../store/authSlice';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    mobile_no: '',
    gender: 'm',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.mobile_no) {
      newErrors.mobile_no = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile_no.replace(/\D/g, ''))) {
      newErrors.mobile_no = 'Please enter a valid 10-digit mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert({ type: '', message: '' });

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        mobile_no: formData.mobile_no,
        gender: formData.gender,
      });
      
      if (response.success) {
        setAlert({ type: 'success', message: 'Registration successful! Redirecting...' });
        
        // Store credentials in Redux (tokens + user)
        if (response.data?.data?.access_token && response.data?.data?.user) {
          dispatch(setCredentials({
            user: response.data.data.user,
            accessToken: response.data.data.access_token,
            refreshToken: response.data.data.refresh_token
          }));
        }
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/company-registration');
        }, 1500);
      } else {
        setAlert({ 
          type: 'error', 
          message: response.message || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'An error occurred. Please try again.';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {alert.message && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Full Name"
        name="full_name"
        type="text"
        value={formData.full_name}
        onChange={handleChange}
        error={!!errors.full_name}
        helperText={errors.full_name}
        margin="normal"
        disabled={loading}
        placeholder="John Doe"
      />

      <TextField
        fullWidth
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
        disabled={loading}
        placeholder="you@example.com"
      />

      <TextField
        fullWidth
        label="Mobile Number"
        name="mobile_no"
        type="tel"
        value={formData.mobile_no}
        onChange={handleChange}
        error={!!errors.mobile_no}
        helperText={errors.mobile_no}
        margin="normal"
        disabled={loading}
        placeholder="9876543210"
      />

      <TextField
        fullWidth
        select
        label="Gender"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        margin="normal"
        disabled={loading}
      >
        <MenuItem value="m">Male</MenuItem>
        <MenuItem value="f">Female</MenuItem>
        <MenuItem value="o">Other</MenuItem>
      </TextField>

      <TextField
        fullWidth
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        margin="normal"
        disabled={loading}
        placeholder="Enter your password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleTogglePasswordVisibility}
                edge="end"
                disabled={loading}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Confirm Password"
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        margin="normal"
        disabled={loading}
        placeholder="Confirm your password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleToggleConfirmPasswordVisibility}
                edge="end"
                disabled={loading}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ 
          mt: 3, 
          mb: 2,
          py: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600
        }}
        disabled={loading}
      >
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <MuiLink component={RouterLink} to="/login" color="primary">
            Log in here
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/authService';
import { setCredentials, setUser } from '../../store/authSlice';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert({ type: '', message: '' });

    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success) {
        setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
        
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
          navigate('/dashboard');
        }, 1500);
      } else {
        setAlert({ 
          type: 'error', 
          message: response.message || 'Login failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
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
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        margin="normal"
        disabled={loading}
        placeholder="Enter your password"
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
            Logging in...
          </>
        ) : (
          'Log In'
        )}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <MuiLink component={RouterLink} to="/register" color="primary">
            Sign up here
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;

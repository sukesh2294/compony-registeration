// frontend/src/components/common/VerifyOtpPopup.jsx
import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { keyframes } from "@emotion/react";
import PropTypes from 'prop-types';



import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// Material-UI Icons
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockClockIcon from "@mui/icons-material/LockClock";

// Styled Components
import { styled } from "@mui/material/styles";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 28,
    padding: theme.spacing(1),
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    border: "1px solid rgba(102, 126, 234, 0.1)",
    boxShadow: "0 40px 80px rgba(0, 0, 0, 0.25), 0 20px 50px rgba(102, 126, 234, 0.15)",
    overflow: "hidden",
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(2),
      maxWidth: "calc(100% - 32px)",
    },
  },
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  padding: theme.spacing(3),
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -10,
    left: "50%",
    transform: "translateX(-50%)",
    width: 60,
    height: 4,
    background: "white",
    borderRadius: 2,
  },
}));

const OtpInput = styled(TextField,{
  shouldForwardProp: (prop) => prop !== 'error',
})(({ theme, error }) => ({
  "& .MuiOutlinedInput-root": {
    width: 55,
    height: 65,
    borderRadius: 16,
    background: error ? "#ffeaea" : "#f1f5f9",
    border: error ? "2px solid #ff4444" : "2px solid #e2e8f0",
    fontSize: "1.8rem",
    fontWeight: 700,
    textAlign: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: error ? "#ff4444" : "#667eea",
    },
    "&.Mui-focused": {
      borderColor: error ? "#ff4444" : "#764ba2",
      boxShadow: error ? "0 0 0 3px rgba(255, 68, 68, 0.1)" : "0 0 0 3px rgba(102, 126, 234, 0.1)",
      background: "white",
    },
  },
  "& input": {
    textAlign: "center",
    padding: 0,
  },
  [theme.breakpoints.down('sm')]: {
    "& .MuiOutlinedInput-root": {
      width: 45,
      height: 55,
      fontSize: "1.5rem",
      borderRadius: theme.spacing(2),
    },
  },
}));

const VerifyButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  padding: theme.spacing(1.5, 4),
  borderRadius: 16,
  fontWeight: 700,
  fontSize: "1rem",
  textTransform: "none",
  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 25px rgba(102, 126, 234, 0.4)",
  },
  "&:disabled": {
    background: "#cbd5e1",
    transform: "none",
    boxShadow: "none",
  },
}));

export default function VerifyOtpPopup ({
  open,
  onClose,
  onVerify,
  onResend,
  email,
  phone,
  context = "login",
  loading = false,
  resendLoading = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  
  const inputRefs = useRef([]);
  
  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer, open]);
  
  // Reset OTP when modal opens
  useEffect(() => {
    if (open) {
      setOtp(["", "", "", "", "", ""]);
      setTimer(60);
      setCanResend(false);
      setError("");
      
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError("");
      
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      if (newOtp.every(digit => digit !== "") && index === 5) {
        handleSubmit();
      }
    }
  };
  
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // Clear current field and stay there
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      setError("");
      inputRefs.current[5]?.focus();
    }
  };
  
  const handleSubmit = () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      
      const emptyIndex = otp.findIndex(digit => !digit);
      if (emptyIndex !== -1) {
        inputRefs.current[emptyIndex]?.focus();
      }
      return;
    }
    
    if (!/^\d{6}$/.test(otpCode)) {
      setError("OTP must contain only numbers");
      return;
    }
    
    onVerify(otpCode);
  };
  
    const handleResend = () => {
    if (canResend && onResend && !resendLoading) {
      onResend();
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  };
  
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Slide}
      transitionDuration={300}
    >
      <DialogHeader>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ background: "rgba(255,255,255,0.2)" }}>
              <VerifiedUserIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Verify Your Identity
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {context === "login" ? "Secure Login" : "Complete Registration"}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogHeader>
      
      <DialogContent sx={{ p: 4 }}>
        <Fade in={true}>
          <Box>
            <Typography variant="body1" sx={{ color: "#4a5568", mb: 3, textAlign: "center" }}>
              Enter the 6-digit verification code sent to:
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 4 }}>
              {email ? <EmailIcon sx={{ color: "#667eea" }} /> : <PhoneIphoneIcon sx={{ color: "#667eea" }} />}
              <Typography variant="h6" sx={{ color: "#2d3748", fontWeight: 600 }}>
                {email || phone}
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            
            <Box onPaste={handlePaste} sx={{ mb: 4 }}>
              <Stack direction="row" spacing={isMobile ? 1.5 : 2} justifyContent="center">
                {otp.map((digit, index) => (
                  <OtpInput
                    key={index}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    inputProps={{ maxLength: 1 }}
                    error={!!error}
                  />
                ))}
              </Stack>
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LockClockIcon sx={{ color: "#64748b", fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Expires in: 
                  <Box component="span" sx={{ fontWeight: 700, ml: 1, color: "#ff6b6b" }}>
                    {formatTime(timer)}
                  </Box>
                </Typography>
              </Box>
              
              <Button
                onClick={handleResend}
                disabled={!canResend || resendLoading}
                startIcon={resendLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                sx={{
                  color: canResend ? "#667eea" : "#94a3b8",
                  fontWeight: 600,
                  textTransform: "none",
                  minWidth: 120,
                }}
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </Button>
            </Box>
            
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", textAlign: "center", mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 12, verticalAlign: "middle", mr: 0.5 }} />
              This extra step keeps your account secure
            </Typography>
          </Box>
        </Fade>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Box sx={{ width: "100%" }}>
          <VerifyButton
              onClick={handleSubmit}
              disabled={loading || otp.some(digit => digit === "")}
              fullWidth
              startIcon={loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
              sx={{ position: "relative" }}
            >
              {loading ? (
                <>
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      position: "absolute", 
                      left: "50%", 
                      marginLeft: "-12px",
                      color: "white" 
                    }} 
                  />
                  <span style={{ opacity: 0 }}>Verify & Continue</span>
                </>
              ) : (
                "Verify & Continue"
              )}
            </VerifyButton>
        </Box>
      </DialogActions>
    </StyledDialog>
    
  );
}
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { companyRegistrationSchema } from '../../utils/validations';
import { registerCompany } from '../../store/slices/companySlice';
import Step1CompanyDetails from './Step1CompanyDetails';
import Step2AddressDetails from './Step2AddressDetails';
import Step3UploadImages from './Step3UploadImages';
import Step4Review from './Step4Review';

const steps = [
  'Company Details',
  'Address',
  'Upload Images',
  'Review & Submit'
];

const CompanyForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const methods = useForm({
    resolver: yupResolver(companyRegistrationSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      website: '',
      description: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      country: '',
      state: '',
      postalCode: '',
      logoUrl: '',
      bannerUrl: ''
    },
    mode: 'onChange'
  });

  const { handleSubmit, trigger, getValues } = methods;

  const handleNext = async () => {
    let isValid = false;
    
    switch (activeStep) {
      case 0:
        isValid = await trigger(['companyName', 'industry']);
        break;
      case 1:
        isValid = await trigger(['addressLine1', 'city', 'country', 'postalCode']);
        break;
      case 2:
        // Image upload is optional, so always valid
        isValid = true;
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      await dispatch(registerCompany(data)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Company registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1CompanyDetails />;
      case 1:
        return <Step2AddressDetails />;
      case 2:
        return <Step3UploadImages />;
      case 3:
        return <Step4Review data={getValues()} />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Company Registration
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Complete your company profile in 4 simple steps
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <FormProvider {...methods}>
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Complete Registration'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </FormProvider>
    </Paper>
  );
};

export default CompanyForm;
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Container,
  StepConnector,
  stepConnectorClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CheckCircle2, ArrowRight } from "lucide-react";
import * as yup from "yup";
import { registerCompany } from "../store/slices/companySlice";
import Step1CompanyDetails from "../components/company/Step1CompanyDetails";
import Step2AddressDetails from "../components/company/Step2AddressDetails";
import Step3UploadImages from "../components/company/Step3UploadImages";
import Step4Review from "../components/company/Step4Review";

/* ---------------- Styled stepper connector & icon ---------------- */

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#2196F3",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
  },
}));

const QontoStepIconRoot = styled("div")(({ ownerState }) => ({
  color: "#eaeaf0",
  display: "flex",
  height: 22,
  alignItems: "center",
  ...(ownerState?.active && {
    color: "#2196F3",
  }),
  "& .QontoStepIcon-completedIcon": {
    color: "#4caf50",
    fontSize: 18,
  },
  "& .QontoStepIcon-circle": {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
}));

function QontoStepIcon(props) {
  const { active, completed, className } = props;
  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <CheckCircle2 className="QontoStepIcon-completedIcon" size={20} />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

/* ---------------- Validation schema (fixed) ----------------
   - website accepts a valid URL or empty string
   - use transform to convert empty string -> null so url() isn't enforced
*/
const companyRegistrationSchema = yup.object().shape({
  companyName: yup.string().required("Company name is required").min(3, "Minimum 3 characters"),
  industry: yup.string().required("Industry is required"),
  website: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired()
    .url("Enter a valid URL"),
  addressLine1: yup.string().required("Address is required"),
  addressLine2: yup.string().notRequired(),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  country: yup.string().required("Country is required"),
  postalCode: yup.string().required("Postal code is required"),
});

/* ---------------- Steps ---------------- */
const steps = ["Company Details", "Address", "Images", "Review & Submit"];

/* ---------------- Page Component ---------------- */
const CompanyRegistrationPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const methods = useForm({
    resolver: yupResolver(companyRegistrationSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      website: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      country: "",
      state: "",
      postalCode: "",
      // include image placeholders if your Step3 expects them (e.g. logo, gallery)
      logo: null,
      gallery: [],
    },
    mode: "onChange",
  });

  const { handleSubmit, trigger, getValues } = methods;

  const handleNext = async () => {
    let fieldsToValidate = [];

    switch (activeStep) {
      case 0:
        fieldsToValidate = ["companyName", "industry", "website"];
        break;
      case 1:
        fieldsToValidate = ["addressLine1", "city", "country", "state", "postalCode"];
        break;
      case 2:
        // Image step typically has its own internal validation (skip or handle inside Step3)
        setActiveStep((p) => p + 1);
        return;
      default:
        break;
    }

    try {
      const isValid = await trigger(fieldsToValidate);
      if (isValid) {
        setActiveStep((p) => p + 1);
        setError("");
      } else {
        setError("Please fix the validation errors before continuing.");
      }
    } catch (err) {
      setError("Validation failed. Please check the form.");
    }
  };

  const handleBack = () => {
    setActiveStep((p) => Math.max(0, p - 1));
    setError("");
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      // If Step3 produced files, you might need to convert to FormData here.
      // Example:
      // const formData = new FormData();
      // Object.entries(data).forEach(([k, v]) => formData.append(k, v));
      // await dispatch(registerCompany(formData)).unwrap();

      await dispatch(registerCompany(data)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      // unwrap() typically throws the error message, but handle defensively
      const msg = err?.message || err || "Company registration failed. Please try again.";
      setError(msg);
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

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "white", mb: 1 }}>
            Register Your Company
          </Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
            Complete your company profile in {steps.length} easy steps
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, backgroundColor: "white" }}>
          <Stepper activeStep={activeStep} connector={<QontoConnector />} sx={{ mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={QontoStepIcon}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <FormProvider {...methods}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box sx={{ mb: 5, minHeight: 300 }}>{renderStepContent(activeStep)}</Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  mt: 6,
                  pt: 3,
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <Button
                  disabled={activeStep === 0 || loading}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{ px: 4, textTransform: "none", fontSize: "1rem" }}
                >
                  ← Back
                </Button>

                <Box sx={{ display: "flex", gap: 2 }}>
                  {activeStep < steps.length - 1 && (
                    <Button
                      type="button"
                      onClick={handleNext}
                      variant="contained"
                      endIcon={<ArrowRight size={18} />}
                      sx={{
                        px: 4,
                        textTransform: "none",
                        fontSize: "1rem",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      Next
                    </Button>
                  )}

                  {isLastStep && (
                    <Button
                      type="submit"
                      disabled={loading}
                      variant="contained"
                      sx={{
                        px: 4,
                        textTransform: "none",
                        fontSize: "1rem",
                        background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Submitting...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </FormProvider>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" color="textSecondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CompanyRegistrationPage;

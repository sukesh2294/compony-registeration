import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextField, Select, MenuItem, Box, Typography } from '@mui/material';

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Real Estate', 'Energy', 'Transportation', 'Other'
];

const Step1CompanyDetails = () => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Company Basic Information
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Tell us about your company
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Controller
          name="companyName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Company Name"
              fullWidth
              placeholder="e.g. TechCorp Inc."
              error={!!errors.companyName}
              helperText={errors.companyName?.message}
              variant="outlined"
            />
          )}
        />

        <Controller
          name="industry"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Industry"
              fullWidth
              error={!!errors.industry}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select an industry
              </MenuItem>
              {industries.map((ind) => (
                <MenuItem key={ind} value={ind}>
                  {ind}
                </MenuItem>
              ))}
            </Select>
          )}
        />

        <Controller
          name="website"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Website (Optional)"
              fullWidth
              placeholder="https://example.com"
              type="url"
              error={!!errors.website}
              helperText={errors.website?.message}
              variant="outlined"
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default Step1CompanyDetails;

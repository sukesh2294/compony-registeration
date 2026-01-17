import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextField, Box, Typography, Grid } from '@mui/material';

const Step2AddressDetails = () => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Company Address
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Where is your company located?
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="addressLine1"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Address Line 1"
                fullWidth
                placeholder="Street address"
                error={!!errors.addressLine1}
                helperText={errors.addressLine1?.message}
                variant="outlined"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name="addressLine2"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Address Line 2 (Optional)"
                fullWidth
                placeholder="Suite, building, floor"
                error={!!errors.addressLine2}
                helperText={errors.addressLine2?.message}
                variant="outlined"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="City"
                fullWidth
                placeholder="e.g. New York"
                error={!!errors.city}
                helperText={errors.city?.message}
                variant="outlined"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="State/Province"
                fullWidth
                placeholder="e.g. NY"
                error={!!errors.state}
                helperText={errors.state?.message}
                variant="outlined"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Postal Code"
                fullWidth
                placeholder="e.g. 10001"
                error={!!errors.postalCode}
                helperText={errors.postalCode?.message}
                variant="outlined"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Country"
                fullWidth
                placeholder="e.g. United States"
                error={!!errors.country}
                helperText={errors.country?.message}
                variant="outlined"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step2AddressDetails;

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { CheckCircle } from 'lucide-react';

const Step4Review = ({ data }) => {
  const sections = [
    {
      title: 'Company Details',
      items: [
        { label: 'Company Name', value: data?.companyName },
        { label: 'Industry', value: data?.industry },
        { label: 'Website', value: data?.website || 'Not provided' },
      ],
    },
    {
      title: 'Address',
      items: [
        { label: 'Address', value: `${data?.addressLine1}${data?.addressLine2 ? ', ' + data.addressLine2 : ''}` },
        { label: 'City', value: data?.city },
        { label: 'State', value: data?.state },
        { label: 'Country', value: data?.country },
        { label: 'Postal Code', value: data?.postalCode },
      ],
    },
  ];

  return (
    <Box>
      <Alert severity="success" icon={<CheckCircle size={20} />} sx={{ mb: 3 }}>
        Please review your information before submitting
      </Alert>

      <Typography variant="h6" gutterBottom>
        Review Your Information
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {sections.map((section, idx) => (
          <Grid size={{ xs: 12 }} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                {section.title}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {section.items.map((item, i) => (
                  <Box key={i}>
                    <Typography variant="caption" color="textSecondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {item.value || '—'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          backgroundColor: '#e3f2fd',
          borderRadius: 2,
          border: '1px solid #90caf9',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          📋 What happens next?
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Your company profile will be reviewed and activated within 24-48 hours. You'll receive a confirmation email once your profile is live.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Step4Review;

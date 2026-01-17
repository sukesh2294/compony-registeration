import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardMedia, Grid } from '@mui/material';
import { CloudUpload, X } from 'lucide-react';

const Step3UploadImages = () => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Company Branding
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Upload your company logo and banner (optional)
      </Typography>

      <Grid container spacing={3}>
        {/* Logo Upload */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ border: '2px dashed #e0e0e0', borderRadius: 2 }}>
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
              }}
              component="label"
            >
              {logoPreview ? (
                <Box>
                  <CardMedia
                    component="img"
                    image={logoPreview}
                    sx={{ maxWidth: '100%', maxHeight: 150, mb: 2 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLogoPreview(null);
                    }}
                    startIcon={<X size={16} />}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <Box>
                  <CloudUpload size={40} style={{ margin: '0 auto', color: '#999' }} />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Company Logo
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Recommended: 200x200px
                  </Typography>
                </Box>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                hidden
                name="logo"
              />
            </Box>
          </Card>
        </Grid>

        {/* Banner Upload */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ border: '2px dashed #e0e0e0', borderRadius: 2 }}>
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
              }}
              component="label"
            >
              {bannerPreview ? (
                <Box>
                  <CardMedia
                    component="img"
                    image={bannerPreview}
                    sx={{ maxWidth: '100%', maxHeight: 150, mb: 2 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBannerPreview(null);
                    }}
                    startIcon={<X size={16} />}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <Box>
                  <CloudUpload size={40} style={{ margin: '0 auto', color: '#999' }} />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Banner Image
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Recommended: 1200x300px
                  </Typography>
                </Box>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                hidden
                name="banner"
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step3UploadImages;

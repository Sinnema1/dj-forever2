// client/src/components/layout/Footer.tsx
import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';

const drawerWidth = 240;

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        backgroundColor: theme.palette.background.paper,
        ml: { xs: 0, md: `${drawerWidth}px` },
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color={theme.palette.text.secondary}>
          © {new Date().getFullYear()} DJ Forever. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
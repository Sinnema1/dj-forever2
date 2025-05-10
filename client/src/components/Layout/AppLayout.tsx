import React, { type ReactNode } from 'react';
import { Container, Box } from '@mui/material';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => (
  <Box display="flex" flexDirection="column" minHeight="100vh">
    <Navbar />
    <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
      {children}
    </Container>
    <Footer />
  </Box>
);

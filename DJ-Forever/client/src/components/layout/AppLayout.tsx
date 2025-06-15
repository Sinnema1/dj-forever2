import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar'; // or ResponsiveSidebar
import Footer from './Footer';
import { Box } from '@mui/material';

const drawerWidth = 240; // Match Sidebar drawerWidth

/**
 * AppLayout component wraps the app's layout with Navbar, Sidebar, and Footer.
 */
const AppLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: 'calc(100vh - 64px - 56px)', // 64px Navbar, 56px Footer (MUI default)
            ml: { md: `${drawerWidth}px` }, // Add left margin for permanent drawer
            p: { xs: 2, md: 3 }, // Responsive padding
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default AppLayout;

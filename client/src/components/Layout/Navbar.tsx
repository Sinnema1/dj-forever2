import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

export const Navbar: React.FC = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        DJ Forever Wedding
      </Typography>
    </Toolbar>
  </AppBar>
);
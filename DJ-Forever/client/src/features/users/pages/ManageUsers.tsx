import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const ManageUsers = () => {
  // The backend no longer supports listing all users
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      <Alert severity="info">User management is not available in this version.</Alert>
    </Box>
  );
};

export default ManageUsers;

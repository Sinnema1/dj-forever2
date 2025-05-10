import React, { useState } from 'react';
import { Typography, Box } from '@mui/material';
import { FormField } from '../components/UI/FormField';
import { Button } from '../components/UI/Button';
import { AppLayout } from '../components/Layout/AppLayout';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('register', { email, password });
  };

  return (
    <AppLayout>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
    </AppLayout>
  );
};

export default RegisterPage;
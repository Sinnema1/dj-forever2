import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRSVP } from '../features/rsvp/hooks/useRSVP';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { rsvp } = useRSVP();

  // Find if the logged-in user has RSVP'd
  const hasRSVP = isLoggedIn && !!rsvp;

  const handleGetStarted = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else if (!hasRSVP) {
      navigate('/register');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 4, md: 6 }, // Reduce top/bottom padding
        flex: 1,
        minHeight: '100%',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to DJ Forever
        </Typography>
        <Typography variant="h5" gutterBottom>
          Your Ultimate Event RSVP Management Platform
        </Typography>
        <Button variant="contained" color="secondary" sx={{ mt: 4 }} onClick={handleGetStarted}>
          Get Started
        </Button>
      </Container>
    </Box>
  );
};

export default Home;

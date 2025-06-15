import React from 'react';
import { useRouteError, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, useTheme } from '@mui/material';

interface RouteError {
  statusText?: string;
  message?: string;
}

export default function ErrorPage() {
  const error = useRouteError() as RouteError;
  const theme = useTheme();

  console.error(error);

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: theme.spacing(4),
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" color="error" gutterBottom>
          Oops!
        </Typography>

        <Typography variant="body1" gutterBottom>
          Sorry, an unexpected error has occurred.
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {error?.statusText || error?.message || 'Unknown error'}
        </Typography>

        <Box mt={4}>
          <Button variant="contained" color="primary" component={RouterLink} to="/">
            Go to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

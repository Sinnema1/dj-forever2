import React from "react";
import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../components/UI/Button";
import { AppLayout } from "../components/Layout/AppLayout";

const HomePage: React.FC = () => (
  <AppLayout>
    <Box textAlign="center" mt={8}>
      <Typography variant="h1" gutterBottom>
        DJ Forever Wedding
      </Typography>
      <Typography variant="h6" gutterBottom>
        November 8, 2026
      </Typography>
      <Button<typeof RouterLink>
        component={RouterLink}
        to="/register"
        sx={{ mx: 1 }}
      >
        Register
      </Button>
      <Button<typeof RouterLink>
        component={RouterLink}
        to="/login"
        sx={{ mx: 1 }}
      >
        Login
      </Button>
    </Box>
  </AppLayout>
);

export default HomePage;

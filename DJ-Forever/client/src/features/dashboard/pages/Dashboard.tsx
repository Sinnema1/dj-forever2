// client/src/features/dashboard/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { useRSVP } from '../../rsvp/hooks/useRSVP';
import { useUsers } from '../../users/hooks/useUsers';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../../users/graphql/queries';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, updateUserInfo } = useAuth();

  // Fetch latest user data from server each time Dashboard is viewed
  const { data: meData, loading: meLoading, error: meError } = useQuery(GET_ME);

  // Always call hooks unconditionally.
  // Even if user is null, these hooks are called.
  // For useUsers, we pass user._id if available or an empty string.
  const userId = user?._id || '';

  // ✅ Always call hooks outside conditionals
  const { rsvp, loading: rsvpLoading, error: rsvpError } = useRSVP();

  const { user: userData, loading: userLoading, error: userError } = useUsers();
  
  // Update local context when we get fresh data from server
  useEffect(() => {
    if (
      meData?.me &&
      (meData.me.fullName !== user?.fullName || meData.me.email !== user?.email || meData.me.isAdmin !== user?.isAdmin)
    ) {
      updateUserInfo({
        fullName: meData.me.fullName,
        email: meData.me.email,
        isAdmin: meData.me.isAdmin
      });
    }
  }, [meData, updateUserInfo]);

  // Now conditionally render UI if user data isn't ready.
  if (!user) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h6">Loading user...</Typography>
      </Box>
    );
  }

  // Handle loading state for either RSVP or user data
  if (rsvpLoading || userLoading || meLoading) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle error state for either RSVP or user data
  if (rsvpError || userError || meError) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Alert severity="error">Failed to load dashboard data.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.fullName}!
      </Typography>

      <Grid container spacing={3}>
        {/* RSVP Summary Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">RSVP Summary</Typography>
              <Typography variant="h4">
                {rsvp ? 1 : 0} RSVP{rsvp ? '' : 's'}
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/rsvp')}>
                Manage RSVPs
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* User Profile Card */}
          <Card>
            <CardContent>
              <Typography variant="h6">Your Profile</Typography>
              <Typography>Name: {userData?.fullName || 'N/A'}</Typography>
              <Typography>Email: {userData?.email || 'N/A'}</Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/profile')}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {rsvp ? (
        <Typography variant="body1" gutterBottom>
          You are invited to the wedding! Please let us know if you will be attending.
        </Typography>
      ) : (
        <Typography variant="body1" gutterBottom>
          Unfortunately, you are not on the invited list for this wedding. Please contact the
          organizer if you believe this is an error.
        </Typography>
      )}
    </Box>
  );
};

export default Dashboard;

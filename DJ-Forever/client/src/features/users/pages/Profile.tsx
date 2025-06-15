import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { GET_ME } from '../graphql/queries';
import { UPDATE_USER } from '../graphql/mutations';
import { UpdateUserInput } from '../types/userTypes';
import { useAuth } from '../../../context/AuthContext';

// TypeScript interface for response matching the query
interface MeResponse {
  me: {
    _id: string;
    email: string;
    fullName: string;
    isAdmin?: boolean;
    hasRSVPed?: boolean;
    rsvpId?: string;
    isInvited?: boolean;
  };
}

const Profile = () => {
  const { loading, data, refetch } = useQuery<MeResponse>(GET_ME);
  const { updateUserInfo } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
    onCompleted: (data) => {
      // Update the user info in the AuthContext
      if (data && data.updateUser) {
        updateUserInfo({
          fullName: data.updateUser.fullName,
          email: data.updateUser.email
        });
      }
      
      setSuccessMessage('Profile updated successfully!');
      setEditMode(false);
      // Refetch to get the latest data
      refetch();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    },
    onError: (error) => {
      setErrorMessage(`Error: ${error.message}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    },
  });

  // Sync data to form inputs
  useEffect(() => {
    if (data?.me) {
      setFullName(data.me.fullName || '');
      setEmail(data.me.email || '');
    }
  }, [data]);

  const handleUpdate = async () => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      const updateData: UpdateUserInput = {};
      if (fullName !== data?.me?.fullName) {
        updateData.fullName = fullName;
      }
      if (email !== data?.me?.email) {
        updateData.email = email;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        setEditMode(false);
        return;
      }

      await updateUser({
        variables: {
          input: updateData
        }
      });
    } catch (err: any) {
      setErrorMessage(`Error updating account: ${err.message}`);
    }
  };

  const handleCancel = () => {
    // Reset form fields to original data
    if (data?.me) {
      setFullName(data.me.fullName || '');
      setEmail(data.me.email || '');
    }
    setEditMode(false);
    setErrorMessage('');
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom>
        My Account
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {editMode ? 'Edit your profile information below.' : 'View your account details below.'}
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          {editMode ? (
            <>
              <TextField
                fullWidth
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                sx={{ marginBottom: 3 }}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ marginBottom: 3 }}
                required
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                  disabled={updating || !fullName || !email}
                >
                  {updating ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" align="left">
                  Full Name
                </Typography>
                <Typography variant="body1" align="left">
                  {data?.me?.fullName || 'Not available'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" align="left">
                  Email Address
                </Typography>
                <Typography variant="body1" align="left">
                  {data?.me?.email || 'Not available'}
                </Typography>
              </Box>

              {data?.me?.hasRSVPed && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" align="left">
                      RSVP Status
                    </Typography>
                    <Typography variant="body1" align="left">
                      You have submitted an RSVP
                    </Typography>
                  </Box>
                </>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;

import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';

import { useRSVP } from '../hooks/useRSVP';
import { RSVP } from '../types/rsvpTypes';

const RSVPList = () => {
  const { rsvp, loading, error } = useRSVP();

  if (error) {
    return <Alert severity="error">Failed to load RSVP.</Alert>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <TableContainer component={Paper} sx={{ mt: 4, overflowX: 'auto' }}>
        <Typography variant="h5" sx={{ m: 2 }}>
          RSVP Details
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Attending</TableCell>
              <TableCell>Meal Preference</TableCell>
              <TableCell>Allergies</TableCell>
              <TableCell>Additional Notes</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!rsvp ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No RSVP found.
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={rsvp._id}>
                <TableCell>{rsvp.fullName}</TableCell>
                <TableCell>{rsvp.attending ? 'Yes' : 'No'}</TableCell>
                <TableCell>{rsvp.mealPreference}</TableCell>
                <TableCell>{rsvp.allergies || '-'}</TableCell>
                <TableCell>{rsvp.additionalNotes || '-'}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RSVPList;

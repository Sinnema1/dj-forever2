import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useRSVP } from '../hooks/useRSVP';
import { RSVPFormData } from '../types/rsvpTypes';

/**
 * RSVPForm component renders the RSVP submission form.
 */
const RSVPForm: React.FC = () => {
  // Get the createRSVP/editRSVP functions, rsvp data and loading state from the custom useRSVP hook.
  const { createRSVP, editRSVP, rsvp, loading } = useRSVP();

  // Local state for the RSVP form data, typed with RSVPFormData.
  const [formData, setFormData] = useState<RSVPFormData>({
    fullName: rsvp?.fullName || '',
    attending: rsvp?.attending || 'NO', // default to "NO" (enum string)
    mealPreference: rsvp?.mealPreference || '',
    allergies: rsvp?.allergies || '',
    additionalNotes: rsvp?.additionalNotes || '',
  });

  // Update form data when RSVP data is loaded or changes
  React.useEffect(() => {
    if (rsvp) {
      setFormData({
        fullName: rsvp.fullName || '',
        attending: rsvp.attending || 'NO',
        mealPreference: rsvp.mealPreference || '',
        allergies: rsvp.allergies || '',
        additionalNotes: rsvp.additionalNotes || '',
      });
    }
  }, [rsvp]);

  // Local state for feedback messages.
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Updates formData when a text field changes.
   * Converts "guests" input to a number.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /**
   * Updates formData when the Select field changes.
   */
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value as 'YES' | 'NO' | 'MAYBE',
    }));
  };

  /**
   * Handles the form submission.
   * Validates the required fields and calls createRSVP mutation.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Basic form validation
    if (!formData.fullName || !formData.attending || !formData.mealPreference) {
      setErrorMessage('Please fill out all required fields, including meal preference.');
      return;
    }

    try {
      if (rsvp) {
        // Update existing RSVP
        await editRSVP({
          attending: formData.attending,
          mealPreference: formData.mealPreference,
          allergies: formData.allergies,
          additionalNotes: formData.additionalNotes,
        });
      } else {
        // Submit new RSVP data
        await createRSVP({
          ...formData,
        });
      }

      // On success, show a success message
      setSuccessMessage(rsvp ? 'RSVP updated successfully!' : 'RSVP submitted successfully!');
    } catch (error: unknown) {
      // Safely narrow the error type.
      const errMsg =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setErrorMessage(errMsg);
    }
  };

  /**
   * Closes any open snackbar messages.
   */
  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <Container maxWidth="sm">
      {/* Page Title */}
      <Typography variant="h4" gutterBottom align="center">
        {rsvp ? 'Update RSVP' : 'RSVP Form'}
      </Typography>

      {rsvp && (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
          Note: To change your name, please update your profile settings instead.
        </Typography>
      )}

      {/* Form Container */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          mt: 2,
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        {/* Full Name Field (readonly because name is managed in profile) */}
        <TextField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          InputProps={{
            readOnly: true,
          }}
          helperText="Name is managed in your profile settings"
          fullWidth
          required
          margin="normal"
        />

        {/* Attending Select Field */}
        <FormControl fullWidth required margin="normal">
          <InputLabel id="attending-label">Attending?</InputLabel>
          <Select
            labelId="attending-label"
            name="attending"
            value={formData.attending}
            onChange={handleSelectChange}
            label="Attending?"
          >
            <MenuItem value="YES">Yes</MenuItem>
            <MenuItem value="NO">No</MenuItem>
            <MenuItem value="MAYBE">Maybe</MenuItem>
          </Select>
        </FormControl>

        {/* Meal Preference Field */}
        <TextField
          label="Meal Preference"
          name="mealPreference"
          value={formData.mealPreference}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
        />

        {/* Allergies Field */}
        <TextField
          label="Allergies (optional)"
          name="allergies"
          value={formData.allergies}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />

        {/* Additional Notes Field */}
        <TextField
          label="Additional Notes (optional)"
          name="additionalNotes"
          multiline
          rows={4}
          value={formData.additionalNotes}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />

        {/* Submit Button */}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : rsvp ? 'Update RSVP' : 'Submit RSVP'}
        </Button>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }} role="alert">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }} role="alert">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RSVPForm;

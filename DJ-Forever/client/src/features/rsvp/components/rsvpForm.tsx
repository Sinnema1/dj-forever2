import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useRSVP } from '../hooks/useRSVP';

/**
 * Form data structure for RSVP
 */
interface RSVPFormData {
  fullName: string;
  attending: 'YES' | 'NO' | 'MAYBE';
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
}

const RSVPForm = () => {
  const { createRSVP, loading } = useRSVP();

  const [formData, setFormData] = useState<RSVPFormData>({
    fullName: '',
    attending: 'NO', // default to "NO" (enum string)
    mealPreference: '',
    allergies: '',
    additionalNotes: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Handles changes for text fields
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /**
   * Handles changes for select dropdowns
   */
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.attending || !formData.mealPreference) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    try {
      await createRSVP({
        ...formData,
      });

      setSuccessMessage('RSVP submitted successfully!');
      setFormData({
        fullName: '',
        attending: 'NO',
        mealPreference: '',
        allergies: '',
        additionalNotes: '',
      });
    } catch (error: unknown) {
      // Safely handle unknown errors
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Something went wrong.');
      } else {
        setErrorMessage('An unknown error occurred.');
      }
    }
  };

  /**
   * Handles closing of snackbars
   */
  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const isFormIncomplete = !formData.fullName || !formData.attending || !formData.mealPreference;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Submit RSVP
      </Typography>

      {/* Full Name */}
      <TextField
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
        fullWidth
        required
        margin="normal"
        autoFocus
      />

      {/* Attending Select */}
      <FormControl fullWidth required margin="normal">
        <InputLabel id="attending-label">Attending?</InputLabel>
        <Select
          labelId="attending-label"
          name="attending"
          value={formData.attending}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              attending: e.target.value as 'YES' | 'NO' | 'MAYBE',
            }))
          }
          label="Attending?"
        >
          <MenuItem value="YES">Yes</MenuItem>
          <MenuItem value="NO">No</MenuItem>
          <MenuItem value="MAYBE">Maybe</MenuItem>
        </Select>
      </FormControl>

      {/* Meal Preference */}
      <TextField
        label="Meal Preference"
        name="mealPreference"
        value={formData.mealPreference}
        onChange={handleInputChange}
        fullWidth
        required
        margin="normal"
      />

      {/* Allergies */}
      <TextField
        label="Allergies (optional)"
        name="allergies"
        value={formData.allergies}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />

      {/* Additional Notes */}
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
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        disabled={loading || isFormIncomplete}
      >
        {loading ? <CircularProgress size={24} /> : 'Submit RSVP'}
      </Button>

      {/* Snackbar for success or error messages */}
      <Snackbar
        open={!!successMessage || !!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {successMessage ? (
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: '100%' }}
            role="alert"
          >
            {successMessage}
          </Alert>
        ) : (
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }} role="alert">
            {errorMessage}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default RSVPForm;

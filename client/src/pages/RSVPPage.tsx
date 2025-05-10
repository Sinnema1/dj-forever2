import React, { useState } from 'react';
import { Typography, Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material';
import { Button } from '../components/UI/Button';
import { AppLayout } from '../components/Layout/AppLayout';

const RSVPPage: React.FC = () => {
  const [attending, setAttending] = useState('yes');
  const [meal, setMeal] = useState('chicken');
  const [allergies, setAllergies] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('rsvp', { attending, meal, allergies });
  };

  return (
    <AppLayout>
      <Typography variant="h4" gutterBottom>
        RSVP
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Will you attend?</FormLabel>
          <RadioGroup
            row
            value={attending}
            onChange={(e) => setAttending(e.target.value)}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <FormLabel>Meal Preference</FormLabel>
          <TextField
            select
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="chicken">Chicken</option>
            <option value="beef">Beef</option>
            <option value="vegetarian">Vegetarian</option>
          </TextField>
        </FormControl>
        <TextField
          label="Allergies / Dietary Restrictions"
          fullWidth
          margin="normal"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />
        <Button type="submit" fullWidth sx={{ mt: 2 }}>
          Submit RSVP
        </Button>
      </Box>
    </AppLayout>
  );
};

export default RSVPPage;
import React from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

export const FormField: React.FC<TextFieldProps> = (props) => (
  <TextField fullWidth margin="normal" {...props} />
);

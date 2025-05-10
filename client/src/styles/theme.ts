import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#293FBC' },    // Wedding blue
    secondary: { main: '#E3D4B9' },  // Soft ivory
  },
  typography: {
    fontFamily: '"Playfair Display", serif',
    h1: { fontSize: '3rem', fontWeight: 700 },
    body1: { fontSize: '1rem', fontWeight: 400 },
  },
  spacing: 8,  // 8px grid
});

export default theme;
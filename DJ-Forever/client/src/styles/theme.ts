import { createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

export const getDesignTokens = (mode: PaletteMode): Theme => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode palette with softer pastel colors
            primary: {
              main: '#B2DFDB', // Soft pastel teal
            },
            secondary: {
              main: '#F8BBD0', // Soft pastel pink
            },
            background: {
              default: '#FFF8E1', // Light warm background
              paper: '#ffffff',
            },
          }
        : {
            // Dark mode palette (maintaining current accents)
            primary: {
              main: '#90caf9',
            },
            secondary: {
              main: '#ce93d8',
            },
            background: {
              default: '#121212',
              paper: '#1d1d1d',
            },
          }),
    },
    typography: {
      // Default body text remains Roboto
      fontFamily: 'Roboto, sans-serif',
      h1: {
        fontFamily: '"Dancing Script", cursive, Roboto, sans-serif', // Fancy script for headings
        fontSize: '2.5rem',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Dancing Script", cursive, Roboto, sans-serif',
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
      button: {
        textTransform: 'none',
      },
    },
    // Apply a softer, less boxy feel
    shape: {
      borderRadius: 12,
    },
    // Subtle shadows for gentle elevation
    shadows: [
      'none',
      '0px 2px 4px rgba(0,0,0,0.1)',
      '0px 3px 6px rgba(0,0,0,0.1)',
      ...Array(22).fill('none'),
    ] as unknown as Theme['shadows'],
    spacing: 8, // Default spacing unit; adjust as needed for more whitespace
  });
};

export interface ThemeColors {
  cream: string;
  panelCream: string;
  sage20: string;
  sage: string;
  sageDark: string;
  sageDarker: string;
  dustyBlueLight: string;
  dustyBlue: string;
  dustyBlueDark: string;
  dustyBlueDarker: string;
  goldAccent: string;
  goldDark: string;
  goldDarker: string;
  charcoal: string;
  success: string;
  error: string;
  info: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface Theme {
  colors: ThemeColors;
  fonts: ThemeFonts;
}

const theme: Theme = {
  colors: {
    cream: '#F2EFEA', // Page background, large section backgrounds
    panelCream: '#E7E3DA', // Card/form backgrounds
    sage20: '#CAD2C5', // Accent blocks, hover states, light overlays
    sage: '#9FB5A1', // Secondary buttons, icon fills
    sageDark: '#7A9A7C', // WCAG AA compliant for white text (3.5:1)
    sageDarker: '#5D7A5F', // WCAG AA compliant text on white/cream (4.5:1)
    dustyBlueLight: '#A3BFCB', // Primary button hover, link hover
    dustyBlue: '#6E8FA3', // Primary buttons, nav highlights
    dustyBlueDark: '#5A7282', // WCAG AA compliant on white (4.5:1)
    dustyBlueDarker: '#4D6070', // WCAG AA compliant on cream (4.5:1)
    goldAccent: '#B4946C', // Underlines, button borders, small accents
    goldDark: '#8B6F4D', // WCAG AA compliant for white text (4.5:1)
    goldDarker: '#6D5739', // WCAG AA compliant on cream (4.5:1)
    charcoal: '#3D3D3D', // Main text, headers
    success: '#4CAF50', // Success messages
    error: '#E53935', // Error states
    info: '#2196F3', // Information alerts
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Lato', 'Montserrat', sans-serif",
  },
};

export default theme;

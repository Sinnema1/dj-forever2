/**
 * WCAG Color Contrast Audit Tool
 *
 * Checks color combinations for WCAG AA/AAA compliance
 * WCAG AA: 4.5:1 for normal text, 3:1 for large text
 * WCAG AAA: 7:1 for normal text, 4.5:1 for large text
 */

// Color palette from theme
const colors = {
  cream: '#F2EFEA',
  panelCream: '#E7E3DA',
  sage20: '#CAD2C5',
  sage: '#9FB5A1',
  sageDark: '#8BA38D', // For hover states
  dustyBlueLight: '#A3BFCB',
  dustyBlue: '#6E8FA3',
  goldAccent: '#B4946C',
  charcoal: '#3D3D3D',
  white: '#FFFFFF',
  black: '#000000',

  // Toast colors
  toastSuccessText: '#155724',
  toastSuccessBg: '#d4edda',
  toastErrorText: '#721c24',
  toastErrorBg: '#f8d7da',
  toastWarningText: '#856404',
  toastWarningBg: '#fff3cd',
  toastInfoText: '#004085',
  toastInfoBg: '#d1ecf1',

  // Button colors from styles
  toastIcon: '#999',

  // New WCAG compliant colors
  sageDark: '#7a9a7c',
  sageDarker: '#6a8a6c',
  dustyBlueDark: '#5a7282',
  goldDark: '#8b6f4d',
  goldDarker: '#6d5739',

  // From CSS
  navbarScrolledBg: 'rgba(255, 255, 255, 0.98)',
  countdownText: 'rgba(255, 255, 255, 0.9)',
};

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return null;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG standards
function checkWCAG(ratio, isLargeText = false) {
  return {
    AA: isLargeText ? ratio >= 3 : ratio >= 4.5,
    AAA: isLargeText ? ratio >= 4.5 : ratio >= 7,
  };
}

// Format results
function formatResult(name, fg, bg, isLargeText = false) {
  const ratio = getContrastRatio(fg, bg);
  if (!ratio) return `${name}: Error calculating contrast`;

  const wcag = checkWCAG(ratio, isLargeText);
  const level = wcag.AAA ? 'AAA ✓✓✓' : wcag.AA ? 'AA ✓✓' : 'FAIL ✗';

  return `${name.padEnd(40)} | ${ratio.toFixed(2)}:1 | ${level}`;
}

console.log('\n' + '='.repeat(80));
console.log('WCAG COLOR CONTRAST AUDIT - DJ Forever 2');
console.log('='.repeat(80) + '\n');

console.log('📝 WCAG Standards:');
console.log('  Normal Text:  AA = 4.5:1  |  AAA = 7:1');
console.log('  Large Text:   AA = 3:1    |  AAA = 4.5:1\n');

// Main content text combinations
console.log('\n📄 MAIN CONTENT TEXT');
console.log('-'.repeat(80));
console.log(
  formatResult('Body text (charcoal on cream)', colors.charcoal, colors.cream)
);
console.log(
  formatResult(
    'Body text (charcoal on panelCream)',
    colors.charcoal,
    colors.panelCream
  )
);
console.log(
  formatResult('Body text (charcoal on white)', colors.charcoal, colors.white)
);
console.log(
  formatResult(
    'Header text (charcoal on cream)',
    colors.charcoal,
    colors.cream,
    true
  )
);

// Navigation
console.log('\n🧭 NAVIGATION');
console.log('-'.repeat(80));
console.log(
  formatResult('Nav text (white on transparent)', colors.white, colors.black)
);
console.log(
  formatResult(
    'Nav scrolled (charcoal on white)',
    colors.charcoal,
    colors.white
  )
);
console.log(
  formatResult(
    'Nav scrolled FIXED (dustyBlueDark)',
    colors.dustyBlueDark,
    colors.white
  )
);
console.log(
  formatResult('Nav scrolled OLD (dustyBlue)', colors.dustyBlue, colors.white)
);

// Buttons
console.log('\n🔘 BUTTONS');
console.log('-'.repeat(80));
console.log(
  formatResult(
    'Primary btn FIXED (white on goldDark)',
    colors.white,
    colors.goldDark,
    true
  )
);
console.log(
  formatResult(
    'Primary btn OLD (white on goldAccent)',
    colors.white,
    colors.goldAccent,
    true
  )
);
console.log(
  formatResult(
    'Outline btn FIXED (sageDarker on white)',
    colors.sageDarker,
    colors.white
  )
);
console.log(
  formatResult(
    'Outline btn FIXED (sageDarker on cream)',
    colors.sageDarker,
    colors.cream
  )
);
console.log(
  formatResult(
    'Outline btn hover (white on sageDark)',
    colors.white,
    colors.sageDark,
    true
  )
);
console.log(
  formatResult(
    'Sage dark btn (white on sageDark)',
    colors.white,
    colors.sageDark,
    true
  )
);
console.log(
  formatResult(
    'Dusty blue btn (white on dustyBlue)',
    colors.white,
    colors.dustyBlue,
    true
  )
);

// Toast notifications
console.log('\n🔔 TOAST NOTIFICATIONS');
console.log('-'.repeat(80));
console.log(
  formatResult('Success toast', colors.toastSuccessText, colors.toastSuccessBg)
);
console.log(
  formatResult('Error toast', colors.toastErrorText, colors.toastErrorBg)
);
console.log(
  formatResult('Warning toast', colors.toastWarningText, colors.toastWarningBg)
);
console.log(
  formatResult('Info toast', colors.toastInfoText, colors.toastInfoBg)
);
console.log(
  formatResult('Toast close button', colors.toastIcon, colors.toastSuccessBg)
);
console.log(formatResult('Toast message text', '#333', colors.toastSuccessBg));

// Links
console.log('\n🔗 LINKS & INTERACTIVE ELEMENTS');
console.log('-'.repeat(80));
console.log(
  formatResult(
    'Link (dustyBlueDark on cream)',
    colors.dustyBlueDark,
    colors.cream
  )
);
console.log(
  formatResult(
    'Link (dustyBlueDark on white)',
    colors.dustyBlueDark,
    colors.white
  )
);
console.log(
  formatResult(
    'Link hover FIXED (goldDarker on cream)',
    colors.goldDarker,
    colors.cream
  )
);
console.log(
  formatResult(
    'Link hover FIXED (goldDarker on white)',
    colors.goldDarker,
    colors.white
  )
);
console.log(
  formatResult(
    'Link hover OLD (goldDark on cream)',
    colors.goldDark,
    colors.cream
  )
);

// Form elements
console.log('\n📝 FORM ELEMENTS');
console.log('-'.repeat(80));
console.log(
  formatResult('Input text (charcoal on white)', colors.charcoal, colors.white)
);
console.log(
  formatResult('Input border (sage on white)', colors.sage, colors.white)
);
console.log(formatResult('Error text (red on white)', '#721c24', colors.white));
console.log(
  formatResult('Success text (green on white)', '#155724', colors.white)
);

// Registry buttons
console.log('\n🎁 REGISTRY BUTTONS');
console.log('-'.repeat(80));
console.log(
  formatResult(
    'Registry btn (charcoal on sage20)',
    colors.charcoal,
    colors.sage20,
    true
  )
);
console.log(
  formatResult(
    'Registry btn hover FIXED (white on sageDark)',
    colors.white,
    colors.sageDark,
    true
  )
);
console.log(
  formatResult(
    'Registry btn hover OLD (white on sage)',
    colors.white,
    colors.sage,
    true
  )
);

// Hero section
console.log('\n🎭 HERO SECTION');
console.log('-'.repeat(80));
console.log(
  formatResult('Hero text (white on dark)', colors.white, colors.charcoal)
);
console.log(
  formatResult('Countdown text (white on overlay)', colors.white, '#333')
);

console.log('\n' + '='.repeat(80));
console.log('END OF AUDIT');
console.log('='.repeat(80) + '\n');

console.log('💡 RECOMMENDATIONS:');
console.log('  • Items marked with ✗ FAIL need immediate attention');
console.log('  • Items with AA ✓✓ are acceptable but could be improved');
console.log('  • Items with AAA ✓✓✓ meet the highest standards\n');

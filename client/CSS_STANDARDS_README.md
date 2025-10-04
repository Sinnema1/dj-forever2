# CSS Architecture Standards - DJ Forever 2

## Overview

This document defines the CSS architecture standards for the DJ Forever 2 wedding website. Following
these guidelines ensures maintainable, scalable, and conflict-free styling across the application.

## 🏗️ CSS Organization Structure

### Primary CSS Location: `/src/assets/`

**All CSS files must be located in the `/src/assets/` directory as the single source of truth.**

```
/client/src/assets/
├── styles.css                 # Main entry point with imports & global styles
├── sections.css              # Layout, animations, section styling
├── mobile-enhancements.css   # Mobile-specific optimizations
├── mobile-drawer.css         # Mobile navigation drawer
├── timeline.css              # Timeline component styling
├── rsvp-enhancements.css     # RSVP form enhancements (imported last)
├── FAQ.css                   # FAQ page styling
├── TravelGuide.css           # Travel guide page styling
├── countdown-enhanced.css    # Countdown timer component
├── details.css               # Event details styling
├── guestbook.css             # Guestbook placeholder styling
├── login-success.css         # Login success page styling
├── qr-prompt.css            # QR code modal styling
├── swipeable-lightbox.css   # Photo gallery lightbox
├── welcome-banner.css       # Welcome banner component
├── welcome-modal.css        # Welcome modal styling
└── images/                  # Image assets
```

## 📋 Import Hierarchy & Order

### Main Entry Point: `styles.css`

The `styles.css` file serves as the main entry point and follows this strict import order:

```css
/* 1. Layout & Core Components (First Priority) */
@import './sections.css';
@import './mobile-enhancements.css';
@import './mobile-drawer.css';

/* 2. Page-Specific Styles */
@import './FAQ.css';
@import './TravelGuide.css';
@import './timeline.css';

/* 3. Component-Specific Styles */
@import './countdown-enhanced.css';
@import './details.css';
@import './guestbook.css';
@import './login-success.css';
@import './qr-prompt.css';
@import './swipeable-lightbox.css';
@import './welcome-banner.css';
@import './welcome-modal.css';

/* 4. Enhancement Overrides (Last Priority) */
@import './rsvp-enhancements.css';
```

**Critical Rule**: `rsvp-enhancements.css` must always be imported LAST to ensure highest CSS
precedence for form styling overrides.

## 🎨 Design Token System

### CSS Custom Properties (Variables)

All design tokens are defined in `styles.css` within the `:root` selector:

```css
:root {
  /* Color Palette */
  --color-primary: var(--color-dusty-blue);
  --color-secondary: var(--color-sage);
  --color-accent: var(--color-gold-accent);
  --color-cream: #f2efea;
  --color-panel-cream: #e7e3da;
  --color-sage-20: #cad2c5;
  --color-sage: #9fb5a1;
  --color-dusty-blue-light: #a3bfcb;
  --color-dusty-blue: #6e8fa3;
  --color-gold-accent: #b4946c;
  --color-charcoal: #3d3d3d;

  /* Typography Scale */
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 1rem;
  --font-md: 1.125rem;
  --font-lg: 1.25rem;
  --font-xl: 1.5rem;
  --font-2xl: 2rem;
  --font-3xl: 3rem;

  /* Spacing Scale */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 1rem;
  --spacing-4: 1.5rem;
  --spacing-5: 2rem;
  --spacing-6: 3rem;

  /* Shadows */
  --shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
}
```

## 📱 Mobile-First Responsive Design

### Breakpoint Strategy

All CSS follows a **mobile-first approach** with these standard breakpoints:

```css
/* Mobile (default): 0px - 767px */
/* Base styles written for mobile */

/* Tablet and Desktop: 768px+ */
@media (min-width: 768px) {
  /* Desktop enhancements */
}

/* Large Desktop: 1200px+ */
@media (min-width: 1200px) {
  /* Large screen optimizations */
}
```

### Mobile Enhancement Guidelines

#### Native Mobile Scrollbar Experience

```css
/* Mobile: Invisible scrollbars for native experience */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

/* Desktop: Styled thin scrollbars */
@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 8px;
  }
}
```

#### Safe Area Insets for Modern Devices

```css
@media (max-width: 768px) {
  .navbar {
    padding-left: max(var(--spacing-4), env(safe-area-inset-left));
    padding-right: max(var(--spacing-4), env(safe-area-inset-right));
  }
}
```

#### Touch-Friendly Interactions

```css
@media (max-width: 768px) {
  .btn,
  button {
    min-height: 48px; /* Apple/Google recommended minimum */
    touch-action: manipulation; /* Prevent zoom on double-tap */
  }
}
```

## 📝 File Naming Conventions

### Component-Specific Files

- **Format**: `ComponentName.css` (PascalCase matching React component)
- **Examples**: `TravelGuide.css`, `FAQ.css`

### Feature-Specific Files

- **Format**: `feature-name.css` (kebab-case)
- **Examples**: `mobile-enhancements.css`, `rsvp-enhancements.css`, `countdown-enhanced.css`

### Layout/System Files

- **Format**: `system-name.css` (kebab-case)
- **Examples**: `sections.css`, `mobile-drawer.css`, `swipeable-lightbox.css`

## 🚫 Anti-Patterns to Avoid

### ❌ Multiple CSS Directories

- **Never** create a separate `/styles/` directory
- **Never** duplicate CSS files across directories
- All CSS must live in `/src/assets/` only

### ❌ Direct Component Imports

- **Never** import CSS files directly in React components
- All CSS must be imported through `styles.css` hierarchy

### ❌ Inline Styles for Theme Values

- **Never** use hardcoded colors/spacing in inline styles
- Always use CSS custom properties for consistent theming

### ❌ Breaking Mobile-First Pattern

- **Never** write desktop styles first, then override for mobile
- Always write mobile styles as the base, enhance for desktop

## ✅ Best Practices

### CSS Organization

1. **Single Import Point**: All CSS flows through `styles.css`
2. **Logical Grouping**: Group related styles in dedicated files
3. **Cascade Awareness**: Import order matters - specificity increases down the list

### Performance Optimization

1. **Efficient Selectors**: Use class selectors over complex hierarchies
2. **Minimal Nesting**: Keep CSS selector specificity low
3. **Critical Path**: Essential styles in main bundle, enhancements loaded after

### Maintainability

1. **Consistent Naming**: Follow established naming conventions
2. **Comment Headers**: Use descriptive section comments
3. **Design Token Usage**: Always use CSS custom properties for theming

## 🔧 Development Workflow

### Adding New Styles

1. **Determine File Location**:

   - Page-specific → Create `PageName.css`
   - Component-specific → Create `ComponentName.css`
   - System/layout → Add to existing or create `feature-name.css`

2. **Create CSS File** in `/src/assets/`

3. **Add Import** to `styles.css` in appropriate section:

   ```css
   /* Add to appropriate section based on type */
   @import './new-feature.css';
   ```

4. **Follow Mobile-First Pattern**:

   ```css
   /* Mobile base styles */
   .component {
     /* mobile styles */
   }

   /* Desktop enhancements */
   @media (min-width: 768px) {
     .component {
       /* desktop overrides */
     }
   }
   ```

5. **Use Design Tokens**:
   ```css
   .component {
     color: var(--color-charcoal);
     padding: var(--spacing-3);
     font-size: var(--font-md);
   }
   ```

### Testing CSS Changes

1. **Build Verification**:

   ```bash
   cd client && npm run build
   ```

2. **Mobile Testing**: Test on actual devices, not just browser dev tools

3. **Cross-Browser**: Verify in Safari, Chrome, Firefox

4. **Performance**: Monitor bundle size with Vite build output

## 📊 Architecture Benefits

### ✅ Achieved with Current Structure

- **Zero Duplication**: Single source of truth in `/assets/`
- **Predictable Cascade**: Clear import hierarchy prevents conflicts
- **Mobile-Optimized**: Native scrollbars, touch targets, safe areas
- **Maintainable**: Logical file organization with clear naming
- **Performance**: Consolidated bundle with efficient loading
- **Scalable**: Easy to add new components without conflicts

### ✅ Resolved Issues

- Removed duplicate `/styles/` directory (25 files, 4,935 lines)
- Fixed timeline styling conflicts
- Resolved mobile centering issues
- Established consistent import patterns
- Preserved critical styling functionality

## 🚨 Emergency Procedures

### If CSS Conflicts Arise

1. **Check Import Order**: Verify `styles.css` import sequence
2. **Inspect Specificity**: Use browser dev tools to identify conflicts
3. **Follow Cascade**: Remember later imports override earlier ones
4. **Mobile-First Check**: Ensure mobile styles aren't being overridden incorrectly

### If Mobile Layout Breaks

1. **Safe Area Insets**: Check `env(safe-area-inset-*)` usage
2. **Container Centering**: Verify `margin: 0 auto` and `max-width` settings
3. **Overflow Issues**: Check for `overflow-x: hidden` on body/html
4. **Viewport Units**: Be cautious with `100vw` (can cause horizontal scroll)

---

## � Recent Updates & Changelog

### **Phase 1 Cleanup (October 4, 2025)**

**New CSS Files Added:**

- **`guestbook.css`** - Professional "Coming Soon" placeholder styling with feature preview
- **`login-success.css`** - Converted from inline styles to design token system

**Files Removed:**

- Eliminated duplicate/unused files: `Home.tsx`, `Gallery-new.tsx`, `Gallery/GalleryGrid.tsx`,
  `Gallery/LightboxModal.tsx`, `WeddingParty/` directory
- Consolidated code: Root `LightboxModal.tsx` removed (SwipeableLightbox is active implementation)

**Improvements:**

- ✅ **Consistency**: All new CSS uses design token system
- ✅ **Mobile-First**: Responsive design with touch-friendly interactions
- ✅ **Accessibility**: Focus states and ARIA-compliant styling
- ✅ **Performance**: Reduced bundle size by removing unused code
- ✅ **Maintainability**: Eliminated inline styles, improved code organization

**Build Results:**

- CSS Bundle: 76.93 KB (optimized)
- Build Time: 5.82s (improved)
- TypeScript Issues: Fixed strict mode compliance

---

## �📚 References

- **Mobile Guidelines**:
  [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- **CSS Architecture**: [ITCSS Methodology](https://itcss.io/)
- **Performance**: [Vite CSS Processing](https://vitejs.dev/guide/features.html#css)
- **Safe Area**: [CSS env() Function](<https://developer.mozilla.org/en-US/docs/Web/CSS/env()>)

---

_Last Updated: October 4, 2025_ _Latest Changes: Phase 1 Cleanup - Component consolidation and CSS
standardization_

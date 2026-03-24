# UI Enhancements Backlog

This document tracks low-priority UI/UX improvements and polish items that don't block functionality but would improve the user experience.

## Low Priority

### Admin Page: Navbar/Header Overlap

**Issue**: The Admin page navbar and page header overlap, causing content to be obscured by the fixed navbar.

**Fix Required**: Add proper top padding to AdminPage similar to Registry and RSVP standalone pages.

**Reference Implementation**:

- RSVP: Uses `.rsvp-standalone-page` with `.rsvp-page { padding-top: clamp(6rem, 8vw, 8rem); }` in `rsvp-enhancements.css`
- Registry: Uses `.registry-standalone-page` with `.registry-page-hero { padding: var(--spacing-12) 0 var(--spacing-8); }` in `rsvp-enhancements.css`

**Suggested Solution**:

1. Update `AdminPage.tsx` to wrap content with `<main className="standalone-page admin-standalone-page">`
2. Add CSS in `AdminDashboard.css` or `rsvp-enhancements.css`:

   ```css
   .admin-standalone-page {
     min-height: 100vh;
     background: var(--color-cream);
   }

   .admin-dashboard {
     padding-top: clamp(6rem, 8vw, 8rem);
   }
   ```

**Impact**: Low (only affects admin users, currently only you)

**Reported**: January 11, 2026

---

### Mobile: Floating RSVP Button

**Issue**: When the navbar collapses to hamburger menu on mobile, the RSVP call-to-action is hidden inside the drawer. Guests may not immediately realize they need to tap the hamburger to access RSVP.

**Fix Required**: Add a floating action button (FAB) that appears only on mobile when hamburger menu is visible.

**Suggested Implementation**:

1. Create floating RSVP button component in `client/src/components/FloatingRSVPButton.tsx`:

   ```tsx
   // Only renders on mobile viewports when user is authenticated
   // Positioned bottom-right with z-index above content
   // Links to /rsvp with smooth scroll/navigation
   ```

2. Add CSS for floating button:

   ```css
   .floating-rsvp-button {
     position: fixed;
     bottom: 2rem;
     right: 2rem;
     z-index: 998; /* Below drawer (999) but above content */
     display: none; /* Hidden by default */
   }

   @media (max-width: 768px) {
     .floating-rsvp-button {
       display: flex; /* Only visible on mobile */
     }
   }
   ```

3. Conditional rendering logic:
   - Show only when: `isMobile && isAuthenticated && !isOnRSVPPage`
   - Use `window.matchMedia('(max-width: 768px)')` to detect mobile
   - Hide when user navigates to RSVP page (redundant)
   - Optional: Add bounce animation or pulse effect to draw attention

**Alternative Approaches**:

- Add RSVP shortcut to mobile drawer header (less intrusive)
- Make hamburger icon pulse when user hasn't RSVP'd yet
- Add sticky banner at bottom instead of FAB

**Impact**: Medium (improves mobile UX for primary user action - RSVP)

**Reported**: February 1, 2026

---

## Completed Items

_(None yet)_

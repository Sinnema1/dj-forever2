# Accessibility Testing Guide - Toast Notifications

## Overview

This guide covers testing the accessibility improvements made to the toast notification system.

## Implemented Improvements

### 1. Screen Reader Support

- **ARIA live regions**: Toasts announce properly to screen readers
- **ARIA labels**: Clear notification type identification
- **Screen reader text**: Hidden descriptive text for context
- **ARIA atomic**: Ensures complete message is read

### 2. Keyboard Navigation

- **ESC key**: Dismisses toast notifications
- **Focus visible**: Clear focus indicator on close button
- **Tab navigation**: Proper tab order maintained

### 3. Reduced Motion Support

- **Respects user preferences**: No animations if `prefers-reduced-motion` is set
- **Instant transitions**: Smooth opacity changes instead of animations

### 4. WCAG Compliance

- **Role="alert"**: Proper semantic HTML
- **aria-live**: "assertive" for errors, "polite" for other types
- **aria-atomic**: Ensures complete messages are announced
- **Focus indicators**: 2px outline with offset for clarity

## Manual Testing Steps

### Test 1: Screen Reader Announcement (VoiceOver - macOS)

**Steps:**

1. Enable VoiceOver: `Cmd + F5`
2. Trigger a toast notification (e.g., failed login attempt)
3. **Expected Result**: VoiceOver announces:
   - "Error notification: Your session has expired. Please scan your QR code to log in again."
   - Or similar based on toast type

**Testing Different Toast Types:**

```javascript
// In browser console
window.dispatchEvent(
  new CustomEvent("show-toast", {
    detail: {
      type: "success",
      message: "Your RSVP has been saved successfully!",
    },
  })
);

window.dispatchEvent(
  new CustomEvent("show-toast", {
    detail: {
      type: "error",
      message: "Failed to save your RSVP. Please try again.",
    },
  })
);

window.dispatchEvent(
  new CustomEvent("show-toast", {
    detail: {
      type: "warning",
      message: "Your session will expire in 5 minutes.",
    },
  })
);
```

### Test 2: Screen Reader Announcement (NVDA - Windows)

**Steps:**

1. Install and run NVDA
2. Trigger toast notifications
3. **Expected Result**: NVDA announces toast type and message clearly

### Test 3: Screen Reader Announcement (TalkBack - Android)

**Steps:**

1. Enable TalkBack in Android Settings
2. Access the website on mobile
3. Trigger toast notifications
4. **Expected Result**: TalkBack announces notifications with proper context

### Test 4: Keyboard Navigation

**Steps:**

1. Trigger a toast notification
2. Press `ESC` key
3. **Expected Result**: Toast dismisses immediately

**Test Multiple Toasts:**

1. Trigger multiple toasts (3-4)
2. Press `ESC` repeatedly
3. **Expected Result**: Toasts dismiss one at a time

### Test 5: Focus Management

**Steps:**

1. Trigger a toast notification
2. Press `Tab` key to navigate
3. Tab to the close button
4. **Expected Result**:
   - Blue outline appears around close button
   - 2px outline with offset
   - Clear visual indicator

### Test 6: Reduced Motion Preference

**macOS Steps:**

1. Open System Preferences → Accessibility → Display
2. Enable "Reduce motion"
3. Trigger toast notifications
4. **Expected Result**:
   - No slide-in animation
   - Toast appears with simple opacity fade
   - Dismissal is instant (no exit animation)

**Windows Steps:**

1. Settings → Ease of Access → Display
2. Turn on "Show animations in Windows"
3. Trigger toast notifications
4. **Expected Result**: No animations, instant appearance

**Browser DevTools:**

```css
/* Emulate in Chrome DevTools */
/* 1. Open DevTools (F12) */
/* 2. Open Command Palette (Cmd+Shift+P or Ctrl+Shift+P) */
/* 3. Type "render" and select "Show Rendering" */
/* 4. Check "Emulate CSS media feature prefers-reduced-motion" */
```

### Test 7: Mobile Touch Navigation

**Steps:**

1. Test on actual mobile device or responsive mode
2. Trigger toast notifications
3. Verify:
   - Toasts appear at top of screen
   - Touch targets are 44px+ (iOS guideline)
   - Close button is easily tappable
   - Proper spacing on small screens

### Test 8: Color Contrast

**Tools:**

- Chrome DevTools Lighthouse
- WAVE browser extension
- axe DevTools

**Steps:**

1. Run accessibility audit
2. Check toast contrast ratios
3. **Expected Results**:
   - Text contrast: ≥ 4.5:1 (WCAG AA)
   - Icon contrast: ≥ 3:1 (WCAG AA for large text/icons)
   - Success: Green on light green bg
   - Error: Red on light red bg
   - Warning: Orange on light orange bg
   - Info: Blue on light blue bg

## Browser Compatibility Testing

### Desktop

- ✅ Chrome 90+ (Windows, macOS, Linux)
- ✅ Firefox 88+ (Windows, macOS, Linux)
- ✅ Safari 14+ (macOS)
- ✅ Edge 90+ (Windows)

### Mobile

- ✅ Safari iOS 14+
- ✅ Chrome Android 90+
- ✅ Samsung Internet 14+

## Automated Testing

### Using axe-core

```bash
npm install --save-dev @axe-core/react
```

```typescript
// In your test file
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

test("Toast should have no accessibility violations", async () => {
  const { container } = render(
    <Toast
      id="test"
      message="Test notification"
      type="success"
      onDismiss={() => {}}
    />
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Success Criteria

All tests should pass with the following outcomes:

- ✅ Screen readers announce toast type and message clearly
- ✅ ESC key dismisses toasts
- ✅ Focus indicator is visible on close button
- ✅ Reduced motion preference is respected
- ✅ ARIA labels are descriptive
- ✅ Color contrast meets WCAG AA standards
- ✅ Mobile touch targets are ≥44px
- ✅ No accessibility violations in automated tests

## Known Limitations

1. **Multiple Simultaneous Toasts**: Screen readers announce each toast individually, which could be verbose if many appear at once
2. **Auto-dismiss timing**: Cannot be paused by screen reader users (consider making critical toasts persistent with duration=0)
3. **Mobile landscape**: Toasts may obscure content on very short screens

## Recommendations for Future Improvements

1. **Toast queue management**: Limit to 3 visible toasts maximum
2. **Focus trapping**: For critical error toasts that require acknowledgment
3. **Haptic feedback**: Vibration on mobile for error toasts
4. **Sound cues**: Optional audio alerts for screen reader users (must be togglable)
5. **Persistent history**: "Toast history" panel for reviewing dismissed notifications

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices - Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Chrome DevTools Accessibility Reference](https://developer.chrome.com/docs/devtools/accessibility/reference/)

# Accessibility Testing Guide

## Overview

This guide covers testing the accessibility improvements made to the wedding website, including toast notifications, countdown timer, and RSVP form.

---

## Table of Contents

1. [Toast Notifications](#toast-notifications)
2. [Countdown Timer](#countdown-timer)
3. [RSVP Form Error Announcement](#rsvp-form-error-announcement)

---

## Toast Notifications

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
- - [Chrome DevTools Accessibility Reference](https://developer.chrome.com/docs/devtools/accessibility/reference/)

---

## RSVP Form Error Announcement

### Overview

The RSVP form includes comprehensive accessibility improvements for error handling and validation feedback.

### Implemented Improvements

#### 1. Form Structure & Semantics

- **Form labeling**: `aria-labelledby` and `aria-describedby` on form element
- **Fieldset for radio groups**: Attendance options wrapped in `<fieldset>` with `<legend>`
- **Proper label associations**: All inputs linked to labels via `for`/`id` attributes
- **Required field indicators**: `aria-label="required"` on asterisk symbols

#### 2. Error Announcement

- **Error summary**: Global error list at top of form with `role="alert"` and `aria-live="assertive"`
- **Individual field errors**: Each error has `role="alert"` and `aria-live="assertive"`
- **Error linking**: Error summary items are clickable links that focus the related field
- **aria-invalid**: Set to "true" on fields with errors
- **aria-describedby**: Links inputs to their error messages

#### 3. Screen Reader Support

- **Assertive announcements**: Errors announced immediately with `aria-live="assertive"`
- **Polite announcements**: Success messages use `aria-live="polite"`
- **Atomic updates**: `aria-atomic="true"` ensures complete messages are read
- **Descriptive labels**: Rich ARIA labels on error summary links

#### 4. Loading States

- **aria-busy**: Set to "true" during form submission
- **Progress indicators**: Loading states with `role="progressbar"`
- **Status updates**: Real-time submission progress with aria-live

### Manual Testing Steps

#### Test 1: Screen Reader Error Announcement (VoiceOver - macOS)

**Steps:**

1. Enable VoiceOver: `Cmd + F5`
2. Navigate to RSVP form
3. Select "Yes, I'll be there!" for attendance
4. Click Submit without filling required fields
5. **Expected Results**:
   - "Alert: Please fix the following 2 errors"
   - Screen reader lists all errors in summary
   - Each field error is announced when focused
   - Error messages include field context

**Test Multiple Guest Errors:**

1. Set guest count to 3
2. Leave all fields empty
3. Submit form
4. **Expected Results**:
   - "Alert: Please fix the following 6 errors" (2 errors × 3 guests)
   - Each guest's errors are announced separately
   - "Guest 1 full name: Please enter guest's full name"
   - "Guest 1 meal preference: Please select a meal preference"

#### Test 2: Error Summary Navigation

**Steps:**

1. Trigger form validation errors (submit without filling fields)
2. Use Tab key to navigate to error summary
3. Press Enter on first error link
4. **Expected Results**:
   - Focus moves to the field with the error
   - Field is scrolled into view smoothly
   - Screen reader announces field label and error

**Test Keyboard Navigation:**

1. Tab through error summary links
2. Press Enter on each link
3. **Expected Results**:
   - Each link focuses its corresponding field
   - Visual focus indicator visible
   - Smooth scroll animation to field

#### Test 3: aria-invalid State Changes

**Using Browser DevTools:**

1. Open DevTools (F12) → Elements tab
2. Locate an input field (e.g., full name)
3. Submit form to trigger errors
4. **Expected Results**:
   - Input has `aria-invalid="true"`
   - Input has `aria-describedby="guest-0-fullName-error"`
   - Error div has `role="alert"` and `aria-live="assertive"`

**Test Error Clearing:**

1. Fill in the invalid field
2. Observe attribute changes
3. **Expected Results**:
   - `aria-invalid` changes to "false"
   - Error message disappears
   - Error summary updates

#### Test 4: Screen Reader Field Descriptions (NVDA - Windows)

**Steps:**

1. Install and run NVDA
2. Navigate to RSVP form with arrow keys
3. Focus on each form field
4. **Expected Results**:
   - Field label is announced
   - Required status is announced
   - Hint text is announced (if present)
   - Error message is announced (if present)
   - Example: "Full Name, edit, required, Please enter guest's full name, alert"

#### Test 5: Mobile Screen Reader (TalkBack - Android)

**Steps:**

1. Enable TalkBack in Android Settings
2. Navigate to RSVP form
3. Submit without filling fields
4. Swipe to error summary
5. **Expected Results**:
   - TalkBack announces: "Alert: Please fix the following errors"
   - Each error is read clearly
   - Error links are focusable by swiping
   - Double-tap to activate link and focus field

#### Test 6: Form Submission Loading States

**Steps:**

1. Fill out form completely
2. Submit form
3. **Expected Results**:
   - Screen reader announces: "Processing submission..."
   - Submit button shows `aria-busy="true"`
   - Loading spinner has `aria-hidden="true"`
   - Progress bar announced with role="progressbar"

#### Test 7: Success Message Announcement

**Steps:**

1. Fill out and submit form successfully
2. **Expected Results**:
   - Screen reader announces: "Status: Amazing! RSVP submitted successfully!"
   - Success message uses `aria-live="polite"` (non-intrusive)
   - Success icon has `aria-hidden="true"`

#### Test 8: Error Recovery Flow

**Steps:**

1. Submit form with errors
2. Fix one error
3. Submit again with remaining errors
4. **Expected Results**:
   - Error summary updates to show fewer errors
   - Screen reader announces updated error count
   - Fixed field no longer appears in error summary
   - Focus management remains logical

### Automated Testing

#### Using React Testing Library

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RSVPForm from "../components/RSVP/RSVPForm";

test("Form announces errors to screen readers", async () => {
  const user = userEvent.setup();
  render(<RSVPForm />);

  // Select attending
  const yesRadio = screen.getByDisplayValue("YES");
  await user.click(yesRadio);

  // Submit without filling
  await user.click(screen.getByRole("button", { name: /submit rsvp/i }));

  // Verify error summary
  await waitFor(() => {
    const errorSummary = screen.getByRole("alert", {
      name: /please fix the following/i,
    });
    expect(errorSummary).toHaveAttribute("aria-live", "assertive");
    expect(errorSummary).toHaveAttribute("aria-atomic", "true");
  });

  // Verify individual field errors
  const nameError = screen.getByText(/please enter guest's full name/i);
  const errorElement = nameError.closest('[role="alert"]');
  expect(errorElement).toHaveAttribute("aria-live", "assertive");

  // Verify form aria-describedby
  const form = screen.getByRole("form");
  expect(form).toHaveAttribute(
    "aria-describedby",
    expect.stringContaining("form-error-summary")
  );
});

test("Error summary links focus corresponding fields", async () => {
  const user = userEvent.setup();
  render(<RSVPForm />);

  // Trigger errors
  const yesRadio = screen.getByDisplayValue("YES");
  await user.click(yesRadio);
  await user.click(screen.getByRole("button", { name: /submit rsvp/i }));

  // Wait for error summary
  await waitFor(() => {
    expect(
      screen.getByRole("alert", { name: /please fix the following/i })
    ).toBeInTheDocument();
  });

  // Verify error links
  const errorLinks = screen.getAllByRole("link");
  expect(errorLinks.length).toBeGreaterThan(0);

  errorLinks.forEach((link) => {
    expect(link).toHaveAttribute("aria-label", expect.stringContaining("Fix"));
  });
});
```

#### Using axe-core

```typescript
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

test("RSVP form has no accessibility violations", async () => {
  const { container } = render(<RSVPForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("RSVP form with errors has no accessibility violations", async () => {
  const { container } = render(<RSVPForm />);
  const user = userEvent.setup();

  // Trigger errors
  await user.click(screen.getByDisplayValue("YES"));
  await user.click(screen.getByRole("button", { name: /submit rsvp/i }));

  // Run accessibility audit on error state
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Browser Compatibility Testing

#### Desktop

- ✅ Chrome 90+ (Windows, macOS, Linux)
- ✅ Firefox 88+ (Windows, macOS, Linux)
- ✅ Safari 14+ (macOS)
- ✅ Edge 90+ (Windows)

#### Mobile

- ✅ Safari iOS 14+
- ✅ Chrome Android 90+
- ✅ Samsung Internet 14+

### Success Criteria

All tests should pass with the following outcomes:

- ✅ Form has proper `aria-labelledby` and `aria-describedby`
- ✅ Error summary appears with `role="alert"` and `aria-live="assertive"`
- ✅ Individual errors have `aria-live="assertive"`
- ✅ Fields with errors have `aria-invalid="true"`
- ✅ Error messages linked via `aria-describedby`
- ✅ Error summary links focus corresponding fields
- ✅ Screen readers announce all errors clearly
- ✅ Loading states use `aria-busy` and `role="progressbar"`
- ✅ Success messages use `aria-live="polite"`
- ✅ Required field indicators have `aria-label="required"`
- ✅ Fieldset/legend used for radio groups
- ✅ All decorative icons have `aria-hidden="true"`

### WCAG Compliance Checklist

#### Level A

- ✅ **1.3.1 Info and Relationships**: Semantic HTML with proper labels
- ✅ **2.1.1 Keyboard**: All functionality available via keyboard
- ✅ **3.3.1 Error Identification**: Errors clearly identified and described
- ✅ **3.3.2 Labels or Instructions**: All inputs have labels and hints
- ✅ **4.1.2 Name, Role, Value**: ARIA attributes properly implemented

#### Level AA

- ✅ **1.4.3 Contrast (Minimum)**: Error text meets 4.5:1 contrast ratio
- ✅ **3.3.3 Error Suggestion**: Error messages provide correction guidance
- ✅ **3.3.4 Error Prevention**: Confirmation flow prevents accidental submissions

### Known Limitations

1. **Long error lists**: If 10+ errors, summary may be verbose for screen readers
2. **Mobile scrolling**: Error summary at top may require manual scroll on small screens
3. **Dynamic guest forms**: Screen readers may need re-announcement when guest count changes

### Recommendations for Future Improvements

1. **Inline validation**: Real-time validation as user types (already partially implemented)
2. **Field grouping**: Logical field groups with `<fieldset>` for better navigation
3. **Smart focus**: Focus first error field automatically on validation failure
4. **Error icons**: Visual error indicators for users who don't rely on color alone
5. **Error persistence**: Keep error summary visible while scrolling to fields

### Resources

- [WCAG 2.1 - Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html)
- [ARIA Authoring Practices - Form Validation](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
- [WebAIM - Accessible Form Validation](https://webaim.org/techniques/formvalidation/)
- [ARIA: invalid state](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid)

```

```

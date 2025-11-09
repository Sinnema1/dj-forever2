# Authentication & Token Expiration Testing Guide

## Overview

This guide covers manual testing for the newly implemented authentication improvements including:

- JWT token expiration detection and auto-logout
- 5-minute session expiration warnings
- AdminRoute user feedback via toast notifications

## Prerequisites

- Development environment running (`npm run dev` from root)
- Access to browser developer tools
- Test user accounts (regular user and admin user)

## Test Scenarios

### 1. Token Expiration Auto-Logout

**Objective**: Verify that expired tokens trigger automatic logout with user feedback

**Steps**:

1. Log in with a valid QR code
2. Open browser DevTools → Application → Local Storage
3. Find the `id_token` value
4. Manually modify the token's expiration (`exp` claim) to be in the past:
   - Copy current token value
   - Decode it at https://jwt.io
   - Note the current `exp` value (Unix timestamp)
   - Calculate a past timestamp (e.g., current time - 1 hour)
   - You can't manually edit the token without breaking signature, so instead:
     - Wait for the 30-second polling interval to trigger
     - OR refresh the page to trigger initial token validation

**Alternative Approach** (simpler):

1. Log in normally
2. In AuthContext.tsx, temporarily change line 137 from:
   ```typescript
   if (isTokenExpired(storedToken)) {
   ```
   to:
   ```typescript
   if (true || isTokenExpired(storedToken)) { // TESTING ONLY
   ```
3. Refresh the page
4. **Expected Result**:

   - User is logged out automatically
   - Error toast appears: "Your session has expired. Please log in again."
   - localStorage is cleared
   - User is redirected to login/home page

5. **Remember to revert the test change!**

### 2. Session Expiration Warning (5-Minute Threshold)

**Objective**: Verify that users receive a warning 5 minutes before token expiration

**Steps**:

1. Log in with a valid QR code
2. In AuthContext.tsx, temporarily change line 215 from:
   ```typescript
   if (expirationInfo.shouldWarn && !hasShownExpirationWarning.current) {
   ```
   to:
   ```typescript
   if (true && !hasShownExpirationWarning.current) { // TESTING ONLY
   ```
3. Wait up to 30 seconds for the polling interval to trigger
4. **Expected Result**:

   - Warning toast appears: "Your session will expire in X minutes. Please save your work."
   - Toast auto-dismisses after 10 seconds
   - Warning only appears once (not repeatedly every 30 seconds)

5. **Remember to revert the test change!**

**Alternative Real-World Test** (requires token modification):

1. Generate a test JWT token with short expiration (6 minutes from now)
2. Manually set it in localStorage as `id_token`
3. Refresh the page
4. Wait 1 minute (token now has 5 minutes remaining)
5. Wait for next 30-second polling cycle
6. Warning toast should appear

### 3. AdminRoute - Logged Out User Feedback

**Objective**: Verify that logged-out users see helpful feedback when accessing admin pages

**Steps**:

1. Ensure you are logged out (clear localStorage or use incognito window)
2. Navigate directly to an admin route: `http://localhost:3002/admin/dashboard`
3. **Expected Result**:

   - Error toast appears: "Please log in to access the admin dashboard"
   - Toast auto-dismisses after 5 seconds
   - Loading spinner displays (user is not authenticated)
   - User stays on admin route but sees no admin content

4. Verify toast appears only once (not repeatedly on re-renders)

### 4. AdminRoute - Non-Admin User Feedback

**Objective**: Verify that authenticated non-admin users see appropriate feedback

**Steps**:

1. Log in as a **regular user** (not an admin)
   - Use a QR code for a non-admin test account
2. Navigate to admin route: `http://localhost:3002/admin/dashboard`
3. **Expected Result**:
   - Warning toast appears: "You don't have permission to access this page"
   - Toast auto-dismisses after 5 seconds
   - User is redirected away from admin route (or sees unauthorized message)
   - Toast appears only once

### 5. localStorage Cleanup on Logout

**Objective**: Verify that token is properly removed from localStorage on logout

**Steps**:

1. Log in with valid QR code
2. Open DevTools → Application → Local Storage
3. Confirm `id_token` exists
4. Trigger auto-logout via expired token (see Test #1)
5. **Expected Result**:

   - `id_token` is removed from localStorage
   - No orphaned authentication data remains

6. Also test manual logout:
   - Log in again
   - Click logout button (if available)
   - Verify `id_token` is removed

### 6. No Duplicate Warning Toasts

**Objective**: Verify that re-renders don't cause duplicate toast notifications

**Steps**:

1. Log in as non-admin user
2. Navigate to admin route to trigger "no permission" warning
3. Cause component re-renders:
   - Resize browser window
   - Switch browser tabs and return
   - Open/close DevTools
4. **Expected Result**:
   - Warning toast appears only once
   - No duplicate toasts on re-renders
   - Same behavior for session expiration warnings (Test #2)

### 7. Toast Auto-Dismiss Timing

**Objective**: Verify toast notifications auto-dismiss at correct intervals

**Toast Types and Durations**:

- Error toasts (auto-logout): 5 seconds
- Warning toasts (session expiration): 10 seconds
- Warning toasts (admin access): 5 seconds

**Steps**:

1. Trigger each toast type (Tests #1-4)
2. Use a stopwatch or browser timer
3. **Expected Result**:
   - Each toast dismisses at the specified duration
   - Toast fades out smoothly (300ms exit animation)

### 8. Cross-Browser Testing

**Objective**: Verify authentication flows work across browsers

**Browsers to Test**:

- Chrome/Edge (Chromium)
- Safari
- Firefox

**Tests to Repeat**:

- Test #1: Auto-logout on expiration
- Test #2: Session expiration warning
- Test #3: AdminRoute logged-out feedback
- Test #4: AdminRoute non-admin feedback

**Expected Result**: Consistent behavior across all browsers

## Success Criteria

All tests should pass with the following outcomes:

- ✅ Expired tokens trigger automatic logout with clear error message
- ✅ 5-minute warning appears before session expiration
- ✅ Warning appears only once (no duplicates)
- ✅ Logged-out users see helpful feedback on admin routes
- ✅ Non-admin users see appropriate permission denied messages
- ✅ localStorage is properly cleaned up on logout
- ✅ Toast notifications auto-dismiss at correct intervals
- ✅ No duplicate toasts on component re-renders
- ✅ Consistent behavior across Chrome, Safari, Firefox

## Known Limitations

1. **Client-Side Token Validation**: The client decodes JWT tokens without verifying signatures. This is safe because:

   - Server always validates token signatures on GraphQL requests
   - Client-side checks are for UX only (preventing unnecessary API calls)
   - Malicious users can't gain elevated privileges by modifying client tokens

2. **30-Second Polling Interval**: Token expiration is checked every 30 seconds, not in real-time:

   - Maximum delay for auto-logout: 30 seconds after actual expiration
   - Acceptable trade-off for performance (avoids constant checking)

3. **Toast Positioning**: Toasts appear in top-right on desktop, top-center on mobile
   - Mobile uses slide-down animation
   - Desktop uses slide-from-right animation

## Debugging Tips

### Toast Not Appearing

- Check browser console for errors
- Verify ToastProvider is wrapping App in App.tsx
- Check that custom event is being dispatched (AuthContext line 193 or 220)
- Verify event listener is attached (ToastContext.tsx line 64)

### Auto-Logout Not Triggering

- Check that token actually has `exp` claim (decode at jwt.io)
- Verify 30-second interval is running (add console.log in useEffect)
- Check isTokenExpired() is returning true (add logging)

### Warning Appearing Multiple Times

- Check hasShownExpirationWarning ref is being set (line 221)
- Verify ref persists across re-renders (shouldn't reset)
- Check if multiple instances of AuthContext exist (shouldn't happen)

### AdminRoute Feedback Not Showing

- Verify hasShownToast ref prevents duplicates (AdminRoute.tsx line 27)
- Check useToast hook is available (ToastContext wrapping)
- Confirm user and isAdmin states are correct

## Cleanup After Testing

**Remember to revert any temporary test changes**:

1. AuthContext.tsx line 137: Remove `true ||` from token expiration check
2. AuthContext.tsx line 215: Remove `true &&` from warning condition
3. Any manually modified localStorage values
4. Any test tokens with modified expiration times

## Next Steps After Testing

Once all tests pass:

1. Update ROUTING_AUTHENTICATION_TODO.md to mark items complete
2. Commit changes with message: "feat: implement JWT token expiration and session warnings"
3. Update manage_todo_list to mark Task #6 as completed
4. Consider moving to next priority TODO item (Personalized Modal Enhancement or Mobile Enhancements)

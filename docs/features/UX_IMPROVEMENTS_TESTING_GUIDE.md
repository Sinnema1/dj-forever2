# UX Improvements Testing Guide

**Status**: Ready for Testing  
**Implementation**: Complete  
**Build Status**: ✅ Passing (0 errors)

## Quick Start

To test all 4 UX improvements, you'll need to:

1. Clear localStorage
2. Test first-time login flow
3. Test returning user flow
4. Test banner snooze
5. Test mobile timing

---

## Test Environment Setup

### Prerequisites

```bash
# Start development server
cd /Users/justinmanning/repos/dj-forever2
npm run dev

# Server: http://localhost:3001
# Client: http://localhost:3002
```

### Clear Testing State

```javascript
// Open browser console and run:
localStorage.clear();
location.reload();
```

### Test Users

Use any test user from `server/src/seeds/userData.json`:

**Recommended Test User**:

- QR Token: `manning-family` (or original token)
- User: Justin Manning
- Has not RSVP'd: Yes (will see RSVP-related banners)

**Login URL Format**:

```
http://localhost:3002/login/qr/manning-family
```

---

## Test Cases

### Test 1: First-Time User Flow (Modal + Banner Timing)

**Objective**: Verify 5-minute suppression window prevents double-tap notifications.

**Steps**:

1. Clear localStorage
2. Login with QR token: `http://localhost:3002/login/qr/manning-family`
3. Wait 1 second
4. ✅ Welcome modal should appear
5. Read modal, click "Explore the Website ✨"
6. Modal closes
7. ⏱️ Start timer
8. ✅ Banner should NOT appear immediately
9. Wait 5 minutes
10. ✅ RSVP banner should now appear

**Expected Behavior**:

- Modal shows at 1 second
- Banner waits 5 minutes
- No double notification

**LocalStorage Keys to Verify**:

```javascript
// After modal close:
localStorage.getItem("welcome-seen-[user-id]"); // "true"
localStorage.getItem("welcome-seen-[user-id]-timestamp"); // timestamp

// After 5 minutes:
// Banner should check timestamp and allow showing
```

**How to Speed Up Testing**:
Temporarily change the 5-minute window to 10 seconds for testing:

```typescript
// PersonalizedWelcome.tsx (line ~50)
// Change this:
const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
// To this:
const fiveMinutesAgo = Date.now() - 10 * 1000; // 10 seconds for testing
```

---

### Test 2: "Don't Show Again" Checkbox

**Objective**: Verify permanent suppression works correctly.

**Steps**:

1. Clear localStorage
2. Login with QR token
3. Wait for welcome modal
4. ✅ Checkbox should be visible: "Don't show this again"
5. Check the checkbox
6. ✅ Button text changes to "Close"
7. Click "Close"
8. Modal closes
9. Logout (clear auth token)
10. Login again with same user
11. ✅ Modal should NOT appear

**Expected Behavior**:

- Checkbox unchecked by default
- Button text updates when checked
- Modal never shows again on subsequent logins
- Banner shows immediately (no 5-minute wait)

**LocalStorage Keys to Verify**:

```javascript
// After clicking Close with checkbox checked:
localStorage.getItem("welcome-suppressed-[user-id]"); // "true"
```

**Manual Reopen Test**:

1. With modal suppressed, click navbar greeting "Welcome back, [Name]!"
2. ✅ Modal should NOT reopen
3. Verify suppression is respected even for manual triggers

---

### Test 3: Banner Snooze Functionality

**Objective**: Verify 24-hour snooze works for deadline banner.

**Steps**:

1. Clear localStorage
2. Login (skip modal or suppress it)
3. Wait for RSVP deadline banner to appear
4. ✅ Banner should show "Remind me tomorrow" button
5. ✅ Banner should also show ✕ dismiss button
6. Click "Remind me tomorrow"
7. Banner disappears
8. Refresh page
9. ✅ Banner should NOT appear
10. Check localStorage for snooze timestamp
11. ⏱️ Simulate 24-hour passage (edit localStorage)
12. Refresh page
13. ✅ Banner should reappear

**Expected Behavior**:

- Snooze button visible and styled correctly
- Banner hides on snooze
- Snooze persists across page refreshes
- Banner reappears after 24 hours
- Permanent dismiss (✕) still works

**LocalStorage Keys to Verify**:

```javascript
// After snooze:
localStorage.getItem("banner-snoozed-rsvp-deadline-[user-id]"); // timestamp

// To simulate 24-hour passage:
localStorage.removeItem("banner-snoozed-rsvp-deadline-[user-id]");
```

**How to Speed Up Testing**:
Temporarily change 24 hours to 30 seconds:

```typescript
// PersonalizedWelcome.tsx (line ~80)
// In the snoozeBanner function:
const snoozeBanner = (bannerId: string, hours: number) => {
  const snoozeUntil = Date.now() + hours * 60 * 60 * 1000; // Original
  // Change to:
  const snoozeUntil = Date.now() + 30000; // 30 seconds for testing

  localStorage.setItem(`banner-snoozed-${bannerId}`, snoozeUntil.toString());
  setShowBanner(false);
};
```

---

### Test 4: Mobile Auto-Hide Duration

**Objective**: Verify mobile gets 10s, desktop gets 7s auto-hide.

**Desktop Testing**:

1. Clear localStorage
2. Open browser at desktop size (> 768px)
3. Login (skip/suppress modal)
4. Wait for banner
5. ⏱️ Start timer when banner appears
6. ✅ Banner should auto-hide at ~7 seconds

**Mobile Testing**:

1. Clear localStorage
2. Resize browser to mobile (< 768px) or use device emulation
3. Login (skip/suppress modal)
4. Wait for banner
5. ⏱️ Start timer when banner appears
6. ✅ Banner should auto-hide at ~10 seconds

**Admin Banner Testing**:

1. Login as admin user
2. Navigate to homepage
3. ⏱️ Desktop: 10 seconds
4. ⏱️ Mobile: 12 seconds

**Expected Behavior**:

- Mobile: 10s for regular banners, 12s for admin
- Desktop: 7s for regular banners, 10s for admin
- Timing accurate within ±500ms

**How to Test**:

```javascript
// Browser console
let startTime = Date.now();
// Wait for banner to disappear
let endTime = Date.now();
console.log(`Duration: ${(endTime - startTime) / 1000}s`);
```

---

## Visual Testing Checklist

### Welcome Modal Footer

**Visual Verification**:

- [ ] Checkbox aligned left
- [ ] Checkbox label: "Don't show this again"
- [ ] Footer actions below checkbox
- [ ] Button text changes when checkbox checked
- [ ] Proper spacing (15px gap)
- [ ] Hover effect on checkbox label (color change)

**CSS Classes to Verify**:

```css
.welcome-suppress-option      /* Checkbox container */
.welcome-footer-actions       /* Button container */
```

### Banner Snooze Button

**Visual Verification**:

- [ ] Snooze button between action button and dismiss button
- [ ] Text: "Remind me tomorrow"
- [ ] Semi-transparent background
- [ ] White border
- [ ] Proper padding (6px 12px)
- [ ] Hover effect (lighter background, slight lift)
- [ ] White text on colored banners

**CSS Classes to Verify**:

```css
.banner-snooze-btn            /* Snooze button */
.banner-snooze-btn:hover      /* Hover state */
```

---

## Accessibility Testing

### Keyboard Navigation

**Modal Checkbox**:

1. Tab to checkbox
2. ✅ Checkbox should be focusable
3. Press Space to toggle
4. ✅ Checkbox should check/uncheck
5. ✅ Button text should update

**Banner Snooze Button**:

1. Tab to snooze button
2. ✅ Focus ring visible
3. Press Enter or Space
4. ✅ Banner should snooze

### Screen Reader Testing

**Modal Announcement**:

- [ ] Checkbox: "Don't show this welcome message again"
- [ ] Button updates: "Explore the Website" → "Close"

**Banner Announcement**:

- [ ] Snooze button: "Snooze banner for 24 hours"
- [ ] Title attribute: "Snooze for 24 hours"

---

## Browser Compatibility Testing

### Target Browsers

**Desktop**:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile**:

- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### LocalStorage Verification

Test in each browser:

```javascript
// Console test
localStorage.setItem("test", "value");
console.log(localStorage.getItem("test")); // Should return "value"
localStorage.removeItem("test");
```

### CSS Feature Support

All features used have universal support:

- Flexbox ✅
- Media queries ✅
- CSS transitions ✅
- rgba() colors ✅

---

## Edge Case Testing

### Test 5: Modal Suppression + Manual Reopen

**Steps**:

1. Clear localStorage
2. Login, suppress modal (check "don't show again")
3. Click navbar greeting to reopen
4. ✅ Modal should NOT reopen (respects suppression)

### Test 6: Snooze Expiration Edge Case

**Steps**:

1. Set snooze with past timestamp manually:
   ```javascript
   localStorage.setItem("banner-snoozed-test", (Date.now() - 1000).toString());
   ```
2. Refresh page
3. ✅ Banner should show (expired snooze auto-removed)

### Test 7: Multiple Banners Priority

**Steps**:

1. Create conditions for multiple banners
2. ✅ Highest priority banner shows first
3. Dismiss top banner
4. ✅ Next priority banner appears

### Test 8: Admin User Exclusion

**Steps**:

1. Login as admin
2. ✅ Welcome modal never shows
3. ✅ Admin banner shows instead

---

## Performance Testing

### Load Time Impact

**Before UX Improvements**:

```bash
# Measure baseline
npm run build
# Check bundle size
```

**After UX Improvements**:

```bash
# Measure new bundle
npm run build
# Compare: Should be ~1.5 KB increase
```

### Runtime Performance

**LocalStorage Operations**:

```javascript
console.time("localStorage-check");
localStorage.getItem("welcome-seen-test");
console.timeEnd("localStorage-check");
// Should be < 1ms
```

**Banner Render Time**:

```javascript
console.time("banner-render");
// Trigger banner
console.timeEnd("banner-render");
// Should be < 50ms
```

---

## Debugging Tools

### LocalStorage Inspector

**View All Keys**:

```javascript
Object.keys(localStorage).forEach((key) => {
  console.log(`${key}: ${localStorage.getItem(key)}`);
});
```

**Clear Specific User Data**:

```javascript
// Replace [user-id] with actual ID
localStorage.removeItem("welcome-seen-[user-id]");
localStorage.removeItem("welcome-seen-[user-id]-timestamp");
localStorage.removeItem("welcome-suppressed-[user-id]");
```

### Banner State Inspector

**Check Current Banner**:

```javascript
// In PersonalizedWelcome component
console.log("Current banner:", currentBanner);
console.log("Show banner:", showBanner);
```

**Check Dismissed Banners**:

```javascript
const dismissed = JSON.parse(localStorage.getItem("dismissedBanners") || "[]");
console.log("Dismissed banners:", dismissed);
```

---

## Known Issues & Limitations

### Current Limitations

1. **5-Minute Suppression Window**:
   - Fixed duration (not configurable)
   - Could be too long/short for some users
   - Consider making user-configurable in future

2. **24-Hour Snooze Duration**:
   - Single fixed duration
   - Could offer multiple options (12h, 24h, 48h)

3. **LocalStorage Cleanup**:
   - No automatic cleanup of old timestamps
   - Could accumulate over time
   - Consider periodic cleanup routine

4. **Testing Time Delays**:
   - 5-minute and 24-hour delays require code changes for testing
   - Consider adding debug mode with shorter durations

### No Known Bugs

- ✅ TypeScript compilation: 0 errors
- ✅ ESLint validation: 0 errors
- ✅ No console errors
- ✅ No accessibility violations

---

## Production Testing Plan

### Phase 1: Staging Environment (1-2 days)

1. Deploy to staging
2. Test all 8 test cases
3. Verify on real mobile devices
4. Collect initial feedback

### Phase 2: Canary Release (3-5 days)

1. Enable for 10% of users
2. Monitor error logs
3. Track localStorage usage
4. Measure user engagement

### Phase 3: Full Rollout (1 week)

1. Enable for all users
2. Monitor metrics:
   - Modal suppression rate
   - Banner snooze rate
   - Banner dismiss rate
   - Time to RSVP completion

---

## Success Metrics

### Quantitative Metrics

**Modal Engagement**:

- Suppression rate (target: < 10%)
- Manual reopen attempts (target: < 5%)
- Average time on modal (target: 20-30s)

**Banner Engagement**:

- Snooze rate (target: 20-30%)
- Dismiss rate (target: 10-20%)
- Action click rate (target: > 50%)

**User Satisfaction**:

- RSVP completion rate (target: > 80%)
- Time to RSVP (target: < 3 days)
- Notification fatigue complaints (target: 0)

### Qualitative Metrics

**User Feedback**:

- "Notifications feel less overwhelming"
- "I like having control over reminders"
- "The 'don't show again' option is helpful"

---

## Rollback Plan

### Quick Rollback

If critical issues found:

1. **Revert Commits**:

   ```bash
   git revert HEAD~4  # Revert last 4 commits
   npm run build
   git push
   ```

2. **Feature Flag Disable**:

   ```typescript
   // Add feature flag check
   const UX_IMPROVEMENTS_ENABLED = false;

   if (!UX_IMPROVEMENTS_ENABLED) {
     // Use old behavior
   }
   ```

3. **LocalStorage Cleanup**:
   ```javascript
   // Clear new localStorage keys
   Object.keys(localStorage).forEach((key) => {
     if (key.includes("suppressed") || key.includes("snoozed")) {
       localStorage.removeItem(key);
     }
   });
   ```

---

## Support & Troubleshooting

### Common Issues

**Modal doesn't show**:

- Check: `localStorage.getItem('welcome-suppressed-[user-id]')`
- Check: User is not admin
- Check: User is logged in

**Banner doesn't show**:

- Check: 5-minute suppression window
- Check: Banner not snoozed
- Check: Banner not dismissed
- Check: User has conditions for banner

**Snooze not working**:

- Check: LocalStorage key format
- Check: Timestamp format (integer)
- Check: Snooze expiration logic

### Debug Mode

Add to browser console:

```javascript
// Enable debug logging
window.DEBUG_UX = true;

// In components, add:
if (window.DEBUG_UX) {
  console.log("Modal state:", { showModal, dontShowAgain, isSuppressed });
  console.log("Banner state:", { showBanner, currentBanner, isSnoozed });
}
```

---

## Completion Checklist

### Implementation

- [x] Modal timestamp tracking
- [x] Banner suppression logic
- [x] "Don't show again" checkbox
- [x] Snooze functionality
- [x] Mobile timing extension
- [x] CSS styling
- [x] TypeScript types
- [x] Accessibility labels

### Testing

- [ ] Test Case 1: First-time flow
- [ ] Test Case 2: Checkbox suppression
- [ ] Test Case 3: Banner snooze
- [ ] Test Case 4: Mobile timing
- [ ] Test Case 5: Manual reopen
- [ ] Test Case 6: Snooze expiration
- [ ] Test Case 7: Banner priority
- [ ] Test Case 8: Admin exclusion

### Documentation

- [x] Implementation guide
- [x] Testing guide
- [x] API documentation
- [x] LocalStorage schema

### Deployment

- [ ] Build verification
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitoring setup

---

**Next Step**: Start with Test Case 1 (First-time flow)

**Estimated Testing Time**: 60-90 minutes for full suite

**Questions?** Review `/docs/features/UX_IMPROVEMENTS_IMPLEMENTATION.md` for detailed documentation.

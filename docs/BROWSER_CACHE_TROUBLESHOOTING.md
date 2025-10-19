# Browser Cache Troubleshooting Guide

## Overview

After deploying routing fixes, you may experience issues where old navigation paths are still active even though the code has been updated. This is due to **browser caching** of JavaScript bundles and service worker caches.

## Common Symptoms

### 1. RSVP Button Not Working

**Symptom**: Clicking "RSVP Now" button does nothing or scrolls to wrong location
**Cause**: Browser cached old JavaScript with `href="#rsvp"` instead of `href="/rsvp"`
**Files Affected**:

- `PersonalizedWelcome.tsx` (fixed in commit `fd9a342`)
- `RSVPButton.tsx` (fixed in commit `d9f5792`)
- `WelcomeModal.tsx` (fixed in commit `fd9a342`)

### 2. Logo/Brand Link Not Working

**Symptom**: "Dominique & Justin" logo doesn't navigate to homepage
**Cause**: Browser cached old JavaScript or React Router not initializing
**File**: `Navbar.tsx` - uses `<Link to="/">` (correct implementation)

### 3. Confirmation Links Go to 404

**Symptom**: "View Wedding Details" or "Travel Information" show 404 errors
**Cause**: Browser cached old routes `/details` and `/travel` instead of `/#details` and `/#travel`
**File**: `RSVPConfirmation.tsx` (fixed in commit `fd9a342`)

## Resolution Steps

### For Users (Production Site)

#### Option 1: Hard Refresh (Recommended)

**Chrome/Firefox/Edge (Windows/Linux)**:

```
Ctrl + Shift + R
```

**Chrome/Firefox/Edge (Mac)**:

```
Cmd + Shift + R
```

**Safari (Mac)**:

```
Option + Cmd + E (to clear cache)
Then: Cmd + R (to reload)
```

#### Option 2: Clear Site Data (Most Thorough)

**Chrome**:

1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Clear site data" in left sidebar
4. Check all boxes
5. Click "Clear site data" button
6. Close DevTools
7. Hard refresh (Ctrl/Cmd + Shift + R)

**Firefox**:

1. Open DevTools (F12)
2. Go to "Storage" tab
3. Right-click domain
4. Select "Delete All"
5. Close DevTools
6. Hard refresh (Ctrl/Cmd + Shift + R)

**Safari**:

1. Safari menu → Preferences → Privacy
2. Click "Manage Website Data"
3. Search for your site
4. Click "Remove"
5. Hard refresh page

#### Option 3: Private/Incognito Window (For Testing)

**All Browsers**:

```
Chrome/Edge: Ctrl/Cmd + Shift + N
Firefox: Ctrl/Cmd + Shift + P
Safari: Cmd + Shift + N
```

This ensures no cached data is used.

### For Developers

#### During Development

```bash
# Always run with cache disabled in DevTools
# Chrome/Firefox/Edge: F12 → Network tab → Check "Disable cache"
npm run dev
```

#### Testing Production Build Locally

```bash
# Build fresh
npm run build

# Clear Vite cache
rm -rf client/.vite
rm -rf client/dist

# Rebuild
cd client && npm run build
```

#### Force Cache Bust in Code

If issues persist, consider adding cache busting:

**vite.config.ts**:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Force new hashes on every build
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
});
```

## Service Worker Issues

### PWA Service Worker Caching

Our site uses Vite PWA plugin which registers a service worker for offline functionality.

**Symptoms**:

- Old routes still work even after hard refresh
- Changes not appearing despite multiple refreshes

**Resolution**:

```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => registration.unregister());
  location.reload();
});
```

Or manually in Chrome:

1. DevTools → Application → Service Workers
2. Click "Unregister" for all service workers
3. Hard refresh page

### Service Worker Update Strategy

Our `vite.config.ts` is configured for auto-updates:

```typescript
VitePWA({
  registerType: "autoUpdate",
  workbox: {
    clientsClaim: true,
    skipWaiting: true,
  },
});
```

This means:

- Service worker updates automatically
- New version takes effect on next page load
- Users may need **2 refreshes**: one to download update, one to activate

## Deployment Best Practices

### Pre-Deployment Checklist

1. ✅ All routing changes committed
2. ✅ TypeScript compilation passes
3. ✅ All tests pass
4. ✅ Production build successful
5. ✅ Tested in local production build

### Post-Deployment Verification

1. **Test in Incognito**: Always test in private/incognito first
2. **Hard Refresh**: Do hard refresh before reporting issues
3. **Check Console**: Open DevTools console for errors
4. **Network Tab**: Verify correct files are loading (check hash values)
5. **Service Worker**: Check if service worker is updating

### Communicating to Users

When deploying routing fixes, inform users:

```
🔄 Website Update Notice 🔄

We've deployed navigation improvements. If you experience any issues:
1. Hold Ctrl+Shift (Cmd+Shift on Mac) and press R
2. Or try opening the site in a private/incognito window

This clears cached data and loads the latest version.
```

## Debugging Tools

### Chrome DevTools Network Tab

Check if correct files are loading:

1. F12 → Network tab
2. Enable "Disable cache" checkbox
3. Reload page
4. Look for `main.[hash].js` files
5. Verify hash values are new (compare to previous build)

### Check Current Service Worker

```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then((registrations) => {
  console.log("Active Service Workers:", registrations);
  registrations.forEach((reg) => {
    console.log("Scope:", reg.scope);
    console.log("Active:", reg.active);
    console.log("Waiting:", reg.waiting);
  });
});
```

### Check Local Storage

```javascript
// View stored data
console.log("LocalStorage:", localStorage);
console.log("SessionStorage:", sessionStorage);

// Clear specific keys
localStorage.removeItem("welcome-seen-USER_ID");
```

## Known Issues Fixed

### Commit History

- `fd9a342` - Fixed PersonalizedWelcome, RSVPConfirmation, WelcomeModal routing
- `d9f5792` - Fixed RSVPButton component routing
- `1d224bd` - Fixed RSVP form state management

### Routes That Changed

| Old Route  | New Route   | Change Type                   |
| ---------- | ----------- | ----------------------------- |
| `#rsvp`    | `/rsvp`     | Hash → Standalone page        |
| `/details` | `/#details` | Standalone → Homepage section |
| `/travel`  | `/#travel`  | Standalone → Homepage section |

## Prevention Strategies

### 1. Consistent Route Patterns

- **Page routes**: Always use `/path` (e.g., `/rsvp`, `/admin`)
- **Homepage sections**: Always use `/#section` (e.g., `/#details`, `/#travel`)
- **Never use**: Bare hash links like `#rsvp` without corresponding section ID

### 2. Route Testing

Add E2E tests for all navigation flows:

```typescript
// Example test
test("RSVP button navigates to standalone page", async () => {
  const rsvpButton = screen.getByRole("link", { name: /rsvp/i });
  expect(rsvpButton).toHaveAttribute("href", "/rsvp");
  // NOT href="#rsvp"
});
```

### 3. Documentation

Keep `docs/ROUTING_GUIDE.md` updated with all routes and their purposes.

## Support Escalation

If issues persist after trying all resolution steps:

1. **Check Deployment**: Verify correct build was deployed to Render.com
2. **Check DNS**: Verify DNS is pointing to correct deployment
3. **Check CDN**: If using CDN, verify cache is cleared
4. **Browser Extensions**: Disable extensions that might interfere
5. **Different Device**: Test on completely different device/network

## Summary

**Most common solution**: Hard refresh (Ctrl/Cmd + Shift + R)

**For persistent issues**: Clear site data in DevTools

**For developers**: Always test with cache disabled during development

**After deployment**: Wait ~2 minutes for service worker to update, then hard refresh

# PWA Testing Guide - DJ Forever 2 Wedding Website

**Date**: November 22, 2025  
**Testing Focus**: Progressive Web App functionality, offline capabilities, installation, and updates

---

## 📋 Test Checklist

### Phase 1: Desktop Testing (Chrome/Edge)

- [ ] **PWA Installation**

  - [ ] Visit production site: https://dj-forever2.onrender.com
  - [ ] Check for install prompt in address bar (⊕ icon)
  - [ ] Install PWA from Chrome menu → "Install DJ Forever 2 Wedding Website"
  - [ ] Verify app opens in standalone window
  - [ ] Check app icon in taskbar/dock matches manifest

- [ ] **Offline Functionality**

  - [ ] Load site fully while online
  - [ ] Open DevTools → Application → Service Workers
  - [ ] Verify service worker is "activated and running"
  - [ ] Enable "Offline" checkbox in Service Workers panel
  - [ ] Navigate to different pages (Home, RSVP, Gallery)
  - [ ] Verify pages load from cache
  - [ ] Check images render correctly
  - [ ] Test GraphQL queries (should show cached data or fallback)

- [ ] **Cache Inspection**

  - [ ] DevTools → Application → Cache Storage
  - [ ] Verify caches exist:
    - `workbox-precache-v2-...` (HTML, CSS, JS)
    - `wedding-images-cache` (photos)
    - `wedding-graphql-cache` (API responses)
    - `google-fonts-stylesheets` & `google-fonts-webfonts`
  - [ ] Check file counts and sizes are reasonable
  - [ ] Verify no duplicate entries

- [ ] **Update Mechanism**
  - [ ] Note current service worker version (DevTools → Application)
  - [ ] Make a small code change (e.g., update a color in CSS)
  - [ ] Rebuild and deploy to production
  - [ ] Refresh page (or wait 60 seconds)
  - [ ] Verify new service worker appears in "waiting" state
  - [ ] Check if auto-update triggers (should skip waiting automatically)
  - [ ] Verify page reloads with new version

### Phase 2: iOS Testing (Safari)

**Requirements**: iPhone or iPad with iOS 15.4+

- [ ] **PWA Installation - iOS Safari**

  - [ ] Open https://dj-forever2.onrender.com in Safari
  - [ ] Tap Share button (□↑)
  - [ ] Scroll down and tap "Add to Home Screen"
  - [ ] Verify app name shows as "D&J Wedding"
  - [ ] Confirm icon appears correctly
  - [ ] Tap "Add" to install

- [ ] **Launch & Standalone Mode**

  - [ ] Launch app from Home Screen
  - [ ] Verify app opens in full-screen (no Safari chrome/URL bar)
  - [ ] Check status bar shows theme color (#C9A66B - gold)
  - [ ] Verify splash screen displays correctly
  - [ ] Navigate through all sections

- [ ] **Offline Testing - iOS**

  - [ ] While app is open and fully loaded
  - [ ] Enable Airplane Mode (Settings or Control Center)
  - [ ] Force close the app (swipe up from app switcher)
  - [ ] Relaunch app from Home Screen
  - [ ] Verify home page loads
  - [ ] Navigate to cached pages (RSVP, Gallery, etc.)
  - [ ] Check images load from cache
  - [ ] Try to submit RSVP (should show network error gracefully)
  - [ ] Disable Airplane Mode
  - [ ] Verify app reconnects and syncs

- [ ] **iOS-Specific Features**
  - [ ] App Shortcuts (long-press app icon)
    - Verify "RSVP" shortcut exists
    - Verify "Gallery" shortcut exists
    - Test both shortcuts open correct pages
  - [ ] Orientation changes (portrait ↔ landscape)
  - [ ] Safari View Controller integration
  - [ ] External link handling

### Phase 3: Android Testing (Chrome)

**Requirements**: Android phone with Chrome 90+

- [ ] **PWA Installation - Android Chrome**

  - [ ] Open https://dj-forever2.onrender.com in Chrome
  - [ ] Wait for "Add to Home Screen" banner (bottom of screen)
  - [ ] Tap "Add to Home Screen" or Chrome menu → "Install app"
  - [ ] Verify app name and icon preview
  - [ ] Tap "Install"
  - [ ] Check app icon appears on Home Screen

- [ ] **Launch & Standalone Mode**

  - [ ] Launch app from Home Screen
  - [ ] Verify standalone mode (no Chrome browser UI)
  - [ ] Check theme color in status bar (#C9A66B)
  - [ ] Verify splash screen shows correctly
  - [ ] Navigate through sections

- [ ] **Offline Testing - Android**

  - [ ] Load full site while online
  - [ ] Enable Airplane Mode (quick settings)
  - [ ] Close and reopen app
  - [ ] Navigate between pages
  - [ ] Verify cached content loads
  - [ ] Test image loading
  - [ ] Try GraphQL operations (should fail gracefully)
  - [ ] Disable Airplane Mode
  - [ ] Verify reconnection

- [ ] **Android-Specific Features**
  - [ ] App shortcuts (long-press icon)
  - [ ] Share target integration
  - [ ] Notification permissions (if implemented)
  - [ ] "Add to Home Screen" custom install prompt

### Phase 4: Cross-Browser Testing

- [ ] **Safari (macOS)**

  - [ ] Test offline mode with DevTools
  - [ ] Check console for PWA-related errors
  - [ ] Verify manifest loads correctly

- [ ] **Firefox**

  - [ ] Visit site and check PWA support
  - [ ] Test offline mode
  - [ ] Verify service worker registration

- [ ] **Edge**
  - [ ] Test PWA installation
  - [ ] Verify offline functionality
  - [ ] Check Windows integration (Start menu, taskbar)

---

## 🔍 What to Look For

### ✅ Success Indicators

1. **Installation**

   - Clean, branded install experience
   - App icon renders correctly
   - Standalone mode works (no browser UI)

2. **Offline Functionality**

   - Pages load from cache instantly
   - Images display without network
   - Graceful error messages for failed API calls
   - No broken content or missing assets

3. **Performance**

   - Fast initial load (< 3 seconds)
   - Instant navigation between cached pages
   - Smooth animations and transitions
   - No janky scrolling or layout shifts

4. **Updates**
   - Service worker updates automatically (no user action needed)
   - New content appears after background sync
   - No errors during update process

### ❌ Issues to Document

1. **Installation Problems**

   - Install prompt doesn't appear
   - App icon missing or incorrect
   - Splash screen issues
   - Wrong app name displayed

2. **Offline Failures**

   - Pages don't load offline
   - Images missing when offline
   - Service worker not registering
   - Cache errors in console

3. **Performance Issues**

   - Slow cache retrieval
   - Large bundle sizes causing delays
   - Memory leaks from service worker
   - Excessive cache storage

4. **Update Problems**
   - Service worker stuck in "waiting" state
   - Updates don't apply automatically
   - Cache not clearing old versions
   - Infinite update loops

---

## 🧪 Testing Commands

### Check Service Worker Status (Browser Console)

```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log("Service Worker:", reg ? "Registered" : "Not registered");
  if (reg) {
    console.log("Active:", reg.active);
    console.log("Waiting:", reg.waiting);
    console.log("Installing:", reg.installing);
  }
});

// Check cache storage
caches.keys().then((keys) => {
  console.log("Cache keys:", keys);
  keys.forEach((key) => {
    caches.open(key).then((cache) => {
      cache.keys().then((requests) => {
        console.log(`${key}: ${requests.length} items`);
      });
    });
  });
});
```

### Force Service Worker Update

```javascript
navigator.serviceWorker.getRegistration().then((reg) => {
  if (reg) {
    reg.update();
    console.log("Update check triggered");
  }
});
```

### Clear All Caches (for clean testing)

```javascript
caches.keys().then((keys) => {
  Promise.all(keys.map((key) => caches.delete(key))).then(() => {
    console.log("All caches cleared");
    location.reload();
  });
});
```

---

## 📊 Test Results Template

### Test Environment

- **Device**: **********\_**********
- **OS**: **********\_**********
- **Browser**: **********\_**********
- **Date**: **********\_**********
- **Site Version**: **********\_**********

### Installation

- **Install Prompt Appeared**: ☐ Yes ☐ No
- **Installation Successful**: ☐ Yes ☐ No
- **Standalone Mode Works**: ☐ Yes ☐ No
- **App Icon Correct**: ☐ Yes ☐ No
- **Notes**: **********\_**********

### Offline Functionality

- **Pages Load Offline**: ☐ Yes ☐ No
- **Images Load Offline**: ☐ Yes ☐ No
- **Service Worker Active**: ☐ Yes ☐ No
- **Cache Storage Present**: ☐ Yes ☐ No
- **Cache Size**: **\_** MB
- **Notes**: **********\_**********

### Performance

- **Initial Load Time**: **\_** seconds
- **Offline Load Time**: **\_** seconds
- **Navigation Speed**: ☐ Fast ☐ Moderate ☐ Slow
- **Memory Usage**: **\_** MB
- **Notes**: **********\_**********

### Updates

- **Auto-Update Works**: ☐ Yes ☐ No ☐ Not Tested
- **Update Notification**: ☐ Yes ☐ No ☐ N/A
- **Clean Update Process**: ☐ Yes ☐ No
- **Notes**: **********\_**********

### Issues Found

1. ***
2. ***
3. ***

---

## 🚀 Quick Start Testing

**5-Minute Quick Test** (Desktop Chrome):

1. Visit https://dj-forever2.onrender.com
2. Open DevTools → Application
3. Check Service Worker status (should show "activated and running")
4. Navigate to Cache Storage → verify caches exist
5. Enable "Offline" mode
6. Refresh page → verify site loads
7. Navigate to different sections
8. Check images render correctly
9. Disable offline mode
10. Done! ✅

**10-Minute Mobile Test** (iOS or Android):

1. Open site in mobile browser
2. Install PWA to Home Screen
3. Launch app from Home Screen
4. Verify standalone mode (no browser UI)
5. Navigate through all sections
6. Enable Airplane Mode
7. Close and reopen app
8. Test offline navigation
9. Disable Airplane Mode
10. Done! ✅

---

## 📱 Device-Specific Notes

### iOS Safari Quirks

- **Cache Limits**: iOS may clear service worker cache if device storage is low
- **Background Sync**: Limited support, may not work as expected
- **Update Timing**: iOS Safari checks for updates less frequently
- **Standalone Detection**: Check `window.navigator.standalone` for PWA mode

### Android Chrome Quirks

- **Installation**: More aggressive install prompts than iOS
- **Background Sync**: Full support for background sync API
- **Notifications**: Can show PWA notifications in system tray
- **Shortcuts**: Supports dynamic shortcuts and badge updates

### Desktop Quirks

- **Windows**: PWA integrates with Start menu and taskbar
- **macOS**: Limited integration compared to Windows
- **Linux**: Varies by desktop environment
- **Edge**: Best Windows integration with OS-level features

---

## 🔧 Troubleshooting

### Service Worker Not Registering

**Check**:

1. Site is served over HTTPS (production) or localhost
2. No JavaScript errors in console
3. Manifest.json is valid and accessible
4. Service worker file exists at `/sw.js` or `/service-worker.js`

**Fix**:

```javascript
// Check registration errors
navigator.serviceWorker.register("/sw.js").catch((err) => {
  console.error("SW registration failed:", err);
});
```

### App Not Installing

**Check**:

1. Manifest is valid (use Chrome DevTools → Application → Manifest)
2. All required manifest fields present (name, icons, start_url)
3. Icons meet size requirements (192x192, 512x512)
4. HTTPS enabled (or localhost)

**Fix**: Validate manifest at https://manifest-validator.appspot.com/

### Offline Mode Not Working

**Check**:

1. Service worker is activated
2. Cache Storage contains expected files
3. Network requests are being intercepted
4. No CORS issues preventing caching

**Fix**: Clear caches and re-cache all resources:

```javascript
caches.keys().then((keys) => {
  Promise.all(keys.map((k) => caches.delete(k)));
});
```

### Updates Not Applying

**Check**:

1. VitePWA config has `skipWaiting: true` and `clientsClaim: true`
2. Service worker version actually changed (check build hash)
3. Browser cache not preventing new SW download
4. No errors during SW activation

**Fix**: Manually skip waiting:

```javascript
navigator.serviceWorker.getRegistration().then((reg) => {
  reg.waiting?.postMessage({ type: "SKIP_WAITING" });
});
```

---

## ✅ Testing Complete Checklist

- [ ] Desktop Chrome PWA installation verified
- [ ] Desktop offline functionality working
- [ ] iOS Safari PWA installation verified
- [ ] iOS offline functionality working
- [ ] Android Chrome PWA installation verified
- [ ] Android offline functionality working
- [ ] Service worker auto-updates working
- [ ] Cache sizes reasonable (< 50MB total)
- [ ] No console errors in any browser
- [ ] All images cached correctly
- [ ] GraphQL caching works
- [ ] Performance metrics acceptable
- [ ] Documentation updated with findings
- [ ] Issues logged in GitHub if any found

---

## 📝 Next Steps After Testing

1. **Document Findings**

   - Create GitHub issue for each bug found
   - Update this guide with device-specific notes
   - Share results with team

2. **Optimize Based on Results**

   - Adjust cache strategies if needed
   - Update service worker config
   - Fix any installation issues

3. **Monitor Production**

   - Check GA4 for PWA install events
   - Monitor service worker errors
   - Track offline usage patterns

4. **User Education**
   - Create guest instructions for PWA installation
   - Add install prompt to site
   - Document offline capabilities

---

**Happy Testing! 🎉**

_Last Updated: November 22, 2025_

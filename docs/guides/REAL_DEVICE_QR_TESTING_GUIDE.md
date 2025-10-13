# Real Device QR Code Testing Guide

## 🎯 Objective

Test QR code scanning and RSVP flow on actual mobile devices to ensure production readiness.

## 📱 Test Devices Required

- **iOS device** (iPhone with Camera app or QR reader)
- **Android device** (with built-in camera QR scanning or QR app)
- **Different screen sizes** (if available)

## 🔧 Prerequisites Setup

### 1. Ensure Development Server is Running

```bash
cd /Users/justinmanning/repos/dj-forever2
npm run dev
```

- Server should be running on: `http://localhost:3001`
- Client should be running on: `http://localhost:3002`

### 2. Make Server Accessible to Mobile Devices

#### Option A: Use Local Network IP

1. Find your local IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Update the frontend URL in QR codes to use your local IP
3. Ensure your mobile device is on the same WiFi network

#### Option B: Use ngrok (Recommended for Testing)

```bash
# Install ngrok if not already installed
brew install ngrok

# Tunnel the client (port 3002)
ngrok http 3002
```

This will give you a public URL like `https://abc123.ngrok.io`

### 3. Generate Fresh QR Codes with Correct URLs

If using ngrok, update the FRONTEND_URL and regenerate QR codes:

```bash
cd /Users/justinmanning/repos/dj-forever2/server
FRONTEND_URL=https://abc123.ngrok.io npm run seed
```

## 📋 Test Cases

### Test Case 1: Basic QR Scan and Login

**Test Users Available:**

- **Charlie Williams** (`charlie@example.com`) - Status: NO (non-attending)
- **Alice Johnson** (`alice@example.com`) - Available for testing
- **Bob Smith** (`bob@example.com`) - Available for testing

**Steps:**

1. Open QR code: `/server/qr-codes/development/Alice_Johnson_alice_example_com_[ID].png`
2. Scan with mobile device camera
3. Verify redirect to login page with QR token
4. Confirm automatic authentication
5. Verify user lands on RSVP form with pre-filled name

**Expected Results:**

- ✅ QR scan opens browser
- ✅ URL contains `/login/qr/[token]`
- ✅ Automatic login without password
- ✅ User redirected to RSVP form
- ✅ User name appears correctly

### Test Case 2: Complete RSVP Flow - Attending

**User:** Alice Johnson

**Steps:**

1. Scan QR code and complete login
2. Select "Yes, I'll be there!"
3. Fill in guest details:
   - Name: Alice Johnson
   - Meal preference: Any option
   - Allergies: Optional
4. Add optional notes
5. Submit RSVP
6. Verify confirmation screen

**Expected Results:**

- ✅ All form fields work on mobile
- ✅ Touch interactions responsive
- ✅ Validation messages clear
- ✅ Submission successful
- ✅ Confirmation screen displays correctly

### Test Case 3: Complete RSVP Flow - Not Attending

**User:** Bob Smith

**Steps:**

1. Scan QR code and complete login
2. Select "Sorry, I can't make it"
3. Verify meal preference fields are hidden
4. Add optional note explaining absence
5. Submit RSVP
6. Verify confirmation screen

**Expected Results:**

- ✅ Conditional field hiding works
- ✅ Non-attending flow completes successfully
- ✅ Appropriate confirmation message

### Test Case 4: Mobile UI/UX Validation

**Focus Areas:**

- **Touch targets**: Buttons and form fields are easy to tap
- **Text readability**: Font sizes appropriate for mobile
- **Form validation**: Error messages visible and helpful
- **Responsive design**: Layout adapts to screen size
- **Performance**: Page loads quickly on mobile data

### Test Case 5: Error Scenarios

**Test these edge cases:**

1. **Invalid QR Token**

   - Manually modify URL with fake token
   - Should show appropriate error message

2. **Duplicate RSVP**

   - Complete RSVP once, then scan QR again
   - Should redirect to edit RSVP or show existing RSVP

3. **Network Issues**
   - Test with poor/slow connection
   - Verify graceful error handling

## 🔍 Detailed Testing Checklist

### Mobile Browser Compatibility

- [ ] **iOS Safari** - Primary iOS browser
- [ ] **Android Chrome** - Primary Android browser
- [ ] **iOS Chrome** - Alternative iOS browser
- [ ] **Android Samsung Browser** - Alternative Android browser

### QR Scanning Methods

- [ ] **Built-in Camera App** (iOS/Android)
- [ ] **Google Lens** (Android)
- [ ] **Third-party QR apps**
- [ ] **Browser QR scan** (if available)

### Form Interaction Testing

- [ ] **Touch scrolling** smooth and responsive
- [ ] **Form field focus** works correctly
- [ ] **Dropdown menus** open and close properly
- [ ] **Radio buttons** easy to select on touch
- [ ] **Text input** keyboard appears correctly
- [ ] **Submit button** responds to touch

### Network Conditions

- [ ] **WiFi connection** - Fast, reliable
- [ ] **Mobile data 4G/5G** - Normal speed
- [ ] **Slow 3G simulation** - Test performance
- [ ] **Intermittent connection** - Test resilience

## 📊 Testing Results Template

### Device: [iOS iPhone 14 / Android Samsung Galaxy, etc.]

### Network: [WiFi / 4G / 5G]

### Test Date: [Date]

| Test Case          | Status | Notes |
| ------------------ | ------ | ----- |
| QR Scan & Login    | ✅/❌  |       |
| Attending RSVP     | ✅/❌  |       |
| Non-attending RSVP | ✅/❌  |       |
| Mobile UI/UX       | ✅/❌  |       |
| Error Scenarios    | ✅/❌  |       |

### Issues Found:

- [ ] Issue 1: Description and severity
- [ ] Issue 2: Description and severity

### Performance Notes:

- Initial page load time: \_\_\_ms
- Form submission time: \_\_\_ms
- Overall user experience: \_\_\_/10

## 🚀 Next Steps After Testing

1. **Document any issues found**
2. **Create GitHub issues for bugs**
3. **Test fixes on real devices**
4. **Validate performance improvements**
5. **Get feedback from actual users if possible**

## 📞 Troubleshooting

### QR Code Won't Scan

- Ensure adequate lighting
- Hold device steady
- Try different QR scanning apps
- Check QR code image quality

### Page Won't Load After Scan

- Verify server is running
- Check network connectivity
- Confirm URL in QR code is correct
- Try opening URL manually in browser

### RSVP Submission Fails

- Check browser console for errors
- Verify server connection
- Test with different user/QR code
- Check server logs for errors

---

**Remember:** Real device testing is crucial because mobile browsers behave differently than desktop browsers, and touch interactions have unique requirements that can't be fully simulated in development tools.

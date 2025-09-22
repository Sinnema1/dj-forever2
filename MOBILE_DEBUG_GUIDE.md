# Mobile Attendance Selection Debug Guide

## Problem

Mobile devices can't select different attendance options (YES/NO/MAYBE) on the RSVP form, but desktop works fine.

## Debug Steps

### 1. Test the standalone mobile test page

Open `mobile-touch-test.html` in your mobile browser:

- File location: `/Users/justinmanning/repos/dj-forever2/mobile-touch-test.html`
- This isolates the touch handling logic
- Watch the console log for touch events
- Check if selection changes work

### 2. Test the actual RSVP form with debugging

1. Access RSVP form on mobile: `http://192.168.1.64:3002/login/qr/ss0qx6mg20f2qaiyl9hnl7`
2. Open mobile browser console/dev tools
3. Try tapping different attendance options
4. Look for these console messages:
   ```
   [RSVPForm] onClick triggered for: YES
   [RSVPForm] onTouchStart triggered for: YES
   [RSVPForm] handleAttendanceChange called with: YES
   ```

### 3. Check for interference

**Common mobile issues:**

- **iOS Safari**: Sometimes has issues with `pointer-events: none` and absolute positioning
- **Touch delay**: iOS adds 300ms delay, but we disabled it with `touch-action: manipulation`
- **Event propagation**: Touch events might be getting blocked
- **CSS overlay**: Something might be covering the touch target

### 4. CSS Debugging

Add this temporary CSS to make touch areas visible:

```css
.attendance-option .option-content {
  border: 3px solid red !important;
  background: rgba(255, 0, 0, 0.1) !important;
}
```

### 5. Alternative Solutions to Try

#### Option A: Remove absolute positioning from radio button

```css
.attendance-radio {
  position: static;
  opacity: 1;
  margin-right: 10px;
}
```

#### Option B: Use a simpler button approach

Replace the complex radio structure with simple buttons that update state.

#### Option C: Add event delegation

Add a parent click handler that catches all touch events.

## Expected Behavior

- Tapping any attendance option should immediately:
  1. Change the visual selection (border/background)
  2. Update the form state
  3. Show/hide meal preference fields
  4. Log events to console

## Test URLs

- **Alice Johnson**: http://192.168.1.64:3002/login/qr/r24gpj3wntgqwqfberlas
- **Bob Smith**: http://192.168.1.64:3002/login/qr/ssq7b7bkfqqpd2724vlcol
- **Charlie Williams**: http://192.168.1.64:3002/login/qr/ss0qx6mg20f2qaiyl9hnl7
- **Test Page**: file:///Users/justinmanning/repos/dj-forever2/mobile-touch-test.html

## Fallback Solutions

If touch events still don't work, we can:

1. Use visible radio buttons instead of hidden ones
2. Replace with a dropdown select
3. Use button group instead of radio inputs
4. Add a native select as backup on mobile

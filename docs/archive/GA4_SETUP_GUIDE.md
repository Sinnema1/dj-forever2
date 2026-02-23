# Google Analytics 4 (GA4) Setup Guide

## ✅ Implementation Complete

Google Analytics 4 has been fully integrated into the wedding website with comprehensive tracking for:

- ✅ Core Web Vitals (CLS, INP, LCP, FCP, TTFB)
- ✅ Custom performance metrics
- ✅ Resource loading performance
- ✅ Navigation timing
- ✅ Custom events (RSVP, login, etc.)
- ✅ Page views (automatic)
- ✅ User properties

---

## 📋 Setup Steps

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Under **Property**, click **Create Property**
4. Fill in details:
   - **Property name**: "DJ Forever Wedding Website"
   - **Reporting time zone**: Your timezone
   - **Currency**: USD (or your preference)
5. Click **Next** and complete business details
6. Click **Create**

### 2. Get Measurement ID

1. In your new property, click **Data Streams** (under Property settings)
2. Click **Add stream** → **Web**
3. Enter details:
   - **Website URL**: `https://dj-forever2.onrender.com`
   - **Stream name**: "Wedding Website Production"
4. Click **Create stream**
5. **Copy the Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Configure Environment Variable

#### For Development (.env.local)

```bash
# Create or edit client/.env.local
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### For Production (Render.com)

1. Go to Render dashboard → Your service
2. Click **Environment** tab
3. Add environment variable:
   - **Key**: `VITE_GA4_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX`
4. Click **Save Changes**
5. Redeploy your service

### 4. Verify Installation

1. **Development testing**:

   ```bash
   npm run dev
   ```

   - Open browser console
   - Look for: `[Analytics] Development mode - GA4 tracking disabled`
   - This is expected! GA4 only runs in production

2. **Production testing** (after deployment):

   - Open website in production
   - Open browser console
   - Look for: `[Analytics] GA4 initialized: G-XXXXXXXXXX`
   - No console errors about analytics

3. **Real-time verification** in GA4:
   - Go to GA4 → **Reports** → **Realtime**
   - Visit your production website
   - You should see yourself in "Users by page title and screen name"
   - Events should appear within 30 seconds

---

## 📊 Events Being Tracked

### Automatic Events

- `page_view` - Every route change
- `performance_metric` - Core Web Vitals (CLS, INP, LCP, FCP, TTFB)
- `navigation_timing` - Page load performance
- `large_resource_loaded` - Resources > 500KB
- `slow_resource_loaded` - Resources > 2s load time
- `performance_issue` - Poor performance detected

### Custom Event Examples

You can track custom events anywhere in the codebase:

```typescript
import { analytics } from "./services/analytics";

// RSVP submission
analytics.track("rsvp_submitted", user?.id, {
  guestCount: 2,
  attending: true,
  dietaryRestrictions: true,
});

// QR code login
analytics.track("qr_login", user?.id, {
  loginMethod: "qr_scanner",
});

// Photo upload (future feature)
analytics.track("photo_uploaded", user?.id, {
  photoCount: 1,
  photoSize: 2048576, // bytes
});

// User properties
analytics.setUserProperties({
  is_invited: true,
  is_admin: false,
  guest_group: "brides_family", // Options: grooms_family, friends, brides_family, extended_family, other
});
```

---

## 🎯 Key Metrics to Monitor

### Performance (Core Web Vitals)

- **LCP** (Largest Contentful Paint): < 2.5s is "good"
- **INP** (Interaction to Next Paint): < 200ms is "good"
- **CLS** (Cumulative Layout Shift): < 0.1 is "good"
- **FCP** (First Contentful Paint): < 1.8s is "good"
- **TTFB** (Time to First Byte): < 800ms is "good"

### User Engagement

- Active users
- Session duration
- Pages per session
- Bounce rate
- RSVP conversion rate

### Technical Metrics

- Browser types
- Device types (mobile vs desktop)
- Geographic locations
- Connection types (4G, WiFi, etc.)

---

## 🔍 Debugging

### GA4 not tracking in production?

1. **Check browser console** for errors
2. **Verify environment variable** is set correctly in Render.com
3. **Check GA4 dashboard** → Admin → Data Streams → Check if stream is active
4. **Verify domain** in data stream settings matches your production URL
5. **Disable ad blockers** (they often block GA4)

### See development tracking

The integration intentionally disables GA4 in development to avoid polluting production data. If you need to test GA4 tracking:

```typescript
// Temporarily edit client/src/services/analytics.ts
constructor(measurementId?: string) {
  this.measurementId = measurementId || import.meta.env?.VITE_GA4_MEASUREMENT_ID;
  this.isDevelopment = false; // Force enable for testing

  if (this.measurementId) {
    this.initialize();
  }
}
```

**Remember to revert this change before committing!**

---

## 📁 Files Modified

### New Files

- ✅ `client/src/services/analytics.ts` - GA4 service implementation
- ✅ `client/.env.example` - Environment variable template

### Updated Files

- ✅ `client/src/services/performanceMonitor.ts` - Integrated GA4 analytics
  - Removed TODO comments
  - Imported analytics service
  - All performance metrics now sent to GA4

---

## 🎉 Next Steps

1. **Create GA4 property** (5 minutes)
2. **Set environment variable** in Render.com (2 minutes)
3. **Deploy to production** (automatic)
4. **Verify tracking** in GA4 Realtime (30 seconds)
5. **Set up custom reports** in GA4 (optional, recommended)

---

## 📚 Resources

- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [GA4 Best Practices](https://support.google.com/analytics/answer/9304153)
- [Event Tracking Guide](https://developers.google.com/analytics/devguides/collection/ga4/events)

---

**Status**: ✅ Complete - Ready for production deployment

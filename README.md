# DJ Forever 2 Wedding Website

## Setup

1. **Install dependencies:**

   ```sh
   npm install
   cd client && npm install
   ```

2. **Seed the database:**

   For production:

   ```sh
   cd server
   npm run clean:db
   npm run seed-prod
   ```

   For testing:

   ```sh
   cd server
   npm run clean:db
   npm run seed-test
   ```

   > **Best Practice:** For backend tests, manual seeding is not required. The test runner will automatically clean and isolate the test database before each run, and each test creates its own data.
   > All scripts accept the `MONGODB_DB_NAME` environment variable. Example:
   >
   > ```sh
   > MONGODB_DB_NAME=djforever2_test npm run print:users
   > MONGODB_DB_NAME=djforever2 npm run print:users
   > ```

3. **Generate QR codes:**

   ```sh
   npm run generate:qrcodes
   ```

   QR codes will be saved in `server/qr-codes/`.

4. **Build and run the app:**

   ```sh
   cd client && npm run build
   cd ../server && npm run start
   ```

## Testing

- **Run backend tests:**

  ```sh
  cd server
  npm run test
  ```

  - Tests use a separate database (`djforever2_test`) and automatically clean it before each run.
  - The test environment uses `.env.test` for configuration. Example:

    ```env
    MONGODB_URI=mongodb://localhost:27017
    MONGODB_DB_NAME=djforever2_test
    JWT_SECRET=your-test-secret
    ```

- **Frontend testing:**

  ```sh
  cd client
  npm run test
  ```

## QR Code-Only Guest Login

All authentication is handled by scanning your invitation QR code:

- Each guest receives a physical "save the date" with a unique QR code.
- Scanning the QR code directs you to a URL like:
  `https://dj-forever2.onrender.com/login/qr/<qrToken>`
- You are automatically logged in—no password, registration, or manual login required.
- The site will show personalized content and RSVP options for your invitation.

**Note:** There is no login button on the website. If you are not logged in, scan your invitation QR code again to access your account.

## Features

### Guest Experience

- **QR Code Authentication**: Unique QR codes for each guest, enabling secure, password-free access.
- **RSVP Management**: Guests can RSVP, select meal preferences, indicate dietary restrictions, and request songs.
  - **Party Size Validation**: Enforces maximum party size based on household members and plus-one allowance
  - **Per-Person Toggles**: Each household member (including kids) can individually confirm attendance
  - **Plus-One Support**: Bailey Bowers and Abby Chose can bring a plus-one with free-text name entry
- **Countdown Timer**: Real-time countdown to the wedding day.
- **Photo Gallery**: Swipeable lightbox with double-tap zoom functionality.
- **Registry Links**: Quick links to wedding registries.
- **Mobile Optimized**: Enhanced touch interactions, responsive design, and PWA capabilities.

### Admin Dashboard

- **Guest Management**: Create/delete guests with automatic QR code generation (30 real guests)
- **RSVP Editing**: Comprehensive forms to edit existing RSVPs and guest information
- **Analytics Dashboard**: 7 interactive visualizations including response timeline, meal preferences, party size distribution, and automated insights
- **Email Reminders**: SMTP-powered email system with bulk operations and production safety guard
- **CSV Export**: Complete guest list export for external processing
- **Real-time Statistics**: Live wedding stats including RSVP rates, attendance counts, and meal orders

### 🛡️ Production Safety Features

- **Email Safety Guard**: Prevents accidental emails to real guests during testing (whitelist-based)
- **Test Data Isolation**: Separate databases for dev/test/production
- **QR Token Validation**: Alphanumeric-only tokens (10-40 characters)
- **Real Guest Data**: 30 households with production email addresses

## 📚 Documentation

Complete project documentation organized in [`/docs`](./docs/):

### Quick Links

- **[Admin Features](/docs/admin/)** - Dashboard, guest management, analytics, email system
- **[Deployment Guides](/docs/deployment/)** - Production deployment, Render.com configuration, testing procedures
- **[Development](/docs/development/)** - Architecture, testing, TypeScript enhancements, code quality
- **[Mobile Features](/docs/development/mobile/)** - Mobile optimizations, QR scanning, touch interactions
- **[User Guides](/docs/guides/)** - QR testing, debugging, quick start implementation
- **[Bug Fixes](/docs/bug-fixes/)** - Historical issue resolutions and fixes

### Key Documentation

| Document                                                               | Description                                   |
| ---------------------------------------------------------------------- | --------------------------------------------- |
| [Admin Dashboard Summary](/docs/admin/ADMIN_DASHBOARD_SUMMARY.md)      | Complete admin features overview (500+ lines) |
| [Admin Production Testing](/docs/admin/ADMIN_PRODUCTION_TESTING.md)    | Comprehensive production testing procedures   |
| [Deployment Guide](/docs/deployment/DEPLOYMENT.md)                     | Complete Render.com deployment instructions   |
| [Mobile Features](/docs/development/mobile/MOBILE_FEATURES_SUMMARY.md) | Mobile optimization details                   |
| [RSVP Test Suite](/docs/development/RSVP_TEST_SUITE.md)                | Testing strategy and procedures               |

📖 **Full Documentation Index**: See [`/docs/README.md`](./docs/README.md)

## Customization

- To personalize guest messages, add fields to the user model and display them in the React app after login.
- To update the QR code domain, edit the QR code generation script.

## No Passwords or Registration

- There is no password-based login or registration. All authentication is via QR code only.

## Performance Monitoring

The website includes comprehensive performance monitoring and optimization features:

### Bundle Analysis

```sh
# Build with detailed bundle analysis
npm run build:analyze

# View interactive bundle visualization
npm run analyze
```

### Performance Budget Checking

```sh
# Check if bundle meets performance budgets
npm run performance:check

# Full performance build with analysis
npm run performance:build
```

### CI/CD Performance Pipeline

```sh
# Run complete performance testing pipeline
npm run performance:ci
```

### Core Web Vitals Tracking

The app automatically tracks real user performance metrics:

- **CLS (Cumulative Layout Shift)**: ≤ 0.1 (good)
- **INP (Interaction to Next Paint)**: ≤ 200ms (good)
- **LCP (Largest Contentful Paint)**: ≤ 2.5s (good)
- **FCP (First Contentful Paint)**: ≤ 1.8s (good)
- **TTFB (Time to First Byte)**: ≤ 800ms (good)

**Current Performance Status**: ✅ **All budgets passing** (467KB total bundle, well within 500KB limit)

### Performance Reports

After running performance commands, reports are generated in:

- `performance-reports/` - CI/CD pipeline reports
- `dist/stats.html` - Interactive bundle visualization
- `dist/performance-report.json` - Detailed performance data

## Recent Updates & TODO

### Recently Completed ✅

#### Admin Dashboard Suite (Tasks #1-5)

- [x] **Guest Management CRUD** - Create/delete guests with automatic QR code generation
- [x] **RSVP Editing** - Comprehensive forms to edit existing RSVPs and guest information
- [x] **CSV Export** - Complete guest list export functionality
- [x] **Analytics Dashboard** - 7 interactive visualizations (response timeline, meal preferences, party size, day of week analysis, insights)
- [x] **Email Reminder System** - SMTP-powered email system with bulk operations for pending RSVPs
- [x] **Email System Testing** - Full validation of SMTP health checks, email delivery, QR login links, and template rendering
- [x] **Personalized Modal Enhancement Phase 3** - Enhanced banner system, smart RSVP pre-population, and dietary restrictions support

#### Bug Fixes & Improvements

- [x] **Admin Stats Alignment Fix** - Corrected boolean vs string enum handling for guest status display
- [x] **Meal Preferences Filtering** - Fixed meal counts to only include attending guests (not NO/MAYBE responses)
- [x] **Vite 5 Upgrade** - Eliminated punycode deprecation warning, 58% faster builds (3.5s → 1.46s)
- [x] **Fix Mobile Hero Background Scaling** - Hero background image now scales properly on mobile devices
- [x] **Fix RSVP Test Mocks** - Updated test mocks to match current RSVP mutation structure
- [x] **Performance Monitoring Setup** - Comprehensive tracking with Core Web Vitals monitoring, bundle analysis, performance budgets
- [x] **Performance Optimization** - Reduced bundle from 18MB to 9MB (50% reduction)
- [x] **Mobile Photo Viewing UX Enhancement** - Enhanced with double-tap zoom, improved swipe navigation, responsive grid
- [x] **Email Environment Variable Fix** - Corrected `FRONTEND_URL` configuration for proper QR login link generation
- [x] **AdminEmailReminders Toggle** - Added show all users vs pending only toggle for easier testing
- [x] **Routing & Auth Improvements** - 404 page, token expiration checking, auto-logout, localStorage cleanup
- [x] **Test Suite Fixes** - Fixed BulkPersonalization tests to match current implementation (all 66 tests passing)

### Next Steps

#### High Priority

- [ ] **Production Validation Sprint** - Test admin features (analytics, guest management) with real production data

#### Low Priority

- [ ] **Desktop QR Code Scanner Enhancement** - Current QR scanner works on mobile but desktop scanning needs improvement. Consider adding manual token entry fallback for desktop users or enhancing webcam-based scanning reliability

### Documentation

📖 **See [PRODUCTION_TESTING_PLAN.md](./PRODUCTION_TESTING_PLAN.md)** for comprehensive testing procedures  
📊 **See [/docs/admin/ADMIN_DASHBOARD_SUMMARY.md](/docs/admin/ADMIN_DASHBOARD_SUMMARY.md)** for complete admin features  
📧 **See [/docs/admin/EMAIL_SYSTEM_GUIDE.md](/docs/admin/EMAIL_SYSTEM_GUIDE.md)** for SMTP configuration  
🐛 **See [/docs/bug-fixes](/docs/bug-fixes/)** for all documented fixes  
🚀 **See [/docs/deployment](/docs/deployment/)** for production deployment guides

---

For questions or help, contact the project maintainer.

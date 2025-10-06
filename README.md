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

## Personalized Guest Experience

The wedding website provides a personalized experience for guests:

- **Welcome Banner**: Guests see personalized welcome messages with their name upon login
- **Custom Content**: Different content displays based on invitation status
- **RSVP Access**: Only invited guests can access the RSVP section
- **QR Prompt**: Clear instructions guide users to scan their QR code when they try to access restricted areas

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

## TODO / Outstanding Action Items

### High Priority

- [x] **Fix Mobile Hero Background Scaling** - Hero background image displays well on desktop but doesn't scale properly on mobile devices. Need to optimize background-size, background-position, or consider responsive image solutions
- [x] **Fix RSVP Test Mocks** - Update test mocks to match current RSVP mutation structure (currently has warnings but tests pass)
- [x] **Performance Monitoring Setup** - Implemented comprehensive performance tracking with Core Web Vitals monitoring, bundle analysis, performance budgets, and CI/CD integration

### Medium Priority

- [x] **Performance Optimization** - Consider image compression for faster loading (~18MB build size) → **COMPLETED: Reduced bundle from 18MB to 9MB (50% reduction)**
- [x] **Mobile Photo Viewing UX Enhancement** - Improve photo gallery and lightbox experience on mobile devices. Consider better touch gestures, zoom functionality, swipe navigation, and optimized image sizing for mobile viewports → **COMPLETED: Enhanced with double-tap zoom, improved swipe navigation, responsive grid, and proper mobile viewport handling**
- [ ] **Accessibility Review** - Screen reader testing for countdown timer and focus management

### Low Priority

- [ ] **Desktop QR Code Scanner Enhancement** - Current QR scanner works on mobile but desktop scanning needs improvement. Consider adding manual token entry fallback for desktop users or enhancing webcam-based scanning reliability
- [ ] **Documentation Updates** - Update deployment instructions with final configuration
- [x] **Enhanced Analytics** - Performance monitoring implemented with Core Web Vitals tracking, bundle analysis, and automated budget checking

---

For questions or help, contact the project maintainer.

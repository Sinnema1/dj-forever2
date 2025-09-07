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
   > MONGODB_DB_NAME=test_db npm run print:users
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

  - Tests use a separate database (`test_db`) and automatically clean it before each run.
  - The test environment uses `.env.test` for configuration. Example:

    ```env
    MONGODB_URI=mongodb://localhost:27017
    MONGODB_DB_NAME=test_db
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

## TODO / Outstanding Action Items

### High Priority

- [ ] **Fix Mobile Hero Background Scaling** - Hero background image displays well on desktop but doesn't scale properly on mobile devices. Need to optimize background-size, background-position, or consider responsive image solutions
- [ ] **Fix RSVP Test Mocks** - Update test mocks to match current RSVP mutation structure (currently has warnings but tests pass)

### Medium Priority

- [ ] **Desktop QR Code Scanner Enhancement** - Current QR scanner works on mobile but desktop scanning needs improvement. Consider adding manual token entry fallback for desktop users or enhancing webcam-based scanning reliability

### Medium Priority

- [ ] **Performance Optimization** - Consider image compression for faster loading (~18MB build size)
- [ ] **Accessibility Review** - Screen reader testing for countdown timer and focus management

### Low Priority

- [ ] **Documentation Updates** - Update deployment instructions with final configuration
- [ ] **Enhanced Analytics** - Add performance monitoring if desired

---

For questions or help, contact the project maintainer.

# DJ Forever 2 Wedding Website - AI Coding Assistant Instructions

## Project Architecture

This is a **QR-code-only authentication** wedding website with a client-server monorepo structure:

- **Frontend**: React 18 + TypeScript + Vite + Apollo Client (`/client`)
- **Backend**: Node.js + Express + Apollo GraphQL + MongoDB (`/server`)
- **Authentication**: JWT tokens issued via unique QR codes (no passwords/registration)

### Key Architectural Principles

1. **QR-Only Authentication**: All user authentication happens by scanning invitation QR codes that contain unique tokens. No login forms, passwords, or manual registration exist.

2. **Monorepo with Concurrent Development**: Root `package.json` uses `concurrently` to run both client and server simultaneously. Always use `npm run dev` from root for development.

3. **Environment-Aware Database Seeding**: Database names are controlled via `MONGODB_DB_NAME` env var. Production uses `djforever2`, testing uses `test_db`, development uses `djforever2_dev`.

## Essential Development Workflows

### Database Management

```bash
# Seed production data
cd server && npm run seed-prod

# Seed test data
cd server && npm run seed-test

# Clean database
cd server && npm run clean:db

# Generate QR codes after seeding
npm run generate:qrcodes
```

### Testing Strategy

```bash
# Run comprehensive RSVP test suite
npm run test:rsvp  # Runs ./test-rsvp-suite.sh

# Individual test types
npm run test:rsvp:server   # Backend E2E tests
npm run test:rsvp:client   # Frontend E2E tests
npm run test:rsvp:graphql  # GraphQL integration tests
```

### Build & Deployment

```bash
# Development (from root)
npm run dev  # Starts both server and client with hot reload

# Production build
npm run render-build  # Render.com deployment command
```

## Project-Specific Patterns

### Authentication Flow

```typescript
// QR token login is handled in /client/src/pages/QRTokenLogin.tsx
// Server redirects /login/qr/:qrToken -> frontend /login/qr/:qrToken
// Uses AuthContext.loginWithQrToken() -> stores JWT in localStorage as 'id_token'
```

### GraphQL Schema Patterns

- **Legacy compatibility**: RSVP mutations support both new guest-array format AND legacy single-guest fields
- **User model**: `hasRSVPed` boolean tracks RSVP completion status
- **Authentication**: All resolvers receive `user` from JWT context in `src/graphql/resolvers.ts`

### Database Patterns

```typescript
// User model in /server/src/models/User.ts
// - Compound indexes: { isInvited: 1, hasRSVPed: 1 }
// - Static methods: findByEmail(), findByQRToken()
// - Always use { dbName } option in mongoose.connect(), never append to URI
```

### Error Handling

- **Client**: Apollo Client with error link in `/client/src/api/apolloClient.ts`
- **Server**: Custom error classes in `/server/src/utils/errors.ts`
- **Network resilience**: QRTokenLogin component has retry logic for network failures

## Critical File Locations

- **Apollo setup**: `/client/src/api/apolloClient.ts` - handles auth headers and error reporting
- **Auth service**: `/server/src/services/authService.ts` - JWT token management
- **QR generation**: `/server/src/seeds/generateQRCodes.ts` - environment-aware QR code generation
- **Test suite**: `./test-rsvp-suite.sh` - comprehensive RSVP validation testing
- **GraphQL schema**: `/server/src/graphql/typeDefs.ts` - includes legacy field compatibility

## Environment Configuration

### Required Environment Variables

```bash
# Server (.env)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=djforever2  # or test_db, djforever2_dev
JWT_SECRET=your-jwt-secret
CONFIG__FRONTEND_URL=https://dj-forever2.onrender.com

# Client (.env)
VITE_GRAPHQL_ENDPOINT=/graphql
```

### Development Ports

- **Server**: 3001 (default in server.ts, can be overridden with PORT env var)
- **Client**: 3002 (Vite dev server)
- **Root dev command**: Starts server first, waits for port 3001, then starts client
- **Port Conflict Resolution**: Use `lsof -ti:PORT && kill -9 $(lsof -ti:PORT)` to clean up stuck processes

## Testing Conventions

- **Database isolation**: Tests use separate `test_db` database, auto-cleaned before each run
- **E2E pattern**: Tests are in `/tests/` directories, named `*.e2e.test.ts/tsx`
- **GraphQL testing**: Use `debug-rsvp-graphql.js` for mutation validation
- **Mock patterns**: Client tests mock Apollo mutations, server tests use real database

### Testing Strategy Deep Dive

- **Server E2E Tests**: Full authentication and RSVP workflow validation
- **Client Component Tests**: React Testing Library with Apollo MockedProvider
- **Integration Tests**: QR-to-RSVP complete user journey validation
- **Cross-browser Testing**: Safari, Chrome, Firefox compatibility verification
- **Real Device Testing**: Actual mobile device QR scanning and form interaction

## Mobile-First Considerations

This project has extensive mobile optimizations:

- **Touch interactions**: Enhanced photo gallery with double-tap zoom
- **QR scanning**: Uses `html5-qrcode` library for mobile camera access
- **Responsive images**: Vite-imagetools for optimized loading
- **PWA ready**: Service worker and manifest.json configured

## Development Pain Points & Common Mistakes

### Port Conflicts

- **Issue**: `EADDRINUSE: address already in use 0.0.0.0:3001`
- **Solution**: Always kill existing processes before starting dev server
- **Command**: `lsof -ti:3001 && kill -9 $(lsof -ti:3001)` to clean up
- **Prevention**: Server defaults to port 3001 consistently across all development tooling

### TypeScript Compilation Errors in CI/CD

- **Issue**: Missing props in components causing pipeline failures
- **Example**: `QRLoginModal` missing `onLoginSuccess` prop
- **Solution**: Always ensure prop interfaces are complete
- **Warning**: Local TypeScript may pass but CI/CD can be stricter

### QR Scanner Resource Management

- **Issue**: "Cannot clear while scan is ongoing, close it first"
- **Root Cause**: Improper cleanup when modal closes/reopens rapidly
- **Solution**: Always stop scanner before clearing, use proper lifecycle management
- **Warning**: Desktop QR scanning requires careful resource cleanup
- **Implementation**: Use unique scanner IDs and proper useEffect cleanup in QrScanner component

### Database Connection Patterns

- **Critical**: Never append database name to MongoDB URI - always use `{ dbName }` option
- **Environment Issues**: Different database names for dev/test/prod environments
- **Index Warnings**: Avoid duplicate schema indexes (both `index: true` and `schema.index()`)
- **Connection Format**: `mongoose.connect(uri, { dbName })` not `mongoose.connect(uri/dbname)`

## Mobile Optimization Strategies

### Hero Background Scaling

- **Current Issue**: Background images don't scale properly on mobile
- **Strategy**: Use responsive `background-size`, `background-position`
- **Alternative**: Implement `<picture>` element for different image sources

### Touch Interactions

- **Photo Gallery**: Double-tap zoom functionality implemented
- **QR Scanning**: `html5-qrcode` library for mobile camera access
- **Form UX**: Enhanced radio buttons and touch-friendly inputs

### Scrollbar Modernization

- **Mobile**: Completely invisible scrollbars (no screen real estate)
- **Desktop**: Thin 8px scrollbars with hover effects
- **Cross-browser**: WebKit + Firefox support

### PWA Features

- **Service Worker**: Enhanced caching in `sw-enhanced.js`
- **Manifest**: Complete PWA manifest with icons
- **Offline**: Fallback page for offline experience

### Modal Architecture & React Portals

- **SwipeableLightbox**: Uses React Portal to render directly to document.body
- **Positioning Strategy**: Viewport-level rendering bypasses container constraints
- **z-index Management**: Modal uses high z-index values with !important declarations
- **Touch Events**: Enhanced mobile interaction with swipe navigation
- **Desktop UX**: TODO documented for improved desktop lightbox experience

## Render.com Deployment Gotchas

### Build Configuration

- **Command**: `npm run render-build` (not standard build)
- **Environment**: Monorepo structure requires specific build paths
- **Assets**: Large bundle (18MB+) requires optimization

### Environment Variables

- **Database**: `MONGODB_DB_NAME` controls environment-specific databases
- **Frontend URL**: `CONFIG__FRONTEND_URL` for QR redirects
- **Production Detection**: Uses `mongodb+srv` or `NODE_ENV=production`

### Port Configuration

- **Production**: Uses `process.env.PORT` (Render assigns this)
- **Development**: Defaults to 3001 consistently
- **CORS**: Multiple localhost ports configured for development

### Static File Serving

- **Production**: Backend doesn't serve static files (frontend-only)
- **Development**: Full-stack development with separate servers

### Production Environment Validation

- **Health Check**: Backend `/health` endpoint returns 200 OK
- **GraphQL Functionality**: All queries and mutations working in production
- **QR Authentication**: End-to-end QR scanning and JWT token validation
- **RSVP Operations**: Create, read, update operations validated with real data
- **Cross-environment Testing**: Test users validated across dev/staging/production

## GraphQL & Apollo Client Specifics

### Legacy Compatibility Patterns

- **RSVP Mutations**: Support both new guest-array AND legacy single-guest formats
- **Backward Compatibility**: Critical for existing data migration

### Authentication Context

- **JWT Flow**: QR token → JWT → localStorage as 'id_token'
- **Resolver Context**: All resolvers receive `user` from JWT context
- **Error Handling**: Custom error classes in `errors.ts`

### Apollo Client Configuration

- **Error Link**: Comprehensive error reporting in `apolloClient.ts`
- **Auth Headers**: Automatic JWT token injection
- **Caching**: InMemoryCache with normalized queries

### Testing Patterns

- **Mock Strategy**: Client tests mock Apollo mutations, server tests use real database
- **Database Isolation**: Tests use separate `test_db` database
- **E2E Coverage**: Comprehensive RSVP validation suite

## Performance Optimizations

- **Image compression**: Bundle reduced from 18MB to 9MB via vite-plugin-imagemin
- **Code splitting**: Vite automatically splits routes and components
- **Apollo caching**: InMemoryCache with normalized queries
- **Static assets**: Optimized images in `/client/public/assets/`

## UI/UX Enhancement Patterns

### Component Design Philosophy

- **Mobile-first approach**: All components designed with mobile touch interactions
- **Progressive enhancement**: Desktop features layer on top of mobile base
- **Accessibility focus**: ARIA labels, semantic HTML, keyboard navigation support

### Typography & Visual Hierarchy

- **Hero section**: Enhanced with script fonts and improved visual flow
- **CSS custom properties**: Consistent design system throughout
- **Responsive scaling**: Fluid typography that adapts to screen size

### Authentication UX

- **QR Login Button**: Interactive button with QR icon in navbar
- **Modal Integration**: Seamless QR scanner modal with proper cleanup
- **Error Boundaries**: Comprehensive error handling for QR scanning failures

### Form Enhancement Patterns

- **RSVP Form**: Multi-step validation with real-time feedback
- **Touch-friendly inputs**: Enhanced radio buttons and form controls
- **Success states**: Clear confirmation messaging and next steps

## Development Workflow Best Practices

### Code Quality & Maintenance

- **TypeScript strict mode**: Ensure complete prop interfaces
- **Component testing**: E2E tests for critical user journeys
- **Performance monitoring**: Built-in analytics and performance tracking

### Git Workflow

- **Feature branches**: Work on feature-branch, merge to main via PR
- **Conventional commits**: Use conventional commit format for clear history
- **Comprehensive testing**: Run full test suite before commits

### Debugging Strategies

- **GraphQL debugging**: Use debug-rsvp-graphql.js for API testing
- **Console monitoring**: Check browser console for client-side errors
- **Network analysis**: Monitor Apollo Client network requests
- **Mobile testing**: Test on actual devices, not just browser dev tools

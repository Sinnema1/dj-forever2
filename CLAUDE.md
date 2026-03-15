# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start both server (3001) and client (3002) concurrently
```

### Testing
```bash
npm run test         # All tests (server + client)
cd server && npx vitest run tests/path/to/spec.ts  # Single server test
cd client && npx vitest run tests/path/to/spec.ts  # Single client test
bash test-rsvp-suite.sh   # Comprehensive RSVP integration suite
node debug-rsvp-graphql.js  # Manual GraphQL mutation testing
```

### Building
```bash
npm run build                          # Production build (both)
cd client && npm run build:analyze     # Build with bundle visualizer output
cd client && npm run performance:check # Bundle size gate (must stay under 500KB)
```

### Linting
```bash
cd client && npm run lint
```

### Database seeding
```bash
cd server && npm run seed      # Dev database (djforever2_dev) — safe
cd server && npm run seed-test  # Test database (djforever2_test) — safe
# Production seeding requires explicit user approval before running
```

### QR code generation
```bash
cd server && npm run generate:qrcodes       # Dev environment
cd server && npm run generate:qrcodes:prod  # Production (generates to server/qr-codes/production/)
```

## Architecture

### Monorepo structure
- `client/` — React 18 + TypeScript + Vite + Apollo Client
- `server/` — Node.js + Express + Apollo Server 4 + MongoDB (Mongoose)
- Root `package.json` orchestrates concurrent dev/build via `concurrently`

### QR-code-only authentication
There are no passwords or user registration. Every household gets a unique QR code that encodes a `qrToken`. Scanning the QR hits `/login/qr/:qrToken` (server redirect) → `/login/qr/:qrToken` (frontend page) → `loginWithQrToken()` in `AuthContext`. The server issues a JWT containing the guest's user record.

**Household model**: All household members share the primary guest's QR code. The JWT always reflects the primary account holder — the app cannot distinguish which household member is actually viewing.

**QR alias system**: Human-readable short URLs (`/:alias`) redirect to `/login/qr/:alias`. Aliases stored on `User.qrAlias`, lockable via `User.qrAliasLocked`. Reserved paths (`rsvp`, `registry`, `login`, `admin`, `qr-help`, `auth-debug`) are protected from collision.

### Environment-aware databases
Three separate MongoDB databases: `djforever2` (prod), `djforever2_dev`, `djforever2_test`. Always set via `MONGODB_DB_NAME` env var. **Never append the database name to the MongoDB URI** — pass it as the `{ dbName }` option to `mongoose.connect()`.

### GraphQL
- Schema + resolvers: `server/src/graphql/typeDefs.ts` and `resolvers.ts`
- Apollo Client config (auth headers, error links, cache): `client/src/api/apolloClient.ts`
- Legacy RSVP compatibility: mutations support both guest-array and single-guest formats

### Key data model facts
- Party size formula: `maxAllowed = 1 + householdMembers.length + (plusOneAllowed ? 1 : 0)`
- RSVP `attending` values: `'YES'`, `'NO'`, `'MAYBE'`
- `User.hasRSVPed` and `User.rsvp` are the canonical RSVP state fields

### Email system
`server/src/services/emailService.ts`. **Production emails are disabled by default** (`ENABLE_PRODUCTION_EMAILS=false`). When disabled, all email goes only to the whitelist address (`sinnema1.jm@gmail.com`). Never enable production emails without explicit approval.

### Feature flags
- `VITE_ENABLE_MEAL_PREFERENCES` — meal preferences UI (currently off; food emoji in RSVP form are dormant)
- `VITE_ENABLE_GUESTBOOK` — guestbook feature

### CI/CD
GitHub Actions runs tests → TypeScript check → lint → build → bundle size gate on every push. Deployment to Render.com triggers automatically on `main` branch CI success via deploy hooks. Bundle must stay under 500KB (currently ~467KB).

## Critical gotchas

- **Port conflicts**: Server expects 3001, client dev server 3002. If you see EADDRINUSE, kill the existing process rather than changing the port.
- **React Portals**: `QRLoginModal` and `SwipeableLightbox` render to `document.body` — styles must account for portal placement.
- **Test isolation**: Server tests use the `djforever2_test` database and run with `maxConcurrency: 1` (sequential) to avoid DB conflicts. Never mock the database in integration tests.
- **TypeScript strict mode**: `any` types are not acceptable.
- **`useLayoutEffect` in `PersonalizedWelcome`**: Intentional — prevents one-frame flash of the previous user's banner on user change.

## Deployment (Render.com)

- Backend Web Service: builds with `npm install && npm run build`, starts with `node dist/server.js`
- Frontend Static Site: builds client, publishes `client/dist`
- Cloudflare DNS: `www.djforever2026.com` → frontend, `api.djforever2026.com` → backend
- Full guide: `docs/deployment/DEPLOYMENT.md`

## Further reference

`.github/copilot-instructions.md` contains detailed patterns for GraphQL mutations, error classes, testing conventions, mobile optimization, and a file context map organized by domain.

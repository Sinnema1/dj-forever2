# DJ Forever 2 -- Repository Synthesis

This document provides a self-contained technical briefing for an AI conversation about the dj-forever2 codebase. **Part I** describes the system (architecture, data flow, models, deployment) -- enough to hold a general technical conversation. **Part II** provides a structured review framework (categories, output format, guardrails, self-verification) for rigorous codebase evaluation.

---

# PART I: System Reference

---

## 1. Scope and Authority Hierarchy

Before reviewing or discussing any part of the codebase, internalize the source-of-truth hierarchy. When files conflict, higher-ranked sources win.

1. **`.claude/rules/server.md`, `.claude/rules/client.md`, `.claude/rules/testing.md`** -- Scoped runtime guardrails. These are path-triggered rules that override all other guidance when working in their respective directories.
2. **`CLAUDE.md`** -- Workspace-level commands, architecture summary, and critical gotchas. The primary quick-reference for development workflows.
3. **`.github/copilot-instructions.md`** -- Detailed patterns, anti-patterns, file context map organized by domain. The deepest written reference for conventions and architectural decisions.
4. **`docs/CONFIGURATION.md`** -- Canonical environment variable reference with consumption map and production checklist.
5. **Source code** (models, services, resolvers, config files) -- When documentation is ambiguous or outdated, code is truth.

### Mandatory first-reads before any technical work

Read these files in order before beginning any review, discussion, or code change:

1. `CLAUDE.md` -- architecture, commands, gotchas
2. `server/src/config/index.ts` -- centralized config with startup validation
3. `server/src/graphql/typeDefs.ts` -- complete GraphQL API contract
4. `server/src/graphql/resolvers.ts` -- resolver implementations and auth guards
5. `client/src/App.tsx` -- all routes, providers, error boundaries
6. `docs/CONFIGURATION.md` -- env vars, production checklist, config consumption map

---

## 2. Architecture and System State

### 2.1 Monorepo Layout

```
dj-forever2/
  client/          React 18 + TypeScript + Vite + Apollo Client
  server/          Node.js + Express + Apollo Server 4 + MongoDB (Mongoose)
  package.json     Root orchestration via concurrently + wait-on
  scripts/         CI gates (bundle size, placeholders, release env check)
  docs/            Configuration, deployment, admin, development guides
  .github/         CI/CD workflows + copilot-instructions.md
  .claude/rules/   Path-scoped AI guardrails (server, client, testing)
```

Root `npm run dev` starts the server on port 3001, waits for its health check, then starts the client on port 3002. Both build independently for deployment.

### 2.2 Authentication Data Flow

There are **no passwords or user registration**. Every household gets a unique QR code.

```
QR scan
  -> browser navigates to /login/qr/:qrToken (or /:alias short URL)
  -> client route renders QRTokenLogin page (or QRAliasRedirect -> /login/qr/:alias)
  -> Apollo mutation loginWithQrToken(qrToken)
  -> server: User.findByQRTokenOrAlias() -> validate isInvited -> sign JWT
  -> server returns { token, user }
  -> client: AuthContext stores JWT in localStorage['id_token'] + user in localStorage['user']
  -> Apollo authLink injects Authorization: Bearer <token> on every subsequent request
  -> server: GraphQL context extracts JWT, fetches user, populates context.user
  -> resolvers use context.user for auth checks
```

**JWT payload**: `{ userId, email, fullName, isAdmin }`. Expires in 7 days (configurable via `JWT_EXPIRES_IN`). Client polls for expiration every 30 seconds and auto-logs out with a toast notification.

**Household model**: All household members share the primary guest's QR code and JWT. The app cannot distinguish which household member is viewing.

### 2.3 QR Alias System

Human-readable short URLs (e.g., `/smith-family`) redirect to `/login/qr/smith-family`. Stored on `User.qrAlias` (unique, sparse index). `User.qrAliasLocked` prevents changes after physical invitations are printed.

**Reserved route collision protection**: The `/:alias` catch-all route in `App.tsx` must come after all static routes. Reserved paths that cannot be used as aliases: `rsvp`, `registry`, `login`, `admin`, `qr-help`, `auth-debug`. QR code generation script detects collisions and falls back to `/login/qr/:alias` URL format.

### 2.4 Data Models

All models in `server/src/models/`.

**User** (`User.ts`) -- Primary guest record
- Authentication: `qrToken` (required, unique), `qrAlias` (unique, sparse), `qrAliasLocked`
- Identity: `fullName`, `email` (unique), `isAdmin`, `isInvited`
- RSVP state: `hasRSVPed` (boolean), `rsvpId` (ObjectId ref)
- Household: `householdMembers[]` (subdocuments with firstName, lastName, relationships)
- Personalization: `relationshipToBride`, `relationshipToGroom`, `customWelcomeMessage`, `guestGroup` (enum), `plusOneAllowed`, `plusOneName`, `personalPhoto`, `specialInstructions`, `dietaryRestrictions`
- Address: `streetAddress`, `addressLine2`, `city`, `state`, `zipCode`, `country`
- Virtual: `status` ("not-invited" | "invited" | "rsvped"), virtual populate `rsvp`
- Indexes: `{ isInvited: 1, hasRSVPed: 1 }`, `{ email: 1, qrToken: 1 }`
- Static methods: `findByEmail()`, `findByQRToken()`, `findByQRAlias()`, `findByQRTokenOrAlias()`, `findInvitedUsers()`, `findRSVPedUsers()`

**RSVP** (`RSVP.ts`) -- Attendance record (one per user, enforced by unique index on `userId`)
- Core: `userId` (ref User, unique), `attending` (enum: "YES", "NO", "MAYBE"), `guestCount` (0-10)
- Modern format: `guests[]` array with `{ fullName, mealPreference, allergies }`
- Legacy format: flat `fullName`, `mealPreference`, `allergies` fields (backward compatibility)
- Meal preference enum: `brisket`, `tritip`, `kids_chicken`, `kids_mac`, `dietary`, `""`
- `additionalNotes` (max 500 chars)
- Pre-save middleware: clears guests/guestCount when attending="NO", syncs guestCount with guests.length
- Virtual: `totalGuestCount` (1 + guestCount for YES, 0 for NO)
- Static methods: `findByUserId()`, `findAttending()`, `findNotAttending()`, `findMaybe()`, `getAttendanceStats()`

**GuestbookMessage** (`GuestbookMessage.ts`) -- Two-stage moderation
- Fields: `userId`, `authorName`, `message` (1-1000 chars), `isApproved` (default false), `isVisible` (default true)
- Compound index: `{ isApproved: 1, isVisible: 1, createdAt: -1 }`
- Static methods: `findApproved()`, `findPending()`, `findByUser()`, `getMessageStats()`

**EmailJob** (`EmailJob.ts`) -- Persistent email retry queue
- Fields: `userId`, `template`, `status` (pending | retrying | sent | failed), `attempts`, `lastError`, `sentAt`
- Compound index: `{ status: 1, createdAt: 1 }`

### 2.5 Key Invariants

These rules are enforced across the codebase and must not be violated:

| Invariant | Enforcement Location |
|-----------|---------------------|
| **Party size formula**: `maxAllowed = 1 + (householdMembers?.length \|\| 0) + (plusOneAllowed ? 1 : 0)` | `server/src/services/rsvpService.ts` (both createRSVP and updateRSVP) |
| **One RSVP per user**: unique index on `RSVP.userId` | `server/src/models/RSVP.ts` |
| **User.hasRSVPed sync**: set true on RSVP creation, reset on admin delete | `server/src/services/rsvpService.ts`, `server/src/services/adminService.ts` |
| **Email whitelist guard**: no email to real guests unless `ENABLE_PRODUCTION_EMAILS=true` | `server/src/services/emailService.ts` |
| **Database name via option**: `mongoose.connect(uri, { dbName })`, never URI-appended | `server/src/config/index.ts`, `.claude/rules/server.md` |
| **Legacy RSVP compatibility**: both multi-guest and single-guest formats must be supported | `server/src/graphql/resolvers.ts`, `server/src/models/RSVP.ts` |
| **Bundle size gate**: client bundle must stay under 500KB | `scripts/check-bundle-size.cjs`, `.github/workflows/ci.yml` |

### 2.6 GraphQL API Surface

**Schema**: `server/src/graphql/typeDefs.ts`
**Resolvers**: `server/src/graphql/resolvers.ts`

**Enums**: `AttendanceStatus` (YES, NO, MAYBE), `GuestGroup` (grooms_family, friends, brides_family, extended_family, other)

**Queries** (8):
| Query | Auth | Purpose |
|-------|------|---------|
| `me` | requireAuth | Current user profile |
| `getRSVP` | requireAuth | Current user's RSVP |
| `adminGetAllRSVPs` | requireAdmin | All RSVPs with user details |
| `adminGetUserStats` | requireAdmin | Aggregate stats (attendance, meals, dietary) |
| `adminGetGuestList` | requireAdmin | Full guest list |
| `adminExportGuestList` | requireAdmin | CSV export string |
| `emailPreview(userId, template)` | requireAdmin | HTML email preview without sending |
| `emailSendHistory(limit?, status?)` | requireAdmin | Email job history |

**Mutations** (16):
| Mutation | Auth | Purpose |
|----------|------|---------|
| `registerUser` | none | Create user (rarely used; QR login is primary) |
| `loginWithQrToken(qrToken)` | none | QR authentication -> AuthPayload |
| `createRSVP(input)` | requireAuth | Modern multi-guest RSVP creation |
| `editRSVP(updates)` | requireAuth | Update existing RSVP |
| `submitRSVP(...)` | requireAuth | Legacy single-guest RSVP (backward compat) |
| `adminCreateUser` | requireAdmin | Create new guest |
| `adminUpdateUser` | requireAdmin | Update guest fields |
| `adminUpdateRSVP` | requireAdmin | Admin RSVP override |
| `adminUpdateUserPersonalization` | requireAdmin | Single guest personalization |
| `adminBulkUpdatePersonalization` | requireAdmin | CSV/bulk personalization |
| `adminRegenerateQRCodes` | requireAdmin | Regenerate all QR code images |
| `adminDeleteUser` | requireAdmin | Remove guest |
| `adminDeleteRSVP` | requireAdmin | Remove RSVP (resets hasRSVPed) |
| `adminSendReminderEmail` | requireAdmin | Single reminder email |
| `adminSendBulkReminderEmails` | requireAdmin | Bulk reminder to selected users |
| `adminSendReminderToAllPending` | requireAdmin | Remind all non-RSVPed guests |

**No subscriptions** -- polling-based architecture only.

### 2.7 Email System

**File**: `server/src/services/emailService.ts`

**Safety guard (CRITICAL)**: `ENABLE_PRODUCTION_EMAILS=false` by default. When false, all outgoing email routes only to the whitelist address (`sinnema1.jm@gmail.com`). All other recipients are logged to console but not sent, even if SMTP is fully configured. There are ~30 real guests -- never enable production emails without explicit approval.

**SMTP**: Lazy-initialized transporter via `getTransporter()`. Validates all 4 SMTP vars. Gmail app passwords for authentication.

**Templates**: Only `rsvp_reminder` template exists. HTML with inline styles + plain text fallback. CTA button links to user's QR login URL.

**Retry queue**: EmailJob model persists failed sends. Status flow: pending -> retrying -> sent (or failed after max attempts). Bulk sends run sequentially with 100ms delays to avoid rate limiting.

### 2.8 Feature Flags

| Flag | Side | Default | Purpose |
|------|------|---------|---------|
| `VITE_ENABLE_MEAL_PREFERENCES` | Client | `false` | Show meal selection in RSVP form. Food emoji in form are dormant when off. |
| `ENABLE_MEAL_PREFERENCES` | Server | `false` | Server-side meal validation gate. **Must match client flag.** |
| `VITE_ENABLE_GUESTBOOK` | Client | `false` | Show guestbook section on homepage and in navigation. |

Client flags consumed in `client/src/config/features.ts`. Server flag consumed in `server/src/config/index.ts`.

### 2.9 Deployment

**Platform**: Render.com (dual services) + Cloudflare DNS

| Service | URL | Build | Start/Publish |
|---------|-----|-------|---------------|
| Backend Web Service | `https://api.djforever2026.com` | `npm install && npm run build` (root: server/) | `node dist/server.js` |
| Frontend Static Site | `https://www.djforever2026.com` | `npm install && npm run build` (root: client/) | Publish `client/dist` |

**DNS**: Cloudflare. Apex `djforever2026.com` -> 301 redirect to `www.djforever2026.com`. Old `onrender.com` URLs remain as fallback.

**Critical**: `VITE_GRAPHQL_ENDPOINT` is baked into the client bundle at Vite build time. Changing it requires a frontend redeploy, not just a backend redeploy.

**Health checks**: `GET /health` (basic), `GET /health/smtp` (SMTP connectivity with latency measurement).

### 2.10 Database Environments

| Database | Environment | Usage |
|----------|-------------|-------|
| `djforever2` | Production | Real guest data. Never modify from local dev. |
| `djforever2_dev` | Development | Local development. Safe to seed/clean. |
| `djforever2_test` | Testing | CI and local test runs. Auto-cleaned before each run. |

**Connection pattern** (CRITICAL): Always `mongoose.connect(uri, { dbName })`. Never append database name to URI. The `{ dbName }` option overrides any database in the URI. Seed scripts validate and warn on mismatch.

### 2.11 CI/CD Pipeline

**CI** (`.github/workflows/ci.yml`): Runs on push to main/feature branches and all PRs. MongoDB 6.0 service container.

Pipeline order:
1. Placeholder check (`scripts/check-placeholders.sh`) -- fast fail gate
2. Install dependencies (server + client separately)
3. Audit production dependencies (enforced at `audit-level=high`)
4. Audit full tree (informational, non-blocking)
5. Run server tests (real `djforever2_test` database)
6. Run client tests (jsdom + MockedProvider)
7. TypeScript compilation check (both services, `--noEmit`)
8. Lint client
9. Build client
10. Bundle size gate (`scripts/check-bundle-size.cjs`)
11. Bundle visualizer (PRs only, artifact uploaded)

**Deploy** (`.github/workflows/deploy.yml`): Triggers on CI success on `main`. Fires Render.com deploy hooks for server and client separately.

### 2.12 Testing

**Framework**: Vitest for both client and server.

| Layer | Environment | Database | Concurrency | Location |
|-------|------------|----------|-------------|----------|
| Server E2E | Node | Real `djforever2_test` | Sequential (`maxConcurrency: 1`) | `server/tests/*.e2e.test.ts` |
| Client E2E | jsdom | Apollo `MockedProvider` | Default | `client/tests/*.e2e.test.tsx` |
| Integration | Shell | Real test DB + HTTP | Sequential | `test-rsvp-suite.sh` |

**Critical rule**: Server tests hit a real database. Never mock the database in server tests. A prior incident showed mock/prod divergence masking a broken behavior.

### 2.13 Client Architecture

**Routing** (`client/src/App.tsx`):
- `/` -- HomePage (all sections: hero, story, details, FAQs, gallery, travel, guestbook)
- `/rsvp` -- InvitedRoute (requires auth + isInvited)
- `/registry` -- RegistryStandalonePage
- `/login/qr/:qrToken` -- QRTokenLogin
- `/login/success` -- LoginSuccess
- `/qr-help` -- QRInfoPage
- `/admin` -- AdminRoute (requires isAdmin)
- `/auth-debug` -- DEV only (tree-shaken in production)
- `/:alias` -- QRAliasRedirect (catch-all, must be second-to-last)
- `*` -- NotFoundPage (404 fallback, last)

**State management**: AuthContext (token lifecycle, cross-tab sync via StorageEvent) + Apollo Client (InMemoryCache, error link -> auth link -> HTTP link) + ToastContext (notifications via custom events).

**Styling**: Pure CSS with design tokens as CSS custom properties. No Tailwind or CSS-in-JS. Mobile-first. Design tokens include colors (dusty blue, sage, gold, cream), typography (Playfair Display headings, Lato body, Great Vibes script), 4pt spacing grid.

**Code splitting**: AdminPage and AuthDebug lazy-loaded. Vendor chunks split by package (apollo, react-router, react, react-icons, utils). PWA with auto-update service worker, offline fallback, workbox caching.

**React Portals**: `QRLoginModal` and `SwipeableLightbox` render to `document.body`. z-index hierarchy: Content (1-100) -> Modals (9999) -> Drawers (999999).

### 2.14 Admin Dashboard

**Components** in `client/src/components/admin/`:
- `AdminDashboard.tsx` -- Hub with navigation to sub-features
- `AdminRSVPManager.tsx` -- RSVP management grid with filtering
- `AdminAnalytics.tsx` -- Stats, meal preference counts, dietary restrictions
- `AdminGuestPersonalization.tsx` -- Individual guest customization
- `BulkPersonalization.tsx` -- CSV import for bulk guest updates
- `AdminEmailReminders.tsx` -- Email preview, send single/bulk/all-pending
- `AdminGuestExport.tsx` -- CSV export of guest list
- `GuestPersonalizationModal.tsx` -- Full guest editor modal

**Server service**: `server/src/services/adminService.ts` -- stats aggregation, user/RSVP CRUD, bulk personalization, QR alias management.

### 2.15 Context Map (Files by Domain)

**Authentication & Security**:
- `server/src/services/authService.ts` -- JWT generation, QR token validation
- `server/src/middleware/auth.ts` -- authMiddleware, requireAuth, requireAdmin
- `server/src/graphql/context.ts` -- GraphQL context creation from JWT
- `client/src/context/AuthContext.tsx` -- Login state, token lifecycle, cross-tab sync
- `client/src/pages/QRTokenLogin.tsx` -- QR redirect handler
- `client/src/components/QRLoginModal.tsx` -- Manual token entry modal (React Portal)

**RSVP**:
- `server/src/services/rsvpService.ts` -- Business logic, party size validation
- `server/src/models/RSVP.ts` -- Schema, pre-save middleware, legacy compat
- `client/src/components/RSVP/RSVPForm.tsx` -- Multi-guest form (39KB, complex)
- `client/src/features/rsvp/hooks/useRSVP.ts` -- RSVP CRUD operations hook
- `client/src/features/rsvp/graphql/` -- Queries and mutations

**Email**:
- `server/src/services/emailService.ts` -- Safety guard, templates, retry, bulk send
- `server/src/models/EmailJob.ts` -- Persistent retry queue

**Configuration**:
- `server/src/config/index.ts` -- Centralized config with startup validation
- `client/src/config/features.ts` -- Feature flags
- `client/src/config/publicLinks.ts` -- Registry URLs, contact email
- `docs/CONFIGURATION.md` -- Canonical env var reference

**Build & CI**:
- `.github/workflows/ci.yml` -- Full CI pipeline
- `.github/workflows/deploy.yml` -- Deploy hooks
- `client/vite.config.ts` -- Build, PWA, image optimization, code splitting
- `scripts/check-bundle-size.cjs` -- Bundle size gate
- `scripts/check-placeholders.sh` -- Placeholder detection
- `scripts/check-release-env.sh` -- Pre-deploy env validation

---

# PART II: Review Framework

---

## 3. Review Categories

Review the codebase across exactly these categories. Each category lists: what to check, which files to inspect, and the domain invariants that must hold.

### A. SCHEMA AND MODEL INTEGRITY

**Files**: `server/src/models/User.ts`, `server/src/models/RSVP.ts`, `server/src/models/GuestbookMessage.ts`, `server/src/models/EmailJob.ts`

Review points:
- Do all Mongoose indexes align with actual query patterns? Verify no duplicate index declarations (both `index: true` on fields and `schema.index()` compound).
- Does the RSVP pre-save middleware correctly clear guests array and reset guestCount when `attending === 'NO'`?
- Does the GuestbookMessage compound index `{ isApproved: 1, isVisible: 1, createdAt: -1 }` cover the public message query path?
- Does the EmailJob compound index `{ status: 1, createdAt: 1 }` support queue processing?
- Does the HouseholdMember subdocument schema match the GraphQL `HouseholdMemberInput` type?
- **Invariant check**: Does `User.hasRSVPed` stay in sync? Verify `createRSVP` sets it true AND `adminDeleteRSVP` resets it false.
- Does the User virtual populate for RSVP work correctly through GraphQL? The `toJSON: { virtuals: true }` setting does not auto-populate in `find()` -- verify resolvers call `.populate('rsvp')` where needed.

### B. AUTHENTICATION FLOW CORRECTNESS

**Files**: `server/src/services/authService.ts`, `server/src/middleware/auth.ts`, `server/src/graphql/context.ts`, `client/src/context/AuthContext.tsx`, `client/src/pages/QRTokenLogin.tsx`, `client/src/components/QRLoginModal.tsx`, `client/src/App.tsx`

Review points:
- Does `findByQRTokenOrAlias()` correctly resolve both raw qrToken and alias lookups?
- Does the server validate `isInvited` before issuing a JWT?
- Is the JWT payload field (`userId`) consistent between `authService.ts` (signing) and `context.ts` (verification)?
- Does the `/:alias` catch-all route come after all static routes in `App.tsx`?
- Does `AuthContext` handle token expiration correctly (30s polling, auto-logout, cross-tab StorageEvent sync)?
- Does `qrAliasLocked` prevent alias changes? Verify the resolver enforces this check.
- Does the auth middleware silently set `req.user = null` on invalid tokens (no throw)?
- Are reserved routes (`rsvp`, `registry`, `login`, `admin`, `qr-help`, `auth-debug`) consistent between `App.tsx` routes and QR code generation collision detection?

### C. GRAPHQL API COMPLETENESS AND CONSISTENCY

**Files**: `server/src/graphql/typeDefs.ts`, `server/src/graphql/resolvers.ts`, `server/src/types/graphql.ts`

Review points:
- Does every field in `typeDefs.ts` types have a corresponding resolver or Mongoose virtual that provides it?
- Do all admin queries and mutations use `requireAdmin()`? Do all user-facing protected operations use `requireAuth()`?
- Does the legacy `submitRSVP` mutation correctly delegate to `createRSVP` in the service layer?
- Are GraphQL input types (e.g., `CreateRSVPInput`, `AdminRSVPUpdateInput`) consistent with the Mongoose schema validation rules?
- Does `adminUpdateRSVP` correctly cascade to `User.hasRSVPed` state?
- Are there any orphaned type definitions in `typeDefs.ts` with no corresponding resolver?

### D. RSVP LOGIC

**Files**: `server/src/services/rsvpService.ts`, `server/src/utils/validation.ts`, `server/src/models/RSVP.ts`, `client/src/features/rsvp/hooks/useRSVP.ts`, `client/src/components/RSVP/RSVPForm.tsx`

Review points:
- Is the party size formula `maxAllowed = 1 + (householdMembers?.length || 0) + (plusOneAllowed ? 1 : 0)` enforced in both `createRSVP` and `updateRSVP`?
- Does the multi-guest format correctly sync `guestCount` with `guests.length`?
- Are legacy RSVP fields (`fullName`, `mealPreference`, `allergies`) synced from `guests[0]` when using the modern format?
- When `attending === 'NO'`, does the pre-save middleware clear `guestCount` to 0 and `guests` to empty array?
- Is meal preference validation gated by `featuresConfig.mealPreferencesEnabled`? When disabled, does it accept empty string for YES attendance?
- Does the client `useRSVP` hook correctly differentiate between create (no existing RSVP) and edit (existing RSVP) paths?
- Does the client RSVP form correctly pre-populate when editing an existing RSVP?

### E. EMAIL SAFETY AND PRODUCTION GUARDS

**Files**: `server/src/services/emailService.ts`, `server/src/models/EmailJob.ts`, `.claude/rules/server.md`

Review points:
- Does `isEmailAllowedForSending()` correctly implement the compound check: whitelist OR (`ENABLE_PRODUCTION_EMAILS=true` AND production environment)?
- Is the whitelist address exactly `sinnema1.jm@gmail.com`?
- Does `getTransporter()` validate all 4 SMTP vars and reject placeholder values?
- Does bulk email send run sequentially (not parallel) with delays between sends?
- Does `getPendingRSVPRecipients` correctly filter: `isInvited && !hasRSVPed && !isAdmin`?
- Does the email retry queue correctly transition: pending -> retrying -> sent (or failed after max attempts)?
- Are all non-whitelisted emails logged to console with explicit instructions (not silently dropped)?

### F. FEATURE FLAG CONSISTENCY

**Files**: `client/src/config/features.ts`, `server/src/config/index.ts`, `docs/CONFIGURATION.md`

Review points:
- Do client `VITE_ENABLE_MEAL_PREFERENCES` and server `ENABLE_MEAL_PREFERENCES` use the same `=== 'true'` string comparison?
- Does `docs/CONFIGURATION.md` document both client and server meal preference flags and note they must match?
- When meal preferences are disabled, does no code path require a meal preference value for YES attendance?
- Does `VITE_ENABLE_GUESTBOOK` have any corresponding server-side flag? (Expected: no -- guestbook has a model but no GraphQL operations wired yet. Note this as an incomplete feature.)
- Are food emoji in `RSVPForm.tsx` dormant when the meal preference flag is off?

### G. BUILD/CI PIPELINE COVERAGE

**Files**: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `scripts/check-bundle-size.cjs`, `scripts/check-placeholders.sh`, `scripts/check-release-env.sh`

Review points:
- Does the CI pipeline run in the correct order: placeholder check -> install -> audit -> test -> typecheck -> lint -> build -> bundle size gate?
- Does the deploy workflow trigger only on CI success on `main` (not feature branches)?
- Does `check-bundle-size.cjs` enforce the 500KB budget stated in `CLAUDE.md` (current size ~467KB)?
- Does `check-placeholders.sh` scan for `@example.com`, `myregistry.com`, and placeholder patterns in runtime code?
- Are both server and client TypeScript checked with `--noEmit` in CI?
- Does CI use the correct MongoDB service container (Mongo 6.0) with `MONGODB_DB_NAME=djforever2_test`?
- Is server linting run in CI? (Note: `CLAUDE.md` only mentions `cd client && npm run lint`. Verify if server lint exists and is wired.)

### H. ENVIRONMENT CONFIGURATION SAFETY

**Files**: `server/src/config/index.ts`, `docs/CONFIGURATION.md`, `scripts/check-release-env.sh`

Review points:
- Does `config/index.ts` enforce required vars (`JWT_SECRET`, `MONGODB_URI`) in non-test environments? Does the test environment auto-supply safe defaults?
- What is the default for `MONGODB_DB_NAME` in `config/index.ts`? If it defaults to a production-like name when unset, this is a footgun.
- Does `CONFIG__FRONTEND_URL` default appropriately for local development vs production?
- Does `check-release-env.sh` validate all must-have vars from the `docs/CONFIGURATION.md` production checklist?
- Are all `VITE_*` variables documented in `docs/CONFIGURATION.md` with their defaults and consumption locations?
- Is `JWT_SECRET` length (>= 32 chars) enforced at startup, or only documented?

### I. CLIENT STATE MANAGEMENT AND ROUTING

**Files**: `client/src/App.tsx`, `client/src/context/AuthContext.tsx`, `client/src/api/apolloClient.ts`, `client/src/components/InvitedRoute.tsx`, `client/src/components/AdminRoute.tsx`

Review points:
- Does `InvitedRoute` correctly handle: not logged in -> QRPrompt, logged in but not invited -> redirect, logged in + invited -> render content?
- Does `AdminRoute` check `isAdmin` and show appropriate feedback (loading state during auth check, toast on redirect)?
- Is the `/:alias` route second-to-last (before `*` 404) in `App.tsx`?
- Does `AuthContext` version migration (`CURRENT_AUTH_VERSION`) correctly clear stale localStorage data on schema changes?
- Does the Apollo error link clear localStorage on 401 responses?
- Are `AdminPage` and `AuthDebug` lazy-loaded? Is `AuthDebug` gated by `import.meta.env.DEV`?
- Does cross-tab sync via `StorageEvent` correctly propagate login/logout across tabs?

### J. MOBILE/RESPONSIVE PATTERNS

**Files**: `client/src/assets/styles.css`, `client/src/assets/mobile-enhancements.css`, `client/src/components/SwipeableLightbox.tsx`, `client/src/components/QrScanner.tsx`, `client/vite.config.ts`

Review points:
- Are CSS design tokens defined as custom properties in `:root` and used consistently?
- Is the mobile-first approach maintained (base styles = mobile, media queries add desktop)?
- Do React Portal components (`QRLoginModal`, `SwipeableLightbox`) use viewport-relative positioning, not container-relative?
- Does the z-index hierarchy (Content 1-100, Modals 9999, Drawers 999999) remain consistent across all CSS files?
- Does the QR scanner call `scanner.stop()` before `scanner.clear()`? Are unique, stable IDs used for scanner DOM elements? Is cleanup in `useEffect` return?
- Is `rsvp-enhancements.css` imported last in `styles.css` for correct cascade precedence?
- Does the PWA config use `registerType: 'autoUpdate'` (no user prompts)?
- Does the Vite build target ES2019/Safari 14 for older mobile Safari compatibility?

### K. ADMIN DASHBOARD COMPLETENESS

**Files**: `client/src/pages/AdminPage.tsx`, `client/src/components/admin/AdminDashboard.tsx`, `client/src/components/admin/AdminRSVPManager.tsx`, `client/src/components/admin/BulkPersonalization.tsx`, `client/src/components/admin/AdminEmailReminders.tsx`, `server/src/services/adminService.ts`, `client/src/api/adminQueries.ts`

Review points:
- Do all admin components use admin GraphQL queries/mutations (not user-facing ones)?
- Does bulk personalization (CSV import) correctly resolve to `adminBulkUpdatePersonalization` mutation?
- Does QR alias management enforce `qrAliasLocked` before allowing changes?
- Does email preview generate HTML without sending?
- Does `adminExportGuestList` include all necessary fields for guest management?
- Are all admin mutations properly guarded by `requireAdmin()` in resolvers?
- Does the RSVP manager correctly display both multi-guest and legacy format RSVPs?

---

## 4. Output Format

For each finding, output exactly:

```
FINDING-[CATEGORY][NUMBER]
Category: A-K
File: path/to/file:line (if known)
Severity: CRITICAL | HIGH | MEDIUM | LOW | INFO
Invariant violated: (if applicable) which domain rule from Section 2.5 is at risk
Description: one specific paragraph
Recommendation: concrete minimal change
```

**Severity definitions**:
- **CRITICAL**: Data loss, security breach, production outage risk, or email sent to real guests unintentionally
- **HIGH**: Incorrect behavior that affects users but does not risk data
- **MEDIUM**: Code quality issue that increases maintenance burden or diverges from conventions
- **LOW**: Minor improvement opportunity
- **INFO**: Observation with no action required

Do not group findings. Do not summarize until all findings are listed. After all findings, output a summary table:

| ID | Category | File | Severity | Status |
|----|----------|------|----------|--------|

---

## 5. Guardrails -- What Not To Do

Do not:
- Enable production emails (`ENABLE_PRODUCTION_EMAILS=true`) during any review or testing activity. There are ~30 real guests.
- Run seed commands against the production database (`djforever2`). Always verify `MONGODB_DB_NAME` before running any database command.
- Mock the database in server tests. Tests must hit `djforever2_test`. A prior incident showed mock/prod divergence masking broken behavior.
- Suggest password-based authentication. The system is QR-only by design.
- Remove legacy RSVP fields (`fullName`, `mealPreference`, `allergies`) or the `submitRSVP` mutation. Both formats must be preserved for backward compatibility.
- Change port 3001 (server) or 3002 (client). Other tools, scripts, and the root dev command depend on these.
- Convert `useLayoutEffect` to `useEffect` in `PersonalizedWelcome.tsx`. The layout effect prevents a one-frame flash of the previous user's banner on user change.
- Use `any` types in TypeScript code. Strict mode is enforced across both services.
- Bypass the bundle size gate (500KB). If the build exceeds it, the issue must be resolved, not the gate removed.
- Append the database name to the MongoDB URI. Always use `{ dbName }` option in `mongoose.connect()`.
- Suggest architectural changes outside the current design pattern (e.g., replacing Apollo with tRPC, switching to Tailwind).
- Treat findings as confirmed without specific file and line citation.
- Claim external repo-setting state (branch protection, Render.com config) as confirmed from local code alone.

---

## 6. Self-Verification Checklist

After producing findings, run this internal check. For each finding:

1. **File citation**: Can you cite the exact file and line (or line range) where the violation occurs?
2. **Authority citation**: Can you cite which canonical file (from Section 1 hierarchy) defines the violated rule?
3. **Minimal fix**: Is the suggested fix scoped only to that finding, without introducing unrelated changes?

If any finding fails these three checks, remove it and report how many were removed and why.

**Domain-specific verification**:

4. **Party size invariant**: For any finding about RSVP logic, did you verify the formula matches `1 + householdMembers.length + (plusOneAllowed ? 1 : 0)`?
5. **Feature flag awareness**: For any finding about meal preferences or guestbook, did you check whether the relevant feature flag is currently enabled or disabled?
6. **Legacy compatibility**: For any finding about RSVP mutations, did you verify both the multi-guest and legacy single-guest paths?
7. **Email safety**: For any finding touching email code, did you confirm the whitelist guard logic is intact?
8. **Auth flow completeness**: For any finding about authentication, did you trace the full flow from QR scan through JWT issuance to resolver context?
9. **Client-server consistency**: For any finding about a GraphQL type, did you check both the `typeDefs.ts` schema and the corresponding Mongoose model?
10. **Production safety**: Does your recommendation risk any production data, email delivery, or deployment pipeline breakage?

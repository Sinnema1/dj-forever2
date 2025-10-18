# Agent Task Recommendations - Evaluation for DJ Forever 2

**Date**: October 18, 2025  
**Project**: DJ Forever 2 Wedding Website  
**Purpose**: Evaluate 10 proposed GitHub agent tasks against current codebase

---

## Executive Summary

**Overall Assessment**: ⭐⭐⭐⭐ (4/5 Stars)

The proposed agent task pack is **well-structured, professionally scoped, and highly relevant** to our wedding website. The JSON schema approach and strict acceptance criteria are excellent for coding agents. However, several tasks need adjustments to match our **current implementation state** and **project priorities**.

### Recommendation Categories

✅ **High Priority (Implement Now)**: Tasks 1, 3, 4, 5, 9  
⚠️ **Medium Priority (Adjust First)**: Tasks 2, 6, 7, 8  
❌ **Low Priority (Defer)**: Task 10

---

## Task-by-Task Evaluation

### ✅ Task 1: SMTP Health + Reliable Reminders

**Status**: HIGH PRIORITY - READY TO IMPLEMENT  
**Alignment Score**: 9/10

#### Current State

- ✅ emailService.ts already exists (470 lines with JSDoc)
- ✅ Nodemailer installed and configured
- ✅ SMTP credentials in `.env` (Gmail: sinnema1.jm@gmail.com)
- ✅ Dual-mode operation (console dev, SMTP prod)
- ✅ AdminEmailReminders UI complete (408 lines)
- ❌ Missing: Health endpoint, retry queue, dry-run, send logs

#### Why This Matters

- Email reminder system is **complete but untested** (Task #6 in our todo)
- No observability into SMTP failures
- Single-attempt sending = unreliable for wedding guests
- Admins have no confidence in email delivery

#### Recommended Adjustments

```json
{
  "title": "SMTP reliability: health check, retry queue, send logs, preview mode",
  "touched_paths": [
    "server/src/services/emailService.ts",
    "server/src/graphql/resolvers.ts",
    "server/src/graphql/typeDefs.ts",
    "server/src/models/EmailJob.ts", // NEW: email job tracking
    "server/src/routes/health.ts", // NEW: health endpoints
    "client/src/components/admin/AdminEmailReminders.tsx"
  ],
  "implementation_steps": [
    "Add GET /health/smtp endpoint (verify AUTH + NOOP)",
    "Create EmailJob model (userId, template, status, attempts, error)",
    "Add retry queue with exponential backoff (1m/5m/15m, max 5 attempts)",
    "Add dry-run GraphQL query: emailPreview(userId, template) returns HTML",
    "Update AdminEmailReminders UI: health badge, preview button, send history table",
    "Add GraphQL query: emailSendHistory(filters) for admin audit"
  ],
  "tests": [
    "Supertest: /health/smtp returns {ok:true, latencyMs:<1000}",
    "Queue tests: simulate 4xx/5xx errors, assert backoff schedule",
    "E2E: enqueue 3 jobs, verify status progression (pending→sent)",
    "Client RTL: preview modal renders HTML correctly"
  ],
  "acceptance_criteria": [
    "Health endpoint green in admin UI before sending",
    "Failed sends retry automatically with visible progress",
    "Preview shows exact HTML without sending",
    "Admin can view last 50 send attempts with timestamps"
  ]
}
```

#### Implementation Notes

- Use existing logger utility (already comprehensive)
- Leverage existing Winston setup for structured logs
- Email job collection: `{ userId, template, status, attempts, lastError, createdAt, sentAt }`
- Frontend health badge: green (ok), yellow (slow), red (failed)

---

### ⚠️ Task 2: Analytics Accuracy Guard

**Status**: MEDIUM PRIORITY - NEEDS SCOPE ADJUSTMENT  
**Alignment Score**: 6/10

#### Current State

- ✅ AdminAnalytics complete (447 lines + 541 CSS)
- ✅ Already fixed stats alignment bug (#7) - attending is 'YES'/'NO'/'MAYBE' enum
- ✅ Already fixed meal counting bug (#8) - only attending guests counted
- ✅ Comprehensive analytics: 7 visualizations with useMemo optimization
- ❌ Missing: Property-based tests, snapshot tests

#### Why Priority is Medium (Not High)

- Analytics bugs **already fixed** in current commit
- No known regressions since fixes
- Property tests are defensive (good practice but not urgent)
- Wedding is Nov 8, 2026 (13 months away) - analytics stable enough

#### Recommended Adjustments

```json
{
  "title": "Analytics test coverage: property tests + chart snapshots",
  "motivation": "Lock in fixes for attending enum and meal counting logic",
  "touched_paths": [
    "client/tests/analytics/AdminAnalytics.property.test.tsx", // NEW
    "client/tests/analytics/AdminAnalytics.snapshot.test.tsx", // NEW
    "server/tests/services/rsvpService.meal-count.test.ts", // NEW
    "client/tests/analytics/fixtures/rsvp-data.ts" // NEW
  ],
  "implementation_steps": [
    "Add fast-check property tests: total === YES + NO + MAYBE",
    "Add fast-check: meal count <= attending count",
    "Snapshot tests for all 7 chart types (lock labels/bins)",
    "Create fixtures for edge cases: all MAYBE, empty list, single guest",
    "Test known bug scenarios from #7 and #8"
  ],
  "out_of_scope": [
    "UI redesign",
    "New visualization types",
    "Performance optimization (already using useMemo)"
  ]
}
```

#### Defer Rationale

- Could wait until after email testing (Task #6 in todo)
- Current analytics stable and validated manually
- Property tests = nice-to-have for long-term maintenance

---

### ✅ Task 3: Mobile Drawer Polish

**Status**: HIGH PRIORITY - READY TO IMPLEMENT  
**Alignment Score**: 8/10

#### Current State

- ✅ MobileDrawer component exists
- ✅ QRLoginModal integrated in navbar
- ✅ Mobile-first CSS with safe-area considerations
- ⚠️ Drawer may be too wide on smaller devices
- ⚠️ No visual regression tests (only manual testing)

#### Why This Matters

- Wedding website is **mobile-first** by design
- Guests will primarily access on phones
- QR login button in navbar needs polish
- iOS safe area issues documented in mobile docs

#### Recommended Adjustments

```json
{
  "title": "Mobile drawer: responsive width, safe-area, visual E2E snapshots",
  "touched_paths": [
    "client/src/assets/mobile-drawer.css",
    "client/src/components/MobileDrawer.tsx",
    "client/src/components/Navbar.tsx",
    "client/tests/e2e/mobile-drawer.spec.ts", // NEW: Playwright
    "client/playwright.config.ts" // NEW
  ],
  "implementation_steps": [
    "Constrain drawer width: min(86vw, 560px)",
    "Add env(safe-area-inset-bottom) padding for iOS home bar",
    "Sticky auth block at bottom (Login + Registry CTAs)",
    "Lower overlay opacity: 0.4 → 0.25 (preserve page context)",
    "Add Playwright E2E with visual snapshots (iPhone 12, Pixel 5, iPad)",
    "Test focus trap and esc-to-close keyboard navigation"
  ],
  "tests": [
    "Playwright: iPhone 12 viewport (390x844)",
    "Playwright: Pixel 5 viewport (393x851)",
    "Visual snapshots: drawer open/closed states",
    "Accessibility: focus order and keyboard nav"
  ],
  "acceptance_criteria": [
    "Drawer never exceeds 86vw or 560px",
    "Login CTA always visible above iOS home bar",
    "Visual snapshots match baseline (tolerate 1% diff)",
    "Focus trap works, esc closes drawer"
  ]
}
```

#### Implementation Notes

- Install Playwright: `npm install -D @playwright/test`
- Store baselines in `client/tests/e2e/snapshots/`
- CI: Run Playwright headless with ubuntu-latest

---

### ✅ Task 4: Performance & DX - Code Split + Size Gates

**Status**: HIGH PRIORITY - READY TO IMPLEMENT  
**Alignment Score**: 10/10

#### Current State

- ✅ Vite 5.4.20 with fast builds (1.46s)
- ✅ Manual chunks already configured (vendor, apollo, ui)
- ✅ Bundle size: 125.34 kB gzipped
- ✅ Rollup visualizer already installed and configured
- ❌ Missing: Lazy-loaded admin routes
- ❌ Missing: CI size budget enforcement

#### Why This Matters

- Admin dashboard is **3,500+ lines** (heavy!)
- Regular guests never access admin features
- Loading admin code on every page = wasted bandwidth
- Size gates prevent future bundle creep

#### Recommended Adjustments

```json
{
  "title": "Performance: lazy admin routes + CI size budget gates",
  "touched_paths": [
    "client/src/App.tsx",
    "client/src/pages/AdminPage.tsx",
    "client/vite.config.ts",
    "scripts/check-bundle-size.cjs", // NEW
    ".github/workflows/ci.yml"
  ],
  "implementation_steps": [
    "Lazy-load AdminPage: const AdminPage = lazy(() => import('./pages/AdminPage'))",
    "Wrap admin route in Suspense with loading fallback",
    "Add manualChunks for admin: ['admin-analytics', 'admin-email', 'admin-rsvp']",
    "Create scripts/check-bundle-size.cjs (fail if main > 120kb or total > 220kb)",
    "Add CI step: 'npm run build && node scripts/check-bundle-size.cjs'",
    "Generate visualizer artifact: ANALYZE=true npm run build"
  ],
  "tests": [
    "Smoke test: admin route renders after lazy load",
    "Build validation: size check script exits 0 when under budget",
    "CI artifact: bundle-analysis.html uploaded to GitHub Actions"
  ],
  "acceptance_criteria": [
    "Main bundle < 120kb gzipped (from current 125.34kb)",
    "Admin chunks separate from main bundle",
    "CI fails PR if size exceeds budget",
    "Visualizer HTML available as CI artifact"
  ]
}
```

#### Implementation Notes

- **High impact, low risk** - classic performance win
- Visualizer already configured (treemap + sunburst)
- Size check script simple: read manifest, check gzip sizes
- Expected savings: 20-30kb from main bundle

---

### ✅ Task 5: PWA Resilience

**Status**: HIGH PRIORITY - READY TO IMPLEMENT  
**Alignment Score**: 9/10

#### Current State

- ✅ PWA fully configured (vite-plugin-pwa 0.20.5)
- ✅ Workbox runtime caching with NetworkFirst for /graphql
- ✅ offline.html fallback page exists
- ⚠️ No explicit network timeout (uses default ~5s)
- ⚠️ No E2E tests for offline behavior

#### Why This Matters

- Wedding venue may have **spotty WiFi**
- Mobile networks can be unreliable
- Guests shouldn't see "No Connection" errors
- Offline fallback is **already built** but untested

#### Recommended Adjustments

```json
{
  "title": "PWA offline resilience: timeout tuning + E2E validation",
  "touched_paths": [
    "client/vite.config.ts",
    "client/public/offline.html",
    "client/src/api/apolloClient.ts",
    "client/tests/e2e/pwa-offline.spec.ts", // NEW: Playwright
    "docs/PWA.md" // NEW
  ],
  "implementation_steps": [
    "Set explicit networkTimeoutSeconds: 3 for /graphql runtimeCaching",
    "Add retry logic to Apollo Client (RetryLink with max 2 attempts)",
    "Playwright E2E: simulate offline, verify offline.html displayed",
    "Playwright E2E: slow network (3G), verify cache serves after timeout",
    "Document PWA behavior in docs/PWA.md (install, offline, updates)"
  ],
  "tests": [
    "Playwright offline: navigate to /rsvp → sees offline.html",
    "Playwright slow 3G: GraphQL request → cache serves within 3s",
    "Apollo retry: simulate 500 error → retries once → fails gracefully"
  ],
  "acceptance_criteria": [
    "Offline navigation shows branded offline.html",
    "Slow GraphQL falls back to cache within 3s",
    "Apollo client retries failed requests once",
    "PWA.md documents all offline behaviors"
  ]
}
```

#### Implementation Notes

- Current autoUpdate config is **perfect** (no changes needed)
- Timeout of 3s is aggressive but appropriate for wedding site
- Apollo RetryLink: only retry idempotent queries (not mutations)

---

### ⚠️ Task 6: Security Hardening

**Status**: MEDIUM PRIORITY - PARTIALLY IMPLEMENTED  
**Alignment Score**: 5/10

#### Current State

- ✅ Security middleware exists (security.ts with TODO comments)
- ✅ CORS already configured in server.ts
- ✅ Basic security headers implemented
- ✅ Winston logger with structured logging
- ⚠️ Helmet commented out (needs install)
- ⚠️ Rate limiting is in-memory placeholder
- ❌ Missing: Env validation with zod

#### Why Priority is Medium (Not High)

- **Current security adequate** for wedding website
- Not handling payments or sensitive data
- Render.com provides DDoS protection
- QR-only auth already limits attack surface

#### Recommended Adjustments

```json
{
  "title": "Security: env validation, helmet, rate-limit (lightweight)",
  "motivation": "Harden deployment without over-engineering",
  "touched_paths": [
    "server/src/server.ts",
    "server/src/middleware/security.ts",
    "server/src/utils/env.ts", // NEW
    "server/package.json",
    "docs/SECURITY.md" // NEW
  ],
  "implementation_steps": [
    "Install: helmet, express-rate-limit, zod",
    "Create server/src/utils/env.ts with zod schema (JWT_SECRET >= 24 chars, SMTP vars)",
    "Uncomment helmet in security.ts, disable CSP for now (PWA compatibility)",
    "Replace in-memory rate limiter with express-rate-limit (120 req/min)",
    "Add boot-time env validation (fail fast with actionable message)",
    "Document security posture in docs/SECURITY.md"
  ],
  "out_of_scope": [
    "OAuth migration",
    "Rate limit per user (IP-based sufficient)",
    "Redis for rate limit storage (overkill for wedding site)",
    "CSP headers (conflicts with PWA inline styles)"
  ],
  "acceptance_criteria": [
    "Server refuses boot if JWT_SECRET < 24 chars",
    "Helmet headers present (except CSP)",
    "Rate limit triggers at 120 req/min per IP",
    "SECURITY.md documents threat model"
  ]
}
```

#### Defer Rationale

- Email system (Task #1) more urgent
- Current security adequate for launch
- Can add incrementally without breaking changes

---

### ⚠️ Task 7: CSV Export 2.0

**Status**: MEDIUM PRIORITY - ALREADY PARTIALLY COMPLETE  
**Alignment Score**: 7/10

#### Current State

- ✅ AdminGuestExport component complete
- ✅ CSV export working with full guest data
- ✅ GraphQL query: adminExportGuestList
- ❌ Missing: Filters (invited/attending/maybe)
- ❌ Missing: Canonical header order

#### Why Priority is Medium

- Current export **works for wedding planning**
- Filters would be nice but not critical
- Header order is cosmetic (Excel handles fine)
- No vendor complaints about current format

#### Recommended Adjustments

```json
{
  "title": "CSV export: add status filters + standardize header order",
  "touched_paths": [
    "server/src/services/adminService.ts",
    "server/src/graphql/typeDefs.ts",
    "server/src/graphql/resolvers.ts",
    "client/src/components/admin/AdminGuestExport.tsx",
    "docs/EXPORTS.md" // NEW
  ],
  "implementation_steps": [
    "Add filter param to adminExportGuestList(filter: ExportFilter = ALL)",
    "enum ExportFilter { ALL, INVITED, YES, NO, MAYBE }",
    "Enforce header order: Full Name, Email, Status, Party Size, Meal, Dietary, Notes",
    "Add filter dropdown in AdminGuestExport UI",
    "Document format in docs/EXPORTS.md"
  ],
  "tests": [
    "Server: query with filter=YES returns only attending guests",
    "Server: verify header order matches spec",
    "Client RTL: filter dropdown changes export query variable"
  ],
  "acceptance_criteria": [
    "Export all invited guests (filter=INVITED)",
    "Export only attending (filter=YES)",
    "CSV headers consistent across all exports"
  ]
}
```

#### Defer Rationale

- Works well enough for current needs
- Can add filters anytime without breaking existing exports
- Priority after email reliability

---

### ⚠️ Task 8: DB Indices + Data Guardrails

**Status**: MEDIUM PRIORITY - PARTIALLY IMPLEMENTED  
**Alignment Score**: 6/10

#### Current State

- ✅ Compound indexes on User model: `{ isInvited: 1, hasRSVPed: 1 }`
- ✅ Unique indexes: `email`, `qrToken`
- ✅ RSVP indexes: `userId`, `createdAt`
- ✅ Attending already string enum ('YES'/'NO'/'MAYBE')
- ⚠️ Email index may not be unique (needs verification)
- ❌ Missing: Migration scripts for backfill
- ❌ Missing: Schema validators for enum

#### Why Priority is Medium

- Current indexes **perform well** (small dataset ~200 guests)
- No legacy boolean attending data (clean from start)
- Migrations only needed if we change schema
- Validators nice-to-have but not critical

#### Recommended Adjustments

```json
{
  "title": "DB hardening: unique email index + enum validators",
  "touched_paths": [
    "server/src/models/User.ts",
    "server/src/models/RSVP.ts",
    "server/src/migrations/2025-10-unique-email.ts", // NEW
    "server/tests/models/User.validation.test.ts" // NEW
  ],
  "implementation_steps": [
    "Verify User email index is unique: { email: 1, unique: true }",
    "Add mongoose schema validator: attending in ['YES', 'NO', 'MAYBE']",
    "Create migration script to detect/fix any invalid attending values",
    "Add tests for validator rejection of invalid enums",
    "Document index strategy in models/README.md"
  ],
  "tests": [
    "Integration: explain() confirms index usage on common queries",
    "Unit: reject RSVP with attending='true' (boolean string)",
    "Migration: dry-run passes with no changes needed"
  ],
  "acceptance_criteria": [
    "User.email index is unique",
    "Invalid attending values rejected at schema level",
    "Migration script idempotent (safe to re-run)"
  ]
}
```

#### Defer Rationale

- No known data quality issues
- Database small enough that perf not critical
- Can add validators incrementally

---

### ✅ Task 9: Structured Logging + Request IDs

**Status**: HIGH PRIORITY - PARTIALLY IMPLEMENTED  
**Alignment Score**: 8/10

#### Current State

- ✅ Winston logger utility complete (logger.ts)
- ✅ Structured logging with metadata objects
- ✅ Request logger middleware in security.ts
- ✅ All services using logger.info/error/warn
- ❌ Missing: Request ID middleware
- ❌ Missing: Request ID in log metadata

#### Why This Matters

- **Email debugging** requires request tracing
- Admin actions need audit trail
- Current logs lack correlation across requests
- Request IDs = 10-line middleware (easy win)

#### Recommended Adjustments

```json
{
  "title": "Observability: requestId middleware + correlated logs",
  "touched_paths": [
    "server/src/middleware/logging.ts", // NEW
    "server/src/server.ts",
    "server/src/utils/logger.ts",
    "server/src/services/emailService.ts",
    "server/src/services/adminService.ts",
    "server/tests/logging/requestId.test.ts" // NEW
  ],
  "implementation_steps": [
    "Create middleware/logging.ts: generate UUID per request",
    "Attach to req.context.requestId and res.setHeader('X-Request-ID')",
    "Update logger to accept optional requestId in metadata",
    "Update all service calls to include requestId from context",
    "Log key events: login, RSVP create/update, email queued/sent/failed",
    "Add tests for requestId propagation through call stack"
  ],
  "tests": [
    "Supertest: verify X-Request-ID in response headers",
    "Integration: trace single request through logs (login → RSVP → email)",
    "Assert requestId consistency across log lines for same request"
  ],
  "acceptance_criteria": [
    "Every log line includes requestId when available",
    "Admin dashboard actions correlate across services",
    "Email send failures traceable to originating request"
  ]
}
```

#### Implementation Notes

- Use `uuid` package for request IDs
- Store in `req.context = { requestId, userId? }`
- Logger signature: `logger.info(msg, { requestId, ...meta })`
- **High value, low effort** - perfect quick win

---

### ❌ Task 10: GraphQL Type Safety Gate

**Status**: LOW PRIORITY - DEFER  
**Alignment Score**: 4/10

#### Current State

- ✅ TypeScript strict mode enabled
- ✅ Manual types in client models
- ✅ GraphQL schema well-documented
- ⚠️ Some `any` types in Apollo queries
- ❌ No graphql-codegen installed
- ❌ No CI typecheck enforcement

#### Why Priority is Low (Defer)

- **Works well enough** for wedding site
- Manual types manageable for small schema
- Codegen adds build complexity
- CI already runs typecheck (`tsc --noEmit`)
- Project scope small enough to maintain manually

#### Recommended If Pursued

```json
{
  "title": "GraphQL codegen types (optional quality-of-life)",
  "motivation": "Eliminate client/server drift for long-term maintenance",
  "out_of_scope": [
    "Server-side codegen (overkill)",
    "Refactoring working queries (if it ain't broke...)",
    "Type generation for mutations (manual types sufficient)"
  ],
  "defer_rationale": [
    "Wedding is 13 months away - time better spent on reliability",
    "Manual types work fine for current schema size",
    "Codegen adds dependency and build step complexity",
    "Current TypeScript coverage adequate (no type-related bugs)"
  ]
}
```

#### Defer Rationale

- Email reliability (Task #1) **vastly more important**
- Mobile polish (Task #3) directly improves UX
- Codegen = nice-to-have for larger teams
- Current manual types are type-safe and working

---

## Implementation Priority Roadmap

### Phase 1: Critical Path (Next 2 Weeks)

1. **Task 1: SMTP Health + Retry Queue** (unblocks Task #6 in todo)
2. **Task 9: Request IDs** (15 min implementation, huge debugging value)
3. **Task 4: Code Splitting** (performance quick win)

### Phase 2: Polish & Resilience (Next Month)

4. **Task 5: PWA Offline E2E** (validates existing PWA)
5. **Task 3: Mobile Drawer** (UX refinement)
6. **Task 6: Security Hardening** (env validation)

### Phase 3: Quality of Life (Next Quarter)

7. **Task 7: CSV Filters** (admin convenience)
8. **Task 2: Analytics Tests** (defensive coverage)
9. **Task 8: DB Validators** (data quality)

### Phase 4: Defer Indefinitely

10. **Task 10: GraphQL Codegen** (not worth complexity)

---

## Agent Contract & Schema Assessment

### ✅ Agent Contract - EXCELLENT

- **Touch scope** rules are perfect
- **Prohibited paths** prevent legacy folder issues
- **Test requirements** enforce quality
- **Build/CI gates** prevent regressions
- **Rollback plans** provide safety net

**Recommendation**: Adopt as-is, no changes needed.

### ✅ Task Schema - EXCELLENT

- **JSON-first** format ideal for agents
- **Strict acceptance criteria** prevent ambiguity
- **out_of_scope** clarifies boundaries
- **rollback_plan** provides safety

**Recommendation**: Use this schema for all future agent tasks.

### ⚠️ Issue Form - NEEDS TWEAK

The `.github/ISSUE_TEMPLATE/agent-task.yml` is good but add:

```yaml
body:
  - type: dropdown
    id: priority
    attributes:
      label: Priority
      options:
        - High (critical path)
        - Medium (quality of life)
        - Low (defer)
    validations:
      required: true
```

### ✅ CI Workflow - GOOD BASE

The workflow is solid but needs adjustments:

```yaml
# Add before tests:
- name: Install dependencies
  run: |
    cd server && npm ci
    cd ../client && npm ci

# Fix client typecheck (no codegen yet):
- name: Typecheck (client)
  working-directory: client
  run: npx tsc --noEmit # Remove codegen step until Task 10

# Size gate needs creation:
- name: Size gate
  working-directory: client
  run: |
    npm run build
    node ../scripts/check-bundle-size.cjs || echo "Size check script needs creation"
```

### ⚠️ Size Check Script - NEEDS CORRECTION

The provided `check-stats.cjs` has wrong path assumptions:

```javascript
// CORRECTED VERSION for Vite 5.4.20
import fs from "node:fs";
import path from "node:path";

const distPath = path.join(process.cwd(), "dist");
const assetsPath = path.join(distPath, "assets");

// Get all JS files
const files = fs
  .readdirSync(assetsPath)
  .filter((f) => f.endsWith(".js") || f.endsWith(".js.gz"));

// Calculate sizes
let totalGz = 0;
let mainGz = 0;

files.forEach((file) => {
  if (file.endsWith(".gz")) {
    const size = fs.statSync(path.join(assetsPath, file)).size;
    totalGz += size;

    // Main entry is usually index-[hash].js
    if (file.includes("index-")) {
      mainGz = Math.max(mainGz, size);
    }
  }
});

// Budgets (adjust as needed)
const MAIN_BUDGET = 120 * 1024; // 120kb
const TOTAL_BUDGET = 220 * 1024; // 220kb

console.log(
  `Bundle sizes: main=${(mainGz / 1024).toFixed(1)}kb, total=${(
    totalGz / 1024
  ).toFixed(1)}kb`
);

if (mainGz > MAIN_BUDGET || totalGz > TOTAL_BUDGET) {
  console.error(
    `❌ Size gate failed: main=${mainGz}b (limit ${MAIN_BUDGET}b), total=${totalGz}b (limit ${TOTAL_BUDGET}b)`
  );
  process.exit(1);
}

console.log("✅ Size gate passed");
```

---

## Recommendations for Deployment

### 1. Start with Quick Wins

- Implement **Task 9** first (request IDs = 15 minutes)
- Then **Task 1** (email reliability = highest business value)
- Then **Task 4** (code splitting = clear performance win)

### 2. Use the Contract & Schema

- Commit AGENT_CONTRACT.md immediately
- Commit agent_task_schema.json immediately
- Reference in all future agent tasks

### 3. Adjust Task Priorities

- Follow the phase roadmap above
- Defer Task 10 indefinitely
- Adjust Task 6 scope (don't over-engineer security)

### 4. Create Adjusted Issue Templates

Use the corrected versions from evaluation sections above.

### 5. Fix CI Workflow

Apply corrections from "CI Workflow" section before first agent task.

---

## Conclusion

The agent task pack is **professionally designed and highly relevant**. With minor adjustments for our **current implementation state** and **wedding website priorities**, this will be an excellent framework for agent-driven development.

**Next Steps**:

1. Review this evaluation
2. Commit AGENT_CONTRACT.md and schema
3. Create adjusted GitHub issues for Phase 1 tasks
4. Assign to coding agent with confidence

**Overall Grade**: A- (92/100)

- Excellent structure and documentation
- Minor adjustments needed for context
- Perfect for coding agent workflows

---

**Document Status**: ✅ READY FOR REVIEW  
**Recommended Action**: Implement Phase 1 tasks immediately after current commit

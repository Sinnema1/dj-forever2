# Remaining Work — DJ Forever 2

> Single source of truth for post-launch and deferred items.
> Last updated: 2026-02-15 (Phase 4 pre-production lockdown).

---

## Pre-Launch Ops Toggles

These require no code changes — just set environment variables at deploy time.

| Toggle            | Env Var                                                           | When to flip                                                |
| ----------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| Contact email     | `VITE_CONTACT_EMAIL`                                              | Before launch — set to real wedding contact email           |
| Registry URLs     | `VITE_CRATE_BARREL_REGISTRY_URL`, `VITE_HONEYMOON_FUND_URL`, etc. | Before launch — set to real registry URLs                   |
| Production emails | `ENABLE_PRODUCTION_EMAILS`                                        | When ready to send real outbound email (RSVP confirmations) |
| Meal preferences  | `VITE_ENABLE_MEAL_PREFERENCES`                                    | When wedding menu is finalized                              |
| Guestbook         | `VITE_ENABLE_GUESTBOOK`                                           | When guestbook backend + UI are implemented                 |

See [docs/CONFIGURATION.md](CONFIGURATION.md) for the full env var reference and production checklist.

---

## Feature Work (Post-Launch)

### RSVP Confirmation Emails

- **Status**: No post-submission email exists. SMTP infra is configured (nodemailer) but only used for admin-triggered reminder emails.
- **Remaining**:
  - [ ] Backend: Send confirmation email after `createRSVP` and `updateRSVP`
  - [ ] Email template: Branded HTML email with attendance summary, guest names, dietary info
  - [ ] Throttle/dedupe: Prevent email spam on rapid re-edits (e.g., 5-minute cooldown on update emails)
  - [ ] Flip `ENABLE_PRODUCTION_EMAILS=true` when ready

### Guestbook (gated — `VITE_ENABLE_GUESTBOOK`)

- **Status**: UI stubs exist (`GuestbookForm`, `GuestbookFeed` return `null`), gated behind feature flag
- **Remaining**:
  - [ ] Backend: GraphQL mutations + MongoDB model for guestbook entries
  - [ ] Frontend: Implement `GuestbookForm` and `GuestbookFeed` components
  - [ ] Moderation: Admin review/approval workflow for entries
  - [ ] Flip `VITE_ENABLE_GUESTBOOK=true` when ready

### Guest Photo Sharing

- **Status**: Frontend components mostly built; backend API missing
- **Remaining**:
  - [ ] Backend: Image upload API (S3/Cloudinary integration)
  - [ ] Backend: Photo storage, retrieval, and thumbnail generation
  - [ ] Frontend: Wire upload component to backend API
  - [ ] Admin: Photo moderation dashboard

### Meal Preferences (gated — `VITE_ENABLE_MEAL_PREFERENCES`)

- **Status**: Full RSVP form integration complete, gated behind feature flag
- **Remaining**:
  - [ ] Finalize wedding menu options
  - [ ] Update meal enum values in schema if menu differs from current options
  - [ ] Flip `VITE_ENABLE_MEAL_PREFERENCES=true`

---

## UX Improvements (Post-Launch)

| Item                                       | Priority | Notes                                                                     |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------- |
| Desktop QR scanner improvement             | Medium   | Current implementation works but could be more polished                   |
| Mobile floating RSVP CTA button            | Medium   | RSVP CTA hidden by hamburger menu on mobile                               |
| Admin page polish                          | Low      | Dashboard is functional; styling can be refined                           |
| Routing expansions (`/gallery`, `/travel`) | Low      | Currently homepage sections; standalone routes would improve deep-linking |

---

## Infrastructure & DevOps

### SMTP Reliability (T1)

- [ ] Production email provider integration (SendGrid/SES/Mailgun)
- [ ] Email delivery monitoring and retry logic
- [ ] Template system for RSVP confirmation emails

### Error Reporting Integration

- **Status**: `errorReportingService.ts` is a silent no-op unless `VITE_ERROR_REPORTING_PROVIDER` is set
- [ ] Choose provider (Sentry, Datadog, etc.)
- [ ] Set `VITE_ERROR_REPORTING_PROVIDER` and `VITE_ERROR_REPORTING_DSN`
- [ ] Implement provider-specific adapter in `sendToExternalServicesIfConfigured()`

### Request ID Tracing (T9)

- [ ] Add `X-Request-ID` header middleware to Express
- [ ] Propagate request IDs through GraphQL resolver context
- [ ] Include request IDs in error responses for debugging

### Dependency Upgrades

| Package               | Current | Latest                            | Risk                                            |
| --------------------- | ------- | --------------------------------- | ----------------------------------------------- |
| `vitest`              | 0.30.x  | 2.x                               | High — major version, test API changes possible |
| `@vitest/coverage-c8` | 0.33.x  | Replaced by `@vitest/coverage-v8` | Medium — package renamed                        |

> **Recommendation**: Upgrade vitest in a dedicated branch with full test validation.

---

## Testing Gaps

| Area                         | What's missing                                           | Priority          |
| ---------------------------- | -------------------------------------------------------- | ----------------- |
| `qrAlias` coverage           | No unit tests for QR alias resolution                    | Medium            |
| CSV validation               | No tests for `BulkPersonalization` CSV import edge cases | Medium            |
| Production validation sprint | Real-data admin walkthrough with prod-like dataset       | High (pre-launch) |
| Cross-browser testing        | Safari/Firefox RSVP form + QR scanner validation         | Medium            |
| Real device QR scanning      | Physical device test with printed QR codes               | High (pre-launch) |

---

## Documentation Status

| Doc                     | Location                                  | Purpose                            | Status        |
| ----------------------- | ----------------------------------------- | ---------------------------------- | ------------- |
| Configuration reference | [docs/CONFIGURATION.md](CONFIGURATION.md) | All env vars, production checklist | Current       |
| Admin guide             | [docs/admin/](admin/)                     | Dashboard usage, login, analytics  | Current       |
| Deployment guide        | [docs/deployment/](deployment/)           | Render.com setup, URLs             | Current       |
| Feature flags           | [docs/features/](features/)               | Meal prefs, QR alias guides        | Current       |
| Bug fix history         | [docs/bug-fixes/](bug-fixes/)             | Resolution notes for past issues   | Archive-ready |
| Routing guide           | [docs/ROUTING_GUIDE.md](ROUTING_GUIDE.md) | SPA routing architecture           | Current       |
| Archived docs           | [docs/archive/](archive/)                 | Completed planning/status docs     | Archived      |

---

## CI/CD Pipeline Summary

```
Push to feature-branch or PR → CI workflow:
  1. Placeholder scan (bash-only, fast fail)
  2. Setup Node.js 20
  3. npm ci (server + client)
  4. Tests (server + client)
  5. TypeScript typecheck (server + client)
  6. ESLint (client)
  7. Build (client)
  8. Bundle size gate
  9. Bundle analysis (PR only)

Push to main → Deploy workflow:
  1. CI workflow runs first (reusable workflow call)
  2. Deploy server to Render (only if CI passes)
  3. Deploy client to Render (only if CI passes)
```

---

## Not Planned / Wish List

These items were identified but are not on the roadmap:

- Email system advanced features (templates, scheduling, analytics)
- Admin dashboard advanced features (export formats, bulk operations)
- PWA offline-first enhancements beyond current service worker
- Personalization framework expansion (per-guest theming)
- Large testing checklists from planning docs (admin UX, QR flow, production readiness)

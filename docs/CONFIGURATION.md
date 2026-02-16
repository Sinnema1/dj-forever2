# Configuration Reference

All environment variables for DJ Forever 2, split by service.

---

## Client (`client/.env`)

| Variable                            | Required | Default    | Description                                                                                    |
| ----------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `VITE_GRAPHQL_ENDPOINT`             | Yes      | `/graphql` | GraphQL API URL. Use relative path in dev (Vite proxy); full backend URL in production.        |
| `VITE_WEDDING_CONTACT_EMAIL`        | **Prod** | _(empty)_  | Contact email shown on QR help pages. Fallback text renders when empty.                        |
| `VITE_CRATE_BARREL_REGISTRY_URL`    | No       | _(empty)_  | Crate & Barrel registry URL. Card hidden when empty.                                           |
| `VITE_WILLIAMS_SONOMA_REGISTRY_URL` | No       | _(empty)_  | Williams-Sonoma registry URL. Card hidden when empty.                                          |
| `VITE_COSTCO_REGISTRY_URL`          | No       | _(empty)_  | Costco/MyRegistry URL. Card hidden when empty.                                                 |
| `VITE_HONEYMOON_FUND_URL`           | No       | _(empty)_  | Honeymoon fund URL. Card hidden when empty.                                                    |
| `VITE_ENABLE_MEAL_PREFERENCES`      | No       | `false`    | Show meal selection in RSVP form. Set `true` when menu is finalized.                           |
| `VITE_ENABLE_GUESTBOOK`             | No       | `false`    | Show Guestbook section on homepage and in navigation.                                          |
| `VITE_GA4_MEASUREMENT_ID`           | No       | _(empty)_  | Google Analytics 4 measurement ID (`G-XXXXXXXXXX`).                                            |
| `VITE_ERROR_REPORTING_PROVIDER`     | No       | _(empty)_  | External error reporting provider (`sentry`, `logrocket`, `bugsnag`). Silent no-op when empty. |

## Server (`server/.env`)

| Variable                   | Required | Default                     | Description                                                                                                                 |
| -------------------------- | -------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`              | Yes      | `mongodb://localhost:27017` | MongoDB connection URI. Use `mongodb+srv://…` for Atlas in production. **Do not** append a database name to the URI.        |
| `MONGODB_DB_NAME`          | Yes      | `djforever2_dev`            | Database name. Production: `djforever2`. Test: `djforever2_test`.                                                           |
| `JWT_SECRET`               | Yes      | —                           | Secret for signing JWT tokens. Must be ≥ 32 characters in production.                                                       |
| `PORT`                     | No       | `3001`                      | HTTP port. Render assigns this automatically in production.                                                                 |
| `FRONTEND_URL`             | Yes      | `http://localhost:3002`     | Frontend origin for QR login redirects and CORS.                                                                            |
| `ENABLE_MEAL_PREFERENCES`  | No       | `false`                     | Server-side meal preference validation gate. Must match client flag.                                                        |
| `ENABLE_PRODUCTION_EMAILS` | No       | `false`                     | When `false`, emails only sent to whitelisted test addresses. Set `true` **only** in production after verifying guest list. |
| `SMTP_HOST`                | No       | —                           | SMTP server hostname (e.g., `smtp.gmail.com`).                                                                              |
| `SMTP_PORT`                | No       | `587`                       | SMTP port.                                                                                                                  |
| `SMTP_USER`                | No       | —                           | SMTP username/email.                                                                                                        |
| `SMTP_PASS`                | No       | —                           | SMTP app password.                                                                                                          |
| `VITE_GA4_MEASUREMENT_ID`  | No       | —                           | GA4 measurement ID (server-side reference).                                                                                 |

---

## Production Checklist

Before going live, ensure these are set in your deployment platform:

### Must-have

- [ ] `VITE_GRAPHQL_ENDPOINT` → full backend URL
- [ ] `VITE_WEDDING_CONTACT_EMAIL` → real contact email
- [ ] `MONGODB_URI` → Atlas connection string
- [ ] `MONGODB_DB_NAME` → `djforever2`
- [ ] `JWT_SECRET` → strong random secret (≥ 32 chars)
- [ ] `FRONTEND_URL` → production frontend URL

### Recommended

- [ ] At least one `VITE_*_REGISTRY_URL` configured
- [ ] `VITE_ENABLE_MEAL_PREFERENCES=true` (when menu is ready)
- [ ] `ENABLE_PRODUCTION_EMAILS=true` (when guest list is verified)

### Optional

- [ ] `VITE_GA4_MEASUREMENT_ID` for analytics
- [ ] `VITE_ERROR_REPORTING_PROVIDER` for error tracking

---

## Where configs are consumed

| Config file                        | Reads from                                              |
| ---------------------------------- | ------------------------------------------------------- |
| `client/src/config/publicLinks.ts` | `VITE_*_REGISTRY_URL`, `VITE_WEDDING_CONTACT_EMAIL`     |
| `client/src/config/features.ts`    | `VITE_ENABLE_MEAL_PREFERENCES`, `VITE_ENABLE_GUESTBOOK` |
| `server/src/config/index.ts`       | All server `env` vars                                   |

## CI gates

| Script                          | What it checks                                                               |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `scripts/check-placeholders.sh` | No `@example.com` / `myregistry.com` in runtime code                         |
| `scripts/check-bundle-size.cjs` | Client bundle stays within size budget                                       |
| `scripts/check-release-env.sh`  | Required env vars are set before deploy (run manually or in deploy pipeline) |

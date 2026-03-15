---
paths:
  - "server/**"
---

# Server-Side Rules

## Database Connection — Critical Pattern

**Never append the database name to the MongoDB URI.** Always pass it as the `{ dbName }` option:

```typescript
// Correct
mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });

// Wrong — do not do this
mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}`);
```

If the URI already contains a database name, `{ dbName }` overrides it. The seed scripts include validation warnings to catch this mismatch. Use bare URIs (e.g., `mongodb://localhost:27017`) and rely on `MONGODB_DB_NAME` for database selection.

## Production Database Safety

- `djforever2` = production, `djforever2_dev` = development, `djforever2_test` = testing
- Never run `npm run seed-prod` or `npm run clean:db` against production without a backup and explicit user approval
- Verify `echo $MONGODB_DB_NAME` before running any database operation locally

## Email Safety Guard

`ENABLE_PRODUCTION_EMAILS=false` by default. When false, **all outgoing email routes to the whitelist address** regardless of recipient. There are 30 real guests — never enable production emails without explicit approval. Logic is in `server/src/services/emailService.ts`.

## GraphQL & RSVP Patterns

- Party size formula: `maxAllowed = 1 + (householdMembers?.length || 0) + (plusOneAllowed ? 1 : 0)` — enforced in both `createRSVP` and `updateRSVP` resolvers
- RSVP mutations support **both** the new guest-array format and the legacy single-guest format — do not remove legacy handling
- All resolvers receive `user` from JWT context (`server/src/graphql/resolvers.ts`) — use `context.user` for auth checks, not request headers directly
- Custom error classes are in `server/src/utils/errors.ts` — use these instead of generic `Error`

## Authentication Flow

QR token → `/login/qr/:qrToken` server endpoint → issues JWT → client stores as `localStorage['id_token']` → Apollo Client injects on every request → resolver reads from context.

`server/src/services/authService.ts` owns JWT generation and QR token validation.

## Render.com Deployment

- `VITE_GRAPHQL_ENDPOINT` is baked into the frontend bundle at Vite build time — changing it requires a frontend redeploy, not just a backend redeploy
- Backend uses `process.env.PORT` in production (Render assigns it); defaults to 3001 in development
- `CONFIG__FRONTEND_URL` is used in QR redirect URLs and email links — verify which var `emailService.ts` reads before changing
- Backend does not serve static files in production; frontend and backend deploy as separate Render services

## Port Conflicts

Kill stuck processes: `lsof -ti:3001 | xargs kill -9`

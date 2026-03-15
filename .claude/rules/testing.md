---
paths:
  - "**/tests/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.e2e.test.ts"
  - "**/*.e2e.test.tsx"
---

# Testing Rules

## Database — Never Mock in Server Tests

Server integration tests hit the real `djforever2_test` database. **Do not mock the database.** A prior incident showed mock/prod divergence masking broken behavior. The test DB is auto-cleaned before each run via `server/tests/vitest.setup.ts`.

## Sequential Execution

Vitest is configured with `maxConcurrency: 1` in `server/vitest.config.ts` — tests run sequentially to prevent DB conflicts. Do not change this setting.

## Test Patterns by Layer

- **Server E2E** (`server/tests/*.e2e.test.ts`): Full auth + RSVP workflow against real test DB, 30s timeout
- **Client component** (`client/tests/*.e2e.test.tsx`): React Testing Library + Apollo `MockedProvider` — mock mutations here, not the DB
- **GraphQL manual testing**: `node debug-rsvp-graphql.js` for ad-hoc mutation validation
- **Full RSVP suite**: `bash test-rsvp-suite.sh` — runs all layers end-to-end

## File Naming

Test files use the `*.e2e.test.ts/tsx` suffix and live in `/tests/` directories within each workspace (`client/tests/`, `server/tests/`).

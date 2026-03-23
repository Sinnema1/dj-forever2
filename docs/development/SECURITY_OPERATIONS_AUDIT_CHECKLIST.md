# Security and Operations Audit Checklist

Use this checklist to execute Phase 3 with evidence-first validation across application security, environment safety, CI/CD, and operational resilience.

## Scope

- Server runtime and middleware protections
- Authentication and authorization pathways
- Environment variable and secret handling
- CI/CD and dependency risk controls
- Production readiness, observability, and rollback safety

## How To Use

1. Work through each section in order.
2. Add evidence links in the last column.
3. Log findings in the findings register.
4. Mark severity and owner for each failed control.

## Severity Rubric

| Severity | Meaning                                  | Required Action                   |
| -------- | ---------------------------------------- | --------------------------------- |
| Critical | Active exploit risk or high blast radius | Fix immediately; block deployment |
| High     | Material risk with clear failure mode    | Fix this sprint                   |
| Medium   | Meaningful gap with constrained impact   | Schedule in current/next cycle    |
| Low      | Improvement opportunity                  | Track for backlog hygiene         |

## Control Checklist

| ID     | Domain             | Control                                                                         | Status            | Severity | Evidence                                                                               |
| ------ | ------------------ | ------------------------------------------------------------------------------- | ----------------- | -------- | -------------------------------------------------------------------------------------- | --- | ------------------ |
| SO-001 | Runtime Security   | `helmet` security headers are enabled in server middleware                      | [x] Pass [ ] Fail |          | server/src/middleware/security.ts, npm run audit:security:check                        |
| SO-002 | Runtime Security   | GraphQL route is rate-limited with defined thresholds                           | [x] Pass [ ] Fail |          | server/src/server.ts, server/src/middleware/security.ts                                |
| SO-003 | Runtime Security   | CORS allowlist is explicit and environment-appropriate                          | [x] Pass [ ] Fail |          | server/src/server.ts                                                                   |
| SO-004 | Auth               | JWT validation path rejects invalid and expired tokens                          | [x] Pass [ ] Fail |          | server/src/middleware/auth.ts, server/src/services/authService.ts                      |
| SO-005 | Auth               | QR-only authentication assumptions are documented and enforced                  | [x] Pass [ ] Fail |          | docs/development/QR_ALIAS_IMPLEMENTATION.md, server/src/services/authService.ts        |
| SO-006 | Secrets & Config   | `JWT_SECRET` is required in non-test environments                               | [x] Pass [ ] Fail |          | server/src/config/index.ts, server/.env.example                                        |
| SO-007 | Secrets & Config   | `MONGODB_DB_NAME` safety pattern is documented and followed                     | [x] Pass [ ] Fail |          | docs/CONFIGURATION.md, server/.env.example, database scripts                           |
| SO-008 | Secrets & Config   | Production email guard defaults to safe mode (`ENABLE_PRODUCTION_EMAILS=false`) | [x] Pass [ ] Fail |          | server/.env.example, server/src/services/emailService.ts                               |
| SO-009 | CI/CD              | CI workflow validates tests, types, and builds before deploy                    | [x] Pass [ ] Fail |          | .github/workflows/ci.yml                                                               |
| SO-010 | CI/CD              | Deploy workflow requires successful CI prerequisites                            | [x] Pass [ ] Fail |          | .github/workflows/deploy.yml (`workflow_run` on CI success)                            |
| SO-011 | Dependency Risk    | Dependency audit/scanning cadence is defined                                    | [ ] Pass [x] Fail | Medium   | .github/workflows/ci.yml uses `npm audit --audit-level=high                            |     | true`; see SOF-001 |
| SO-012 | Ops Health         | `/health` endpoint is available and documented                                  | [x] Pass [ ] Fail |          | server/src/routes/health.ts, docs/deployment/DEPLOYMENT.md                             |
| SO-013 | Ops Health         | `/health/smtp` endpoint is available and documented                             | [x] Pass [ ] Fail |          | server/src/routes/health.ts, docs/deployment/DEPLOYMENT.md                             |
| SO-014 | Incident Readiness | Backup and restore guidance exists for production database                      | [x] Pass [ ] Fail |          | docs/deployment/PRODUCTION_READINESS_CHECKLIST.md                                      |
| SO-015 | Incident Readiness | Rollback procedure for failed deployment is documented                          | [x] Pass [ ] Fail |          | docs/deployment/ROLLBACK_RUNBOOK.md, docs/deployment/PRODUCTION_READINESS_CHECKLIST.md |

## Evidence Sources

- server source: `server/src/server.ts`, `server/src/middleware/security.ts`, `server/src/routes/health.ts`
- environment docs: `server/.env.example`, `client/.env.example`, `docs/CONFIGURATION.md`
- deployment docs: `docs/deployment/DEPLOYMENT.md`, `docs/deployment/PRODUCTION_READINESS_CHECKLIST.md`
- workflows: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

## Exit Criteria

Phase 3 checklist is complete when:

1. All controls are marked pass/fail with evidence.
2. Every failed control has severity and a linked finding ID.
3. Critical and High findings have a dated remediation plan.
4. Baseline report rerun confirms post-remediation status.

# Security and Operations Findings Register

Track all Phase 3 findings with ownership, severity, and closure evidence.

## Workflow

1. Create one row per finding.
2. Keep IDs stable (`SOF-001`, `SOF-002`, ...).
3. Link each finding to checklist control IDs (`SO-###`).
4. Do not close findings without validation evidence.

## Findings Table

| ID      | Control ID | Title                                                         | Severity | Impact                                               | Owner          | Target Date | Status    | Evidence                                                                                                                | Notes                               |
| ------- | ---------- | ------------------------------------------------------------- | -------- | ---------------------------------------------------- | -------------- | ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------- | ------------------- | --- | ----------------------------------------------------------- |
| SOF-001 | SO-011     | Dependency audit is non-blocking in CI                        | Medium   | High-severity dependency issues may not block merges | Justin Manning | 2026-03-30  | Open      | .github/workflows/ci.yml includes `npm audit --audit-level=high                                                         |                                     | true`; npm run audit:security:check shows dependency audit refs present | Next step: remove ` |     | true` after one stable week and document exception handling |
| SOF-002 | SO-015     | Rollback procedure not fully documented as executable runbook | Medium   | Slower recovery during failed production deploys     | Justin Manning | 2026-03-23  | Validated | docs/deployment/ROLLBACK_RUNBOOK.md published; docs/deployment/PRODUCTION_READINESS_CHECKLIST.md links rollback runbook | Closed in Phase 5 operating cadence |

## Status Definitions

- Open: Identified, not yet remediated
- In Progress: Remediation underway
- Blocked: Awaiting prerequisite decision or change
- Resolved: Code/docs change merged
- Validated: Verified with explicit evidence after merge

## Minimum Evidence Standard

A finding can be marked `Validated` only when all are true:

1. Code or doc change link is recorded.
2. Verification command or test result is recorded.
3. A post-change baseline check has been run.

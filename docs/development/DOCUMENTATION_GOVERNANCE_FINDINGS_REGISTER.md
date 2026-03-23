# Documentation Governance Findings Register

Track all Phase 4 findings with ownership, severity, and validation evidence.

## Workflow

1. Add one row per finding (`DGF-001`, `DGF-002`, ...).
2. Link each row to control IDs from the checklist (`DG-###`).
3. Keep status current as remediation progresses.
4. Mark findings as validated only with explicit evidence.

## Findings Table

| ID      | Control ID | Title                                                       | Severity | Impact                                                    | Owner          | Target Date | Status    | Evidence                                                                                                                                                                                                  | Notes                                                                |
| ------- | ---------- | ----------------------------------------------------------- | -------- | --------------------------------------------------------- | -------------- | ----------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| DGF-001 | DG-003     | Local markdown links unresolved                             | High     | Broken navigation in docs and reduced operational trust   | Justin Manning | 2026-03-23  | Validated | npm run audit:docs:check shows Unresolved local markdown links: 0; fixes in docs/admin/TESTING_COMPLETION_SUMMARY.md, docs/deployment/PRODUCTION_READINESS_CHECKLIST.md, docs/archive/PRODUCTION_READY.md | Closed in remediation pass 1                                         |
| DGF-002 | DG-005     | Active docs referenced env-specific legacy Render hostnames | Medium   | Stale operational references in active runbooks           | Justin Manning | 2026-03-23  | Validated | npm run audit:docs:check shows Legacy Render domain refs (active docs): 0; updates in docs/deployment/RENDER_DEPLOYMENT_URLS.md                                                                           | Normalized to generic fallback placeholders                          |
| DGF-003 | DG-011     | Placeholder tokens remain across active docs                | Medium   | Ambiguity in execution guidance and governance drift risk | Justin Manning | 2026-03-30  | Open      | npm run audit:docs:check shows Placeholder refs: 53                                                                                                                                                       | Next remediation pass should triage by active operational docs first |

## Status Definitions

- Open: identified, not yet remediated
- In Progress: remediation work underway
- Blocked: waiting on prerequisite decision or dependency
- Resolved: remediating change merged
- Validated: post-change evidence confirms closure

## Minimum Evidence Standard

A finding can be marked `Validated` only when all are true:

1. Changed file links are recorded.
2. Verification commands or checks are recorded.
3. Post-fix baseline run is linked.

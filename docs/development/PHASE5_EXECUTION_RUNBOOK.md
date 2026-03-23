# Phase 5 Execution Runbook

Run this workflow weekly to keep documentation, security, and operational quality within target KPIs.

## Weekly Sequence

1. `npm run audit:baseline:check`
2. `npm run audit:security:check`
3. `npm run audit:docs:check`
4. `npm run audit:kpi`

## Interpretation Rules

- If docs legacy refs, unresolved links, or placeholder markers are non-zero:
  - Open/update findings in documentation governance register.
  - Assign owner and target date before ending the week.
- If open findings exceed 2:
  - Prioritize closure in next sprint planning.
- If dependency-audit references remain 0:
  - Add/repair dependency scanning signal in workflows.

## Reporting Artifacts

- KPI snapshot reports: `docs/development/reports/YYYY-MM-DD-phase5-kpi-snapshot.md`
- KPI tracker: `docs/development/PHASE5_KPI_TRACKER.md`
- Findings registers:
  - `docs/development/SECURITY_OPERATIONS_FINDINGS_REGISTER.md`
  - `docs/development/DOCUMENTATION_GOVERNANCE_FINDINGS_REGISTER.md`

## Exit Criteria for Stable Maintenance Mode

1. Four consecutive weekly runs with docs quality gate pass.
2. Open findings <= 2 for four consecutive weekly runs.
3. Dependency-audit signal gate pass in two consecutive weekly runs.

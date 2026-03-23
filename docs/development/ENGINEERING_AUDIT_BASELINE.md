# Engineering Audit Baseline

This document operationalizes the strategic audit plan with repeatable baseline checks and clear completion criteria.

## Purpose

Use this baseline to measure structural and documentation health before and during remediation work.

## How to Run

```bash
# Print current baseline summary to terminal
npm run audit:baseline:check

# Print and write report file to docs/development/reports/
npm run audit:baseline
```

## Output

When run with `--write`, a dated report is generated at:

- `docs/development/reports/YYYY-MM-DD-engineering-audit-baseline.md`

## Baseline Dimensions

1. Repository structure inventory
2. TypeScript strictness signals
3. CI/CD workflow presence
4. Documentation domain consistency
5. Audit execution cadence

## Phase 1 Completion Criteria

- Baseline report generated and reviewed
- Priority findings recorded with owners
- Scope for Phase 2 structure audit agreed

## Phase 2+ Execution Order

1. Architecture and repository structure audit
2. Engineering quality audit (types, tests, dependencies)
3. Security and operational audit
4. Documentation governance audit
5. Implementation sequencing and KPI tracking

## Phase 2 Artifacts

- [Structure Audit Scorecard](./STRUCTURE_AUDIT_SCORECARD.md)
- [Audit Ownership Matrix Template](./AUDIT_OWNERSHIP_MATRIX_TEMPLATE.md)

## Recommended Cadence

- During active cleanup: run baseline weekly
- During maintenance mode: run baseline monthly

## Notes

- This baseline is intentionally lightweight and non-destructive.
- Use this report with targeted deep-dive audits, not as a replacement for them.

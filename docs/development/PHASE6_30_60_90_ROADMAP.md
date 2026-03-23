# Phase 6 Roadmap (30/60/90)

This roadmap converts completed audit phases into an execution sequence with measurable gates tied directly to the Phase 5 KPI tracker.

## Purpose

- Sustain gains from Phases 1-5
- Prevent regression in docs, security, and CI controls
- Move from remediation mode to stable maintenance mode

## KPI Source of Truth

Primary tracker:

- `docs/development/PHASE5_KPI_TRACKER.md`

Weekly execution runbook:

- `docs/development/PHASE5_EXECUTION_RUNBOOK.md`

## Milestone Plan

| Horizon   | Focus                            | Deliverables                                                                                       | Owner          | Success Signal                                                   |
| --------- | -------------------------------- | -------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| Day 0-30  | Stabilize operational rhythm     | Weekly cadence executed, KPI tracker updated every run, findings kept actionable                   | Justin Manning | All KPI gates pass each week                                     |
| Day 31-60 | Harden controls and reduce drift | Dependency audit policy refined, rollback runbook exercised, docs governance spot-checks completed | Justin Manning | Zero open must-fix findings; no regression in docs quality gates |
| Day 61-90 | Institutionalize governance      | Maintenance-mode criteria reached and documented, recurring review checklist established           | Justin Manning | Stable maintenance mode achieved with evidence history           |

## 30-Day Milestones

### Checklist

1. Run weekly sequence from runbook at least 4 consecutive times.
2. Record weekly entries in KPI tracker.
3. Keep values at or better than:

- Docs active legacy refs: 0
- Docs unresolved links: 0
- Docs placeholder markers: 0
- Open findings: <= 2

4. Ensure dependency-audit signal gate remains pass.

### Gate Criteria (Must Pass)

| Gate  | Criteria                        | Evidence                                            |
| ----- | ------------------------------- | --------------------------------------------------- |
| G30-1 | 4 weekly KPI rows captured      | `PHASE5_KPI_TRACKER.md` weekly log                  |
| G30-2 | No docs quality regression      | KPI report snapshots in `docs/development/reports/` |
| G30-3 | Open findings remain controlled | Security + docs findings registers                  |

## 60-Day Milestones

### Checklist

1. Review CI dependency-audit output trend and triage informational dev-tree issues.
2. Exercise rollback runbook with a tabletop drill and capture notes.
3. Re-validate security checklist controls and findings closure evidence.
4. Update KPI tracker action queue with any policy changes.

### Gate Criteria (Must Pass)

| Gate  | Criteria                                                  | Evidence                                          |
| ----- | --------------------------------------------------------- | ------------------------------------------------- |
| G60-1 | Rollback runbook reviewed and exercised                   | `docs/deployment/ROLLBACK_RUNBOOK.md` update note |
| G60-2 | Security checklist still signed with no must-fix blockers | `SECURITY_OPERATIONS_AUDIT_CHECKLIST.md`          |
| G60-3 | Dependency-audit gate remains pass for weekly runs        | KPI snapshots and CI history                      |

## 90-Day Milestones

### Checklist

1. Confirm stable maintenance criteria from runbook are fully met.
2. Publish a short phase-completion note in development docs.
3. Transition audit cadence ownership to ongoing monthly governance mode.

### Gate Criteria (Must Pass)

| Gate  | Criteria                              | Evidence                                             |
| ----- | ------------------------------------- | ---------------------------------------------------- |
| G90-1 | Stable maintenance criteria satisfied | `PHASE5_EXECUTION_RUNBOOK.md` criteria + KPI history |
| G90-2 | Consecutive pass trend demonstrated   | Weekly log in `PHASE5_KPI_TRACKER.md`                |
| G90-3 | No open critical/high audit findings  | Security/docs findings registers                     |

## Risk and Escalation Rules

| Trigger                     | Severity | Action                                                           |
| --------------------------- | -------- | ---------------------------------------------------------------- |
| Any docs quality KPI > 0    | High     | Open finding same day and remediate in current week              |
| Dependency-audit gate fails | Medium   | Create triage item and assign target date within 2 business days |
| Open findings > 2           | Medium   | Prioritize closure in next sprint planning                       |

## Reporting Template

Use this at each milestone checkpoint:

- Checkpoint date:
- Gates passed/failed:
- KPI trend summary:
- Open findings summary:
- Decision: continue / remediate / escalate

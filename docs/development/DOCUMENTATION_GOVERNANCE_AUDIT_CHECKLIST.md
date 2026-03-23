# Documentation Governance Audit Checklist

Use this checklist to execute Phase 4 with evidence-first validation of documentation quality, lifecycle hygiene, and operational clarity.

## Scope

- Documentation taxonomy and discoverability
- Link integrity and reference quality
- Active versus archive lifecycle boundaries
- Configuration and deployment documentation correctness
- Placeholder, stale-content, and ownership hygiene

## How To Use

1. Work through each control in order.
2. Mark each control pass/fail.
3. Add evidence links for each control.
4. Record failed controls in the findings register.

## Severity Rubric

| Severity | Meaning                                        | Required Action                                          |
| -------- | ---------------------------------------------- | -------------------------------------------------------- |
| Critical | High chance of operational error in production | Fix immediately; block release tasks that depend on docs |
| High     | Guidance is misleading or materially outdated  | Fix this sprint                                          |
| Medium   | Quality gap with limited blast radius          | Schedule in current/next cycle                           |
| Low      | Improvement opportunity                        | Backlog cleanup                                          |

## Control Checklist

| ID     | Domain            | Control                                                                             | Status            | Severity | Evidence                                                                                    |
| ------ | ----------------- | ----------------------------------------------------------------------------------- | ----------------- | -------- | ------------------------------------------------------------------------------------------- |
| DG-001 | Taxonomy          | docs index clearly maps active sections and archive guidance                        | [x] Pass [ ] Fail |          | docs/README.md, docs/deployment/README.md                                                   |
| DG-002 | Taxonomy          | operational docs are separated from historical/archive docs                         | [x] Pass [ ] Fail |          | docs/README.md, docs/archive/                                                               |
| DG-003 | Link Integrity    | local markdown links resolve correctly                                              | [x] Pass [ ] Fail |          | npm run audit:docs:check => Unresolved local markdown links: 0                              |
| DG-004 | Link Integrity    | cross-doc links point to current canonical files                                    | [x] Pass [ ] Fail |          | docs/admin/TESTING_COMPLETION_SUMMARY.md, docs/deployment/PRODUCTION_READINESS_CHECKLIST.md |
| DG-005 | Deployment Docs   | custom production domains are the default references                                | [x] Pass [ ] Fail |          | docs/deployment/DEPLOYMENT.md, docs/deployment/RENDER_DEPLOYMENT_URLS.md                    |
| DG-006 | Deployment Docs   | legacy Render URLs are labeled as fallback/historical where present                 | [x] Pass [ ] Fail |          | docs/deployment/RENDER_DEPLOYMENT_URLS.md note + archive labels                             |
| DG-007 | Config Docs       | environment variable docs match current .env.example templates                      | [x] Pass [ ] Fail |          | docs/CONFIGURATION.md, server/.env.example, client/.env.example                             |
| DG-008 | Config Docs       | production safety guards are explicitly documented (emails/db safety)               | [x] Pass [ ] Fail |          | docs/CONFIGURATION.md, docs/deployment/PRODUCTION_READINESS_CHECKLIST.md                    |
| DG-009 | Lifecycle Hygiene | archived docs are clearly labeled archived/superseded                               | [x] Pass [ ] Fail |          | docs/archive/PRODUCTION_READY.md and archive status notes                                   |
| DG-010 | Lifecycle Hygiene | superseded docs point to current replacement docs                                   | [x] Pass [ ] Fail |          | docs/archive/PRODUCTION_READY.md => ../admin/ADMIN_PRODUCTION_TESTING.md                    |
| DG-011 | Quality           | placeholders (TODO/FIXME/TBD/template tokens) are tracked or removed in active docs | [ ] Pass [x] Fail | Medium   | npm run audit:docs:check => Placeholder refs: 53                                            |
| DG-012 | Governance        | each finding has owner, severity, and target date in the register                   | [x] Pass [ ] Fail |          | docs/development/DOCUMENTATION_GOVERNANCE_FINDINGS_REGISTER.md                              |

## Evidence Sources

- docs indexes: docs/README.md, docs/deployment/README.md
- config docs: docs/CONFIGURATION.md, server/.env.example, client/.env.example
- deployment docs: docs/deployment/DEPLOYMENT.md, docs/deployment/PRODUCTION_READINESS_CHECKLIST.md
- archive docs: docs/archive/\*.md
- generated baseline: docs/development/reports/\*-documentation-governance-audit-baseline.md

## Exit Criteria

Phase 4 checklist is complete when:

1. All controls are marked pass/fail with evidence.
2. Every failed control is logged in the findings register.
3. Critical and High findings have approved remediation sequence.
4. Baseline is re-run after changes and attached to findings closure.

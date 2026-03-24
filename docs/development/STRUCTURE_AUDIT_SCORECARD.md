# Structure Audit Scorecard

Use this scorecard to evaluate project structure quality with repeatable scoring and evidence-based findings.

## Scope

- Repository topology and folder taxonomy
- Boundary clarity across client, server, scripts, docs
- Naming conventions and discoverability
- Dead/duplicate/stale artifacts
- Documentation structure alignment with code reality

## How To Use

1. Assess each category from 1 to 5.
2. Add concrete evidence links for each score.
3. Record weighted totals.
4. Create remediation actions for any category below 4.

## Scoring Rubric

| Score | Meaning   | Definition                                                    |
| ----- | --------- | ------------------------------------------------------------- |
| 1     | Critical  | Structure is inconsistent or high-risk; major rework required |
| 2     | Weak      | Significant issues; frequent confusion or maintenance cost    |
| 3     | Adequate  | Generally workable; notable gaps remain                       |
| 4     | Strong    | Minor improvements needed; structure is reliable              |
| 5     | Excellent | Clear, consistent, scalable, and well-governed                |

## Category Weights

| Category                       | Weight |
| ------------------------------ | ------ |
| Repository Topology            | 15%    |
| Domain Boundaries              | 20%    |
| Naming and Discoverability     | 15%    |
| Build/Test/Script Organization | 15%    |
| Documentation Taxonomy         | 20%    |
| Archive and Lifecycle Hygiene  | 15%    |

## Scorecard

| Category                       |   Weight | Score (1-5) | Weighted Score | Evidence | Findings |
| ------------------------------ | -------: | ----------: | -------------: | -------- | -------- |
| Repository Topology            |      15% |             |                |          |          |
| Domain Boundaries              |      20% |             |                |          |          |
| Naming and Discoverability     |      15% |             |                |          |          |
| Build/Test/Script Organization |      15% |             |                |          |          |
| Documentation Taxonomy         |      20% |             |                |          |          |
| Archive and Lifecycle Hygiene  |      15% |             |                |          |          |
| **Total**                      | **100%** |             |                |          |          |

## Weighted Score Formula

- Per row: Weighted Score = Score \* Weight
- Overall: Sum of all weighted scores
- Optional normalization: divide by 5 to report as a percentage

Example:

- If total weighted score is 4.1 out of 5, percentage is 82%

## Maturity Bands

| Range (Out of 5) | Band     | Interpretation                             |
| ---------------: | -------- | ------------------------------------------ |
|        4.5 - 5.0 | Elite    | Ready for scale; maintain via governance   |
|       4.0 - 4.49 | Strong   | Healthy structure with low risk            |
|       3.5 - 3.99 | Stable   | Functional but needs targeted improvements |
|       3.0 - 3.49 | At Risk  | Technical debt likely to compound          |
|            < 3.0 | Critical | Immediate remediation required             |

## Evidence Checklist

### 1. Repository Topology

- [ ] Root folders have clear purpose and low overlap
- [ ] No orphaned top-level files without rationale
- [ ] Monorepo boundaries are explicit

### 2. Domain Boundaries

- [ ] Client-only code stays under client
- [ ] Server-only code stays under server
- [ ] Shared concepts are documented (not duplicated ad hoc)

### 3. Naming and Discoverability

- [ ] Consistent file naming conventions
- [ ] Predictable location for feature docs and scripts
- [ ] Low ambiguity in folder intent

### 4. Build/Test/Script Organization

- [ ] Scripts are grouped and named consistently
- [ ] CI workflows align with local commands
- [ ] No obsolete scripts in active paths

### 5. Documentation Taxonomy

- [ ] Docs index reflects current file tree
- [ ] Operational docs are separate from historical notes
- [ ] Cross-links are valid and maintained

### 6. Archive and Lifecycle Hygiene

- [ ] Historical docs are clearly labeled as archived
- [ ] Superseded docs reference replacement paths
- [ ] Archive content does not masquerade as runbook guidance

## Findings Register Template

| ID     | Severity | Category | Issue | Impact | Recommendation | Owner | Target Date | Status |
| ------ | -------- | -------- | ----- | ------ | -------------- | ----- | ----------- | ------ |
| SA-001 | High     |          |       |        |                |       |             | Open   |
| SA-002 | Medium   |          |       |        |                |       |             | Open   |

## Phase Exit Criteria

A structure audit is complete when:

1. Scorecard is fully populated with evidence links.
2. All findings have owners and target dates.
3. High-severity findings have approved remediation plans.
4. Documentation index and taxonomy actions are scheduled.

## Recommended Cadence

- Active cleanup period: monthly
- Maintenance period: quarterly
- Mandatory rerun after major restructuring

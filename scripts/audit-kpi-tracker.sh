#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATE_STAMP="$(date +%F)"
REPORT_DIR="$ROOT_DIR/docs/development/reports"
REPORT_FILE="$REPORT_DIR/${DATE_STAMP}-phase5-kpi-snapshot.md"
WRITE_REPORT=false

for arg in "$@"; do
  if [[ "$arg" == "--write" ]]; then
    WRITE_REPORT=true
  fi
done

normalize_number() {
  local value="$1"
  if [[ -z "$value" ]]; then
    echo "0"
  else
    echo "$value" | tr -d ' '
  fi
}

extract_metric() {
  local content="$1"
  local prefix="$2"
  printf '%s\n' "$content" | awk -v p="$prefix" 'index($0, p) == 1 { print substr($0, length(p) + 1); exit }'
}

count_open_findings() {
  local file_path="$1"
  if [[ ! -f "$file_path" ]]; then
    echo "0"
    return
  fi
  (grep -E '\|[[:space:]]*Open[[:space:]]*\|' "$file_path" || true) | wc -l | tr -d ' '
}

BASELINE_OUTPUT="$(bash "$ROOT_DIR/scripts/audit-baseline.sh")"
SECURITY_OUTPUT="$(bash "$ROOT_DIR/scripts/audit-security-ops.sh")"
DOCS_OUTPUT="$(bash "$ROOT_DIR/scripts/audit-docs-governance.sh")"

WORKFLOW_FILES="$(normalize_number "$(extract_metric "$BASELINE_OUTPUT" '- Workflow files: ')")"
SECURITY_DEP_AUDIT_REFS="$(normalize_number "$(extract_metric "$SECURITY_OUTPUT" '- Dependency audit references in workflows: ')")"
DOCS_ACTIVE_LEGACY="$(normalize_number "$(extract_metric "$DOCS_OUTPUT" '- Legacy Render domain refs (active docs): ')")"
DOCS_UNRESOLVED_LINKS="$(normalize_number "$(extract_metric "$DOCS_OUTPUT" '- Unresolved local markdown links (docs/): ')")"
DOCS_PLACEHOLDER_MARKERS="$(normalize_number "$(extract_metric "$DOCS_OUTPUT" '- Placeholder markers (active docs): ')")"

SECURITY_OPEN_FINDINGS="$(count_open_findings "$ROOT_DIR/docs/development/SECURITY_OPERATIONS_FINDINGS_REGISTER.md")"
DOCS_OPEN_FINDINGS="$(count_open_findings "$ROOT_DIR/docs/development/DOCUMENTATION_GOVERNANCE_FINDINGS_REGISTER.md")"
TOTAL_OPEN_FINDINGS=$((SECURITY_OPEN_FINDINGS + DOCS_OPEN_FINDINGS))

DOCS_QUALITY_GATE="pass"
if [[ "$DOCS_ACTIVE_LEGACY" -gt 0 || "$DOCS_UNRESOLVED_LINKS" -gt 0 || "$DOCS_PLACEHOLDER_MARKERS" -gt 0 ]]; then
  DOCS_QUALITY_GATE="fail"
fi

OPEN_FINDINGS_GATE="pass"
if [[ "$TOTAL_OPEN_FINDINGS" -gt 2 ]]; then
  OPEN_FINDINGS_GATE="fail"
fi

DEPENDENCY_AUDIT_GATE="pass"
if [[ "$SECURITY_DEP_AUDIT_REFS" -eq 0 ]]; then
  DEPENDENCY_AUDIT_GATE="fail"
fi

REPORT_CONTENT=$(cat <<EOF
# Phase 5 KPI Snapshot (${DATE_STAMP})

## Scope
- Repository: dj-forever2
- Audit phase: Phase 5 implementation sequencing and KPI tracking

## KPI Dashboard
- Workflow files present: ${WORKFLOW_FILES}
- Security dependency-audit workflow references: ${SECURITY_DEP_AUDIT_REFS}
- Docs active legacy refs: ${DOCS_ACTIVE_LEGACY}
- Docs unresolved local links: ${DOCS_UNRESOLVED_LINKS}
- Docs placeholder markers (active): ${DOCS_PLACEHOLDER_MARKERS}
- Security open findings: ${SECURITY_OPEN_FINDINGS}
- Documentation open findings: ${DOCS_OPEN_FINDINGS}
- Total open findings: ${TOTAL_OPEN_FINDINGS}

## KPI Gates
- Docs quality gate (legacy=0, unresolved=0, placeholders=0): ${DOCS_QUALITY_GATE}
- Open findings gate (<=2): ${OPEN_FINDINGS_GATE}
- Dependency-audit signal gate (>0 workflow refs): ${DEPENDENCY_AUDIT_GATE}

## Weekly Actions
1. Run npm run audit:kpi and attach this snapshot to the tracker.
2. If any gate is fail, open or update a findings row with owner and target date.
3. Re-check after remediation and mark validated only with updated evidence.
EOF
)

echo "$REPORT_CONTENT"

if [[ "$WRITE_REPORT" == "true" ]]; then
  mkdir -p "$REPORT_DIR"
  printf '%s\n' "$REPORT_CONTENT" > "$REPORT_FILE"
  echo
  echo "Wrote Phase 5 KPI report: $REPORT_FILE"
fi

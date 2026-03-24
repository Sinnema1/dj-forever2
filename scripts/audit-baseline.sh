#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATE_STAMP="$(date +%F)"
REPORT_DIR="$ROOT_DIR/docs/development/reports"
REPORT_FILE="$REPORT_DIR/${DATE_STAMP}-engineering-audit-baseline.md"
WRITE_REPORT=false

if [[ "${1:-}" == "--write" ]]; then
  WRITE_REPORT=true
fi

count_files() {
  local dir="$1"
  find "$dir" -type f | wc -l | tr -d ' '
}

count_md_files() {
  local dir="$1"
  find "$dir" -type f -name "*.md" | wc -l | tr -d ' '
}

count_matches() {
  local pattern="$1"
  local path="$2"
  (grep -R -E -o "$pattern" "$path" 2>/dev/null || true) | wc -l | tr -d ' '
}

exists() {
  local path="$1"
  if [[ -e "$path" ]]; then
    echo "yes"
  else
    echo "no"
  fi
}

WORKFLOW_COUNT="$(count_files "$ROOT_DIR/.github/workflows")"
DOC_MD_COUNT="$(count_md_files "$ROOT_DIR/docs")"
CLIENT_TS_FILES="$(find "$ROOT_DIR/client/src" -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l | tr -d ' ')"
SERVER_TS_FILES="$(find "$ROOT_DIR/server/src" -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l | tr -d ' ')"
ONRENDER_MATCHES="$(count_matches 'dj-forever2\.onrender\.com|dj-forever2-backend\.onrender\.com' "$ROOT_DIR/docs")"
CUSTOM_DOMAIN_MATCHES="$(count_matches 'www\.djforever2026\.com|api\.djforever2026\.com' "$ROOT_DIR/docs")"
HAS_CLIENT_STRICT="$(grep -E '"strict"\s*:\s*true' "$ROOT_DIR/client/tsconfig.json" >/dev/null && echo yes || echo no)"
HAS_SERVER_STRICT="$(grep -E '"strict"\s*:\s*true' "$ROOT_DIR/server/tsconfig.json" >/dev/null && echo yes || echo no)"
HAS_CI_WORKFLOW="$(exists "$ROOT_DIR/.github/workflows/ci.yml")"
HAS_DEPLOY_WORKFLOW="$(exists "$ROOT_DIR/.github/workflows/deploy.yml")"

REPORT_CONTENT=$(cat <<EOF
# Engineering Audit Baseline (${DATE_STAMP})

## Scope
- Repository: dj-forever2
- Audit phase: Phase 1 baseline inventory

## Baseline Metrics
- Workflow files: ${WORKFLOW_COUNT}
- Markdown docs under docs/: ${DOC_MD_COUNT}
- Client TS/TSX source files: ${CLIENT_TS_FILES}
- Server TS/TSX source files: ${SERVER_TS_FILES}
- docs/ references to legacy Render domains: ${ONRENDER_MATCHES}
- docs/ references to custom production domains: ${CUSTOM_DOMAIN_MATCHES}

## Quality Gates Snapshot
- client tsconfig strict mode: ${HAS_CLIENT_STRICT}
- server tsconfig strict mode: ${HAS_SERVER_STRICT}
- CI workflow present: ${HAS_CI_WORKFLOW}
- Deploy workflow present: ${HAS_DEPLOY_WORKFLOW}

## Recommended Next Steps
1. Run full lint and tests: npm run lint && npm run test
2. Resolve stale docs domain references where not intentionally fallback/archive
3. Create audit ownership matrix for docs and architecture reviews
4. Track this report weekly during active cleanup
EOF
)

echo "$REPORT_CONTENT"

if [[ "$WRITE_REPORT" == "true" ]]; then
  mkdir -p "$REPORT_DIR"
  printf '%s\n' "$REPORT_CONTENT" > "$REPORT_FILE"
  echo
  echo "Wrote baseline report: $REPORT_FILE"
fi

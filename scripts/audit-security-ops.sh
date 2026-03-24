#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATE_STAMP="$(date +%F)"
REPORT_DIR="$ROOT_DIR/docs/development/reports"
REPORT_FILE="$REPORT_DIR/${DATE_STAMP}-security-operations-audit-baseline.md"
WRITE_REPORT=false

if [[ "${1:-}" == "--write" ]]; then
  WRITE_REPORT=true
fi

count_matches() {
  local pattern="$1"
  local path="$2"
  (grep -R -E -o "$pattern" "$path" 2>/dev/null || true) | wc -l | tr -d ' '
}

has_file() {
  local path="$1"
  if [[ -f "$path" ]]; then
    echo "yes"
  else
    echo "no"
  fi
}

has_dir() {
  local path="$1"
  if [[ -d "$path" ]]; then
    echo "yes"
  else
    echo "no"
  fi
}

truthy_env_var() {
  local var_name="$1"
  local value="${!var_name:-}"
  shopt -s nocasematch
  if [[ "$value" == "true" || "$value" == "1" || "$value" == "yes" ]]; then
    echo "true"
  else
    echo "false"
  fi
  shopt -u nocasematch
}

SECURITY_MIDDLEWARE_FILE="$ROOT_DIR/server/src/middleware/security.ts"
HEALTH_ROUTE_FILE="$ROOT_DIR/server/src/routes/health.ts"
SERVER_ENTRY_FILE="$ROOT_DIR/server/src/server.ts"
SERVER_ENV_TEMPLATE="$ROOT_DIR/server/.env.example"
CLIENT_ENV_TEMPLATE="$ROOT_DIR/client/.env.example"

HAS_SECURITY_MIDDLEWARE="$(has_file "$SECURITY_MIDDLEWARE_FILE")"
HAS_HEALTH_ROUTE="$(has_file "$HEALTH_ROUTE_FILE")"
HAS_SERVER_ENV_TEMPLATE="$(has_file "$SERVER_ENV_TEMPLATE")"
HAS_CLIENT_ENV_TEMPLATE="$(has_file "$CLIENT_ENV_TEMPLATE")"
HAS_WORKFLOWS_DIR="$(has_dir "$ROOT_DIR/.github/workflows")"

HELMET_USAGE="$(grep -E 'helmet' "$SECURITY_MIDDLEWARE_FILE" >/dev/null 2>&1 && echo yes || echo no)"
RATE_LIMIT_USAGE="$(grep -E 'express-rate-limit|createRateLimiter' "$SECURITY_MIDDLEWARE_FILE" "$SERVER_ENTRY_FILE" >/dev/null 2>&1 && echo yes || echo no)"
CORS_CONFIG_USAGE="$(grep -E 'cors\(' "$SERVER_ENTRY_FILE" >/dev/null 2>&1 && echo yes || echo no)"
HEALTH_ENDPOINT_USAGE="$(grep -E '/health|healthRouter' "$SERVER_ENTRY_FILE" "$HEALTH_ROUTE_FILE" >/dev/null 2>&1 && echo yes || echo no)"

ENV_HAS_JWT_SECRET="$(grep -E '^JWT_SECRET=' "$SERVER_ENV_TEMPLATE" >/dev/null 2>&1 && echo yes || echo no)"
ENV_HAS_DB_NAME="$(grep -E '^MONGODB_DB_NAME=' "$SERVER_ENV_TEMPLATE" >/dev/null 2>&1 && echo yes || echo no)"
ENV_HAS_EMAIL_GUARD="$(grep -E '^ENABLE_PRODUCTION_EMAILS=' "$SERVER_ENV_TEMPLATE" >/dev/null 2>&1 && echo yes || echo no)"
ENV_HAS_FRONTEND_URL="$(grep -E '^FRONTEND_URL=|^CONFIG__FRONTEND_URL=' "$SERVER_ENV_TEMPLATE" >/dev/null 2>&1 && echo yes || echo no)"

CI_HAS_CI_WORKFLOW="$(has_file "$ROOT_DIR/.github/workflows/ci.yml")"
CI_HAS_DEPLOY_WORKFLOW="$(has_file "$ROOT_DIR/.github/workflows/deploy.yml")"
CI_HAS_DEP_AUDIT="$(count_matches 'npm audit|audit --audit-level|pnpm audit|yarn audit' "$ROOT_DIR/.github/workflows")"

DOC_HAS_BACKUP_GUIDANCE="$(count_matches 'backup|snapshot|mongodump|mongorestore' "$ROOT_DIR/docs/deployment")"
DOC_HAS_HEALTH_GUIDANCE="$(count_matches '/health|health check|health endpoint' "$ROOT_DIR/docs/deployment")"
DOC_HAS_SECURITY_GUIDANCE="$(count_matches 'JWT_SECRET|ENABLE_PRODUCTION_EMAILS|security|secrets' "$ROOT_DIR/docs")"

PROD_EMAILS_ENABLED_NOW="$(truthy_env_var ENABLE_PRODUCTION_EMAILS)"
ACTIVE_DB_NAME="${MONGODB_DB_NAME:-[not set in shell]}"

RISK_NOTES=""
if [[ "$PROD_EMAILS_ENABLED_NOW" == "true" ]]; then
  RISK_NOTES+="- ENABLE_PRODUCTION_EMAILS is truthy in current shell; verify this is intentional.\n"
fi
if [[ "$ACTIVE_DB_NAME" == "djforever2" ]]; then
  RISK_NOTES+="- MONGODB_DB_NAME is set to production database in current shell; avoid destructive operations locally.\n"
fi
if [[ -z "$RISK_NOTES" ]]; then
  RISK_NOTES="- No immediate shell-level production safety flags detected."
fi

REPORT_CONTENT=$(cat <<EOF
# Security and Operations Audit Baseline (${DATE_STAMP})

## Scope
- Repository: dj-forever2
- Audit phase: Phase 3 security and operational baseline

## Control Presence Snapshot
- Security middleware file present: ${HAS_SECURITY_MIDDLEWARE}
- Health route file present: ${HAS_HEALTH_ROUTE}
- Helmet usage detected: ${HELMET_USAGE}
- Rate limiter usage detected: ${RATE_LIMIT_USAGE}
- CORS configuration detected: ${CORS_CONFIG_USAGE}
- Health endpoint wiring detected: ${HEALTH_ENDPOINT_USAGE}

## Environment Safety Signals
- Server env template present: ${HAS_SERVER_ENV_TEMPLATE}
- Client env template present: ${HAS_CLIENT_ENV_TEMPLATE}
- JWT_SECRET documented in server template: ${ENV_HAS_JWT_SECRET}
- MONGODB_DB_NAME documented in server template: ${ENV_HAS_DB_NAME}
- ENABLE_PRODUCTION_EMAILS documented in server template: ${ENV_HAS_EMAIL_GUARD}
- Frontend URL documented in server template: ${ENV_HAS_FRONTEND_URL}
- Current shell MONGODB_DB_NAME: ${ACTIVE_DB_NAME}
- Current shell ENABLE_PRODUCTION_EMAILS truthy: ${PROD_EMAILS_ENABLED_NOW}

## CI and Delivery Signals
- Workflows directory present: ${HAS_WORKFLOWS_DIR}
- CI workflow present: ${CI_HAS_CI_WORKFLOW}
- Deploy workflow present: ${CI_HAS_DEPLOY_WORKFLOW}
- Dependency audit references in workflows: ${CI_HAS_DEP_AUDIT}

## Documentation Coverage Signals
- Deployment backup guidance references: ${DOC_HAS_BACKUP_GUIDANCE}
- Deployment health guidance references: ${DOC_HAS_HEALTH_GUIDANCE}
- Security guidance references across docs: ${DOC_HAS_SECURITY_GUIDANCE}

## Immediate Risk Notes
${RISK_NOTES}

## Recommended Next Steps
1. Complete the Security and Operations Audit Checklist in docs/development/SECURITY_OPERATIONS_AUDIT_CHECKLIST.md.
2. Record findings in docs/development/SECURITY_OPERATIONS_FINDINGS_REGISTER.md with owner, severity, and target date.
3. Run npm run test and npm run lint before closing high-severity findings.
4. Re-run this baseline after changes: npm run audit:security:check.
EOF
)

echo "$REPORT_CONTENT"

if [[ "$WRITE_REPORT" == "true" ]]; then
  mkdir -p "$REPORT_DIR"
  printf '%s\n' "$REPORT_CONTENT" > "$REPORT_FILE"
  echo
  echo "Wrote security/ops baseline report: $REPORT_FILE"
fi

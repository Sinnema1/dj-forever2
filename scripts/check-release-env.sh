#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# check-release-env.sh — Pre-deploy gate that verifies required
# environment variables are set.
#
# Run manually before deploy, or wire into your deploy pipeline.
# Reads the target service from the first argument:
#
#   ./scripts/check-release-env.sh client   # check client vars
#   ./scripts/check-release-env.sh server   # check server vars
#   ./scripts/check-release-env.sh          # check both
#
# Exit 0  = all required vars present
# Exit 1  = missing vars (blocks deploy)
# ──────────────────────────────────────────────────────────────
set -euo pipefail

TARGET="${1:-all}"
MISSING=0

check_var() {
  local var_name="$1"
  local label="$2"
  local value="${!var_name:-}"

  if [[ -z "$value" ]]; then
    echo "   ❌ $var_name  ($label)"
    MISSING=1
  else
    echo "   ✅ $var_name"
  fi
}

check_var_warn() {
  local var_name="$1"
  local label="$2"
  local value="${!var_name:-}"

  if [[ -z "$value" ]]; then
    echo "   ⚠️  $var_name  ($label) — recommended"
  else
    echo "   ✅ $var_name"
  fi
}

# ── Client vars ──────────────────────────────────────────────
check_client() {
  echo ""
  echo "🖥  Client environment"
  echo ""
  check_var  VITE_GRAPHQL_ENDPOINT        "GraphQL API URL"
  check_var  VITE_WEDDING_CONTACT_EMAIL   "Guest contact email"
  echo ""
  check_var_warn  VITE_CRATE_BARREL_REGISTRY_URL     "Crate & Barrel registry"
  check_var_warn  VITE_WILLIAMS_SONOMA_REGISTRY_URL   "Williams-Sonoma registry"
  check_var_warn  VITE_COSTCO_REGISTRY_URL            "Costco registry"
  check_var_warn  VITE_HONEYMOON_FUND_URL             "Honeymoon fund"
  check_var_warn  VITE_GA4_MEASUREMENT_ID             "Google Analytics"
  echo ""
}

# ── Server vars ──────────────────────────────────────────────
check_server() {
  echo ""
  echo "🗄  Server environment"
  echo ""
  check_var  MONGODB_URI       "MongoDB connection string"
  check_var  MONGODB_DB_NAME   "Database name"
  check_var  JWT_SECRET        "JWT signing secret"
  check_var  FRONTEND_URL      "Frontend origin for CORS / redirects"
  echo ""
  check_var_warn  SMTP_HOST    "Email SMTP host"
  check_var_warn  SMTP_USER    "Email SMTP user"
  check_var_warn  SMTP_PASS    "Email SMTP password"
  echo ""
}

echo "🔒 Checking release environment variables..."

case "$TARGET" in
  client) check_client ;;
  server) check_server ;;
  all|*)  check_client; check_server ;;
esac

if [[ $MISSING -eq 1 ]]; then
  echo "──────────────────────────────────────────────────────"
  echo "🚫 Missing required environment variables."
  echo "   Set them in your deployment platform before releasing."
  echo "   See docs/CONFIGURATION.md for the full reference."
  echo "──────────────────────────────────────────────────────"
  exit 1
else
  echo "✅ All required environment variables are set."
  exit 0
fi

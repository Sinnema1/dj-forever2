#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# check-placeholders.sh — CI gate that fails when placeholder
# values leak into guest-facing runtime code.
#
# Scans client/src/** and server/src/** (excluding seeds, tests,
# docs, and other allowlisted paths) for known placeholder
# patterns that must never reach production.
#
# Exit 0  = clean
# Exit 1  = placeholders found (blocks merge)
# ──────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── Patterns to flag ─────────────────────────────────────────
PATTERNS=(
  '@example\.com'
  'myregistry\.com'
  'wedding@example'
)

# ── Paths to scan ────────────────────────────────────────────
SCAN_DIRS=(
  "client/src"
  "server/src"
)

# ── Paths & files to allow (extended grep -v filters) ────────
# These are legitimate uses: seed data, test fixtures, docs,
# admin-only form placeholders, and config examples.
EXCLUDE_PATTERNS=(
  '/seeds/'
  '\.test\.'
  '__tests__'
  '\.md$'
  '\.example$'
  '/docs/'
  '/scripts/'
  'BulkPersonalization'
  'GuestPersonalizationModal'
  'convertGuestList'
)

# Lines that are purely comments/JSDoc (matched against the content after filename:line:)
COMMENT_PATTERNS=(
  ': \* '
  ': \*$'
  ':.*// .*@example'
  ':.*\/\/ .*@example'
)

# Build a single grep -v chain from the exclusion list
build_exclude_filter() {
  local filter="cat"
  for pat in "${EXCLUDE_PATTERNS[@]}"; do
    filter="$filter | grep -v '$pat'"
  done
  for pat in "${COMMENT_PATTERNS[@]}"; do
    filter="$filter | grep -v '$pat'"
  done
  echo "$filter"
}

FOUND=0
EXCLUDE_FILTER=$(build_exclude_filter)

echo "🔍 Scanning for placeholder values in runtime code..."
echo ""

for dir in "${SCAN_DIRS[@]}"; do
  full_path="$REPO_ROOT/$dir"
  if [[ ! -d "$full_path" ]]; then
    continue
  fi

  for pattern in "${PATTERNS[@]}"; do
    # Find matches, apply exclusion filter, collect results
    MATCHES=$(grep -rn --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.json' \
      "$pattern" "$full_path" 2>/dev/null | eval "$EXCLUDE_FILTER" || true)

    if [[ -n "$MATCHES" ]]; then
      echo "❌ Found '$pattern' in $dir:"
      echo "$MATCHES" | while IFS= read -r line; do
        echo "   $line"
      done
      echo ""
      FOUND=1
    fi
  done
done

if [[ $FOUND -eq 1 ]]; then
  echo "──────────────────────────────────────────────────────"
  echo "🚫 Placeholder values detected in runtime code."
  echo ""
  echo "   These patterns should only appear in:"
  echo "   • server/src/seeds/**  (seed/template data)"
  echo "   • **/*.test.*          (test files)"
  echo "   • **/*.md              (documentation)"
  echo "   • Admin-only components (BulkPersonalization, etc.)"
  echo ""
  echo "   Fix: Move values to environment variables via"
  echo "   client/src/config/publicLinks.ts or remove them."
  echo "──────────────────────────────────────────────────────"
  exit 1
else
  echo "✅ No placeholder values found in runtime code."
  exit 0
fi

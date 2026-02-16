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
# Each entry is an extended regex matched against file content.
PATTERNS=(
  '@example\.com'
  'myregistry\.com'
  'your.jwt.secret'
  'your-email@'
  'your-app-password'
  'replace.with.actual'
)

# ── Paths to scan ────────────────────────────────────────────
SCAN_DIRS=(
  "client/src"
  "server/src"
)

# ── Allowlisted path fragments ──────────────────────────────
# Matches are removed if the file path contains any of these.
# Kept deliberately short — add entries only when a false
# positive is confirmed.
PATH_ALLOWLIST='/(seeds|scripts)/|\.test\.|__tests__|\.md$|\.example$|/docs/|BulkPersonalization|GuestPersonalizationModal|convertGuestList'

# ── Comment-line filter ──────────────────────────────────────
# Lines that are clearly JSDoc or inline comments. Matched
# against the grep output line (filepath:linenum: content).
COMMENT_ALLOWLIST=':[0-9]+: *(\*|//|#) '

FOUND=0

echo "🔍 Scanning for placeholder values in runtime code..."
echo ""

for dir in "${SCAN_DIRS[@]}"; do
  full_path="$REPO_ROOT/$dir"
  [[ -d "$full_path" ]] || continue

  for pattern in "${PATTERNS[@]}"; do
    MATCHES=$(
      grep -rn -E --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
        "$pattern" "$full_path" 2>/dev/null \
      | grep -v -E "$PATH_ALLOWLIST" \
      | grep -v -E "$COMMENT_ALLOWLIST" \
      || true
    )

    if [[ -n "$MATCHES" ]]; then
      echo "❌ Found '$pattern' in $dir:"
      echo "$MATCHES" | sed 's/^/   /'
      echo ""
      FOUND=1
    fi
  done
done

if [[ $FOUND -eq 1 ]]; then
  cat <<'EOF'
──────────────────────────────────────────────────────
🚫 Placeholder values detected in runtime code.

   Allowed locations:
   • server/src/seeds/**       (seed/template data)
   • server/src/scripts/**     (dev utility scripts)
   • **/*.test.*               (test files)
   • **/*.md                   (documentation)
   • Admin components          (form placeholder attrs)

   Fix: Move values to environment variables via
   client/src/config/publicLinks.ts or remove them.
──────────────────────────────────────────────────────
EOF
  exit 1
else
  echo "✅ No placeholder values found in runtime code."
  exit 0
fi

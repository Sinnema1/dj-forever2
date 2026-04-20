#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# check-docs-freshness.sh — Warns when changed source files may
# require documentation updates.
#
# Reads the mapping from scripts/docs-freshness-map.json.
#
# Modes:
#   --staged       (default) Check git staged files
#   --diff-base=X  Check git diff X...HEAD
#   --ci           Exit 1 on warnings (for CI gates)
#
# Exit 0  = no doc review needed (or docs already changed)
# Exit 1  = docs may need review (only with --ci)
# ──────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAP_FILE="$REPO_ROOT/scripts/docs-freshness-map.json"
MODE="staged"
CI_MODE="false"

for arg in "$@"; do
  case "$arg" in
    --staged)       MODE="staged" ;;
    --diff-base=*)  MODE="diff-base"; BASE="${arg#--diff-base=}" ;;
    --ci)           CI_MODE="true" ;;
    --help|-h)
      echo "Usage: $0 [--staged] [--diff-base=REF] [--ci]"
      echo ""
      echo "  --staged       Check git staged files (default)"
      echo "  --diff-base=X  Check git diff X...HEAD"
      echo "  --ci           Exit 1 on warnings (for CI gates)"
      exit 0
      ;;
  esac
done

if [[ ! -f "$MAP_FILE" ]]; then
  echo "Warning: $MAP_FILE not found, skipping docs freshness check."
  exit 0
fi

# ── Get the list of changed files ────────────────────────────
if [[ "$MODE" == "staged" ]]; then
  CHANGED_FILES=$(git -C "$REPO_ROOT" diff --cached --name-only 2>/dev/null || true)
else
  CHANGED_FILES=$(git -C "$REPO_ROOT" diff --name-only "$BASE"...HEAD 2>/dev/null || true)
fi

if [[ -z "$CHANGED_FILES" ]]; then
  exit 0
fi

# ── Check mapping and emit warnings ─────────────────────────
# Uses python3 (already a dependency — used in .claude/settings.json PostToolUse hook)
# Pass changed files via env var to avoid stdin conflict with heredoc
export CHANGED_FILES
python3 - "$MAP_FILE" "$CI_MODE" <<'PYEOF'
import sys, json, fnmatch, os

map_file = sys.argv[1]
ci_mode = sys.argv[2] == "true"
changed_files = [line.strip() for line in os.environ.get("CHANGED_FILES", "").splitlines() if line.strip()]

with open(map_file) as f:
    config = json.load(f)

# For each mapping, find source matches and check if target docs are also changed
warnings = {}  # doc -> { reason, sources[] }

for mapping in config["mappings"]:
    matched_sources = []
    for changed in changed_files:
        for pattern in mapping["sources"]:
            if fnmatch.fnmatch(changed, pattern):
                matched_sources.append(changed)
                break
    if not matched_sources:
        continue

    # Check which target docs are NOT in the changed files
    for doc in mapping["docs"]:
        if doc not in changed_files:
            if doc not in warnings:
                warnings[doc] = {"reason": mapping["reason"], "sources": []}
            warnings[doc]["sources"].extend(matched_sources)

# Deduplicate sources per doc
for doc in warnings:
    warnings[doc]["sources"] = sorted(set(warnings[doc]["sources"]))

if not warnings:
    sys.exit(0)

print()
print("──────────────────────────────────────────────────────")
print("\U0001f4cb Documentation freshness check")
print("──────────────────────────────────────────────────────")
print()
print("The following docs MAY need updates based on your changes:")
print()

for doc, info in sorted(warnings.items()):
    print(f"  \U0001f4c4 {doc}")
    print(f"     Reason: {info['reason']}")
    print(f"     Triggered by: {', '.join(info['sources'])}")
    print()

print("If these docs are already current, no action needed.")
print("Otherwise, consider updating them in this commit.")
print("──────────────────────────────────────────────────────")
print()

if ci_mode:
    sys.exit(1)
else:
    sys.exit(0)
PYEOF

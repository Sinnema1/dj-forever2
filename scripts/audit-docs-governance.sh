#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATE_STAMP="$(date +%F)"
REPORT_DIR="$ROOT_DIR/docs/development/reports"
REPORT_FILE="$REPORT_DIR/${DATE_STAMP}-documentation-governance-audit-baseline.md"
WRITE_REPORT=false
LIST_UNRESOLVED=false

for arg in "$@"; do
  if [[ "$arg" == "--write" ]]; then
    WRITE_REPORT=true
  fi
  if [[ "$arg" == "--list-unresolved" ]]; then
    LIST_UNRESOLVED=true
  fi
done

count_md_files() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    echo "0"
    return
  fi
  find "$dir" -type f -name "*.md" | wc -l | tr -d ' '
}

count_matches() {
  local pattern="$1"
  local path="$2"
  if [[ ! -e "$path" ]]; then
    echo "0"
    return
  fi
  (grep -R -E -o "$pattern" "$path" 2>/dev/null || true) | wc -l | tr -d ' '
}

count_matches_in_docs_set() {
  local pattern="$1"
  local include_archive="$2"
  local total=0

  if [[ "$include_archive" == "true" ]]; then
    while IFS= read -r md_file; do
      local file_count
      file_count="$( (grep -E -o "$pattern" "$md_file" 2>/dev/null || true) | wc -l | tr -d ' ' )"
      total=$((total + file_count))
    done < <(find "$ROOT_DIR/docs/archive" -type f -name "*.md")
  else
    while IFS= read -r md_file; do
      local file_count
      file_count="$( (grep -E -o "$pattern" "$md_file" 2>/dev/null || true) | wc -l | tr -d ' ' )"
      total=$((total + file_count))
    done < <(find "$ROOT_DIR/docs" -type f -name "*.md" -not -path "*/archive/*")
  fi

  echo "$total"
}

has_file() {
  local path="$1"
  if [[ -f "$path" ]]; then
    echo "yes"
  else
    echo "no"
  fi
}

# Link checker: count local markdown links that do not resolve to files/directories.
count_unresolved_local_links() {
  local unresolved=0

  while IFS= read -r md_file; do
    while IFS= read -r raw_link; do
      local link
      link="$(printf '%s' "$raw_link" | sed -E 's/^[^]]*\]\(([^)]*)\)$/\1/')"

      # Skip external and non-file links.
      if [[ "$link" =~ ^https?:// ]] || [[ "$link" =~ ^mailto: ]] || [[ "$link" =~ ^# ]]; then
        continue
      fi

      # Remove anchors/query string.
      local link_path="${link%%#*}"
      link_path="${link_path%%\?*}"

      # Skip empty targets after trimming.
      if [[ -z "$link_path" ]]; then
        continue
      fi

      local resolved_path
      if [[ "$link_path" == /* ]]; then
        resolved_path="$ROOT_DIR$link_path"
      else
        resolved_path="$(cd "$(dirname "$md_file")" && pwd)/$link_path"
      fi

      if [[ ! -e "$resolved_path" ]]; then
        unresolved=$((unresolved + 1))
      fi
    done < <(grep -oE '\[[^]]+\]\([^)]*\)' "$md_file" || true)
  done < <(find "$ROOT_DIR/docs" -type f -name "*.md")

  echo "$unresolved"
}

print_unresolved_local_links() {
  while IFS= read -r md_file; do
    while IFS= read -r raw_link; do
      local link
      link="$(printf '%s' "$raw_link" | sed -E 's/^[^]]*\]\(([^)]*)\)$/\1/')"

      if [[ "$link" =~ ^https?:// ]] || [[ "$link" =~ ^mailto: ]] || [[ "$link" =~ ^# ]]; then
        continue
      fi

      local link_path="${link%%#*}"
      link_path="${link_path%%\?*}"

      if [[ -z "$link_path" ]]; then
        continue
      fi

      local resolved_path
      if [[ "$link_path" == /* ]]; then
        resolved_path="$ROOT_DIR$link_path"
      else
        resolved_path="$(cd "$(dirname "$md_file")" && pwd)/$link_path"
      fi

      if [[ ! -e "$resolved_path" ]]; then
        echo "${md_file#$ROOT_DIR/} :: $link"
      fi
    done < <(grep -oE '\[[^]]+\]\([^)]*\)' "$md_file" || true)
  done < <(find "$ROOT_DIR/docs" -type f -name "*.md")
}

if [[ "$LIST_UNRESOLVED" == "true" ]]; then
  print_unresolved_local_links
  exit 0
fi

TOTAL_DOCS_MD="$(count_md_files "$ROOT_DIR/docs")"
ARCHIVE_DOCS_MD="$(count_md_files "$ROOT_DIR/docs/archive")"
ACTIVE_DOCS_MD=$((TOTAL_DOCS_MD - ARCHIVE_DOCS_MD))

HAS_DOCS_INDEX="$(has_file "$ROOT_DIR/docs/README.md")"
HAS_CONFIG_DOC="$(has_file "$ROOT_DIR/docs/CONFIGURATION.md")"
HAS_DEPLOYMENT_README="$(has_file "$ROOT_DIR/docs/deployment/README.md")"

LEGACY_PATTERN='dj-forever2\.onrender\.com|dj-forever2-backend\.onrender\.com'
ACTIVE_LEGACY_DOMAIN_REFS="$(count_matches_in_docs_set "$LEGACY_PATTERN" "false")"
ARCHIVE_LEGACY_DOMAIN_REFS="$(count_matches_in_docs_set "$LEGACY_PATTERN" "true")"
TOTAL_LEGACY_DOMAIN_REFS=$((ACTIVE_LEGACY_DOMAIN_REFS + ARCHIVE_LEGACY_DOMAIN_REFS))
ARCHIVE_LABEL_REFS="$(count_matches 'Archived|historical|superseded' "$ROOT_DIR/docs/archive")"
PLACEHOLDER_REFS="$(count_matches_in_docs_set '\{\{[^}]+\}\}|TODO|FIXME|TBD' "false")"
UNRESOLVED_LOCAL_LINKS="$(count_unresolved_local_links)"

REPORT_CONTENT=$(cat <<EOF
# Documentation Governance Audit Baseline (${DATE_STAMP})

## Scope
- Repository: dj-forever2
- Audit phase: Phase 4 documentation governance baseline

## Inventory Snapshot
- Total markdown files under docs/: ${TOTAL_DOCS_MD}
- Active markdown files (excluding archive): ${ACTIVE_DOCS_MD}
- Archive markdown files: ${ARCHIVE_DOCS_MD}

## Governance Signals
- Docs index present (docs/README.md): ${HAS_DOCS_INDEX}
- Configuration guide present (docs/CONFIGURATION.md): ${HAS_CONFIG_DOC}
- Deployment docs index present (docs/deployment/README.md): ${HAS_DEPLOYMENT_README}
- Legacy Render domain refs (active docs): ${ACTIVE_LEGACY_DOMAIN_REFS}
- Legacy Render domain refs (archive docs): ${ARCHIVE_LEGACY_DOMAIN_REFS}
- Legacy Render domain refs (all docs): ${TOTAL_LEGACY_DOMAIN_REFS}
- Archive lifecycle label refs (archive docs): ${ARCHIVE_LABEL_REFS}
- Placeholder markers (active docs): ${PLACEHOLDER_REFS}
- Unresolved local markdown links (docs/): ${UNRESOLVED_LOCAL_LINKS}

## Recommended Next Steps
1. Execute the checklist in docs/development/DOCUMENTATION_GOVERNANCE_AUDIT_CHECKLIST.md.
2. Log all findings in docs/development/DOCUMENTATION_GOVERNANCE_FINDINGS_REGISTER.md.
3. Prioritize unresolved local links and active-doc legacy domain references.
4. Re-run this baseline after fixes: npm run audit:docs:check.
EOF
)

echo "$REPORT_CONTENT"

if [[ "$WRITE_REPORT" == "true" ]]; then
  mkdir -p "$REPORT_DIR"
  printf '%s\n' "$REPORT_CONTENT" > "$REPORT_FILE"
  echo
  echo "Wrote documentation governance baseline report: $REPORT_FILE"
fi

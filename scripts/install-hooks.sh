#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# install-hooks.sh — Copies tracked git hooks into .git/hooks/
#
# Run automatically via npm install (prepare lifecycle) or
# manually: bash scripts/install-hooks.sh
# ──────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_SRC="$REPO_ROOT/scripts/hooks"
HOOKS_DST="$REPO_ROOT/.git/hooks"

# Worktree safety: .git may be a file (gitdir reference), not a directory
if [[ ! -d "$HOOKS_DST" ]]; then
  # Try to resolve the actual .git directory for worktrees
  GIT_DIR=$(git -C "$REPO_ROOT" rev-parse --git-dir 2>/dev/null || true)
  if [[ -n "$GIT_DIR" && -d "$GIT_DIR/hooks" ]]; then
    HOOKS_DST="$GIT_DIR/hooks"
  else
    echo "Note: .git/hooks directory not found, skipping hook install."
    exit 0
  fi
fi

for hook_src in "$HOOKS_SRC"/*; do
  hook_name=$(basename "$hook_src")
  hook_dst="$HOOKS_DST/$hook_name"

  # Back up existing non-sample hook if present
  if [[ -f "$hook_dst" ]] && [[ ! "$hook_dst" == *.sample ]]; then
    if ! diff -q "$hook_src" "$hook_dst" > /dev/null 2>&1; then
      cp "$hook_dst" "$hook_dst.bak"
      echo "Backed up existing $hook_name to $hook_name.bak"
    fi
  fi

  cp "$hook_src" "$hook_dst"
  chmod +x "$hook_dst"
done

echo "Git hooks installed."

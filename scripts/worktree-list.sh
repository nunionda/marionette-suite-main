#!/usr/bin/env bash
# worktree-list.sh — list all active marionette worktrees with status
#
# Usage: ./scripts/worktree-list.sh

set -euo pipefail

SUITE_ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  marionette worktree status                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

git -C "$SUITE_ROOT" worktree list --porcelain | awk '
  /^worktree / { path=$2 }
  /^HEAD /     { head=substr($0,6,8) }
  /^branch /   { branch=$2; gsub("refs/heads/","",branch) }
  /^$/         {
    if (path != "") {
      printf "  📁 %-52s\n     branch: %-40s head: %s\n\n", path, branch, head
      path=""; head=""; branch=""
    }
  }
'

echo ""
echo "── Branch summary ──────────────────────────────────────────────"
git -C "$SUITE_ROOT" branch -v | grep "feat/"
echo ""

echo "── Disk usage ──────────────────────────────────────────────────"
WT_ROOT="$(dirname "$SUITE_ROOT")/marionette-wt"
if [[ -d "$WT_ROOT" ]]; then
  du -sh "$WT_ROOT"/*/  2>/dev/null | sort -rh || echo "  (no worktrees in $WT_ROOT)"
else
  echo "  $WT_ROOT does not exist yet"
fi
echo ""

#!/usr/bin/env bash
# worktree-new.sh — provision a new feature worktree under marionette-wt/
#
# Usage:
#   ./scripts/worktree-new.sh <slug> <port-offset> [from-branch]
#
# Example:
#   ./scripts/worktree-new.sh sprint19-management 100
#   ./scripts/worktree-new.sh sprint3-design 200
#   ./scripts/worktree-new.sh db-migration 300
#
# What it does:
#   1. Creates git worktree at ../marionette-wt/<slug>/
#   2. Creates branch feat/<slug> (or uses from-branch if provided)
#   3. Copies root .env.example → .env.local with port offsets applied
#   4. Creates a minimal CLAUDE.md stub for the worktree domain
#   5. Installs packages (pnpm uses global content-addressable store — fast)

set -euo pipefail

SLUG="${1:-}"
PORT_OFFSET="${2:-0}"
FROM_BRANCH="${3:-main}"

if [[ -z "$SLUG" ]]; then
  echo "Usage: $0 <slug> <port-offset> [from-branch]"
  exit 1
fi

SUITE_ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
WT_ROOT="$(dirname "$SUITE_ROOT")/marionette-wt"
WT_DIR="$WT_ROOT/$SLUG"
BRANCH="feat/$SLUG"

echo "╔══════════════════════════════════════════════════╗"
echo "║  marionette worktree provisioner                ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "  slug        : $SLUG"
echo "  branch      : $BRANCH"
echo "  worktree    : $WT_DIR"
echo "  port offset : +$PORT_OFFSET"
echo "  from        : $FROM_BRANCH"
echo ""

# 1. Create worktree directory + branch
mkdir -p "$WT_ROOT"
if git -C "$SUITE_ROOT" worktree list | grep -q "$WT_DIR"; then
  echo "⚠ Worktree already exists at $WT_DIR — skipping git step"
else
  git -C "$SUITE_ROOT" worktree add -b "$BRANCH" "$WT_DIR" "$FROM_BRANCH"
  echo "✅ git worktree created: $WT_DIR ($BRANCH)"
fi

# 2. Port-offset .env.local
ENV_EXAMPLE="$SUITE_ROOT/.env.example"
ENV_LOCAL="$WT_DIR/.env.local"
if [[ -f "$ENV_EXAMPLE" && ! -f "$ENV_LOCAL" ]]; then
  # Copy env.example and apply port offsets
  cp "$ENV_EXAMPLE" "$ENV_LOCAL"
  # Replace common service port numbers with offset versions
  # Hub (3000), script-writer-be (3006), storyboard (3007), studio (3001)
  # scenario (4000), analysis-web (4007), analysis-api (4006), shorts (5178)
  if [[ "$PORT_OFFSET" -gt 0 ]]; then
    # Offset all localhost:XXXX references
    sed -i '' \
      -e "s|localhost:3000|localhost:$((3000 + PORT_OFFSET))|g" \
      -e "s|localhost:3001|localhost:$((3001 + PORT_OFFSET))|g" \
      -e "s|localhost:3006|localhost:$((3006 + PORT_OFFSET))|g" \
      -e "s|localhost:3007|localhost:$((3007 + PORT_OFFSET))|g" \
      -e "s|localhost:4000|localhost:$((4000 + PORT_OFFSET))|g" \
      -e "s|localhost:4006|localhost:$((4006 + PORT_OFFSET))|g" \
      -e "s|localhost:4007|localhost:$((4007 + PORT_OFFSET))|g" \
      -e "s|localhost:5174|localhost:$((5174 + PORT_OFFSET))|g" \
      -e "s|localhost:5178|localhost:$((5178 + PORT_OFFSET))|g" \
      "$ENV_LOCAL"
    echo "# WT_SLUG=$SLUG WT_PORT_OFFSET=$PORT_OFFSET" >> "$ENV_LOCAL"
  fi
  echo "✅ .env.local created (port +$PORT_OFFSET)"
else
  echo "⚠ .env.local already exists or no .env.example — skipping"
fi

# 3. Stub CLAUDE.md if missing
CLAUDE_MD="$WT_DIR/CLAUDE.md"
if [[ ! -f "$CLAUDE_MD" ]]; then
  cat > "$CLAUDE_MD" <<CLAUDEEOF
# CLAUDE.md — $SLUG worktree

> **Scope**: This worktree is dedicated to \`feat/$SLUG\`.
> Modify ONLY files relevant to this feature. Do not change packages outside this scope.

## Domain

<!-- TODO: fill in the specific domain / Sprint scope -->

## Port offsets (port +$PORT_OFFSET vs main)

| Service | Main port | This worktree |
|---|---|---|
| Hub (contents-studio-web) | 3000 | $((3000 + PORT_OFFSET)) |
| script-writer-backend | 3006 | $((3006 + PORT_OFFSET)) |
| storyboard-maker | 3007 | $((3007 + PORT_OFFSET)) |

## Rules

1. Branch: \`feat/$SLUG\` — never commit to main from here
2. Run dev servers with port offset: \`PORT=$((3000 + PORT_OFFSET)) pnpm dev\`
3. Keep changes scoped — this Claude session should not modify other features
4. PR target: main (squash merge after review)
CLAUDEEOF
  echo "✅ CLAUDE.md stub created"
fi

# 4. Install packages (pnpm hard-links from global store — fast)
echo ""
echo "Installing packages (using pnpm global content-addressable store)..."
cd "$WT_DIR"
pnpm install --frozen-lockfile 2>&1 | tail -5
echo ""
echo "✅ Done. Start developing:"
echo "   cd $WT_DIR"
echo "   pnpm dev  (hub on port $((3000 + PORT_OFFSET)))"

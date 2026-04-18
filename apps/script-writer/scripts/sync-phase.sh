#!/bin/zsh
PHASE=$1
MESSAGE=$2

if [[ -z "$PHASE" || -z "$MESSAGE" ]]; then
  echo "Usage: ./scripts/sync-phase.sh <phase-name> <message>"
  exit 1
fi

# 1. Ensure git is initialized
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  git init
fi

# 2. Stage changes
git add .

# 3. Commit with standard format
git commit -m "feat($PHASE): $MESSAGE"

echo "✅ Phase $PHASE synced with git."

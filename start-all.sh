#!/bin/bash
# Marionette Suite - Industrialized Production Hub Auto-Start
# Responsible AI Architect: Antigravity

# 1. Hardcoded Infrastructure Paths (Mac Production Environment)
BUN_BIN="/Users/daniel/.bun/bin/bun"
WORKSPACE_ROOT="/Users/daniel/dev/claude-dev/marionette-suite"

echo "🚀 [Marionette] Industrializing Production Environment..."

# 2. Cleanup existing ghost processes (Port Defense)
echo "🛡️  Clearing port conflicts (3000, 3001, 3005)..."
lsof -ti:3000,3001,3005 | xargs kill -9 2>/dev/null

# 3. Launch Services in Parallel (Unified Architecture)
cd "$WORKSPACE_ROOT"

echo "🌐 Starting Homepage (:3000)..."
cd apps/homepage && "$BUN_BIN" run dev &

echo "🎨 Starting Studio Hub (:3001)..."
cd "$WORKSPACE_ROOT/apps/studio" && "$BUN_BIN" run dev &

echo "⚙️  Starting Production API & Intelligence Core (:3005)..."
cd "$WORKSPACE_ROOT/apps/production-pipeline" && "$BUN_BIN" run dev &

echo "✅ [SUCCESS] Marionette Suite is now operational."
echo "   - Homepage:  http://localhost:3000"
echo "   - Studio:    http://localhost:3001"
echo "   - Intel API: http://localhost:3005"
wait

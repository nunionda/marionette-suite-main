#!/bin/bash

# Marionette Suite - Robust Unified Pipeline Launch Script
export PATH="/opt/homebrew/bin:/Users/daniel/.bun/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
ROOT_DIR=$(pwd)

# Ports Map
# 3001: Studio Hub | 3000: Homepage | 3005: Auteur API | 8000: Production Engine
# 3006: Script Writer BE | 4005: Analysis BE | 5174: Script Writer FE | 8080: Storyboard

BUN_BIN="/Users/daniel/.bun/bin/bun"
PNPM_BIN="/opt/homebrew/bin/pnpm"
PYTHON_BIN="python3"

echo "🎬 Starting Marionette Suite Unified Pipeline from $ROOT_DIR"

# Helper for starting services
start_service() {
    local name=$1
    local dir=$2
    local cmd=$3
    local log=$4
    local pid_file=$5

    echo "Launching $name..."
    if [ -d "$ROOT_DIR/$dir" ]; then
        cd "$ROOT_DIR/$dir"
        eval "$cmd > $log 2>&1 &"
        echo $! > "$pid_file"
        echo "  [OK] $name started (PID: $(cat $pid_file))"
    else
        echo "  [ERROR] Directory $dir not found!"
    fi
}

# 1. Engine
start_service "Production Engine (8000)" "apps/production-pipeline" "$PYTHON_BIN -m uvicorn server.app:app --port 8000 --host 0.0.0.0" "engine.log" "engine.pid"

# 2. Auteur API
start_service "Auteur API (3005)" "apps/production-pipeline/apps/api" "$BUN_BIN run dev" "api.log" "api.pid"

# 3. Backends
start_service "Script Writer BE (3006)" "apps/script-writer/server" "$BUN_BIN run dev" "backend.log" "backend.pid"
start_service "Analysis System BE (4005)" "apps/analysis-system/apps/api" "$BUN_BIN run dev" "backend.log" "backend.pid"

# 4. Frontends
start_service "Studio Hub (3001)" "apps/studio" "$PNPM_BIN dev" "studio.log" "studio.pid"
start_service "Homepage (3000)" "apps/homepage" "npx serve -l 3000 ." "homepage.log" "homepage.pid"
start_service "Script Writer FE (5174)" "apps/script-writer" "$PNPM_BIN dev" "frontend.log" "frontend.pid"
start_service "Analysis System FE (4000)" "apps/analysis-system/apps/web" "$PNPM_BIN dev" "frontend.log" "frontend.pid"
start_service "Storyboard Maker (8080)" "apps/storyboard-maker" "npx serve -l 8080 gallery" "storyboard.log" "storyboard.pid"

echo "✅ All services initiated. Watch logs for details."
cd "$ROOT_DIR"

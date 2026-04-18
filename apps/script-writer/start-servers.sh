#!/bin/bash

echo "Stopping existing servers..."
lsof -ti:3005 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "Starting Backend Server (Port: 3005)..."
cd server
nohup bun run src/index.ts > backend.log 2>&1 &
cd ..

echo "Starting Frontend Server (Port: 5173)..."
nohup npm run dev > frontend.log 2>&1 &

echo "Servers restarted successfully!"
echo "Backend log: server/backend.log"
echo "Frontend log: frontend.log"

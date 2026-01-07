#!/bin/bash
# Start backend, frontend, and Telegram bot with verbose output
# Usage: ./start_all_verbose.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting MedState Application (Verbose Mode)"
echo ""
echo "This will start:"
echo "  1. Backend server (http://localhost:5001)"
echo "  2. Frontend dev server (http://localhost:5173)"
echo "  3. Telegram bot"
echo ""
echo "All output will be shown in this terminal"
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID $BOT_PID 2>/dev/null
    pkill -f "backend/script.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit
}
trap cleanup INT TERM

# Kill any existing instances
echo "Cleaning up any existing processes..."
pkill -f "backend/script.py" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# Start backend in background but show output
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 BACKEND SERVER"
echo "═══════════════════════════════════════════════════════════"
cd "$SCRIPT_DIR/backend"
./run_backend.sh &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

# Start frontend in background but show output
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎨 FRONTEND SERVER"
echo "═══════════════════════════════════════════════════════════"
cd "$SCRIPT_DIR/frontend"
./run_frontend.sh &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
sleep 3

# Start Telegram bot in background but show output
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🤖 TELEGRAM BOT"
echo "═══════════════════════════════════════════════════════════"
cd "$SCRIPT_DIR/backend"
./start_bot.sh &
BOT_PID=$!
echo "Bot PID: $BOT_PID"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ All services started!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Services:"
echo "  Backend:  http://localhost:5001"
echo "  Frontend: http://localhost:5173 (check terminal output above)"
echo "  Bot:      Running (send /start in Telegram)"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Wait for all processes
wait


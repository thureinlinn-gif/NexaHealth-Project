#!/bin/bash
# Start backend, frontend, and Telegram bot
# Usage: ./start_all.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting MedState Application"
echo ""
echo "This will start:"
echo "  1. Backend server (http://localhost:5001)"
echo "  2. Frontend dev server (http://localhost:5173)"
echo "  3. Telegram bot"
echo ""
echo "⚠️  Note: This runs all services in the background."
echo "   For better control, run each in separate terminals:"
echo "   - Terminal 1: cd backend && ./run_backend.sh"
echo "   - Terminal 2: cd frontend && ./run_frontend.sh"
echo "   - Terminal 3: cd backend && ./start_bot.sh"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID $BOT_PID 2>/dev/null
    pkill -f "backend/script.py" 2>/dev/null
    exit
}
trap cleanup INT TERM

# Kill any existing bot instances (more aggressive)
echo "Cleaning up any existing processes..."
pkill -9 -f "backend/script.py" 2>/dev/null
pkill -9 -f "script.py" 2>/dev/null
pkill -9 -f "telebot" 2>/dev/null
sleep 3

# Verify no bot processes are running
if pgrep -f "script.py" > /dev/null; then
    echo "⚠️  Warning: Some bot processes may still be running"
    pkill -9 -f "script.py" 2>/dev/null
    sleep 2
fi

# Start backend
echo ""
echo "📦 Starting backend server..."
cd "$SCRIPT_DIR/backend"
./run_backend.sh > /tmp/medstate_backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo "   Logs: tail -f /tmp/medstate_backend.log"

# Wait a bit for backend to start
sleep 3

# Start frontend
echo ""
echo "🎨 Starting frontend server..."
cd "$SCRIPT_DIR/frontend" || {
    echo "❌ Error: Cannot cd to frontend directory"
    exit 1
}

# Make sure we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory"
    exit 1
fi

echo "   ✓ Found package.json"
echo "   ✓ Checking dependencies..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing npm dependencies (this may take a minute)..."
    npm install >> /tmp/medstate_frontend.log 2>&1
fi

# Create .env if needed
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "VITE_BACKEND_URL=http://localhost:5001" > .env
    echo "   ✓ Created .env file"
fi

# Run frontend script in background
echo "   Starting Vite dev server..."
bash ./run_frontend.sh >> /tmp/medstate_frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
echo "   Waiting for frontend to start..."
sleep 5

# Check if frontend is actually running
if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "   ✓ Frontend process is running"
else
    echo "   ⚠️  Warning: Frontend process may have exited"
    echo "   Check logs: tail -f /tmp/medstate_frontend.log"
fi

# Wait a bit for frontend to start
sleep 2

# Start Telegram bot
echo ""
echo "🤖 Starting Telegram bot..."
cd "$SCRIPT_DIR/backend"
./start_bot.sh > /tmp/medstate_bot.log 2>&1 &
BOT_PID=$!
echo "   Bot PID: $BOT_PID"
echo "   Logs: tail -f /tmp/medstate_bot.log"

echo ""
echo "✅ All services started!"
echo ""
echo "📊 View logs:"
echo "   Backend:  tail -f /tmp/medstate_backend.log"
echo "   Frontend: tail -f /tmp/medstate_frontend.log"
echo "   Bot:      tail -f /tmp/medstate_bot.log"
echo ""
echo "🛑 To stop all services, press Ctrl+C"
echo ""

# Wait for all processes
wait

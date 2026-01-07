#!/bin/bash
# Script to kill all Telegram bot instances
# Usage: ./kill_bot.sh

echo "Stopping all Telegram bot instances..."

# Kill all bot processes
pkill -9 -f "backend/script.py" 2>/dev/null
pkill -9 -f "script.py" 2>/dev/null
pkill -9 -f "telebot" 2>/dev/null

sleep 2

# Check if any are still running
if pgrep -f "script.py" > /dev/null; then
    echo "⚠️  Some processes may still be running. Trying again..."
    pkill -9 -f "script.py" 2>/dev/null
    sleep 1
fi

# Final check
if pgrep -f "script.py" > /dev/null; then
    echo "❌ Error: Could not kill all bot processes"
    echo "   Running processes:"
    ps aux | grep -E "script.py|telebot" | grep -v grep
    exit 1
else
    echo "✅ All bot processes stopped"
fi


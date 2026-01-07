#!/bin/bash
# Simple script to start the Telegram bot

cd "$(dirname "$0")"

# Kill any existing bot instances (more aggressive)
echo "Checking for existing bot processes..."
pkill -9 -f "backend/script.py" 2>/dev/null
pkill -9 -f "script.py" 2>/dev/null
pkill -9 -f "telebot" 2>/dev/null
# Wait a bit longer to ensure processes are fully killed
sleep 3

# Double-check no bot processes are running
if pgrep -f "script.py" > /dev/null; then
    echo "⚠️  Warning: Some bot processes may still be running"
    echo "   Attempting to kill again..."
    pkill -9 -f "script.py" 2>/dev/null
    sleep 2
fi

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✓ Virtual environment activated"
else
    echo "✗ Error: Virtual environment not found"
    exit 1
fi

# Verify Python path
PYTHON_PATH=$(which python3)
if [[ "$PYTHON_PATH" != *"venv"* ]]; then
    echo "✗ Warning: Not using venv Python. Current: $PYTHON_PATH"
    echo "  Make sure venv is activated!"
fi

# Check .env file
if [ ! -f "../.env" ]; then
    echo "✗ Error: .env file not found in parent directory"
    exit 1
fi
echo "✓ .env file found"

# Verify telebot is installed
python3 -c "import telebot" 2>/dev/null || {
    echo "✗ Error: telebot not installed. Installing..."
    pip install pyTelegramBotAPI
}

# Start the bot
echo "Starting Telegram bot..."
echo "Press Ctrl+C to stop"
echo ""
python3 script.py


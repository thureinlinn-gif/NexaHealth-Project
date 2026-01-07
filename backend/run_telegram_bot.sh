#!/bin/bash
# Script to run the Telegram bot

cd "$(dirname "$0")"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Virtual environment activated"
else
    echo "Error: Virtual environment not found. Please run: python3 -m venv venv"
    exit 1
fi

# Verify we're using the venv Python
VENV_PYTHON=$(which python3)
echo "Using Python: $VENV_PYTHON"

# Check if .env exists in parent directory
if [ ! -f "../.env" ]; then
    echo "Error: .env file not found in parent directory"
    exit 1
fi

# Install/update dependencies
echo "Installing/updating dependencies..."
pip install -q -r requirements.txt

# Verify telebot is installed
echo "Verifying telebot installation..."
python3 -c "import telebot; print('✓ telebot is installed')" || {
    echo "Error: telebot not found. Installing..."
    pip install pyTelegramBotAPI
}

# Run the bot
echo "Starting Telegram bot..."
python3 script.py


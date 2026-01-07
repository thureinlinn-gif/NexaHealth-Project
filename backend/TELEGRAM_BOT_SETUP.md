# Telegram Bot Setup Guide

## Quick Start

The Telegram bot (`script.py`) is located in the `backend/` directory and must be run with the virtual environment activated.

## Running the Bot

### Method 1: Using the Helper Script (Recommended)

```bash
cd backend
./run_telegram_bot.sh
```

### Method 2: Manual Activation

```bash
cd backend
source venv/bin/activate
python3 script.py
```

**Important:** You MUST activate the virtual environment first! The `(venv)` prefix in your terminal prompt indicates the venv is active.

## Troubleshooting

### Error: "ModuleNotFoundError: No module named 'telebot'"

This means the virtual environment is not activated or you're using the wrong Python interpreter.

**Solution:**
1. Make sure you're in the `backend/` directory
2. Activate the venv: `source venv/bin/activate`
3. Verify you're using the venv Python:
   ```bash
   which python3
   # Should show: /Users/aidanjenkins/Desktop/MedState/backend/venv/bin/python3
   ```
4. If it shows a different path, the venv is not activated

### Verify Installation

Check if telebot is installed:
```bash
cd backend
source venv/bin/activate
pip list | grep telebot
```

If it's not listed, install it:
```bash
pip install -r requirements.txt
```

### Check .env File

Make sure your `.env` file is in the root directory (parent of `backend/`) with:
```
TELEGRAM_BOT_TOKEN=your_token_here
GEMINI_API_KEY=your_key_here
```

## Bot Commands

Once running, the bot responds to:
- `/start` - Start the symptom assessment
- `/help` - Show help message
- `/reset` - Reset current session
- `/linkwallet` - Link wallet address for cross-platform chat history

## Stopping the Bot

Press `Ctrl+C` in the terminal where the bot is running.


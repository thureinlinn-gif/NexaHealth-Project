# Environment Variables Setup

## Important: API Keys

**DO NOT HARD CODE API KEYS** - Always use environment variables.

## Quick Setup

1. **Create a `.env` file in the root directory** (same level as `backend/` and `frontend/`):

```bash
# .env file
GEMINI_API_KEY=your_gemini_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

2. **The `.env` file is already in `.gitignore`** - it won't be committed to git.

## Files Updated

### `script.py` (Telegram Bot)
- Now reads `GEMINI_API_KEY` and `TELEGRAM_BOT_TOKEN` from environment variables
- Will raise an error if keys are not set
- Uses model: `models/gemini-2.5-pro`

### `backend/chat_handler.py` (Web Chat API)
- Reads `GEMINI_API_KEY` from environment variables
- Uses model: `models/gemini-2.5-pro`
- Falls back gracefully if key is not set

### `backend/app.py`
- Loads `.env` file automatically using `python-dotenv`

## Running with Environment Variables

### Option 1: Using .env file (Recommended)
Just create the `.env` file in the root directory. The backend will load it automatically.

### Option 2: Export in terminal
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
export TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
```

### Option 3: Set in run scripts
You can also add to `backend/run_backend.sh`:
```bash
export GEMINI_API_KEY="your-key"
export TELEGRAM_BOT_TOKEN="your-token"
```

## Verification

To verify environment variables are loaded:
```bash
python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); print('GEMINI_API_KEY:', 'SET' if os.getenv('GEMINI_API_KEY') else 'NOT SET')"
```

## Security Notes

- ✅ `.env` is in `.gitignore` - won't be committed
- ✅ No hardcoded keys in source code
- ✅ Use `.env.example` as a template (without real keys)
- ⚠️ Never commit `.env` file to git
- ⚠️ Never share API keys publicly


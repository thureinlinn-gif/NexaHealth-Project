# Chat Backend Setup

The chat functionality now uses the backend instead of Lovable/Supabase.

## Files Created

1. **`chat_handler.py`** - Chat logic using Gemini AI (similar to script.py but for web API)
2. **`app.py`** - Added `/chat` endpoint

## Configuration

The chat handler uses Google Gemini AI. You need to set the API key:

### Option 1: Environment Variable (Recommended)
```bash
export GEMINI_API_KEY="your-api-key-here"
```

### Option 2: Edit chat_handler.py
Change line 12 in `chat_handler.py`:
```python
GENAI_KEY = os.getenv("GEMINI_API_KEY", "your-api-key-here")
```

## How It Works

1. Frontend sends messages to `/chat` endpoint
2. Backend uses `chat_handler.py` which calls Gemini AI
3. Response is returned to frontend
4. Uses same logic as `script.py` but adapted for web API

## Differences from script.py

- **script.py**: Telegram bot with interactive flows, symptom tracking
- **chat_handler.py**: Simple chat API for web frontend
- Both use the same Gemini AI model and similar prompts

## Testing

1. Start backend: `./run_backend.sh`
2. Start frontend: `./run_frontend.sh`
3. Go to Chat page and send a message
4. Should get response from Gemini AI via backend

## Troubleshooting

- **"Chat service is not configured"**: Set GEMINI_API_KEY environment variable
- **Import errors**: Run `pip install -r requirements.txt` (includes google-generativeai)
- **CORS errors**: Make sure backend CORS includes `/chat` endpoint


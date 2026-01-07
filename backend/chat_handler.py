"""
Chat handler for frontend - uses Gemini AI similar to script.py
This is separate from script.py to keep the Telegram bot unchanged.
"""

import os
import json
from collections import Counter
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file (in parent directory)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
load_dotenv(dotenv_path=os.path.join(PARENT_DIR, '.env'))

# Initialize Gemini (same as script.py)
# Get API key from environment variable (DO NOT HARD CODE)
GENAI_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_KEY:
    try:
        genai.configure(api_key=GENAI_KEY)
        model = genai.GenerativeModel("models/gemini-2.5-pro")
    except Exception as e:
        print(f"Warning: Failed to initialize Gemini model: {e}")
        model = None
else:
    print("Warning: GEMINI_API_KEY environment variable not set")
    model = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)

# Load config files (same paths as script.py would use)
SYMPTOM_CONFIG_PATH = os.path.join(PARENT_DIR, "symptoms_config.Json")
HEALTH_KEYWORDS_PATH = os.path.join(PARENT_DIR, "health_keywords.json")

# Try to load symptom config if available
SYMPTOM_CONFIG = {}
HEALTH_KEYWORDS = []
try:
    if os.path.exists(SYMPTOM_CONFIG_PATH):
        with open(SYMPTOM_CONFIG_PATH, "r", encoding="utf-8") as f:
            RAW_SYMPTOM_CONFIG = json.load(f)
            SYMPTOM_CONFIG = RAW_SYMPTOM_CONFIG.get("symptoms", {})
except Exception:
    pass

try:
    if os.path.exists(HEALTH_KEYWORDS_PATH):
        with open(HEALTH_KEYWORDS_PATH, "r", encoding="utf-8") as f:
            health_data = json.load(f)
            HEALTH_KEYWORDS = health_data.get("keywords", [])
except Exception:
    pass


def gemini_chat_reply(user_text, counts=None, details=None):
    """
    Generate a chat reply using Gemini AI.
    Same logic as script.py but adapted for API use.
    """
    if model is None:
        return "Chat service is not configured. Please set GEMINI_API_KEY environment variable."
    
    counts = counts or Counter()
    details = details or {}

    prompt = f"""Context:
Symptoms selected: {list(counts.elements())}
Details: {details}

User message: "{user_text}"

Reply under 70 words.
Do not diagnose or give medication.
Use simple language.
You may remind the user that this is not medical advice.
You are NexaHealth AI Assistant, a helpful medical information assistant.
Provide clear, concise health guidance.
"""

    try:
        resp = model.generate_content(prompt)
        return (resp.text or "").strip() or "I could not respond."
    except Exception as e:
        return f"I could not respond. Error: {str(e)}"


def chat_with_context(messages):
    """
    Process chat messages and return a response.
    
    Args:
        messages: List of message dicts with 'role' and 'content'
    
    Returns:
        str: Response text
    """
    if not messages:
        return "Please send a message."
    
    # Get the last user message
    user_messages = [msg for msg in messages if msg.get("role") == "user"]
    if not user_messages:
        return "I didn't receive a user message."
    
    last_user_message = user_messages[-1].get("content", "")
    
    # For now, we don't track symptoms in the web chat (simpler)
    # But we can extract context from conversation history
    counts = Counter()
    details = {}
    
    # Simple keyword detection from health_keywords
    user_text_lower = last_user_message.lower()
    for keyword in HEALTH_KEYWORDS:
        if keyword in user_text_lower:
            counts[keyword] += 1
    
    return gemini_chat_reply(last_user_message, counts, details)


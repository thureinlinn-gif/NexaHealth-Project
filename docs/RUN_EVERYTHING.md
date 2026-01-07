# 🚀 Complete Startup Guide - Run Everything

This guide shows you how to start all three services: **Backend**, **Frontend**, and **Telegram Bot**.

## Quick Start (3 Terminal Windows - Recommended)

### Terminal 1: Backend Server
```bash
cd backend
./run_backend.sh
```
**Expected:** Flask server running on `http://localhost:5001`

### Terminal 2: Frontend Server
```bash
cd frontend
./run_frontend.sh
```
**Expected:** Vite dev server running on `http://localhost:5173`

### Terminal 3: Telegram Bot
```bash
cd backend
./start_bot.sh
```
**Expected:** Bot connected and ready to receive messages

---

## Alternative: Run All in Background (Single Command)

```bash
./start_all.sh
```

This starts all three services in the background. View logs with:
```bash
tail -f /tmp/medstate_backend.log
tail -f /tmp/medstate_frontend.log
tail -f /tmp/medstate_bot.log
```

---

## Step-by-Step Instructions

### 1. Start Backend (Flask API)

**Open Terminal 1:**
```bash
cd /Users/aidanjenkins/Desktop/MedState/backend
./run_backend.sh
```

**What happens:**
- Activates virtual environment
- Installs dependencies (if needed)
- Starts Flask server on port 5001
- Loads the ML model

**Success indicators:**
```
🚀 Starting Flask server on http://localhost:5001
 * Running on http://0.0.0.0:5001
```

**Keep this terminal open!**

---

### 2. Start Frontend (React App)

**Open Terminal 2 (new terminal):**
```bash
cd /Users/aidanjenkins/Desktop/MedState/frontend
./run_frontend.sh
```

**What happens:**
- Installs npm dependencies (if needed)
- Creates `.env` file with backend URL
- Starts Vite dev server

**Success indicators:**
```
🚀 Starting Vite dev server...
  ➜  Local:   http://localhost:5173/
```

**Keep this terminal open!**

---

### 3. Start Telegram Bot

**Open Terminal 3 (new terminal):**
```bash
cd /Users/aidanjenkins/Desktop/MedState/backend
./start_bot.sh
```

**What happens:**
- Kills any existing bot instances
- Activates virtual environment
- Verifies `.env` file exists
- Installs telebot (if needed)
- Starts the bot

**Success indicators:**
```
✓ Virtual environment activated
✓ .env file found
Starting Telegram bot...
```

**Keep this terminal open!**

---

## Verify Everything is Running

### Check Backend
```bash
curl http://localhost:5001/health
```
Should return JSON with `"status": "healthy"`

### Check Frontend
Open browser to: `http://localhost:5173`
Should see the NexaHealth landing page

### Check Telegram Bot
Send `/start` to your bot in Telegram
Should receive a greeting message

---

## Troubleshooting

### Backend Issues

**"ModuleNotFoundError"**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**"Model not loaded"**
```bash
cd backend
./train_model.sh  # Train the model first
```

**Port 5001 already in use**
```bash
lsof -ti:5001 | xargs kill  # Kill process on port 5001
```

### Frontend Issues

**"Cannot connect to backend"**
- Make sure backend is running first
- Check `frontend/.env` has: `VITE_BACKEND_URL=http://localhost:5001`

**"npm: command not found"**
- Install Node.js: https://nodejs.org/

### Telegram Bot Issues

**"ModuleNotFoundError: No module named 'telebot'"**
```bash
cd backend
source venv/bin/activate
pip install pyTelegramBotAPI
```

**"Conflict: terminated by other getUpdates request"**
```bash
pkill -f "backend/script.py"  # Kill existing bot
```

**Bot not responding**
- Check `.env` file has correct `TELEGRAM_BOT_TOKEN`
- Verify bot token is valid in Telegram
- Check logs: `tail -f /tmp/medstate_bot.log`

---

## Stopping Services

### Stop Individual Service
Press `Ctrl+C` in the terminal running that service

### Stop All Services
```bash
pkill -f "backend/app.py"      # Backend
pkill -f "vite"                # Frontend
pkill -f "backend/script.py"   # Bot
```

Or if using `start_all.sh`, press `Ctrl+C` in that terminal

---

## Manual Commands (If Scripts Don't Work)

### Backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Telegram Bot
```bash
cd backend
source venv/bin/activate
pip install pyTelegramBotAPI
python3 script.py
```

---

## Development Workflow

1. **Start all services** (3 terminals or `./start_all.sh`)
2. **Make changes** to code
3. **Backend**: Restart manually (Ctrl+C, then restart)
4. **Frontend**: Auto-reloads on save
5. **Bot**: Restart manually if needed

---

## Quick Reference

| Service | Port | Script | Logs |
|---------|------|--------|------|
| Backend | 5001 | `backend/run_backend.sh` | `/tmp/medstate_backend.log` |
| Frontend | 5173 | `frontend/run_frontend.sh` | `/tmp/medstate_frontend.log` |
| Telegram Bot | N/A | `backend/start_bot.sh` | `/tmp/medstate_bot.log` |

---

## Need Help?

- Check individual README files:
  - `backend/README.md`
  - `frontend/README.md`
  - `backend/TELEGRAM_BOT_SETUP.md`
- Check logs for error messages
- Verify `.env` file has correct API keys


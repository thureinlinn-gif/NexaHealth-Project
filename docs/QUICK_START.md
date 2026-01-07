# Quick Start Guide

## Prerequisites

- **Python 3.9+** (use `python3 --version` to check)
- **Node.js 16+** and npm (use `node --version` to check)
- **Dataset**: `Wound_dataset/` folder in the root directory

## First Time Setup

### 1. Train the Model (Backend)

```bash
cd backend
./train_model.sh
```

This will:
- Create a Python virtual environment
- Install all dependencies
- Train the classification model
- Save the model to `wound_classifier.joblib`

**Note:** This only needs to be done once, or when you want to retrain with new data.

### 2. Start the Backend Server

In a terminal:
```bash
cd backend
./run_backend.sh
```

The backend will start on `http://localhost:5001`

### 3. Start the Frontend

In a **new terminal**:
```bash
cd frontend
./run_frontend.sh
```

The frontend will start on `http://localhost:5173` (or next available port)

## Using the Application

1. Open your browser to the frontend URL (usually `http://localhost:5173`)
2. Upload a wound image
3. Fill out the symptoms form
4. View the classification results

## Troubleshooting

### "python: command not found"
- Use `python3` instead of `python` on macOS/Linux
- The helper scripts already use `python3`

### "Model not loaded" error
- Make sure you've run `./train_model.sh` first
- Check that `wound_classifier.joblib` and `class_names.pkl` exist in `backend/`

### Frontend can't connect to backend
- Make sure the backend is running on port 5001
- Check `frontend/.env` or `frontend/.env.local` for `VITE_BACKEND_URL`
- Default is `http://localhost:5001`

### Port already in use
- Backend: Change port in `backend/app.py` (line 173)
- Frontend: Vite will automatically use the next available port

## Development Workflow

1. **Backend changes**: Edit files in `backend/`, restart the server
2. **Frontend changes**: Edit files in `frontend/src/`, hot-reloads automatically
3. **Model updates**: Run `./train_model.sh` to retrain


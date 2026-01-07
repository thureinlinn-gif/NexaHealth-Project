# 🚀 Quick Start Guide - Run Backend & Frontend

Follow these steps to get image classification working:

## Step 1: Start the Backend Server

Open **Terminal 1** and run:

```bash
cd backend
./run_backend.sh
```

**What you'll see:**
- Virtual environment setup (first time only)
- Dependencies installation (first time only)
- Flask server starting on `http://localhost:5001`
- Keep this terminal open!

**Expected output:**
```
🚀 Starting Flask server on http://localhost:5001
 * Running on http://0.0.0.0:5001
```

## Step 2: Start the Frontend Server

Open **Terminal 2** (new terminal window) and run:

```bash
cd frontend
./run_frontend.sh
```

**What you'll see:**
- Dependencies installation (first time only)
- Vite dev server starting
- Frontend URL (usually `http://localhost:5173`)
- Keep this terminal open!

**Expected output:**
```
🚀 Starting Vite dev server...
  ➜  Local:   http://localhost:5173/
```

## Step 3: Use the Application

1. Open your browser to the frontend URL (usually `http://localhost:5173`)
2. Click "Upload Wound Image"
3. Select an image
4. Fill out the symptoms form
5. View the classification results!

## Troubleshooting

### Backend won't start
- Make sure port 5001 is not in use
- Check that model files exist: `ls backend/wound_classifier.joblib`
- If missing, run: `cd backend && ./train_model.sh`

### Frontend can't connect to backend
- Make sure backend is running first (Step 1)
- Check backend URL in browser console
- Verify `frontend/.env` has: `VITE_BACKEND_URL=http://localhost:5001`

### "Failed to fetch" error
- Backend server is not running - start it with `./run_backend.sh`
- Check that backend is on port 5001
- Check browser console for detailed error messages

## Manual Commands (Alternative)

If the scripts don't work, use these manual commands:

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Stopping the Servers

Press `Ctrl+C` in each terminal to stop the servers.


# NexaHealth - Wound Classification System

A full-stack application for classifying wound images using machine learning.

## Project Structure

```
MedState/
├── backend/          # Flask API & ML Model
│   ├── app.py       # Flask web server
│   ├── train_model.py      # Model training script
│   ├── evaluate_model.py   # Model evaluation script
│   ├── requirements.txt   # Python dependencies
│   ├── templates/   # Flask HTML templates (demo)
│   └── uploads/     # Temporary image uploads
│
├── frontend/        # React frontend (from lovable/woundcare-ai)
│   ├── src/        # React source code
│   ├── public/     # Static assets
│   └── package.json
│
└── Wound_dataset/   # Training dataset (not tracked in git)
```

## Quick Start

### Backend (ML API)

**Option 1: Using helper scripts (Recommended)**
```bash
cd backend
./train_model.sh    # Train the model (first time only)
./run_backend.sh    # Start the Flask server
```

**Option 2: Manual setup**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 train_model.py    # Train the model (first time only)
python3 app.py            # Run the server
```

Server runs on `http://localhost:5001`

### Frontend (React App)

**Option 1: Using helper script (Recommended)**
```bash
cd frontend
./run_frontend.sh
```

**Option 2: Manual setup**
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173` (or next available port)

## Updating Frontend from Lovable

To pull the latest frontend code from the `lovable` remote:

```bash
./update_frontend.sh
```

## Backend API Endpoints

- `GET /` - Demo page
- `POST /predict` - Upload image and get classification
- `GET /health` - Health check and model status

## Development Workflow

1. **Modify backend:** Edit files in `backend/`
2. **Connect them:** Frontend should call backend API at `http://localhost:5001`

## Notes

- Model files (`.joblib`, `.pkl`) are gitignored - train locally
- Dataset (`Wound_dataset/`) is gitignored due to size


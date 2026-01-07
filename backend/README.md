# Backend - ML Wound Classification API

Flask-based backend for wound image classification using a MobileNetV2 feature extractor + Logistic Regression classifier.

## Quick Start

### First Time Setup

1. **Train the model:**
   ```bash
   ./train_model.sh
   ```
   This creates a virtual environment, installs dependencies, and trains the model.

2. **Start the server:**
   ```bash
   ./run_backend.sh
   ```
   Server runs on `http://localhost:5001`

### Manual Setup (Alternative)

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train model (first time only)
python3 train_model.py

# Run server
python3 app.py
```

## Files

- **`app.py`** - Flask web server with prediction endpoints
- **`train_model.py`** - Train the wound classification model
- **`evaluate_model.py`** - Evaluate model performance
- **`requirements.txt`** - Python dependencies
- **`run_backend.sh`** - Helper script to start the server
- **`train_model.sh`** - Helper script to train the model

## API Endpoints

- `GET /` - Demo HTML page
- `POST /predict` - Upload image (JSON with base64 or multipart file), returns classification
- `GET /health` - Check if model is loaded

### Predict Endpoint

**JSON Request (for frontend):**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response:**
```json
{
  "label": "Abrasion",
  "confidence": 0.85
}
```

## Model Architecture

- **Feature Extractor:** MobileNetV2 (frozen, ImageNet weights)
- **Classifier:** Logistic Regression (scikit-learn)
- **Input Size:** 224x224 RGB images
- **Output:** Wound type classification with confidence scores

## Requirements

- Python 3.9+
- Dataset in `../Wound_dataset/` directory
- Model files: `wound_classifier.joblib` and `class_names.pkl` (created after training)

## Troubleshooting

### "python: command not found"
- Use `python3` instead (helper scripts already do this)

### "Model not loaded" error
- Run `./train_model.sh` first to create the model files

### Port 5001 already in use
- Change the port in `app.py` line 173: `app.run(..., port=5002)`

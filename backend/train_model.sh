#!/bin/bash

# Script to train the wound classification model
# Usage: ./train_model.sh

set -e

cd "$(dirname "$0")"

echo "Training wound classification model..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if dataset exists
if [ ! -d "../Wound_dataset" ]; then
    echo "❌ Error: Wound_dataset directory not found!"
    echo "   Please ensure the dataset is in ../Wound_dataset/"
    exit 1
fi

# Run training
echo ""
echo "🧠 Starting model training..."
echo "   This may take several minutes..."
echo ""
python3 train_model.py

echo ""
echo "✅ Training complete!"
echo "   Model saved to: wound_classifier.joblib"
echo "   Class names saved to: class_names.pkl"


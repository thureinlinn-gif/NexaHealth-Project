#!/bin/bash

# Script to run the Flask backend server
# Usage: ./run_backend.sh

set -e

cd "$(dirname "$0")"

echo "Starting Flask backend server..."

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

# Check if model exists
if [ ! -f "wound_classifier.joblib" ] || [ ! -f "class_names.pkl" ]; then
    echo "⚠️  Warning: Model files not found!"
    echo "   Run 'python3 train_model.py' first to train the model."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run the Flask app
echo ""
echo "🚀 Starting Flask server on http://localhost:5001"
echo "   Press Ctrl+C to stop"
echo ""
python3 app.py


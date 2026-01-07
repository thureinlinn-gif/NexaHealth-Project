#!/bin/bash

# Script to run the React frontend
# Usage: ./run_frontend.sh

set -e

cd "$(dirname "$0")"

echo "Starting React frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    if command -v npm &> /dev/null; then
        npm install
    elif command -v yarn &> /dev/null; then
        yarn install
    elif command -v pnpm &> /dev/null; then
        pnpm install
    else
        echo "❌ Error: No package manager found (npm, yarn, or pnpm)"
        exit 1
    fi
fi

# Check if .env file exists for backend URL
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "Creating .env file with default backend URL..."
    echo "VITE_BACKEND_URL=http://localhost:5001" > .env
    echo "   You can edit .env to change the backend URL"
fi

# Run the dev server
echo ""
echo "🚀 Starting Vite dev server..."
echo "   Frontend will be available at http://localhost:5173 (or next available port)"
echo "   Make sure the backend is running on http://localhost:5001"
echo "   Press Ctrl+C to stop"
echo ""

if command -v npm &> /dev/null; then
    npm run dev
elif command -v yarn &> /dev/null; then
    yarn dev
elif command -v pnpm &> /dev/null; then
    pnpm dev
fi


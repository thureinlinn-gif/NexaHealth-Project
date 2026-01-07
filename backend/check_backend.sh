#!/bin/bash

# Quick script to check if backend is running and accessible
# Usage: ./check_backend.sh

BACKEND_URL="${1:-http://localhost:5001}"

echo "Checking backend at: $BACKEND_URL"
echo ""

# Check if server is responding
if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend is running and accessible!"
    echo ""
    echo "Health check response:"
    curl -s "$BACKEND_URL/health" | python3 -m json.tool 2>/dev/null || curl -s "$BACKEND_URL/health"
    echo ""
else
    echo "❌ Backend is NOT running or not accessible"
    echo ""
    echo "To start the backend:"
    echo "  cd backend"
    echo "  ./run_backend.sh"
    echo ""
    echo "Or manually:"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  python3 app.py"
    echo ""
fi


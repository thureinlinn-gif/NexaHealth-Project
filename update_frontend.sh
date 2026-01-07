#!/bin/bash

# Script to update frontend from lovable remote
# Usage: ./update_frontend.sh

set -e

echo "Updating frontend from lovable remote..."

cd frontend

# Check if lovable remote exists
if ! git remote | grep -q lovable; then
    echo "Adding lovable remote..."
    git remote add lovable git@github.com:MarcellusL/woundcare-ai.git
fi

# Fetch latest from lovable
echo "Fetching latest from lovable/main..."
git fetch lovable

# Checkout files from lovable/main
echo "Updating files from lovable/main..."
git checkout lovable/main -- .

echo "✅ Frontend updated successfully!"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Install dependencies: npm install"
echo "  3. Run dev server: npm run dev"


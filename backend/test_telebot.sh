#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
echo "Testing telebot import..."
python3 -c "import telebot; print('SUCCESS: telebot is installed')" || echo "ERROR: telebot not found"
echo "Python path: $(which python3)"

#!/bin/bash
echo "Running Velora Multiplayer Server..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Starting server on port 3000..."
node server.js
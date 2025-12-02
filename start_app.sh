#!/bin/bash

# Function to cleanup on exit
cleanup() {
    echo "Stopping all services..."
    npm run cleanup
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Cleanup existing processes first
npm run cleanup

# Start all services in the background
npm run dev &

# Wait for services to start
echo "Waiting for services to start..."
sleep 5

# Open Client in Browser
echo "Opening Client..."
open http://localhost:5173

# Keep script running to maintain background processes
wait

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

# Get local IP address (macOS specific for WiFi interface en0)
IP=$(ipconfig getifaddr en0)

if [ -z "$IP" ]; then
    # Fallback to finding first non-loopback IP
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | cut -d\  -f2 | head -n1)
fi

# Open Client in Browser
echo "Opening Client..."
if [ -n "$IP" ]; then
    open "https://$IP:5173"
else
    open "https://localhost:5173"
fi

# Show Mobile Connection QR Code
./scripts/mobile_connect.sh

# Keep script running to maintain background processes
wait

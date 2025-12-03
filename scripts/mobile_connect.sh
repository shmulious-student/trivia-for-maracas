#!/bin/bash

# Get local IP address (macOS specific for WiFi interface en0)
IP=$(ipconfig getifaddr en0)

if [ -z "$IP" ]; then
    # Fallback to finding first non-loopback IP
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | cut -d\  -f2 | head -n1)
fi

if [ -z "$IP" ]; then
    echo "Could not determine local IP address."
    exit 1
fi

# Construct the URL
APP_URL="https://$IP:5173"

echo "========================================================"
echo "📱 Mobile Testing Connection"
echo "========================================================"
echo "Ensure your mobile device is on the same WiFi network."
echo "Scan the QR code below to open the app:"
echo ""
echo "URL: $APP_URL"
echo ""

# Generate QR code using node script for better control
node -e "require('qrcode-terminal').generate('$APP_URL', {small: true})"

echo ""
echo "========================================================"

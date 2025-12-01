#!/bin/bash

echo "Cleaning up background processes..."

# Kill Playwright/Node processes related to tests
pkill -f "playwright"
pkill -f "run-driver"

# Find and kill processes on common development ports (excluding 5000 which is often system)
# Port 3000 (React/Node)
lsof -ti:3000 | xargs kill -9 2>/dev/null
# Port 5000 (Flask/Python)
lsof -ti:5000 | xargs kill -9 2>/dev/null
# Port 5173 (Vite)
lsof -ti:5173 | xargs kill -9 2>/dev/null
# Port 8000 (Python/Django)
lsof -ti:8000 | xargs kill -9 2>/dev/null
# Port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null

echo "Cleanup finished."

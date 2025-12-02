#!/bin/bash
# Exit on error
set -e

echo "Installing dependencies..."
# Install all dependencies including devDependencies (needed for vite, tsc, etc.)
# and ensure we are at the root
npm install --include=dev

echo "Building shared..."
npm run build --workspace=shared

echo "Building server..."
npm run build --workspace=server

echo "Building client..."
npm run build --workspace=client

echo "Building backoffice..."
npm run build --workspace=backoffice

echo "Build complete!"

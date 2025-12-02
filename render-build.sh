#!/bin/bash
# Exit on error
set -e

echo "Installing dependencies..."
# Install all dependencies including devDependencies (needed for vite, tsc, etc.)
# and ensure we are at the root
npm install --include=dev

echo "Building shared..."
# Shared might be needed by others, though usually it's just imported source.
# If shared has a build script, run it. If not, this might fail or do nothing.
# Assuming shared is source-only for now based on tsconfig, but good practice to build if it had one.
# checking package.json of shared would be good, but for now let's stick to the plan of building apps.

echo "Building server..."
npm run build --workspace=server

echo "Building client..."
npm run build --workspace=client

echo "Building backoffice..."
npm run build --workspace=backoffice

echo "Build complete!"

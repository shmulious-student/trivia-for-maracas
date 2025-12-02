#!/bin/bash
echo "Building server..."
cd server
npm install
npm run build
cd ..

echo "Building client..."
cd client
npm install
npm run build
cd ..

echo "Building backoffice..."
cd backoffice
npm install
npm run build
cd ..

echo "Build complete!"

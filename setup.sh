#!/bin/bash

# Clinic Management System - Quick Start Script
echo "🏥 Clinic Management System - Setup Script"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Firebase CLI is installed globally
if ! command -v firebase &> /dev/null; then
    echo "🔧 Installing Firebase CLI globally..."
    npm install -g firebase-tools
fi

echo "✅ Dependencies installed successfully"

# Instructions
echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Set up Firebase project (see FIREBASE_SETUP.md)"
echo "2. Update js/config.js with your Firebase configuration"
echo "3. Run 'npm start' to start the development server"
echo ""
echo "📚 Documentation:"
echo "- README.md - Project overview and usage"
echo "- FIREBASE_SETUP.md - Firebase configuration guide"
echo "- DEVELOPMENT.md - Development guidelines"
echo "- API_DOCUMENTATION.md - Database and API reference"
echo ""
echo "🚀 Ready to start developing!"

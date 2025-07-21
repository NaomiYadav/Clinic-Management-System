@echo off
REM Clinic Management System - Quick Start Script for Windows
echo 🏥 Clinic Management System - Setup Script
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if Firebase CLI is installed globally
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔧 Installing Firebase CLI globally...
    npm install -g firebase-tools
)

echo ✅ Dependencies installed successfully
echo.
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo 1. Set up Firebase project (see FIREBASE_SETUP.md)
echo 2. Update js/config.js with your Firebase configuration
echo 3. Run 'npm start' to start the development server
echo.
echo 📚 Documentation:
echo - README.md - Project overview and usage
echo - FIREBASE_SETUP.md - Firebase configuration guide
echo - DEVELOPMENT.md - Development guidelines
echo - API_DOCUMENTATION.md - Database and API reference
echo.
echo 🚀 Ready to start developing!
pause

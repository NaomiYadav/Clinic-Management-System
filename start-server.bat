@echo off
echo Starting Clinic Management System Local Server...
echo.
echo Make sure you're in the project root directory!
echo Current directory: %CD%
echo.

REM Check if index.html exists in current directory
if not exist "index.html" (
    echo ERROR: index.html not found in current directory!
    echo Please navigate to the Clinic-Management-System root folder first.
    echo.
    pause
    exit /b 1
)

REM Check if css and js folders exist
if not exist "css" (
    echo ERROR: css folder not found!
    echo Please make sure you're in the correct directory.
    pause
    exit /b 1
)

if not exist "js" (
    echo ERROR: js folder not found!
    echo Please make sure you're in the correct directory.
    pause
    exit /b 1
)

echo ✅ Directory structure looks correct!
echo.
echo ========================================
echo   CLINIC MANAGEMENT SYSTEM SERVER
echo ========================================
echo.
echo Instructions:
echo 1. Use VS Code Live Server extension (recommended)
echo 2. Right-click on index.html and select "Open with Live Server"
echo 3. Or manually open index.html in your browser
echo.
echo Files in this directory:
dir /b *.html
echo.
echo Press any key to open index.html in your default browser...
pause >nul

start index.html

echo.
echo If the page doesn't work properly:
echo - Use VS Code Live Server instead
echo - Check browser console for errors
echo - Make sure Firebase is configured correctly
echo.
pause

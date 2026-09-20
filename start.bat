@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
) else if exist "%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe" (
    set "NODE_CMD=%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe"
) else if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
) else (
    echo Error: Node.js was not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting Hatch server...
echo Customer site: http://localhost:3001
echo Admin dashboard: http://localhost:3001/admin (user: hatch / password: changeme)
echo Press Ctrl+C to stop the server.
echo.

start "" http://localhost:3001
"%NODE_CMD%" server.js
pause

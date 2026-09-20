@echo off
title Hatch Customer App — Desktop
cd /d "%~dp0"

echo ===================================================
echo     Hatch Customer App — Food Delivery ^& Dining
echo ===================================================
echo.

:: Check if server is already running on port 3001
powershell -Command "try { $r = Invoke-RestMethod -Uri 'http://localhost:3001/health' -TimeoutSec 1; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Hatch Backend Server is already active on port 3001.
) else (
    echo [STARTING] Launching Hatch Backend Server...
    start /b "" powershell -WindowStyle Hidden -Command "& 'C:\Users\Shaik.Jubair\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe' server.js"
    timeout /t 2 >nul
)

echo [LAUNCH] Opening Hatch Customer Desktop App...
:: Launch in dedicated borderless application window mode using Edge or Chrome
start msedge --app=http://localhost:3001 --window-size=1300,840 2>nul || start chrome --app=http://localhost:3001 --window-size=1300,840 2>nul || start http://localhost:3001

exit

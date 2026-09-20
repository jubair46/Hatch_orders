@echo off
title Hatch Partner ^& Kitchen POS Console — Desktop
cd /d "%~dp0"

echo ===================================================
echo     Hatch Partner ^& Kitchen POS — Desktop Console
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

echo [LAUNCH] Opening Hatch Owner ^& POS Console...
:: Launch in dedicated borderless application window mode
start msedge --app=http://localhost:3001/admin --window-size=1400,900 2>nul || start chrome --app=http://localhost:3001/admin --window-size=1400,900 2>nul || start http://localhost:3001/admin

exit

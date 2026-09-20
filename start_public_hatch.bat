@echo off
title Hatch Luxury Food Hall - Server & Public Cloudflare Tunnel
echo ==========================================================
echo Starting Hatch Orders Backend & Global Public HTTPS Tunnel
echo ==========================================================
echo.

set NODE_EXE="C:\Users\Shaik.Jubair\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe"
if not exist %NODE_EXE% set NODE_EXE=node

start "Hatch Backend Server" %NODE_EXE% server.js
timeout /t 2 /nobreak >nul

if exist cloudflared.exe (
  echo Launching Cloudflare Public HTTPS Tunnel...
  .\cloudflared.exe tunnel --url http://127.0.0.1:3001
) else (
  echo Local server running at http://localhost:3001
  pause
)

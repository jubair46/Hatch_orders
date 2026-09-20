@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==============================================
echo   Hatch Orders - Push to GitHub
echo ==============================================
echo.

git status --porcelain > "%TEMP%\git_status.tmp"
set "HAS_CHANGES="
for /f "delims=" %%i in ("%TEMP%\git_status.tmp") do set "HAS_CHANGES=1"
if exist "%TEMP%\git_status.tmp" del "%TEMP%\git_status.tmp"

if not defined HAS_CHANGES (
    echo No uncommitted local changes detected.
    echo Checking for unpushed commits...
    git push origin main
    goto finish
)

echo Changes detected:
git status -s
echo.
set "commit_msg="
set /p "commit_msg=Enter commit message (press Enter for default): "

if "!commit_msg!"=="" (
    set "commit_msg=Update Hatch cafe code and configuration"
)

echo.
echo [1/3] Staging files...
git add .

echo [2/3] Committing changes...
git commit -m "!commit_msg!"

echo [3/3] Pushing to GitHub (main)...
git push origin main

:finish
if %errorlevel% equ 0 (
    echo.
    echo ==============================================
    echo  Successfully pushed to GitHub!
    echo  Repo: https://github.com/jubair46/Hatch_orders
    echo ==============================================
) else (
    echo.
    echo Push encountered an issue. Check your connection or GitHub permissions.
)

echo.
pause

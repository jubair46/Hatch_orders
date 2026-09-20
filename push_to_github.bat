@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo  Pushing Hatch_orders to GitHub (main branch)
echo ==============================================
echo.
echo If prompted, complete the one-time GitHub sign-in in your browser.
echo.

git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ==============================================
    echo  Successfully pushed to GitHub!
    echo  Repo: https://github.com/jubair46/Hatch_orders
    echo ==============================================
) else (
    echo.
    echo Push failed. If you need to use a Personal Access Token, run:
    echo   git push https://YOUR_GITHUB_TOKEN@github.com/jubair46/Hatch_orders.git main
)

echo.
pause

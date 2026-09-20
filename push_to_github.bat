@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo  Push Hatch_orders to GitHub
echo ==============================================
echo.

git push origin main
if %errorlevel% equ 0 goto success

echo.
echo --------------------------------------------------------
echo GitHub authentication is needed to push your code.
echo.
echo Choose an option:
echo   [1] Sign in via Browser (Opens GitHub sign-in page)
echo   [2] Paste a GitHub Personal Access Token (PAT)
echo   [3] Exit
echo --------------------------------------------------------
set /p choice="Enter choice (1, 2, or 3): "

if "%choice%"=="1" (
    echo.
    echo Launching GitHub sign-in in your browser...
    git credential-manager github login
    echo.
    echo Retrying git push...
    git push origin main
    if %errorlevel% equ 0 goto success
)

if "%choice%"=="2" (
    echo.
    echo To create a token:
    echo   1. Visit: https://github.com/settings/tokens
    echo   2. Click "Generate new token (classic)"
    echo   3. Select the "repo" checkbox and click "Generate token"
    echo.
    set /p token="Paste your GitHub Token: "
    if not "%token%"=="" (
        git push https://%token%@github.com/jubair46/Hatch_orders.git main
        if %errorlevel% equ 0 goto success
    )
)

echo.
echo Push was not completed.
goto end

:success
echo.
echo ==============================================
echo  Successfully pushed to GitHub!
echo  Repo: https://github.com/jubair46/Hatch_orders
echo ==============================================

:end
echo.
pause


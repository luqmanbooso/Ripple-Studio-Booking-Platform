@echo off
echo.
echo ============================================================
echo   PayHere Webhook Quick Setup
echo ============================================================
echo.

echo Checking ngrok installation...
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ngrok is not installed!
    echo.
    echo Install ngrok using npm:
    echo   npm install -g ngrok
    echo.
    echo Or download from: https://ngrok.com/download
    echo.
    pause
    exit /b 1
)

echo [OK] ngrok is installed
echo.

echo ============================================================
echo   Quick Start Instructions
echo ============================================================
echo.
echo 1. Start your server in one terminal:
echo    npm run dev
echo.
echo 2. Run this in another terminal to start ngrok:
echo    ngrok http 5000
echo.
echo 3. Copy the https URL from ngrok (e.g., https://abc123.ngrok.io)
echo.
echo 4. Update your .env file:
echo    SERVER_URL=https://your-ngrok-url
echo.
echo 5. Update PayHere Dashboard:
echo    Settings ^> API Configuration ^> Notify URL
echo    Set to: https://your-ngrok-url/api/webhooks/payhere
echo.
echo 6. Restart your server
echo.
echo ============================================================
echo.

set /p start="Start ngrok now? (y/n): "
if /i "%start%"=="y" (
    echo.
    echo Starting ngrok... Keep this window open!
    echo Copy the https forwarding URL shown below.
    echo.
    timeout /t 2 >nul
    ngrok http 5000
) else (
    echo.
    echo Remember to start ngrok manually: ngrok http 5000
    echo.
    pause
)

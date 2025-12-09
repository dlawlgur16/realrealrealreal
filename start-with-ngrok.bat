@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Karrot Booster - NGROK Auto Launch
echo ========================================
echo.
echo [*] Backend + ngrok + Mobile App starting...
echo.

cd /d "%~dp0"

REM ============================================
REM 1. Check ngrok installation
REM ============================================
echo [1/6] Checking ngrok installation...

if exist "%~dp0ngrok.exe" (
    set NGROK_CMD=%~dp0ngrok.exe
    echo [OK] ngrok found - local
    goto :ngrok_installed
)

where ngrok >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set NGROK_CMD=ngrok
    echo [OK] ngrok found - system
    goto :ngrok_installed
)

echo.
echo [ERROR] ngrok is not installed!
echo.
echo Quick install: Run install-ngrok.bat
echo    OR
echo Manual install:
echo    1. Visit https://ngrok.com/download
echo    2. Download Windows 64-bit
echo    3. Extract and copy ngrok.exe to this folder
echo.
echo Run this script again after installation!
echo.
pause
exit /b 1

:ngrok_installed
echo.

REM ============================================
REM 2. Check ngrok authentication
REM ============================================
echo [2/6] Checking ngrok authentication...

set NGROK_CONFIG=%LOCALAPPDATA%\ngrok\ngrok.yml
if not exist "%NGROK_CONFIG%" (
    set NGROK_CONFIG=%USERPROFILE%\.ngrok2\ngrok.yml
)

if not exist "%NGROK_CONFIG%" (
    echo.
    echo [WARNING] ngrok auth token is not configured!
    echo.
    
    set NGROK_TOKEN=
    if exist .env (
        echo [OK] Checking NGROK_AUTHTOKEN in .env file...
        for /f "tokens=2 delims==" %%a in ('findstr /i /c:"NGROK_AUTHTOKEN" .env 2^>nul') do (
            set "NGROK_TOKEN=%%a"
            set "NGROK_TOKEN=!NGROK_TOKEN:"=!"
            for /f "tokens=*" %%b in ("!NGROK_TOKEN!") do set "NGROK_TOKEN=%%b"
        )
    )
    
    if "!NGROK_TOKEN!"=="" (
        echo.
        echo 1. Visit https://dashboard.ngrok.com/signup - free
        echo 2. Login with Google or GitHub
        echo 3. Visit https://dashboard.ngrok.com/get-started/your-authtoken
        echo 4. Copy the auth token
        echo 5. Add NGROK_AUTHTOKEN=YOUR_TOKEN to .env file
        echo.
        set /p NGROK_TOKEN="Enter auth token or press Enter to skip: "
    ) else (
        echo [OK] NGROK_AUTHTOKEN found in .env file!
    )

    if not "!NGROK_TOKEN!"=="" (
        "!NGROK_CMD!" config add-authtoken "!NGROK_TOKEN!"
        if !errorlevel! equ 0 (
            echo [OK] Auth token configured!
        ) else (
            echo [ERROR] Token configuration failed. Please configure manually:
            echo    "!NGROK_CMD!" config add-authtoken YOUR_TOKEN
            pause
            exit /b 1
        )
    ) else (
        echo [!] Warning: Continuing without authentication - limited features
    )
) else (
    echo [OK] ngrok authentication verified
)
echo.

REM ============================================
REM 3. Check virtual environment
REM ============================================
echo [3/6] Checking virtual environment...

if exist venv\Scripts\activate.bat (
    echo [OK] Virtual environment found, activating...
    call venv\Scripts\activate.bat
) else (
    echo [!] No virtual environment found. Creating new one...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo [OK] Installing dependencies...
    pip install -r requirements.txt
)
echo.

REM ============================================
REM 4. Check environment variables
REM ============================================
echo [4/6] Checking environment variables...

if "%GEMINI_API_KEY%"=="" (
    if exist .env (
        echo [OK] Loading environment variables from .env file
    ) else (
        echo.
        echo [WARNING] GEMINI_API_KEY is not configured!
        echo.
        set /p API_KEY="Enter Gemini API key: "
        echo GEMINI_API_KEY=!API_KEY!> .env
        echo [OK] Saved to .env file!
    )
) else (
    echo [OK] GEMINI_API_KEY verified
)
echo.

REM ============================================
REM 5. Start backend server
REM ============================================
echo [5/6] Starting backend server...
echo.
echo Backend server will run in a new window.
echo Server address: http://localhost:8000
echo.

start "Karrot Booster - Backend" cmd /k "cd /d %~dp0 && call venv\Scripts\activate.bat && python run.py"

echo Waiting for backend server initialization...
timeout /t 5 /nobreak >nul
echo.

REM ============================================
REM 6. Start ngrok tunnel
REM ============================================
echo [6/6] Starting ngrok tunnel...
echo.
echo ngrok will run in a new window.
echo ngrok web interface: http://localhost:4040
echo.

start "Karrot Booster - ngrok" cmd /k "!NGROK_CMD! http 8000"

echo Waiting for ngrok tunnel initialization...
timeout /t 5 /nobreak >nul
echo.

REM ============================================
REM 7. Prepare and run mobile app
REM ============================================
echo [7/7] Preparing mobile app...
echo.

cd /d "%~dp0mobile"

if not exist node_modules (
    echo [!] node_modules not found. Running npm install...
    call npm install
) else (
    echo [OK] node_modules found
)

echo.
echo [OK] Auto-configuring API URL - detecting ngrok URL...
timeout /t 3 /nobreak >nul
node scripts\setup-api-url.js
echo.

echo.
echo ========================================
echo    All services started successfully!
echo ========================================
echo.
echo Running services:
echo   [OK] Backend server: http://localhost:8000
echo   [OK] ngrok tunnel: http://localhost:4040 - Web UI
echo.
echo.
echo ========================================
echo    Starting mobile app - Tunnel mode
echo ========================================
echo.
echo Starting Expo in tunnel mode - internet connection
echo.
echo In a moment - 30sec to 1min:
echo   1. Browser will open with Expo DevTools
echo   2. QR code will appear in this window
echo   3. Scan QR code with Expo Go app on your phone
echo.
echo [TIP] If you do not have Expo Go:
echo   - Android: Install Expo Go from Play Store
echo   - iOS: Install Expo Go from App Store
echo.
echo [TIP] To exit: Ctrl+C - close all windows
echo.
echo Starting...
timeout /t 3 /nobreak >nul
echo.

set CI=true
call npm run start:tunnel

echo.
echo Mobile app has stopped.
echo Backend server and ngrok are still running.
echo.
pause

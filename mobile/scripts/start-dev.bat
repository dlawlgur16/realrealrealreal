@echo off
echo ========================================
echo   당근 부스터 모바일 앱 개발 서버 시작
echo ========================================
echo.

REM 프로젝트 루트로 이동
cd /d %~dp0\..

REM 백엔드 서버 실행 확인
echo [1/3] 백엔드 서버 확인 중...
netstat -ano | findstr :8000 >nul
if %errorlevel% neq 0 (
    echo ⚠️  백엔드 서버가 실행되지 않았습니다.
    echo    백엔드 서버를 먼저 실행해주세요: python run.py
    echo.
    pause
    exit /b 1
)
echo ✅ 백엔드 서버가 실행 중입니다.

REM API URL 자동 설정
echo.
echo [2/3] API URL 자동 설정 중...
cd mobile
node scripts\setup-api-url.js
if %errorlevel% neq 0 (
    echo ⚠️  API URL 설정에 실패했습니다.
    pause
    exit /b 1
)

REM Expo 서버 시작
echo.
echo [3/3] Expo 개발 서버 시작 중...
echo.
npx expo start

pause


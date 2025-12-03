@echo off
chcp 65001 >nul
title ngrok 설정 고치기
color 0B

echo ========================================
echo   ngrok 설정 초기화 및 재설정
echo ========================================
echo.

REM 모든 가능한 ngrok 설정 파일 삭제
echo [1/3] 기존 설정 파일 삭제 중...

set CONFIG1=%USERPROFILE%\.ngrok2\ngrok.yml
set CONFIG2=%APPDATA%\ngrok\ngrok.yml
set CONFIG3=%LOCALAPPDATA%\ngrok\ngrok.yml

if exist "%CONFIG1%" (
    echo    삭제: %CONFIG1%
    del "%CONFIG1%"
)

if exist "%CONFIG2%" (
    echo    삭제: %CONFIG2%
    del "%CONFIG2%"
)

if exist "%CONFIG3%" (
    echo    삭제: %CONFIG3%
    del "%CONFIG3%"
)

echo ✅ 설정 파일 삭제 완료!
echo.

REM 프로젝트 루트로 이동
cd /d "%~dp0"

REM ngrok 경로 확인
set NGROK_CMD=
if exist "ngrok.exe" (
    set NGROK_CMD=ngrok.exe
) else (
    where ngrok >nul 2>&1
    if %errorlevel% equ 0 (
        set NGROK_CMD=ngrok
    )
)

if "%NGROK_CMD%"=="" (
    echo ❌ ngrok.exe를 찾을 수 없습니다!
    pause
    exit /b 1
)

echo [2/3] ngrok 인증 토큰 설정
echo.
echo 인증 토큰을 받으려면:
echo 1. https://dashboard.ngrok.com/signup 접속 (무료)
echo 2. Google/GitHub로 로그인
echo 3. https://dashboard.ngrok.com/get-started/your-authtoken 접속
echo 4. 인증 토큰 복사
echo.
set /p TOKEN="인증 토큰을 입력하세요: "

if "%TOKEN%"=="" (
    echo.
    echo ❌ 토큰이 입력되지 않았습니다.
    pause
    exit /b 1
)

echo.
echo [3/3] 토큰 설정 중...
"%NGROK_CMD%" config add-authtoken %TOKEN%

if %errorlevel% equ 0 (
    echo.
    echo ✅ 인증 토큰이 성공적으로 설정되었습니다!
    echo.
    echo 이제 다음 명령어로 테스트하세요:
    echo   ngrok.exe http 8000
    echo.
) else (
    echo.
    echo ❌ 토큰 설정에 실패했습니다.
    echo    토큰이 올바른지 확인하세요.
    echo.
)

pause


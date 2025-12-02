@echo off
chcp 65001 >nul
echo ========================================
echo    당근 부스터 - NGROK 완전 자동 실행
echo    Karrot Booster - Full Auto Launch
echo ========================================
echo.
echo 🚀 백엔드 + ngrok + 모바일 앱을 모두 시작합니다!
echo.

REM 현재 디렉토리 확인
cd /d "%~dp0"

REM ============================================
REM 1. ngrok 설치 확인
REM ============================================
echo [1/6] ngrok 설치 확인 중...

REM 로컬 ngrok 확인
if exist "%~dp0ngrok.exe" (
    set NGROK_CMD=%~dp0ngrok.exe
    echo ✅ ngrok 발견 (로컬)
    goto :ngrok_installed
)

REM 시스템 ngrok 확인
where ngrok >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set NGROK_CMD=ngrok
    echo ✅ ngrok 발견 (시스템)
    goto :ngrok_installed
)

REM ngrok이 없음
echo.
echo ❌ ngrok이 설치되어 있지 않습니다!
echo.
echo 🚀 간편 설치: install-ngrok.bat 실행
echo    또는
echo 📥 수동 설치:
echo    1. https://ngrok.com/download 접속
echo    2. Windows 64-bit 다운로드
echo    3. 압축 해제 후 ngrok.exe를 이 폴더에 복사
echo.
echo 설치 후 이 스크립트를 다시 실행하세요!
echo.
pause
exit /b 1

:ngrok_installed
echo.

REM ============================================
REM 2. ngrok 인증 확인
REM ============================================
echo [2/6] ngrok 인증 확인 중...

REM ngrok 설정 파일 확인 (Windows의 경우)
set NGROK_CONFIG=%USERPROFILE%\.ngrok2\ngrok.yml
if not exist "%NGROK_CONFIG%" (
    echo.
    echo ⚠️  ngrok 인증 토큰이 설정되지 않았습니다!
    echo.
    echo 1. https://dashboard.ngrok.com/signup 접속 (무료)
    echo 2. Google/GitHub로 로그인
    echo 3. https://dashboard.ngrok.com/get-started/your-authtoken 접속
    echo 4. 인증 토큰 복사
    echo.
    set /p NGROK_TOKEN="인증 토큰을 입력하세요 (또는 Enter로 건너뛰기): "

    if not "!NGROK_TOKEN!"=="" (
        "%NGROK_CMD%" config add-authtoken !NGROK_TOKEN!
        echo ✅ 인증 토큰이 설정되었습니다!
    ) else (
        echo ! 경고: 인증 없이 계속합니다 (제한된 기능)
    )
) else (
    echo ✅ ngrok 인증 확인됨
)
echo.

REM ============================================
REM 3. 가상환경 확인 및 활성화
REM ============================================
echo [3/6] 가상환경 확인 중...

if exist venv\Scripts\activate.bat (
    echo ✅ 가상환경 발견, 활성화 중...
    call venv\Scripts\activate.bat
) else (
    echo ! 가상환경이 없습니다. 새로 생성합니다...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo ✅ 의존성 설치 중...
    pip install -r requirements.txt
)
echo.

REM ============================================
REM 4. 환경변수 확인
REM ============================================
echo [4/6] 환경변수 확인 중...

if "%GEMINI_API_KEY%"=="" (
    if exist .env (
        echo ✅ .env 파일에서 환경변수 로드
    ) else (
        echo.
        echo ⚠️  GEMINI_API_KEY가 설정되지 않았습니다!
        echo.
        set /p API_KEY="Gemini API 키를 입력하세요: "
        echo GEMINI_API_KEY=!API_KEY!> .env
        echo ✅ .env 파일에 저장되었습니다!
    )
) else (
    echo ✅ GEMINI_API_KEY 확인됨
)
echo.

REM ============================================
REM 5. 백엔드 서버 시작
REM ============================================
echo [5/6] 백엔드 서버 시작 중...
echo.
echo 백엔드 서버가 새 창에서 실행됩니다.
echo 서버 주소: http://localhost:8000
echo.

start "당근 부스터 - 백엔드 서버" cmd /k "cd /d "%~dp0" && venv\Scripts\activate.bat && python run.py"

REM 서버 시작 대기
echo 백엔드 서버 초기화 대기 중...
timeout /t 5 /nobreak >nul
echo.

REM ============================================
REM 6. ngrok 터널 시작
REM ============================================
echo [6/6] ngrok 터널 시작 중...
echo.
echo ngrok이 새 창에서 실행됩니다.
echo ngrok 웹 인터페이스: http://localhost:4040
echo.

start "당근 부스터 - ngrok 터널" cmd /k ""%NGROK_CMD%" http 8000"

REM ngrok 시작 대기
echo ngrok 터널 초기화 대기 중...
timeout /t 5 /nobreak >nul
echo.

REM ============================================
REM 7. 모바일 앱 준비 및 실행
REM ============================================
echo [7/7] 모바일 앱 준비 중...
echo.

cd mobile

REM node_modules 확인
if not exist node_modules (
    echo ! node_modules가 없습니다. npm install 실행 중...
    call npm install
)

REM API URL 자동 설정 (ngrok URL 감지)
echo.
echo ✅ API URL 자동 설정 중 (ngrok URL 감지)...
echo    ngrok 터널이 완전히 시작될 때까지 조금 더 대기 중...
timeout /t 3 /nobreak >nul
node scripts\setup-api-url.js
echo.

echo.
echo ========================================
echo    🎉 모든 서비스 시작 완료!
echo ========================================
echo.
echo 실행 중인 서비스:
echo   ✅ 백엔드 서버: http://localhost:8000
echo   ✅ ngrok 터널: http://localhost:4040 (웹 UI)
echo.
echo.
echo ========================================
echo    📱 모바일 앱 시작 중... (터널 모드)
echo ========================================
echo.
echo 🌐 Expo 터널 모드로 시작합니다 (인터넷 연결)
echo.
echo 잠시 후 (30초-1분 소요):
echo   1. 브라우저가 열리고 Expo DevTools 표시
echo   2. 이 창에 QR 코드가 나타납니다
echo   3. 스마트폰 Expo Go 앱으로 QR 코드 스캔
echo.
echo 💡 Expo Go 앱이 없다면:
echo   - Android: Play Store에서 "Expo Go" 설치
echo   - iOS: App Store에서 "Expo Go" 설치
echo.
echo 💡 참고:
echo   - 터널 모드는 초기화에 시간이 걸립니다
echo   - ngrok과 Expo 터널 모두 인터넷을 통해 연결됩니다
echo   - QR 코드를 스캔하면 어디서든 앱 실행 가능!
echo.
echo 💡 종료: Ctrl+C (모든 창 닫기)
echo.
echo 시작합니다...
timeout /t 3 /nobreak >nul
echo.

REM 모바일 앱 시작 (터널 모드)
call npm run start:tunnel

REM 종료 시
echo.
echo 모바일 앱이 종료되었습니다.
echo 백엔드 서버와 ngrok은 여전히 실행 중입니다.
echo.
pause

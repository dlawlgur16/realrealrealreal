@echo off
chcp 65001 >nul
echo ========================================
echo    ngrok 자동 설치
echo ========================================
echo.

REM 현재 디렉토리 확인
cd /d "%~dp0"

echo ngrok을 다운로드하고 설치합니다...
echo.

REM ngrok이 이미 설치되어 있는지 확인
where ngrok >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ ngrok이 이미 설치되어 있습니다!
    ngrok version
    goto :configure
)

REM 임시 디렉토리 생성
set TEMP_DIR=%TEMP%\ngrok-install
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

echo [1/3] ngrok 다운로드 중...
echo.

REM PowerShell로 ngrok 다운로드
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile '%TEMP_DIR%\ngrok.zip'}"

if not exist "%TEMP_DIR%\ngrok.zip" (
    echo ❌ 다운로드 실패!
    echo.
    echo 수동 설치 방법:
    echo 1. https://ngrok.com/download 접속
    echo 2. Windows 64-bit 다운로드
    echo 3. 압축 해제 후 ngrok.exe를 이 폴더에 복사
    pause
    exit /b 1
)

echo ✅ 다운로드 완료!
echo.

echo [2/3] ngrok 압축 해제 중...
echo.

REM PowerShell로 압축 해제
powershell -Command "& {Expand-Archive -Path '%TEMP_DIR%\ngrok.zip' -DestinationPath '%TEMP_DIR%' -Force}"

if not exist "%TEMP_DIR%\ngrok.exe" (
    echo ❌ 압축 해제 실패!
    pause
    exit /b 1
)

echo ✅ 압축 해제 완료!
echo.

echo [3/3] ngrok 설치 중...
echo.

REM 프로젝트 폴더에 복사
copy "%TEMP_DIR%\ngrok.exe" "%~dp0ngrok.exe" >nul

if not exist "%~dp0ngrok.exe" (
    echo ❌ 설치 실패!
    pause
    exit /b 1
)

REM 임시 파일 정리
rd /s /q "%TEMP_DIR%" 2>nul

echo ✅ ngrok이 성공적으로 설치되었습니다!
echo    위치: %~dp0ngrok.exe
echo.

REM PATH에 추가 (선택사항)
echo ngrok을 어디서든 사용하려면 PATH에 추가하세요:
echo   1. Windows 검색에서 "환경 변수" 입력
echo   2. "시스템 환경 변수 편집" 클릭
echo   3. "환경 변수" 버튼 클릭
echo   4. Path 변수에 "%~dp0" 추가
echo.

:configure
echo ========================================
echo    ngrok 인증 설정
echo ========================================
echo.

REM ngrok 설정 확인
set NGROK_CONFIG=%USERPROFILE%\.ngrok2\ngrok.yml
if exist "%NGROK_CONFIG%" (
    echo ✅ ngrok 인증이 이미 설정되어 있습니다!
    goto :done
)

echo ngrok 사용을 위해 무료 계정이 필요합니다.
echo.
echo 1. https://dashboard.ngrok.com/signup 접속 (무료)
echo 2. Google/GitHub로 로그인
echo 3. https://dashboard.ngrok.com/get-started/your-authtoken 접속
echo 4. 인증 토큰 복사
echo.

set /p NGROK_TOKEN="인증 토큰을 입력하세요 (또는 Enter로 건너뛰기): "

if "%NGROK_TOKEN%"=="" (
    echo.
    echo ! 나중에 다음 명령어로 설정하세요:
    echo   ngrok config add-authtoken YOUR_TOKEN
    goto :done
)

REM ngrok 실행 파일 경로
if exist "%~dp0ngrok.exe" (
    "%~dp0ngrok.exe" config add-authtoken %NGROK_TOKEN%
) else (
    ngrok config add-authtoken %NGROK_TOKEN%
)

echo.
echo ✅ 인증 토큰이 설정되었습니다!

:done
echo.
echo ========================================
echo    설치 완료!
echo ========================================
echo.
echo 이제 start-with-ngrok.bat를 실행하세요!
echo.
pause

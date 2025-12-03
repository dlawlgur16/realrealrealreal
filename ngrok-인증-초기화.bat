@echo off
chcp 65001 >nul
title ngrok 인증 초기화
color 0C

echo ========================================
echo   ngrok 인증 초기화
echo ========================================
echo.

REM ngrok 설정 파일 삭제
set NGROK_CONFIG=%USERPROFILE%\.ngrok2\ngrok.yml
if exist "%NGROK_CONFIG%" (
    echo 기존 ngrok 설정 파일 삭제 중...
    del "%NGROK_CONFIG%"
    echo ✅ 삭제 완료!
) else (
    echo ngrok 설정 파일이 없습니다.
)

echo.
echo 이제 start-with-ngrok.bat를 실행하면
echo 인증 토큰을 입력하라는 메시지가 나타납니다.
echo.
echo 인증 토큰 받는 방법:
echo 1. https://dashboard.ngrok.com/signup 접속 (무료)
echo 2. Google/GitHub로 로그인
echo 3. https://dashboard.ngrok.com/get-started/your-authtoken 접속
echo 4. 인증 토큰 복사
echo.
pause


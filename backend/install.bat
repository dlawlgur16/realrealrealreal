@echo off
echo ========================================
echo 의존성 설치 시작
echo ========================================
echo.

REM 가상환경 활성화 (있는 경우)
if exist venv\Scripts\activate.bat (
    echo 가상환경 활성화 중...
    call venv\Scripts\activate.bat
) else (
    echo 가상환경이 없습니다. 먼저 생성하세요:
    echo python -m venv venv
    pause
    exit /b 1
)

echo.
echo pip 업그레이드 중...
python -m pip install --upgrade pip

echo.
echo requirements.txt 설치 중...
pip install -r requirements.txt

echo.
echo ========================================
echo PyTorch CUDA 설치 (GPU 사용 시)
echo ========================================
echo.
echo CUDA 11.8 버전 PyTorch를 설치합니다...
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

echo.
echo ========================================
echo 설치 완료!
echo ========================================
pause


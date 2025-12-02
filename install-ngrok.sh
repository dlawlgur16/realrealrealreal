#!/bin/bash

echo "========================================"
echo "   ngrok 자동 설치 (macOS/Linux)"
echo "========================================"
echo

# 현재 디렉토리로 이동
cd "$(dirname "$0")"

# ngrok이 이미 설치되어 있는지 확인
if command -v ngrok &> /dev/null; then
    echo "✅ ngrok이 이미 설치되어 있습니다!"
    ngrok version
    echo
    read -p "계속해서 인증을 설정하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
    NGROK_CMD="ngrok"
else
    # OS 감지
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Darwin)
            echo "macOS 감지됨"
            if [ "$ARCH" = "arm64" ]; then
                DOWNLOAD_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-arm64.zip"
            else
                DOWNLOAD_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip"
            fi
            ;;
        Linux)
            echo "Linux 감지됨"
            if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
                DOWNLOAD_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.zip"
            else
                DOWNLOAD_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip"
            fi
            ;;
        *)
            echo "❌ 지원하지 않는 운영체제입니다: $OS"
            exit 1
            ;;
    esac

    echo
    echo "[1/3] ngrok 다운로드 중..."
    echo "URL: $DOWNLOAD_URL"
    echo

    # 임시 디렉토리 생성
    TEMP_DIR="/tmp/ngrok-install"
    mkdir -p "$TEMP_DIR"

    # curl로 다운로드
    if ! curl -L -o "$TEMP_DIR/ngrok.zip" "$DOWNLOAD_URL"; then
        echo "❌ 다운로드 실패!"
        echo
        echo "수동 설치 방법:"
        echo "1. https://ngrok.com/download 접속"
        echo "2. macOS/Linux 버전 다운로드"
        echo "3. 압축 해제 후 ngrok를 이 폴더에 복사"
        exit 1
    fi

    echo "✅ 다운로드 완료!"
    echo

    echo "[2/3] ngrok 압축 해제 중..."
    echo

    # unzip으로 압축 해제
    if ! unzip -o "$TEMP_DIR/ngrok.zip" -d "$TEMP_DIR"; then
        echo "❌ 압축 해제 실패!"
        exit 1
    fi

    echo "✅ 압축 해제 완료!"
    echo

    echo "[3/3] ngrok 설치 중..."
    echo

    # 프로젝트 폴더에 복사
    cp "$TEMP_DIR/ngrok" "./ngrok"
    chmod +x "./ngrok"

    # 임시 파일 정리
    rm -rf "$TEMP_DIR"

    if [ ! -f "./ngrok" ]; then
        echo "❌ 설치 실패!"
        exit 1
    fi

    echo "✅ ngrok이 성공적으로 설치되었습니다!"
    echo "   위치: $(pwd)/ngrok"
    echo

    NGROK_CMD="./ngrok"
fi

# ngrok 인증 설정
echo "========================================"
echo "   ngrok 인증 설정"
echo "========================================"
echo

# ngrok 설정 파일 확인
NGROK_CONFIG="$HOME/.ngrok2/ngrok.yml"
if [ -f "$NGROK_CONFIG" ]; then
    echo "✅ ngrok 인증이 이미 설정되어 있습니다!"
    echo
    read -p "종료하려면 Enter를 누르세요..."
    exit 0
fi

echo "ngrok 사용을 위해 무료 계정이 필요합니다."
echo
echo "1. https://dashboard.ngrok.com/signup 접속 (무료)"
echo "2. Google/GitHub로 로그인"
echo "3. https://dashboard.ngrok.com/get-started/your-authtoken 접속"
echo "4. 인증 토큰 복사"
echo

read -p "인증 토큰을 입력하세요 (또는 Enter로 건너뛰기): " NGROK_TOKEN

if [ -z "$NGROK_TOKEN" ]; then
    echo
    echo "! 나중에 다음 명령어로 설정하세요:"
    echo "  $NGROK_CMD config add-authtoken YOUR_TOKEN"
else
    $NGROK_CMD config add-authtoken "$NGROK_TOKEN"
    echo
    echo "✅ 인증 토큰이 설정되었습니다!"
fi

echo
echo "========================================"
echo "   설치 완료!"
echo "========================================"
echo
echo "이제 start-with-ngrok.sh를 실행하세요!"
echo

read -p "종료하려면 Enter를 누르세요..."

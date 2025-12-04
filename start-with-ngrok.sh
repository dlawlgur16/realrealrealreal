#!/bin/bash
# UTF-8 인코딩 설정
export LANG=ko_KR.UTF-8

echo "========================================"
echo "   당근 부스터 - NGROK 완전 자동 실행"
echo "   Karrot Booster - Full Auto Launch"
echo "========================================"
echo ""
echo "🚀 백엔드 + ngrok + 모바일 앱을 모두 시작합니다!"
echo ""

# 현재 디렉토리로 이동
cd "$(dirname "$0")"

# ============================================
# 1. ngrok 설치 확인
# ============================================
echo "[1/6] ngrok 설치 확인 중..."

# 로컬 ngrok 확인
if [ -f "./ngrok" ]; then
    NGROK_CMD="./ngrok"
    echo "✅ ngrok 발견 (로컬)"
# 시스템 ngrok 확인
elif command -v ngrok &> /dev/null; then
    NGROK_CMD="ngrok"
    echo "✅ ngrok 발견 (시스템)"
else
    echo ""
    echo "❌ ngrok이 설치되어 있지 않습니다!"
    echo ""
    echo "📥 설치 방법:"
    echo "   1. https://ngrok.com/download 접속"
    echo "   2. macOS 버전 다운로드"
    echo "   3. 압축 해제 후 ngrok를 이 폴더에 복사"
    echo ""
    echo "또는 Homebrew 사용:"
    echo "   brew install ngrok/ngrok/ngrok"
    echo ""
    echo "설치 후 이 스크립트를 다시 실행하세요!"
    echo ""
    exit 1
fi
echo ""

# ============================================
# 2. ngrok 인증 확인
# ============================================
echo "[2/6] ngrok 인증 확인 중..."

# ngrok 설정 파일 확인
NGROK_CONFIG="$HOME/Library/Application Support/ngrok/ngrok.yml"
if [ ! -f "$NGROK_CONFIG" ]; then
    NGROK_CONFIG="$HOME/.ngrok2/ngrok.yml"
fi

if [ ! -f "$NGROK_CONFIG" ]; then
    echo ""
    echo "⚠️  ngrok 인증 토큰이 설정되지 않았습니다!"
    echo ""

    # .env 파일에서 NGROK_AUTHTOKEN 읽기
    NGROK_TOKEN=""
    if [ -f ".env" ]; then
        echo "✅ .env 파일에서 NGROK_AUTHTOKEN 확인 중..."
        NGROK_TOKEN=$(grep -i "^NGROK_AUTHTOKEN" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)
    fi

    # .env에서 토큰을 찾지 못한 경우
    if [ -z "$NGROK_TOKEN" ]; then
        echo ""
        echo "1. https://dashboard.ngrok.com/signup 접속 (무료)"
        echo "2. Google/GitHub로 로그인"
        echo "3. https://dashboard.ngrok.com/get-started/your-authtoken 접속"
        echo "4. 인증 토큰 복사"
        echo "5. .env 파일에 NGROK_AUTHTOKEN=YOUR_TOKEN 형식으로 추가"
        echo ""
        read -p "인증 토큰을 입력하세요 (또는 Enter로 건너뛰기): " NGROK_TOKEN
    else
        echo "✅ .env 파일에서 NGROK_AUTHTOKEN 발견!"
    fi

    if [ -n "$NGROK_TOKEN" ]; then
        $NGROK_CMD config add-authtoken "$NGROK_TOKEN"
        if [ $? -eq 0 ]; then
            echo "✅ 인증 토큰이 설정되었습니다!"
        else
            echo "❌ 토큰 설정 실패. 수동으로 설정해주세요:"
            echo "   $NGROK_CMD config add-authtoken YOUR_TOKEN"
            exit 1
        fi
    else
        echo "! 경고: 인증 없이 계속합니다 (제한된 기능)"
    fi
else
    echo "✅ ngrok 인증 확인됨"
fi
echo ""

# ============================================
# 3. 가상환경 확인 및 활성화
# ============================================
echo "[3/6] 가상환경 확인 중..."

if [ -d "venv" ]; then
    echo "✅ 가상환경 발견, 활성화 중..."
    source venv/bin/activate
else
    echo "! 가상환경이 없습니다. 새로 생성합니다..."
    python3 -m venv venv
    source venv/bin/activate
    echo "✅ 의존성 설치 중..."
    pip install -r requirements.txt
fi
echo ""

# ============================================
# 4. 환경변수 확인
# ============================================
echo "[4/6] 환경변수 확인 중..."

if [ -z "$GEMINI_API_KEY" ]; then
    if [ -f ".env" ]; then
        echo "✅ .env 파일에서 환경변수 로드"
        export $(grep -v '^#' .env | xargs)
    else
        echo ""
        echo "⚠️  GEMINI_API_KEY가 설정되지 않았습니다!"
        echo ""
        read -p "Gemini API 키를 입력하세요: " API_KEY
        echo "GEMINI_API_KEY=$API_KEY" > .env
        export GEMINI_API_KEY=$API_KEY
        echo "✅ .env 파일에 저장되었습니다!"
    fi
else
    echo "✅ GEMINI_API_KEY 확인됨"
fi
echo ""

# ============================================
# 5. 백엔드 서버 시작
# ============================================
echo "[5/6] 백엔드 서버 시작 중..."
echo ""
echo "백엔드 서버가 새 터미널에서 실행됩니다."
echo "서버 주소: http://localhost:8000"
echo ""

# macOS에서 새 터미널 창 열기
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && source venv/bin/activate && python run.py"'

# 서버 시작 대기
echo "백엔드 서버 초기화 대기 중..."
sleep 5
echo ""

# ============================================
# 6. ngrok 터널 시작
# ============================================
echo "[6/6] ngrok 터널 시작 중..."
echo ""
echo "ngrok이 새 터미널에서 실행됩니다."
echo "ngrok 웹 인터페이스: http://localhost:4040"
echo ""

# ngrok 새 터미널에서 실행
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && '$NGROK_CMD' http 8000"'

# ngrok 시작 대기
echo "ngrok 터널 초기화 대기 중..."
sleep 5
echo ""

# ============================================
# 7. 모바일 앱 준비 및 실행
# ============================================
echo "[7/7] 모바일 앱 준비 중..."
echo ""

cd mobile

# node_modules 확인
if [ ! -d "node_modules" ]; then
    echo "! node_modules가 없습니다. npm install 실행 중..."
    npm install
fi

# API URL 자동 설정 (ngrok URL 감지)
echo ""
echo "✅ API URL 자동 설정 중 (ngrok URL 감지)..."
echo "   ngrok 터널이 완전히 시작될 때까지 조금 더 대기 중..."
sleep 3
node scripts/setup-api-url.js
echo ""

echo ""
echo "========================================"
echo "   🎉 모든 서비스 시작 완료!"
echo "========================================"
echo ""
echo "실행 중인 서비스:"
echo "  ✅ 백엔드 서버: http://localhost:8000"
echo "  ✅ ngrok 터널: http://localhost:4040 (웹 UI)"
echo ""
echo ""
echo "========================================"
echo "   📱 모바일 앱 시작 중... (터널 모드)"
echo "========================================"
echo ""
echo "🌐 Expo 터널 모드로 시작합니다 (인터넷 연결)"
echo ""
echo "잠시 후 (30초-1분 소요):"
echo "  1. 브라우저가 열리고 Expo DevTools 표시"
echo "  2. 이 창에 QR 코드가 나타납니다"
echo "  3. 스마트폰 Expo Go 앱으로 QR 코드 스캔"
echo ""
echo "💡 Expo Go 앱이 없다면:"
echo "  - Android: Play Store에서 \"Expo Go\" 설치"
echo "  - iOS: App Store에서 \"Expo Go\" 설치"
echo ""
echo "💡 참고:"
echo "  - 터널 모드는 초기화에 시간이 걸립니다"
echo "  - ngrok과 Expo 터널 모두 인터넷을 통해 연결됩니다"
echo "  - QR 코드를 스캔하면 어디서든 앱 실행 가능!"
echo ""
echo "💡 종료: Ctrl+C (모든 창 닫기)"
echo ""
echo "시작합니다..."
sleep 3
echo ""

# 모바일 앱 시작 (터널 모드)
npm run start:tunnel

# 종료 시
echo ""
echo "모바일 앱이 종료되었습니다."
echo "백엔드 서버와 ngrok은 여전히 실행 중입니다."
echo ""

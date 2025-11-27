#!/bin/bash

echo "========================================"
echo "  당근 부스터 모바일 앱 개발 서버 시작"
echo "========================================"
echo ""

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.."

# 백엔드 서버 실행 확인
echo "[1/3] 백엔드 서버 확인 중..."
if ! lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 && ! netstat -an | grep -q ":8000.*LISTEN"; then
    echo "⚠️  백엔드 서버가 실행되지 않았습니다."
    echo "   백엔드 서버를 먼저 실행해주세요: python run.py"
    echo ""
    exit 1
fi
echo "✅ 백엔드 서버가 실행 중입니다."

# API URL 자동 설정
echo ""
echo "[2/3] API URL 자동 설정 중..."
cd mobile
node scripts/setup-api-url.js
if [ $? -ne 0 ]; then
    echo "⚠️  API URL 설정에 실패했습니다."
    exit 1
fi

# Expo 서버 시작
echo ""
echo "[3/3] Expo 개발 서버 시작 중..."
echo ""
npx expo start


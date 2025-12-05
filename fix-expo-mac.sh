#!/bin/bash
# macOS에서 expo 의존성 문제 해결 스크립트

echo "========================================"
echo "   macOS Expo 의존성 수정 도구"
echo "========================================"
echo ""

cd "$(dirname "$0")/mobile"

echo "[1/5] 기존 node_modules 제거..."
rm -rf node_modules
rm -f package-lock.json
echo "✅ 완료"
echo ""

echo "[2/5] npm 캐시 정리..."
npm cache clean --force
echo "✅ 완료"
echo ""

echo "[3/5] 의존성 재설치..."
npm install
echo "✅ 완료"
echo ""

echo "[4/5] expo 의존성 수정..."
npx expo install --fix
echo "✅ 완료"
echo ""

echo "[5/5] 설치 확인..."
if npm list expo &> /dev/null; then
    echo "✅ expo 설치 확인됨"
else
    echo "⚠️  expo 설치 확인 실패"
    echo "   수동으로 설치를 시도합니다..."
    npm install expo@~54.0.25
fi
echo ""

echo "========================================"
echo "   🎉 수정 완료!"
echo "========================================"
echo ""
echo "이제 ./start-with-ngrok.sh 를 실행하세요."
echo ""

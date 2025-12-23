#!/bin/bash
# EC2 배포 자동화 스크립트

echo "========================================"
echo "   AWS EC2 배포 스크립트"
echo "========================================"
echo ""

# 설정 확인
if [ -z "$1" ]; then
    echo "사용법: ./deploy-to-ec2.sh <EC2_IP_ADDRESS>"
    echo "예시: ./deploy-to-ec2.sh 3.34.123.45"
    echo ""
    echo "또는 SSH 호스트명:"
    echo "  ./deploy-to-ec2.sh ec2-user@3.34.123.45"
    exit 1
fi

EC2_HOST=$1
SSH_KEY="${SSH_KEY:-$HOME/.ssh/karrot-booster-key.pem}"

# SSH 키 확인
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH 키를 찾을 수 없습니다: $SSH_KEY"
    echo ""
    echo "SSH_KEY 환경변수를 설정하거나 키 경로를 확인하세요:"
    echo "  export SSH_KEY=/path/to/your/key.pem"
    exit 1
fi

echo "🔑 SSH 키: $SSH_KEY"
echo "🖥️  EC2 호스트: $EC2_HOST"
echo ""

# SSH 연결 테스트
echo "[1/5] SSH 연결 테스트..."
if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "echo 'Connection OK'" &> /dev/null; then
    echo "✅ SSH 연결 성공!"
else
    echo "❌ SSH 연결 실패. EC2 IP와 SSH 키를 확인하세요."
    exit 1
fi
echo ""

# 프로젝트 파일 업로드
echo "[2/5] 프로젝트 파일 업로드 중..."
echo "백엔드 코드를 EC2로 전송합니다..."

# 임시 디렉토리 생성
ssh -i "$SSH_KEY" ubuntu@$EC2_HOST "mkdir -p ~/karrot-booster-deploy"

# 필요한 파일만 rsync로 전송
rsync -avz --progress \
  -e "ssh -i $SSH_KEY" \
  --exclude 'venv/' \
  --exclude 'node_modules/' \
  --exclude 'mobile/' \
  --exclude 'frontend/' \
  --exclude '.git/' \
  --exclude '__pycache__/' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  --exclude 'ngrok.exe' \
  --exclude '*.bat' \
  . ubuntu@$EC2_HOST:~/karrot-booster-deploy/

echo "✅ 파일 업로드 완료"
echo ""

# .env 파일 확인
echo "[3/5] 환경 변수 설정 확인..."
if [ -f ".env" ]; then
    echo "로컬 .env 파일을 EC2로 복사합니다..."
    scp -i "$SSH_KEY" .env ubuntu@$EC2_HOST:~/karrot-booster-deploy/.env
    echo "✅ .env 파일 전송 완료"
else
    echo "⚠️  .env 파일이 없습니다. EC2에서 수동으로 생성해야 합니다."
fi
echo ""

# Docker 이미지 빌드 및 실행
echo "[4/5] Docker 컨테이너 배포 중..."
ssh -i "$SSH_KEY" ubuntu@$EC2_HOST << 'ENDSSH'
cd ~/karrot-booster-deploy

echo "기존 컨테이너 중지 및 제거..."
docker stop karrot-booster 2>/dev/null || true
docker rm karrot-booster 2>/dev/null || true

echo "Docker 이미지 빌드 중..."
docker build -t karrot-booster:latest .

echo "Docker 컨테이너 실행 중..."
docker run -d \
  --name karrot-booster \
  -p 8000:8000 \
  --env-file .env \
  --restart unless-stopped \
  karrot-booster:latest

echo "컨테이너 상태 확인..."
sleep 3
docker ps | grep karrot-booster
ENDSSH

echo "✅ 배포 완료!"
echo ""

# 배포 확인
echo "[5/5] 배포 확인 중..."
echo "API 엔드포인트 테스트..."
sleep 2

if curl -s http://$EC2_HOST:8000/ | grep -q "당근 부스터"; then
    echo ""
    echo "========================================"
    echo "   ✅ 배포 성공!"
    echo "========================================"
    echo ""
    echo "백엔드 API URL:"
    echo "  http://$EC2_HOST:8000"
    echo ""
    echo "다음 단계:"
    echo "  1. 모바일 앱의 API_BASE_URL을 변경하세요:"
    echo "     mobile/src/services/api.js → http://$EC2_HOST:8000"
    echo ""
    echo "  2. Nginx 설정 (포트 번호 제거):"
    echo "     AWS-DEPLOYMENT-GUIDE.md 참고"
    echo ""
else
    echo "⚠️  API 응답을 확인할 수 없습니다."
    echo "서버 로그를 확인하세요:"
    echo "  ssh -i $SSH_KEY ubuntu@$EC2_HOST 'docker logs karrot-booster'"
fi
echo ""

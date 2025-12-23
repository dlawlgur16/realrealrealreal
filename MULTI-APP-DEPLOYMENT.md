# EC2에서 여러 앱 동시 배포 가이드

하나의 EC2 인스턴스에서 당근 부스터 + 다른 웹 앱을 동시에 실행하는 방법입니다.

---

## 📋 목차

1. [개요](#개요)
2. [방법 선택](#방법-선택)
3. [방법 1: 포트로 구분](#방법-1-포트로-구분-가장-간단)
4. [방법 2: 경로로 구분 (Nginx)](#방법-2-경로로-구분-nginx)
5. [방법 3: 도메인으로 구분](#방법-3-도메인으로-구분)
6. [메모리 모니터링](#메모리-모니터링)

---

## 개요

### 목표
하나의 t3.micro (1GB) EC2에서:
- 당근 부스터 백엔드 (FastAPI)
- 다른 웹 앱

을 동시에 실행

### 메모리 사용량 (실측)
```
당근 부스터: 232MB (피크)
다른 웹:     200MB (예상)
시스템:      250MB
--------------------------
총:          682MB
여유:        342MB (33%)
```

✅ **t3.micro (1GB)로 충분!**

---

## 방법 선택

| 방법 | URL 형태 | Nginx | 난이도 | 추천 |
|------|---------|-------|--------|------|
| **1. 포트 구분** | `http://IP:8000`<br>`http://IP:8001` | 불필요 | ⭐ 쉬움 | ✅ 추천 |
| **2. 경로 구분** | `http://IP/karrot/`<br>`http://IP/other/` | 필요 | ⭐⭐ 보통 | 프로덕션 |
| **3. 도메인 구분** | `http://karrot.com`<br>`http://other.com` | 필요 | ⭐⭐⭐ 어려움 | 장기 운영 |

---

## 방법 1: 포트로 구분 (가장 간단)

### 구조
```
EC2 인스턴스
├── 당근 부스터 → 포트 8000
└── 다른 앱     → 포트 8001
```

### 접속 URL
```
당근 부스터: http://YOUR_EC2_IP:8000
다른 앱:     http://YOUR_EC2_IP:8001
```

### 배포 방법

#### Step 1: EC2 보안 그룹 설정
AWS 콘솔에서 EC2 보안 그룹에 포트 추가:

| 유형 | 포트 | 소스 | 설명 |
|------|------|------|------|
| Custom TCP | 8000 | 0.0.0.0/0 | 당근 부스터 |
| Custom TCP | 8001 | 0.0.0.0/0 | 다른 앱 |

#### Step 2: 당근 부스터 배포
```bash
# EC2 접속
ssh -i ~/.ssh/karrot-booster-key.pem ubuntu@YOUR_EC2_IP

# 프로젝트 클론
git clone https://github.com/dlawlgur16/realrealrealreal.git
cd realrealrealreal

# 환경 변수 설정
nano .env
# GEMINI_API_KEY=your_key_here

# Docker 빌드 및 실행
docker build -t karrot-booster:latest .
docker run -d \
  --name karrot-booster \
  -p 8000:8000 \
  --env-file .env \
  --memory="300m" \
  --restart unless-stopped \
  karrot-booster:latest
```

#### Step 3: 다른 앱 배포
```bash
# 다른 앱 디렉토리로 이동
cd ~/other-app-directory

# 다른 앱 실행 (포트 8001)
docker run -d \
  --name other-app \
  -p 8001:8000 \
  --memory="200m" \
  --restart unless-stopped \
  your-other-app:latest
```

#### Step 4: 확인
```bash
# 당근 부스터 테스트
curl http://localhost:8000/

# 다른 앱 테스트
curl http://localhost:8001/

# 외부에서 테스트 (로컬 PC)
curl http://YOUR_EC2_IP:8000/
curl http://YOUR_EC2_IP:8001/
```

### 모바일 앱 설정
```javascript
// mobile/src/services/api.js
const API_BASE_URL = 'http://YOUR_EC2_IP:8000';
```

---

## 방법 2: 경로로 구분 (Nginx)

### 구조
```
Nginx (포트 80)
├── /karrot/ → 당근 부스터 (8000)
└── /other/  → 다른 앱 (8001)
```

### 접속 URL
```
당근 부스터: http://YOUR_EC2_IP/karrot/
다른 앱:     http://YOUR_EC2_IP/other/
```

### 배포 방법

#### Step 1: Docker Compose로 배포
```bash
# EC2 접속
ssh -i ~/.ssh/karrot-booster-key.pem ubuntu@YOUR_EC2_IP

# 프로젝트 클론
git clone https://github.com/dlawlgur16/realrealrealreal.git
cd realrealrealreal

# 환경 변수 설정
nano .env

# Docker Compose 실행
docker-compose -f docker-compose-multi-app.yml up -d
```

#### Step 2: 확인
```bash
# 서비스 상태 확인
docker-compose -f docker-compose-multi-app.yml ps

# 로그 확인
docker-compose -f docker-compose-multi-app.yml logs

# API 테스트
curl http://localhost/karrot/
curl http://localhost/other/
```

### 모바일 앱 설정
```javascript
// mobile/src/services/api.js
const API_BASE_URL = 'http://YOUR_EC2_IP/karrot';
```

**주의**: API 경로가 `/karrot/`로 시작하므로 앱 코드에서 경로 조정 필요

---

## 방법 3: 도메인으로 구분

### 구조
```
karrot.yourdomain.com → 당근 부스터
other.yourdomain.com  → 다른 앱
```

### 접속 URL
```
당근 부스터: https://karrot.yourdomain.com
다른 앱:     https://other.yourdomain.com
```

### 사전 준비
1. 도메인 구매 (GoDaddy, Route53 등)
2. DNS 설정:
   - A 레코드: `karrot` → EC2 IP
   - A 레코드: `other` → EC2 IP

### 배포 방법

#### Step 1: Nginx 설정 수정
```bash
# nginx-multi-app.conf 파일에서 서브도메인 설정 주석 해제
nano nginx-multi-app.conf
```

다음 섹션 활성화:
```nginx
server {
    listen 80;
    server_name karrot.yourdomain.com;
    # ...
}

server {
    listen 80;
    server_name other.yourdomain.com;
    # ...
}
```

#### Step 2: SSL 인증서 설치 (HTTPS)
```bash
# Certbot 설치
sudo apt install -y certbot

# SSL 인증서 발급
sudo certbot certonly --standalone -d karrot.yourdomain.com
sudo certbot certonly --standalone -d other.yourdomain.com

# Nginx 설정에 SSL 추가 (443 포트)
```

---

## Docker Compose 관리 명령어

### 시작/중지
```bash
# 모든 서비스 시작
docker-compose -f docker-compose-multi-app.yml up -d

# 특정 서비스만 시작
docker-compose -f docker-compose-multi-app.yml up -d karrot-booster

# 모든 서비스 중지
docker-compose -f docker-compose-multi-app.yml down

# 중지 + 볼륨 삭제
docker-compose -f docker-compose-multi-app.yml down -v
```

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose -f docker-compose-multi-app.yml logs

# 실시간 로그
docker-compose -f docker-compose-multi-app.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose-multi-app.yml logs karrot-booster
```

### 재시작
```bash
# 모든 서비스 재시작
docker-compose -f docker-compose-multi-app.yml restart

# 특정 서비스 재시작
docker-compose -f docker-compose-multi-app.yml restart karrot-booster
```

### 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker-compose -f docker-compose-multi-app.yml ps

# 리소스 사용량 (메모리, CPU)
docker stats
```

---

## 메모리 모니터링

### Docker Stats로 실시간 모니터링
```bash
# 모든 컨테이너 모니터링
docker stats

# 출력 예시:
# CONTAINER        CPU %   MEM USAGE / LIMIT   MEM %
# karrot-booster   5.2%    230MB / 300MB       76.6%
# other-app        2.1%    150MB / 200MB       75.0%
# nginx-proxy      0.5%    20MB / 100MB        20.0%
```

### 특정 컨테이너만 모니터링
```bash
docker stats karrot-booster other-app
```

### 메모리 사용량 확인
```bash
# 시스템 전체 메모리
free -h

# Docker 컨테이너별 메모리
docker ps -q | xargs docker stats --no-stream
```

---

## 문제 해결

### 1. 포트 충돌
```bash
# 포트 8000 사용 중인 프로세스 확인
sudo lsof -i :8000

# 프로세스 종료
sudo kill -9 <PID>
```

### 2. 메모리 부족
```bash
# 메모리 사용량 확인
free -h

# Swap 메모리 추가 (응급처방)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 3. Docker 네트워크 오류
```bash
# 네트워크 재생성
docker-compose -f docker-compose-multi-app.yml down
docker network prune -f
docker-compose -f docker-compose-multi-app.yml up -d
```

### 4. Nginx 502 Bad Gateway
```bash
# 백엔드 서비스 상태 확인
docker-compose -f docker-compose-multi-app.yml ps

# Nginx 로그 확인
docker logs nginx-proxy

# 백엔드 재시작
docker-compose -f docker-compose-multi-app.yml restart karrot-booster
```

---

## 자동 배포 스크립트

```bash
#!/bin/bash
# deploy-multi-app.sh

echo "🚀 멀티 앱 배포 시작..."

# 최신 코드 가져오기
git pull origin main

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다!"
    exit 1
fi

# Docker Compose로 배포
docker-compose -f docker-compose-multi-app.yml down
docker-compose -f docker-compose-multi-app.yml build
docker-compose -f docker-compose-multi-app.yml up -d

# 상태 확인
sleep 5
docker-compose -f docker-compose-multi-app.yml ps

echo "✅ 배포 완료!"
echo ""
echo "접속 URL:"
echo "  당근 부스터: http://$(curl -s ifconfig.me):8000"
echo "  다른 앱:     http://$(curl -s ifconfig.me):8001"
```

실행:
```bash
chmod +x deploy-multi-app.sh
./deploy-multi-app.sh
```

---

## 비용 최적화 팁

1. **메모리 제한 설정**: Docker Compose에 `mem_limit` 설정으로 메모리 사용 제한
2. **불필요한 로그 삭제**: `docker system prune -a` 정기 실행
3. **이미지 최적화**: Alpine Linux 기반 이미지 사용
4. **Auto Scaling 비활성화**: 트래픽 적으면 불필요

---

## 체크리스트

### 배포 전
- [ ] EC2 인스턴스 생성 (t3.micro)
- [ ] 보안 그룹 포트 설정 (8000, 8001, 80, 443)
- [ ] .env 파일 준비 (GEMINI_API_KEY)
- [ ] 다른 앱 준비

### 배포 중
- [ ] Docker 설치
- [ ] 프로젝트 클론
- [ ] Docker Compose 실행
- [ ] 서비스 상태 확인

### 배포 후
- [ ] API 엔드포인트 테스트
- [ ] 메모리 사용량 확인
- [ ] 모바일 앱 API URL 변경
- [ ] 전체 기능 테스트

---

## 추천 구성

**개발/테스트 단계**:
- 방법 1: 포트로 구분 (가장 간단)

**프로덕션 단계**:
- 방법 2: 경로로 구분 (Nginx + HTTP)

**정식 서비스**:
- 방법 3: 도메인 + HTTPS

---

## 참고 자료

- [AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md) - 기본 EC2 배포 가이드
- [docker-compose-multi-app.yml](docker-compose-multi-app.yml) - Docker Compose 설정
- [nginx-multi-app.conf](nginx-multi-app.conf) - Nginx 설정

---

## 다음 단계

1. EC2 배포 완료 후 → 도메인 연결
2. 도메인 연결 후 → HTTPS 설정
3. HTTPS 설정 후 → 앱스토어 배포

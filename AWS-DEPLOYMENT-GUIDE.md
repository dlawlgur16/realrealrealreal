# AWS EC2 배포 가이드

당근 부스터(Karrot Booster) 백엔드를 AWS EC2에 배포하는 완전한 가이드입니다.

---

## 📋 목차

1. [사전 준비](#사전-준비)
2. [AWS 계정 생성 및 EC2 인스턴스 생성](#aws-계정-생성-및-ec2-인스턴스-생성)
3. [EC2 서버 초기 설정](#ec2-서버-초기-설정)
4. [백엔드 배포](#백엔드-배포)
5. [도메인 연결 (선택)](#도메인-연결-선택)
6. [HTTPS 설정 (선택)](#https-설정-선택)
7. [모바일 앱 연결](#모바일-앱-연결)

---

## 1️⃣ 사전 준비

### 필요한 것들
- [ ] AWS 계정 (신용카드 필요, 프리티어 1년 무료)
- [ ] Gemini API Key (현재 `.env` 파일에 있음)
- [ ] SSH 클라이언트 (macOS/Linux는 기본 내장)

### 예상 비용
- **프리티어 (첫 1년)**: 무료 (t2.micro)
- **프리티어 이후**: 약 $8~15/월 (t3.small)

---

## 2️⃣ AWS 계정 생성 및 EC2 인스턴스 생성

### Step 1: AWS 계정 생성
1. https://aws.amazon.com/ko/ 접속
2. "AWS 계정 생성" 클릭
3. 이메일, 비밀번호 입력
4. 신용카드 등록 (인증용, 프리티어는 무료)
5. 이메일 인증 완료

### Step 2: EC2 인스턴스 시작
1. AWS 콘솔 로그인: https://console.aws.amazon.com/
2. 우측 상단에서 **지역 선택**: `아시아 태평양 (서울) ap-northeast-2` 추천
3. 검색창에 "EC2" 입력 → EC2 대시보드로 이동
4. **"인스턴스 시작"** 버튼 클릭

### Step 3: 인스턴스 설정

#### 3-1. 이름 및 태그
```
이름: karrot-booster-backend
```

#### 3-2. 애플리케이션 및 OS 이미지
```
운영 체제: Ubuntu
버전: Ubuntu Server 22.04 LTS (무료)
아키텍처: 64비트 (x86)
```

#### 3-3. 인스턴스 유형
```
프리티어: t2.micro (무료, 메모리 1GB)
추천: t3.small (유료, 메모리 2GB - 이미지 처리에 적합)
```
💡 처음엔 t2.micro로 시작하고, 성능이 부족하면 나중에 t3.small로 변경 가능

#### 3-4. 키 페어 생성 (중요! 🔑)
1. **"새 키 페어 생성"** 클릭
2. 설정:
   ```
   키 페어 이름: karrot-booster-key
   키 페어 유형: RSA
   프라이빗 키 파일 형식: .pem (macOS/Linux) 또는 .ppk (Windows)
   ```
3. **"키 페어 생성"** 클릭
4. ⚠️ **중요**: 자동으로 다운로드되는 `.pem` 파일을 안전한 곳에 보관!
   - 분실 시 서버 접속 불가능
   - 추천 저장 위치: `~/.ssh/karrot-booster-key.pem`

#### 3-5. 네트워크 설정
**"편집"** 클릭 후 다음 설정:

```
VPC: 기본값
서브넷: 기본값 (ap-northeast-2a 등)
퍼블릭 IP 자동 할당: 활성화 ✅
```

**방화벽 (보안 그룹)** - "보안 그룹 생성" 선택:
```
보안 그룹 이름: karrot-booster-sg
설명: Security group for Karrot Booster backend
```

**인바운드 보안 그룹 규칙** 추가:

| 유형       | 프로토콜 | 포트 범위 | 소스              | 설명                  |
|----------|------|-------|-----------------|---------------------|
| SSH      | TCP  | 22    | 내 IP (자동 감지)    | SSH 접속              |
| HTTP     | TCP  | 80    | 0.0.0.0/0       | HTTP 접속             |
| HTTPS    | TCP  | 443   | 0.0.0.0/0       | HTTPS 접속            |
| 사용자 지정 TCP | TCP  | 8000  | 0.0.0.0/0       | FastAPI 백엔드 (임시)  |

💡 나중에 Nginx를 설정하면 포트 8000은 닫아도 됩니다.

#### 3-6. 스토리지 구성
```
크기: 8 GiB (기본값, 프리티어 최대 30GB)
볼륨 유형: gp3 (범용 SSD)
```

#### 3-7. 고급 세부 정보
```
기본값 사용 (변경 불필요)
```

### Step 4: 인스턴스 시작
1. 우측 **"인스턴스 시작"** 버튼 클릭
2. "성공적으로 시작됨" 메시지 확인
3. **"인스턴스 보기"** 클릭

### Step 5: 인스턴스 정보 확인
인스턴스가 시작되면 (1~2분 소요):
- **인스턴스 상태**: `실행 중` (초록색)
- **퍼블릭 IPv4 주소**: `xx.xx.xx.xx` (예: `3.34.123.45`) 📝 메모!
- **퍼블릭 IPv4 DNS**: `ec2-xx-xx-xx-xx.ap-northeast-2.compute.amazonaws.com` 📝 메모!

---

## 3️⃣ EC2 서버 초기 설정

### Step 1: SSH 키 권한 설정 (macOS/Linux)
```bash
# 다운로드한 키 파일을 ~/.ssh/ 로 이동
mv ~/Downloads/karrot-booster-key.pem ~/.ssh/

# 권한 설정 (필수!)
chmod 400 ~/.ssh/karrot-booster-key.pem
```

### Step 2: EC2 서버 접속
```bash
# 퍼블릭 IP를 사용해서 접속
ssh -i ~/.ssh/karrot-booster-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# 예시:
# ssh -i ~/.ssh/karrot-booster-key.pem ubuntu@3.34.123.45
```

처음 접속 시 fingerprint 경고가 나오면 `yes` 입력

### Step 3: 서버 업데이트
```bash
# 패키지 목록 업데이트
sudo apt update

# 설치된 패키지 업그레이드
sudo apt upgrade -y
```

### Step 4: 필수 소프트웨어 설치
```bash
# Git, Python, pip 설치
sudo apt install -y git python3-pip python3-venv

# Docker 설치 (권장)
sudo apt install -y docker.io docker-compose

# Docker 사용자 권한 추가
sudo usermod -aG docker ubuntu

# 재로그인 (권한 적용)
exit
ssh -i ~/.ssh/karrot-booster-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 5: 환경 확인
```bash
# Python 버전 확인
python3 --version  # Python 3.10+ 확인

# Docker 버전 확인
docker --version
docker-compose --version

# Git 확인
git --version
```

---

## 4️⃣ 백엔드 배포

### 방법 A: Docker 사용 (추천 ⭐)

#### Step 1: 프로젝트 클론
```bash
# 홈 디렉토리로 이동
cd ~

# GitHub에서 프로젝트 클론
git clone https://github.com/dlawlgur16/realrealrealreal.git
cd realrealrealreal
```

#### Step 2: 환경 변수 설정
```bash
# .env 파일 생성
nano .env
```

다음 내용 입력:
```env
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
```
- `Ctrl + O` (저장)
- `Enter`
- `Ctrl + X` (종료)

#### Step 3: Docker 이미지 빌드
```bash
# Docker 이미지 빌드
docker build -t karrot-booster:latest .
```

#### Step 4: Docker 컨테이너 실행
```bash
# 백그라운드에서 실행
docker run -d \
  --name karrot-booster \
  -p 8000:8000 \
  --env-file .env \
  --restart unless-stopped \
  karrot-booster:latest
```

#### Step 5: 실행 확인
```bash
# 컨테이너 상태 확인
docker ps

# 로그 확인
docker logs karrot-booster

# API 테스트
curl http://localhost:8000/
```

응답 예시:
```json
{
  "service": "당근 부스터 API",
  "version": "1.0.0",
  "status": "running"
}
```

---

### 방법 B: 직접 설치 (Docker 없이)

#### Step 1: 프로젝트 클론
```bash
cd ~
git clone https://github.com/dlawlgur16/realrealrealreal.git
cd realrealrealreal
```

#### Step 2: 가상환경 생성 및 의존성 설치
```bash
# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
```

#### Step 3: 환경 변수 설정
```bash
nano .env
```
내용:
```env
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
```

#### Step 4: 서버 실행
```bash
# 프로덕션 모드로 실행 (백그라운드)
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 > server.log 2>&1 &
```

#### Step 5: 실행 확인
```bash
# 프로세스 확인
ps aux | grep uvicorn

# API 테스트
curl http://localhost:8000/
```

---

### Step 6: 외부 접속 테스트
로컬 컴퓨터에서:
```bash
# EC2 퍼블릭 IP로 접속 테스트
curl http://YOUR_EC2_PUBLIC_IP:8000/

# 예시:
# curl http://3.34.123.45:8000/
```

✅ 성공하면 JSON 응답이 나옵니다!

---

## 5️⃣ 도메인 연결 (선택)

포트 번호 없이 깔끔한 URL 사용하기

### Step 1: Nginx 설치
```bash
sudo apt install -y nginx
```

### Step 2: Nginx 설정
```bash
sudo nano /etc/nginx/sites-available/karrot-booster
```

다음 내용 입력:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # 또는 도메인

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 타임아웃 설정 (이미지 처리용)
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }

    # 최대 업로드 크기 (이미지 업로드용)
    client_max_body_size 10M;
}
```

### Step 3: Nginx 설정 활성화
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/karrot-booster /etc/nginx/sites-enabled/

# 기본 설정 제거
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### Step 4: 테스트
```bash
# 포트 없이 접속
curl http://YOUR_EC2_PUBLIC_IP/
```

이제 `http://YOUR_EC2_PUBLIC_IP`로 접속 가능! (포트 8000 불필요)

---

## 6️⃣ HTTPS 설정 (선택, 도메인 필요)

도메인이 있다면 무료 SSL 인증서 설치

### Step 1: 도메인 구매 (선택)
- **무료**: Freenom (기간 제한)
- **유료**: GoDaddy, Route53, 가비아 등

### Step 2: DNS 설정
도메인의 A 레코드를 EC2 퍼블릭 IP로 설정:
```
Type: A
Name: @ (또는 api)
Value: YOUR_EC2_PUBLIC_IP
TTL: 300
```

### Step 3: Certbot 설치 (무료 SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 4: SSL 인증서 발급
```bash
sudo certbot --nginx -d your-domain.com

# 이메일 입력
# 약관 동의: Y
# 광고 수신: N (선택)
```

### Step 5: 자동 갱신 설정
```bash
# 자동 갱신 테스트
sudo certbot renew --dry-run
```

이제 `https://your-domain.com`으로 접속 가능!

---

## 7️⃣ 모바일 앱 연결

### Step 1: API URL 확인
```
포트 번호 있음: http://YOUR_EC2_PUBLIC_IP:8000
Nginx 사용: http://YOUR_EC2_PUBLIC_IP
도메인 + HTTPS: https://your-domain.com
```

### Step 2: 모바일 앱 설정 변경
로컬 컴퓨터에서:

```bash
# mobile/src/services/api.js 수정
nano mobile/src/services/api.js
```

6번째 줄 수정:
```javascript
// 변경 전:
const API_BASE_URL = 'https://posthumeral-grayish-cristian.ngrok-free.dev';

// 변경 후:
const API_BASE_URL = 'http://YOUR_EC2_PUBLIC_IP:8000';
// 또는
const API_BASE_URL = 'http://YOUR_EC2_PUBLIC_IP';  // Nginx 사용 시
// 또는
const API_BASE_URL = 'https://your-domain.com';  // HTTPS 사용 시
```

### Step 3: 앱 재시작
```bash
cd mobile
npm start
```

### Step 4: 테스트
- Expo Go 앱으로 QR 코드 스캔
- 이미지 업로드 테스트
- 모든 기능 작동 확인

---

## 🔧 유용한 명령어 모음

### Docker 컨테이너 관리
```bash
# 컨테이너 상태 확인
docker ps -a

# 로그 확인 (실시간)
docker logs -f karrot-booster

# 컨테이너 중지
docker stop karrot-booster

# 컨테이너 시작
docker start karrot-booster

# 컨테이너 재시작
docker restart karrot-booster

# 컨테이너 삭제
docker rm -f karrot-booster

# 이미지 재빌드 후 실행
docker build -t karrot-booster:latest . && \
docker rm -f karrot-booster && \
docker run -d --name karrot-booster -p 8000:8000 --env-file .env --restart unless-stopped karrot-booster:latest
```

### 서버 상태 확인
```bash
# CPU/메모리 사용량
htop  # 또는 top

# 디스크 사용량
df -h

# 네트워크 연결 확인
netstat -tlnp | grep 8000
```

### 코드 업데이트
```bash
# 최신 코드 가져오기
cd ~/realrealrealreal
git pull origin main

# Docker 재배포
docker build -t karrot-booster:latest .
docker restart karrot-booster
```

### 로그 확인
```bash
# Docker 로그
docker logs karrot-booster --tail 100

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚨 문제 해결

### 1. 포트 8000에 접속 안 됨
```bash
# 방화벽 확인
sudo ufw status

# 포트 열기 (필요 시)
sudo ufw allow 8000

# Docker 컨테이너 확인
docker ps
docker logs karrot-booster
```

### 2. Gemini API 오류
```bash
# 환경 변수 확인
docker exec karrot-booster env | grep GEMINI

# .env 파일 확인
cat .env
```

### 3. 메모리 부족
```bash
# 메모리 확인
free -h

# 인스턴스 유형 업그레이드: EC2 콘솔에서 t3.small로 변경
```

### 4. 컨테이너가 계속 재시작됨
```bash
# 로그 확인
docker logs karrot-booster

# 의존성 문제일 가능성 - 이미지 재빌드
docker build --no-cache -t karrot-booster:latest .
```

---

## 📊 비용 절감 팁

1. **프리티어 활용**: 처음 1년은 t2.micro 무료
2. **Reserved Instance**: 1년 약정 시 최대 72% 할인
3. **Auto Scaling 비활성화**: 트래픽이 적으면 불필요
4. **CloudWatch 모니터링 최소화**: 기본 모니터링만 사용

---

## ✅ 배포 체크리스트

- [ ] AWS 계정 생성
- [ ] EC2 인스턴스 시작 (t2.micro 또는 t3.small)
- [ ] 보안 그룹 설정 (포트 22, 80, 443, 8000)
- [ ] SSH 키 페어 다운로드 및 권한 설정
- [ ] EC2 서버 접속
- [ ] Docker 설치
- [ ] GitHub에서 프로젝트 클론
- [ ] .env 파일 생성 (GEMINI_API_KEY)
- [ ] Docker 이미지 빌드 및 실행
- [ ] API 동작 확인 (curl 테스트)
- [ ] Nginx 설정 (선택)
- [ ] HTTPS 설정 (선택)
- [ ] 모바일 앱 API URL 변경
- [ ] 전체 기능 테스트

---

## 🎉 완료!

백엔드가 AWS EC2에서 24/7 실행됩니다!

이제 모바일 앱을 앱스토어에 배포할 준비가 되었습니다.

**다음 단계**: 앱스토어 배포 (필요 시 별도 가이드)

---

## 📞 문제가 생기면?

1. Docker 로그 확인: `docker logs karrot-booster`
2. EC2 보안 그룹 확인
3. .env 파일의 API 키 확인
4. GitHub Issues에 질문 남기기

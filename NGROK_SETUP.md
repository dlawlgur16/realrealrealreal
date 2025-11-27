# 🌐 ngrok 사용 가이드 (다른 네트워크 연결)

컴퓨터가 유선 인터넷이고 핸드폰이 Wi-Fi로 다른 네트워크에 있을 때 사용하는 방법입니다.

## 📥 ngrok 설치

### 방법 1: 공식 사이트에서 다운로드 (추천)

1. https://ngrok.com/download 접속
2. Windows용 다운로드
3. 압축 해제 후 `ngrok.exe`를 PATH에 추가하거나 프로젝트 폴더에 복사

### 방법 2: Chocolatey로 설치

```bash
choco install ngrok
```

### 방법 3: npm으로 설치

```bash
npm install -g ngrok
```

## 🔑 ngrok 인증 (최초 1회만)

1. https://dashboard.ngrok.com/signup 에서 무료 계정 생성
2. 대시보드에서 인증 토큰 복사
3. 다음 명령어 실행:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

## 🚀 사용 방법

### 방법 1: 자동 스크립트 사용 (추천)

```bash
# 프로젝트 루트에서
python scripts/start-with-ngrok.py
```

이 스크립트가:
- ✅ ngrok 터널 자동 시작
- ✅ 공개 URL 표시
- ✅ 모바일 앱 API URL 자동 업데이트

### 방법 2: 수동 설정

**1단계: 백엔드 서버 실행**
```bash
python run.py
```

**2단계: 새 터미널에서 ngrok 시작**
```bash
ngrok http 8000
```

**3단계: ngrok URL 확인**
터미널에 표시된 `Forwarding` URL을 복사 (예: `https://xxxx.ngrok-free.app`)

**4단계: 모바일 앱 API URL 업데이트**

방법 A: 자동 업데이트
```bash
cd mobile
node ../scripts/setup-ngrok-api.js
```

방법 B: 수동 업데이트
`mobile/src/services/api.js` 파일을 열어서:
```javascript
const API_BASE_URL = 'https://xxxx.ngrok-free.app';
```

**5단계: 모바일 앱 실행**
```bash
cd mobile
npm start
```

## ✅ 확인 사항

- ✅ 백엔드 서버가 실행 중 (`python run.py`)
- ✅ ngrok 터널이 실행 중 (`ngrok http 8000`)
- ✅ 모바일 앱의 API URL이 ngrok URL로 설정됨
- ✅ 핸드폰에서 인터넷 연결 가능 (데이터 또는 Wi-Fi)

## 💡 팁

1. **ngrok 무료 플랜 제한**
   - URL이 매번 변경됨 (재시작 시)
   - 시간 제한 있음 (8시간)
   - 월 트래픽 제한

2. **고정 URL이 필요하면**
   - ngrok 유료 플랜 사용
   - 또는 도메인 연결

3. **더 간단한 방법**
   - 컴퓨터의 Wi-Fi도 켜서 같은 Wi-Fi에 연결
   - 그러면 ngrok 없이도 사용 가능

## 🔧 문제 해결

### "ngrok: command not found"
- ngrok이 설치되지 않았거나 PATH에 없습니다
- 설치 방법 참조

### "ngrok: authtoken required"
- 인증 토큰을 설정하지 않았습니다
- `ngrok config add-authtoken YOUR_TOKEN` 실행

### "터널을 찾을 수 없습니다"
- ngrok이 실행 중인지 확인
- `http://localhost:4040` 접속하여 웹 인터페이스 확인


# 🚀 빠른 시작 가이드

모바일 앱을 **3단계**로 쉽게 시작하세요!

## 📋 사전 준비

1. **Node.js 설치** (없는 경우)
   - [Node.js 다운로드](https://nodejs.org/) (v18 이상)

2. **Expo Go 앱 설치** (스마트폰에)
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

## 🎯 3단계로 시작하기

### 1단계: 백엔드 서버 실행

프로젝트 루트 디렉토리에서:

```bash
python run.py
```

서버가 `http://localhost:8000`에서 실행됩니다. ✅

### 2단계: 모바일 앱 시작

**방법 A: 자동 설정 (추천) ⭐**

```bash
cd mobile
npm run dev
```

이 명령어가 자동으로:
- ✅ 로컬 IP 주소 감지
- ✅ API URL 자동 설정
- ✅ Expo 서버 시작

**방법 B: 수동 설정**

```bash
cd mobile
npm install              # 최초 1회만
npm run setup-api       # API URL 자동 설정
npm start               # Expo 서버 시작
```

### 3단계: 앱 실행

터미널에 QR 코드가 표시됩니다:

- **실제 디바이스**: Expo Go 앱으로 QR 코드 스캔
- **에뮬레이터**: `a` (Android) 또는 `i` (iOS) 키 입력

## ✅ 완료!

이제 앱을 사용할 수 있습니다!

## 🔧 문제 해결

### "Network Error" 발생 시

1. **백엔드 서버가 실행 중인지 확인**
   ```bash
   # 다른 터미널에서 확인
   curl http://localhost:8000/
   ```

2. **API URL 다시 설정**
   ```bash
   npm run setup-api
   ```

3. **네트워크 확인**
   - **같은 Wi-Fi**: 컴퓨터와 스마트폰이 같은 Wi-Fi에 연결되어 있어야 합니다
   - **다른 네트워크**: ngrok 사용 필요 (아래 참조)

### 🌐 다른 네트워크에 있는 경우

**컴퓨터가 유선 인터넷이고 핸드폰이 다른 Wi-Fi인 경우:**

1. **ngrok 설치** (최초 1회)
   - https://ngrok.com/download
   - 계정 생성 후 인증: `ngrok config add-authtoken YOUR_TOKEN`

2. **ngrok 시작**
   ```bash
   # 프로젝트 루트에서
   python scripts/start-with-ngrok.py
   ```
   
   또는 수동으로:
   ```bash
   ngrok http 8000
   # 표시된 URL을 복사하여 mobile/src/services/api.js에 설정
   ```

**자세한 가이드:** [../NGROK_SETUP.md](../NGROK_SETUP.md) 또는 [../QUICKSTART_NETWORK.md](../QUICKSTART_NETWORK.md)

### "포트가 이미 사용 중" 에러

```bash
# Windows
netstat -ano | findstr :8000
taskkill /F /PID [프로세스ID]

# macOS/Linux
lsof -ti:8000 | xargs kill
```

### 권한 에러

앱에서 카메라/갤러리 권한을 허용해주세요.

## 📱 사용 방법

1. 홈 화면에서 기능 선택
2. 이미지 업로드 (갤러리 또는 카메라)
3. 처리 버튼 클릭
4. 결과 확인 및 저장

## 💡 팁

- **에뮬레이터 사용 시**: `API_BASE_URL`을 `http://localhost:8000`으로 수동 설정
- **실제 디바이스 사용 시**: `npm run setup-api`로 자동 설정
- **개발 중**: `npm run dev`로 한 번에 시작

## 📚 더 자세한 정보

- 전체 가이드: `SETUP.md`
- API 문서: `README.md`


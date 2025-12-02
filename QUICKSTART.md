# ⚡ 초간단 시작 가이드

Desktop(유선) + 모바일(Wi-Fi/데이터) 환경
**인터넷만 있으면 어디서든 연결 가능!**

---

## 🚀 1단계: ngrok 설치 (최초 1회만)

**Windows:**
```bash
install-ngrok.bat
```

**macOS/Linux:**
```bash
chmod +x install-ngrok.sh
./install-ngrok.sh
```

**자동으로 수행:**
- ✅ ngrok 다운로드
- ✅ 압축 해제
- ✅ 프로젝트 폴더에 설치
- ✅ 인증 토큰 설정 (입력 필요)

**소요 시간: 1-2분**

---

## 🎯 2단계: 전체 실행 (매번)

**Windows:**
```bash
start-with-ngrok.bat
```

**macOS/Linux:**
```bash
./start-with-ngrok.sh
```

**자동으로 시작:**
- ✅ 백엔드 서버
- ✅ ngrok 터널
- ✅ Expo 터널 모드 (인터넷 연결)

**끝!** QR 코드가 나타날 때까지 30초-1분 대기! 🎉

---

## 📱 3단계: QR 코드 스캔

터미널 또는 브라우저에 QR 코드가 나타나면:
1. **Expo Go 앱** 실행 (설치 안 되어 있으면 설치)
2. **"Scan QR code"** 클릭
3. **컴퓨터 화면의 QR 코드 스캔**
4. **앱 자동 로드!**

⚠️ **터널 모드는 초기화에 30초-1분 걸립니다. 조금만 기다려주세요!**

---

## 🔧 ngrok 인증 토큰 받기

1. https://dashboard.ngrok.com/signup (무료)
2. Google/GitHub 로그인
3. https://dashboard.ngrok.com/get-started/your-authtoken
4. 토큰 복사
5. `install-ngrok.bat` 또는 `start-with-ngrok.bat` 실행 시 입력

---

## 💡 문제 해결

### "ngrok이 설치되어 있지 않습니다"

**Windows:**
```bash
install-ngrok.bat
```

**macOS/Linux:**
```bash
./install-ngrok.sh
```

### "서버 연결 실패"

1. 방화벽 확인 (Windows Defender → Python 허용)
2. 백엔드 서버 창 확인 (에러 메시지?)
3. ngrok 창 확인 (터널 정상?)

### "GEMINI_API_KEY 오류"

실행 시 API 키 입력 요청이 나타나면 입력

---

## 📖 더 자세한 정보

- **실행방법.md** - 상세 가이드
- **프로젝트구조.md** - 파일 구조 설명
- **README.md** - 프로젝트 소개

---

## 🎊 완료!

이제 **딸깍 한 번**으로 모든 것이 실행됩니다!

**Windows:**
```bash
start-with-ngrok.bat
```

**macOS/Linux:**
```bash
./start-with-ngrok.sh
```

30초 후 개발 준비 완료! 🚀

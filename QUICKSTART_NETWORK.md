# 🌐 네트워크 설정 가이드

## 상황별 해결 방법

### ✅ 상황 1: 같은 네트워크 (가장 쉬움)

**컴퓨터와 핸드폰이 같은 Wi-Fi에 연결된 경우**

```bash
# 1. 백엔드 서버 실행
python run.py

# 2. 모바일 앱 시작 (자동 설정)
cd mobile
npm run dev
```

끝! 🎉

---

### 🌐 상황 2: 다른 네트워크 (ngrok 사용)

**컴퓨터: 유선 인터넷 / 핸드폰: Wi-Fi (다른 네트워크)**

#### 방법 A: ngrok 자동 스크립트 (추천)

```bash
# 1. 백엔드 서버 실행
python run.py

# 2. 새 터미널에서 ngrok 시작 (자동 설정)
python scripts/start-with-ngrok.py
```

#### 방법 B: ngrok 수동 설정

```bash
# 1. 백엔드 서버 실행
python run.py

# 2. 새 터미널에서 ngrok 시작
ngrok http 8000

# 3. 표시된 URL 복사 (예: https://xxxx.ngrok-free.app)

# 4. 모바일 앱 API URL 업데이트
cd mobile
node ../scripts/setup-ngrok-api.js

# 5. 모바일 앱 실행
npm start
```

**ngrok 설치가 필요하면:** [NGROK_SETUP.md](./NGROK_SETUP.md) 참조

---

### 📱 상황 3: USB 연결 (Android만)

**Android 디바이스를 USB로 연결한 경우**

```bash
# 1. USB 디버깅 활성화 (설정 > 개발자 옵션)

# 2. adb 포트 포워딩
adb reverse tcp:8000 tcp:8000

# 3. 모바일 앱에서 localhost 사용
# mobile/src/services/api.js
const API_BASE_URL = 'http://localhost:8000';
```

---

## 🎯 빠른 선택 가이드

| 상황 | 방법 | 난이도 |
|------|------|--------|
| 같은 Wi-Fi | 자동 설정 (`npm run dev`) | ⭐ 쉬움 |
| 다른 네트워크 | ngrok 사용 | ⭐⭐ 보통 |
| USB 연결 (Android) | adb 포트 포워딩 | ⭐⭐ 보통 |

---

## 💡 추천 방법

**가장 쉬운 방법:**
1. 컴퓨터의 Wi-Fi도 켜기
2. 컴퓨터와 핸드폰을 같은 Wi-Fi에 연결
3. `npm run dev` 실행

이렇게 하면 ngrok 없이도 바로 사용 가능합니다! 🚀


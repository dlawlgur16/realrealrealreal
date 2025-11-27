# Karrot Booster Mobile App

당근 부스터 모바일 앱 - React Native Expo

## 기능

1. **포스터형 썸네일 생성**: 상품을 더 매력적으로 보여주는 프리미엄 포스터 생성
2. **인증 정보 선명화**: 시리얼 넘버나 인증서를 깔끔하게 보정
3. **하자 부분 강조**: 솔직한 거래를 위해 하자 부분을 감성적으로 표현

## 🚀 빠른 시작

**더 자세한 가이드는 [QUICKSTART.md](./QUICKSTART.md)를 참조하세요!**

### 1. 백엔드 서버 실행

프로젝트 루트에서:
```bash
python run.py
```

### 2. 모바일 앱 시작 (자동 설정)

```bash
cd mobile
npm install          # 최초 1회만
npm run dev          # API URL 자동 설정 + Expo 시작
```

### 3. 앱 실행

- **실제 디바이스**: Expo Go 앱으로 QR 코드 스캔
- **에뮬레이터**: `a` (Android) 또는 `i` (iOS)

## 📝 수동 설정 (선택사항)

API URL을 수동으로 설정하려면:

```bash
npm run setup-api    # 로컬 IP 자동 감지 및 설정
```

또는 `src/services/api.js`에서 직접 수정:

```javascript
// 에뮬레이터/시뮬레이터
const API_BASE_URL = 'http://localhost:8000';

// 실제 디바이스 (같은 네트워크)
const API_BASE_URL = 'http://192.168.x.x:8000';
```

## 프로젝트 구조

```
mobile/
├── App.js                      # 메인 앱 파일 (Navigation 설정)
├── app.json                    # Expo 설정
├── package.json
├── src/
│   ├── screens/               # 화면 컴포넌트
│   │   ├── HomeScreen.js      # 홈 화면
│   │   ├── PosterScreen.js    # 포스터 생성 화면
│   │   ├── SerialScreen.js    # 시리얼 선명화 화면
│   │   └── DefectScreen.js    # 하자 강조 화면
│   ├── services/              # API 서비스
│   │   └── api.js             # 백엔드 API 통신
│   └── utils/                 # 유틸리티
│       └── storage.js         # 이미지 저장 기능
└── README.md
```

## 사용된 주요 패키지

- **react-navigation**: 화면 네비게이션
- **expo-image-picker**: 이미지 선택 및 카메라
- **expo-media-library**: 이미지 갤러리 저장
- **expo-file-system**: 파일 시스템 접근
- **axios**: HTTP 클라이언트

## 백엔드 연동

이 앱은 FastAPI 백엔드 서버(`../app/`)와 연동됩니다.

백엔드 서버를 먼저 실행한 후 모바일 앱을 사용하세요:

```bash
# 프로젝트 루트 디렉토리에서
python run.py
```

## API 엔드포인트

- `POST /api/process` - 통합 이미지 처리
- `POST /api/poster` - 포스터 생성
- `POST /api/serial` - 시리얼 선명화
- `POST /api/defect` - 하자 강조

## 권한

앱 실행 시 다음 권한이 필요합니다:

- **카메라**: 상품 사진 촬영
- **사진 라이브러리**: 이미지 선택 및 저장

## 개발 팁

### 실제 디바이스에서 테스트 시

1. 백엔드 서버를 실행 중인 컴퓨터의 로컬 IP 주소 확인
   ```bash
   # Windows
   ipconfig

   # macOS/Linux
   ifconfig
   ```

2. `src/services/api.js`의 `API_BASE_URL`을 수정
   ```javascript
   const API_BASE_URL = 'http://192.168.x.x:8000';
   ```

3. 방화벽에서 8000 포트 허용

### 디버깅

```bash
# 로그 확인
npx expo start

# React Native 디버거
npx expo start --dev-client
```

## 빌드 (배포용)

```bash
# Android APK
eas build --platform android

# iOS
eas build --platform ios
```

## 문제 해결

### "Network request failed"

- 백엔드 서버가 실행 중인지 확인
- API_BASE_URL이 올바른지 확인
- 같은 네트워크에 연결되어 있는지 확인

### 이미지 저장 실패

- 미디어 라이브러리 권한이 허용되었는지 확인
- 앱 설정에서 권한 확인

## 라이선스

MIT

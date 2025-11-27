# 빠른 시작 가이드

## 1. 백엔드 서버 실행

먼저 프로젝트 루트 디렉토리에서 백엔드 서버를 실행하세요:

```bash
# 프로젝트 루트 디렉토리로 이동
cd ..

# 백엔드 서버 실행
python run.py
```

백엔드 서버가 `http://localhost:8000`에서 실행됩니다.

## 2. API URL 설정

### 2-1. 에뮬레이터에서 테스트하는 경우

`mobile/src/services/api.js` 파일을 열고 다음과 같이 설정:

```javascript
// Android 에뮬레이터
const API_BASE_URL = 'http://10.0.2.2:8000';

// iOS 시뮬레이터
const API_BASE_URL = 'http://localhost:8000';
```

### 2-2. 실제 디바이스에서 테스트하는 경우

1. 컴퓨터의 로컬 IP 주소를 확인:

```bash
# Windows (CMD)
ipconfig

# Windows (PowerShell)
Get-NetIPAddress -AddressFamily IPv4

# macOS/Linux
ifconfig
# 또는
ip addr show
```

2. `mobile/src/services/api.js` 파일을 열고 IP 주소를 입력:

```javascript
// 예: 192.168.0.10
const API_BASE_URL = 'http://192.168.0.10:8000';
```

3. 방화벽 설정 확인:
   - Windows: 방화벽에서 8000 포트 인바운드 규칙 허용
   - macOS: 시스템 환경설정 > 보안 및 개인 정보 보호 > 방화벽에서 허용

## 3. 모바일 앱 실행

```bash
# mobile 디렉토리로 이동
cd mobile

# 의존성 설치 (최초 1회만)
npm install

# Expo 개발 서버 시작
npx expo start
```

## 4. 앱 실행 방법

터미널에 표시되는 메뉴에서 선택:

- `a` - Android 에뮬레이터에서 실행
- `i` - iOS 시뮬레이터에서 실행 (macOS만 가능)
- `w` - 웹 브라우저에서 실행

### 실제 디바이스에서 실행

1. 스마트폰에 Expo Go 앱 설치:
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. 터미널에 표시된 QR 코드를 스캔:
   - Android: Expo Go 앱에서 QR 코드 스캔
   - iOS: 카메라 앱으로 QR 코드 스캔

3. 스마트폰과 컴퓨터가 같은 Wi-Fi 네트워크에 연결되어 있어야 합니다!

## 5. 사용 방법

1. 홈 화면에서 3가지 기능 중 하나 선택:
   - **포스터형 썸네일**: 상품 이미지를 매력적인 포스터로 변환
   - **인증 정보 선명화**: 시리얼 넘버나 인증서를 선명하게 보정
   - **하자 부분 강조**: 하자 부분을 감성적으로 강조

2. 이미지 선택:
   - "갤러리에서 선택" 또는 "사진 촬영"

3. 설정 조정 (기능에 따라 다름):
   - 포스터: 스타일 선택
   - 인증 정보/하자: 영역 좌표 입력

4. 처리 버튼 클릭

5. 결과 확인 후 "갤러리에 저장" 버튼으로 저장

## 문제 해결

### "Network request failed" 에러

1. 백엔드 서버가 실행 중인지 확인
2. `src/services/api.js`의 `API_BASE_URL` 확인
3. 방화벽 설정 확인
4. 같은 네트워크에 연결되어 있는지 확인

### 권한 관련 에러

앱 설정에서 카메라 및 사진 라이브러리 권한을 허용했는지 확인

### 이미지가 처리되지 않음

1. 백엔드 로그 확인
2. 네트워크 연결 확인
3. 이미지 크기가 너무 크지 않은지 확인

## 개발 환경

- Node.js 18 이상
- Expo CLI
- Android Studio (Android 개발 시)
- Xcode (iOS 개발 시, macOS만 가능)

## 추가 정보

자세한 내용은 `README.md`를 참조하세요.

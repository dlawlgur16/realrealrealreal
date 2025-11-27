# 스크립트 설명

## setup-api-url.js

로컬 네트워크의 IP 주소를 자동으로 감지하여 API URL을 설정합니다.

**사용법:**
```bash
npm run setup-api
# 또는
node scripts/setup-api-url.js
```

**동작:**
1. 컴퓨터의 로컬 IP 주소 자동 감지 (192.168.x.x, 10.x.x.x 등)
2. `src/services/api.js`의 `API_BASE_URL` 자동 업데이트
3. 설정된 URL 출력

## start-dev.bat / start-dev.sh

백엔드 서버 확인 → API URL 설정 → Expo 서버 시작을 한 번에 수행합니다.

**사용법:**
- Windows: `start-dev.bat` 더블클릭 또는 명령어 실행
- macOS/Linux: `./scripts/start-dev.sh` 실행

**동작:**
1. 백엔드 서버 실행 여부 확인
2. API URL 자동 설정
3. Expo 개발 서버 시작


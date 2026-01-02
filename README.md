# OceanSeal (당근 부스터)

**중고거래 프리미엄 포토 서비스** - AI 이미지 처리 + 블록체인 인증서

## 개요

OceanSeal은 중고거래 판매자를 위한 AI 이미지 처리 서비스입니다.
Gemini AI로 이미지를 처리하고, Polygon 블록체인에 디지털 인증서를 발급합니다.

## 핵심 기능

### 1. 포스터형 썸네일 (Pro Poster)
- 평범한 중고물품 사진을 스튜디오급 썸네일로 변환
- 6가지 스타일: Dramatic, Tone-on-Tone, Modern, Artistic, Hero, Museum

### 2. 개인정보 블러 (Privacy Blur)
- 시리얼 넘버, 모델명 등 민감 정보 자동 감지 및 제거
- 특정 영역 선택 가능

### 3. 하자 표시 (Defect Scan)
- 제품 하자 자동 감지
- 빨간색 원으로 하자 위치 표시
- 정직한 거래 지원

### 4. 디지털 인증서 (LVMH Aura 스타일)
- 처리된 이미지에 블록체인 인증서 발급
- Polygon 네트워크에 해시 기록
- QR코드로 누구나 검증 가능

## 기술 스택

| 구분 | 기술 |
|------|------|
| 모바일 앱 | React Native + Expo |
| 백엔드 | Python FastAPI |
| AI | Google Gemini API |
| 인증 | Firebase Auth (Google/Kakao) |
| DB | Supabase PostgreSQL |
| 이미지 저장 | Supabase Storage |
| 블록체인 | Polygon (Amoy Testnet) |

## 프로젝트 구조

```
realrealrealreal/
├── app/                          # 백엔드 (FastAPI)
│   ├── main.py                   # API 엔드포인트
│   ├── config.py                 # Gemini 설정
│   ├── models.py                 # Pydantic 모델
│   ├── prompts.py                # AI 프롬프트
│   ├── gemini_client.py          # Gemini API
│   ├── utils.py                  # 유틸리티
│   └── certificate/              # 인증서 모듈
│       ├── router.py             # 인증서 API
│       ├── service.py            # 비즈니스 로직
│       ├── blockchain.py         # Polygon 연동
│       └── models.py             # 인증서 모델
│
├── mobile/                       # 프론트엔드 (React Native)
│   ├── App.js                    # 앱 진입점
│   └── src/
│       ├── screens/              # 화면들
│       ├── services/             # API 서비스
│       ├── components/           # 컴포넌트
│       └── config/               # 설정
│
├── contracts/                    # 스마트 컨트랙트
│   └── OceanSealCertificate.sol
│
└── scripts/                      # 유틸리티 스크립트
    ├── setup_blockchain.py       # 지갑 생성
    └── deploy_final.py           # 컨트랙트 배포
```

## 시작하기

### 1. 백엔드 실행

```bash
# 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정 (.env 파일)
GEMINI_API_KEY=your-gemini-key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_PRIVATE_KEY=your-private-key
CERTIFICATE_CONTRACT_ADDRESS=0x...

# 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 모바일 앱 실행

```bash
cd mobile

# 의존성 설치
npm install

# Expo 개발 서버 실행
npx expo start

# EAS 빌드 (Google 로그인 테스트용)
eas build --profile development --platform ios
```

## API 엔드포인트

### 이미지 처리

| 엔드포인트 | 설명 |
|-----------|------|
| `POST /api/poster` | 포스터 썸네일 생성 |
| `POST /api/serial` | 개인정보 블러 |
| `POST /api/defect` | 하자 감지 |

### 인증서

| 엔드포인트 | 설명 |
|-----------|------|
| `POST /api/certificate/issue` | 인증서 발급 (인증 필요) |
| `GET /api/certificate/{id}` | 인증서 조회 |
| `GET /api/certificate/verify/{id}` | 인증서 검증 (공개) |
| `GET /api/certificate/user/{uid}` | 내 인증서 목록 (인증 필요) |

## 보안

- CORS: 허용된 도메인만 접근 가능
- Rate Limiting: 분당 10회 (인증서는 분당 5회)
- Firebase Token 인증: 민감한 API 보호
- SQL Injection 방지: 입력값 검증

## 배포

- 백엔드: AWS EC2 + Docker
- 도메인: https://api.ocean-seal.shop
- 블록체인: Polygon Amoy Testnet

## 라이선스

MIT License

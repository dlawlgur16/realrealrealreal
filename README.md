# 🥕 당근 부스터 (Karrot Booster)

**중고거래 프리미엄 포토 서비스** - AI 기반 이미지 변환으로 중고물품의 가치를 극대화하세요.

## 📋 개요

당근 부스터는 당근마켓, 중고나라 등 C2C 플랫폼 판매자를 위한 AI 이미지 처리 서비스입니다.
**Gemini 3 Pro Image** 모델을 활용하여 세 가지 핵심 기능을 제공합니다.

## ✨ 핵심 기능

### 1. 🌟 포스터형 썸네일 (Aesthetic Hook)
- 평범한 중고물품 사진을 스튜디오급 썸네일로 변환
- 깨끗한 배경 + 전문적인 조명
- 제품의 원래 질감/상태는 유지 (빈티지 가치 보존)

### 2. 🛡️ 인증 영역 선명화 (Trust Proof)
- 시리얼 넘버, 모델명 등 인증 정보 강조
- 특정 영역만 선택하여 가독성 향상
- 나머지 이미지는 원본 그대로 유지

### 3. ⚠️ 하자 부분 강조 (The Honesty)
- 정직한 상태 표시로 구매자 신뢰 확보
- 하자 부분을 미적으로 강조
- "정직한 판매자" 이미지 구축

## 🛠️ 기술 스택

### Backend
- **FastAPI** - Python 고성능 웹 프레임워크
- **Gemini 2.5 Flash Image** - Google AI 이미지 생성/편집 모델
- **google-genai** - Google Gemini API 공식 SDK
- **Pillow (PIL)** - 이미지 처리 및 최적화
- **python-dotenv** - 환경변수 관리

### Frontend
- **Vanilla HTML/CSS/JS** - 단독 실행 가능
- **React (선택)** - 컴포넌트 기반 버전
- **Pretendard** - 한글 최적화 폰트

## 📁 프로젝트 구조

```
realrealrealreal/
├── app/                    # 백엔드 코드
│   ├── __init__.py
│   ├── main.py            # FastAPI 앱 및 엔드포인트
│   ├── config.py          # 설정 및 Gemini 클라이언트 초기화
│   ├── models.py          # Pydantic 데이터 모델
│   ├── prompts.py         # 프롬프트 템플릿
│   ├── utils.py           # 유틸리티 함수 (이미지 처리 등)
│   └── gemini_client.py   # Gemini API 클라이언트
├── frontend/              # 프론트엔드 파일
│   ├── index.html         # 단독 실행 가능한 웹 앱
│   └── App.jsx            # React 컴포넌트 버전
├── run.py                 # 서버 실행 스크립트
├── requirements.txt       # Python 의존성
└── README.md
```

## 🚀 시작하기

### 1. 백엔드 설정

```bash
# 가상환경 생성 (선택)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
# Windows (cmd):
set GEMINI_API_KEY=your-api-key-here

# Windows (PowerShell):
$env:GEMINI_API_KEY='your-api-key-here'

# Linux/Mac:
export GEMINI_API_KEY='your-api-key-here'

# 또는 .env 파일 생성 (python-dotenv 자동 로드)
# .env 파일에 GEMINI_API_KEY=your-api-key-here 작성

# 서버 실행
python run.py
# 또는
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 프론트엔드 실행

```bash
# 방법 1: 단순 파일 열기
# frontend/index.html을 브라우저에서 직접 열기

# 방법 2: 로컬 서버로 실행
cd frontend
python -m http.server 3000
# http://localhost:3000 접속

# 방법 3: 루트에서 실행
python -m http.server 3000 --directory frontend
```

### 3. API 키 발급

1. [Google AI Studio](https://aistudio.google.com/) 접속
2. API Key 생성
3. `GEMINI_API_KEY` 환경변수로 설정

## 📡 API 엔드포인트

### 기본 처리 API
```
POST /api/process
```

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| file | File | 이미지 파일 (필수) |
| process_type | string | "poster" \| "serial" \| "defect" |
| reference_files | File[] | 레퍼런스 이미지 파일들 (선택, 여러 장 가능) |
| additional_instructions | string | 추가 지시사항 (선택) |
| mask_x, mask_y | int | 영역 시작 좌표 (serial, defect용) |
| mask_width, mask_height | int | 영역 크기 (serial, defect용) |

**레퍼런스 이미지 기능:**
- 첫 번째 이미지가 메인 제품 이미지
- 나머지 이미지는 스타일 가이드로 사용
- 레퍼런스 이미지의 스타일, 조명, 배경을 메인 이미지에 적용

### 전용 엔드포인트
```
POST /api/poster   # 포스터 썸네일 전용
POST /api/serial   # 시리얼 선명화 전용
POST /api/defect   # 하자 강조 전용
```

### 응답 형식
```json
{
  "success": true,
  "image_base64": "...",
  "message": "이미지 처리가 완료되었습니다.",
  "process_type": "poster",
  "processing_time_ms": 12500
}
```

## 💰 비즈니스 모델 (제안)

| 상품 | 내용 | 가격 |
|------|------|------|
| Trial | 썸네일 1장 | 990원 |
| Standard | 썸네일 + 인증샷 3장 세트 | 2,900원 |
| Premium | Standard + 판매 컨설팅 | 4,900원 |
| 월 구독 | 월 10건 처리권 | 19,900원 |

## ⚠️ API 사용량 제한

Gemini 2.5 Flash Image 모델 (무료 티어 기준):
- **RPM**: 20 (분당 요청 수)
- **TPM**: 100K (분당 토큰 수)
- **RPD**: 250 (일일 요청 수)

> 서비스 확장 시 유료 플랜으로 업그레이드 필요

## 🔧 주요 기능

### 레퍼런스 이미지 지원
- 여러 레퍼런스 이미지를 업로드하여 스타일 일관성 확보
- 첫 번째 이미지가 메인 제품 이미지
- 나머지 이미지는 스타일 가이드로 활용
- 문서 기반 모범 사례 적용

### 이미지 최적화
- 자동 이미지 리사이즈 (최대 1500px)
- JPEG/PNG 자동 최적화
- 처리 속도 향상 및 API 비용 절감

## 🎯 판매 팁

1. **포스터 썸네일**을 첫 번째 사진으로 사용
2. 나머지 사진은 **실제 제품 사진**으로 신뢰도 확보
3. 하자가 있다면 **정직하게 표시**하여 분쟁 방지

## 📝 라이선스

MIT License

## 🙏 크레딧

- Gemini API by Google
- Pretendard Font by Kil Hyung-jin

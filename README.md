# 내 똥템을 애플처럼 – 중고거래 AI 포스터 에디터

사용자가 대충 찍은 중고 물건 사진을 업로드하면, AI가 배경 제거, Stable Diffusion img2img 처리, ControlNet Depth 적용, 그리고 Gemini로 생성한 광고 카피를 자동으로 합성하여 애플 광고 같은 고퀄리티 포스터로 만들어주는 서비스입니다.

## 🎯 주요 기능

- **이미지 업로드**: JPG/PNG 파일 업로드
- **배경 제거**: rembg를 사용한 자동 배경 제거
- **Stable Diffusion 처리**: SD 1.5 + ControlNet(Depth) + LoRA로 광고풍 이미지 보정
- **AI 카피 생성**: Gemini API를 사용한 광고 카피 자동 생성
- **템플릿 합성**: 애플 스타일 그라데이션 배경 + 레이아웃
- **최종 포스터**: 768×1024 해상도의 인스타 카드형 포스터 생성

## 🏗️ 아키텍처

- **프론트엔드**: Next.js 14 (React + TypeScript)
- **백엔드**: FastAPI (Python)
- **이미지 처리**: 
  - rembg (배경 제거)
  - Stable Diffusion 1.5 (img2img)
  - ControlNet Depth
  - LoRA 지원
  - Pillow (이미지 합성)
- **AI 카피**: Google Gemini API

## 📦 설치 및 실행

### 사전 요구사항

- Python 3.11 이상
- Node.js 18 이상
- NVIDIA GPU (GTX 1080 Ti 이상, 11GB VRAM 권장)
- CUDA 11.8 이상
- Gemini API 키

### 백엔드 설정

1. 백엔드 디렉토리로 이동:
```bash
cd backend
```

2. 가상환경 생성 및 활성화:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

3. 의존성 설치:
```bash
pip install -r requirements.txt
```

**주의**: PyTorch와 CUDA 버전은 시스템에 맞게 설치해야 합니다.
```bash
# CUDA 11.8 예시
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

4. 환경변수 설정:
```bash
# .env 파일 생성
cp .env.example .env
# .env 파일에 다음 내용 추가:
# GEMINI_API_KEY=your_gemini_api_key_here
# LORA_PATH=path/to/lora/model.safetensors (선택사항)
```

5. 서버 실행:
```bash
uvicorn app.main:app --reload --port 8000
```

### 프론트엔드 설정

1. 프론트엔드 디렉토리로 이동:
```bash
cd frontend
```

2. 의존성 설치:
```bash
npm install
```

3. 개발 서버 실행:
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 🚀 사용 방법

1. 이미지 업로드: 판매할 중고 제품 사진을 업로드합니다.
2. 정보 입력: 제품명, 설명, 가격을 입력합니다 (선택사항).
3. 스타일 선택: 애플/병맛/드라마틱 스타일 중 하나를 선택합니다.
4. 포스터 생성: "포스터 생성하기" 버튼을 클릭합니다.
5. 다운로드: 생성된 포스터를 다운로드합니다.

## 📁 프로젝트 구조

```
project/
  frontend/
    pages/          # Next.js 페이지
    components/     # React 컴포넌트
    styles/         # CSS 스타일
  backend/
    app/
      main.py       # FastAPI 메인 앱
      api/          # API 엔드포인트
      services/     # 비즈니스 로직
        rembg_engine.py      # 배경 제거 엔진
        sd_pipeline.py       # Stable Diffusion 파이프라인
        copywriter.py        # Gemini 카피 생성
        template_engine.py   # 템플릿 합성
        pipeline.py          # 전체 파이프라인
    static/         # 정적 파일 (생성된 포스터)
    models/         # 모델 저장 (선택사항)
```

## 🔧 API 엔드포인트

### POST /api/generate-poster

포스터를 생성합니다.

**Request (multipart/form-data):**
- `file`: 이미지 파일
- `tone`: 스타일 톤 ("apple", "funny", "dramatic")
- `product_name`: 제품명 (선택)
- `description`: 제품 설명 (선택)
- `price`: 가격 (선택)

**Response:**
```json
{
  "result_url": "/static/poster_xxxxx.png",
  "headline": "생성된 헤드라인",
  "subcopy": "생성된 서브카피",
  "cta": "생성된 CTA"
}
```

## ⚙️ Stable Diffusion 설정

### 기본 설정 (GTX 1080 Ti 최적화)

- **Base Model**: Stable Diffusion 1.5
- **ControlNet**: Depth (control_v11f1p_sd15_depth)
- **ControlNet Strength**: 0.75
- **Denoise Strength**: 0.30
- **CFG Scale**: 5.0
- **Steps**: 24
- **Sampler**: DPM++ SDE Karras
- **Resolution**: 768×1024

### LoRA 지원

LoRA 모델을 사용하려면 `.env` 파일에 경로를 설정하세요:
```
LORA_PATH=path/to/your/lora/model.safetensors
```

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Axios
- **Backend**: FastAPI, Python
- **Image Processing**: 
  - rembg
  - Stable Diffusion 1.5 (diffusers)
  - ControlNet
  - Pillow
- **AI**: Google Gemini API

## 📝 라이센스

이 프로젝트는 오픈소스입니다.

## 🤝 기여

이슈와 풀 리퀘스트를 환영합니다!

## ⚠️ 주의사항

- GPU 메모리 부족 시 `enable_model_cpu_offload()` 사용
- 첫 실행 시 모델 다운로드로 인해 시간이 걸릴 수 있습니다
- CUDA 버전은 시스템에 맞게 설치해야 합니다

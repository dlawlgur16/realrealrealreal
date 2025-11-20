# 빠른 시작 가이드

## 1. 백엔드 설정

### Windows

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Mac/Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### PyTorch 설치 (GPU 지원)

CUDA 버전에 맞게 PyTorch를 설치하세요:

```bash
# CUDA 11.8 예시
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# CPU만 사용하는 경우
pip install torch torchvision
```

### 환경변수 설정

`backend` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가:

```
GEMINI_API_KEY=your_gemini_api_key_here
LORA_PATH=path/to/lora/model.safetensors (선택사항)
```

**API 키 발급:**
- Gemini API 키: [Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급

**LoRA 모델 (선택사항):**
- LoRA 모델을 사용하려면 경로를 설정하세요
- Civitai 등에서 "Apple Studio Lighting" 또는 "Minimalist Product Shot" 스타일 LoRA 다운로드

### 백엔드 실행

```bash
# backend 폴더에서
uvicorn app.main:app --reload --port 8000
```

백엔드가 `http://localhost:8000`에서 실행됩니다.

**첫 실행 시:**
- Stable Diffusion 모델 다운로드 (약 4GB)
- ControlNet 모델 다운로드 (약 1.5GB)
- 시간이 걸릴 수 있습니다

## 2. 프론트엔드 설정

새 터미널 창을 열고:

```bash
cd frontend
npm install
npm run dev
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

## 3. 사용 방법

1. 브라우저에서 `http://localhost:3000` 접속
2. 중고 제품 사진 업로드
3. 제품 정보 입력 (선택사항)
4. 스타일 선택 (애플/병맛/드라마틱)
5. "포스터 생성하기" 버튼 클릭
6. 생성된 포스터 다운로드

## 문제 해결

### GPU 메모리 부족

GTX 1080 Ti (11GB)에서 메모리 부족 시:
- `sd_pipeline.py`에서 `enable_model_cpu_offload()` 사용
- 배치 크기 줄이기
- xformers 설치: `pip install xformers`

### rembg 설치 오류

rembg는 처음 실행 시 모델을 다운로드합니다. 인터넷 연결이 필요합니다.

### CUDA 오류

```bash
# CUDA 버전 확인
nvidia-smi

# PyTorch CUDA 버전 확인
python -c "import torch; print(torch.cuda.is_available())"
```

CUDA 버전에 맞는 PyTorch를 설치하세요.

### 폰트 오류

한글 폰트가 제대로 표시되지 않으면, Windows의 경우 `C:/Windows/Fonts/malgun.ttf`가 있는지 확인하세요.

### CORS 오류

백엔드와 프론트엔드가 다른 포트에서 실행되므로 CORS 설정이 필요합니다. `backend/app/main.py`의 CORS 설정을 확인하세요.

### Stable Diffusion 모델 다운로드 실패

인터넷 연결을 확인하고, Hugging Face 토큰이 필요한 경우 설정하세요:
```bash
huggingface-cli login
```

### Gemini API 오류

API 키가 올바른지 확인하고, 할당량을 확인하세요.

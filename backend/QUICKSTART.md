# 🚀 빠른 시작 가이드

## 1단계: 환경 설정 (5분)

### 1.1 Python 가상환경 생성
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
```

### 1.2 의존성 설치
```bash
pip install -r requirements.txt
```

**중요**: PyTorch CUDA 버전 별도 설치
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### 1.3 환경변수 설정
`backend/.env` 파일 생성:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Gemini API 키 발급: https://makersuite.google.com/app/apikey

## 2단계: 설정 확인 (1분)

```bash
python test_setup.py
```

모든 체크가 통과하면 다음 단계로!

## 3단계: 서버 실행 (1분)

### 백엔드
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 프론트엔드 (새 터미널)
```bash
cd frontend
npm install
npm run dev
```

## 4단계: 테스트 (2분)

1. 브라우저에서 `http://localhost:3000` 접속
2. 작은 이미지 업로드 (처음 테스트용)
3. 제품 정보 입력
4. "포스터 생성하기" 클릭
5. 결과 확인!

## ⚠️ 첫 실행 시 주의사항

- **모델 다운로드**: 첫 실행 시 약 5-6GB 모델 다운로드 (시간 소요)
- **인터넷 연결 필수**: 모델 다운로드 필요
- **GPU 메모리**: GTX 1080 Ti (11GB) 권장

## 🐛 문제 해결

### GPU 인식 안 됨
```bash
python -c "import torch; print(torch.cuda.is_available())"
```
False면 PyTorch CUDA 버전 재설치

### 모델 다운로드 실패
```bash
huggingface-cli login
```

### Gemini API 오류
`.env` 파일의 API 키 확인

## 📝 다음 단계

- [ ] LoRA 모델 추가 (선택)
- [ ] 로깅 시스템 추가
- [ ] 배포 준비


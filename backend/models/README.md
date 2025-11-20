# 모델 파일 배치 위치

## 📁 디렉토리 구조

이 디렉토리에 모델 파일들을 다음과 같이 배치하세요:

```
models/
  ├── stable-diffusion-v1-5/     # Stable Diffusion 1.5 모델
  │   └── v1-5-pruned.safetensors
  │
  └── controlnet-depth/          # ControlNet Depth 모델
      ├── control_v11f1p_sd15_depth.pth
      └── control_v11f1p_sd15_depth.yaml
```

## 📦 파일 배치 방법

### 방법 1: 직접 복사 (권장)

1. `stable-diffusion-v1-5` 폴더 생성
2. `v1-5-pruned.safetensors` 파일을 해당 폴더에 복사

3. `controlnet-depth` 폴더 생성
4. `control_v11f1p_sd15_depth.pth`와 `.yaml` 파일을 해당 폴더에 복사

### 방법 2: Hugging Face 형식으로 변환

diffusers는 Hugging Face 형식의 모델을 기대합니다. safetensors 파일만으로는 부족할 수 있습니다.

**Stable Diffusion 1.5의 경우:**
- `model_index.json` 파일이 필요할 수 있습니다
- 또는 Hugging Face에서 전체 모델을 다운로드하는 것이 더 안전합니다

## ⚠️ 주의사항

- `.safetensors` 파일만으로는 작동하지 않을 수 있습니다
- Hugging Face 형식의 전체 모델 디렉토리가 필요할 수 있습니다
- 모델 파일이 없으면 자동으로 Hugging Face에서 다운로드됩니다

## 🔍 확인

코드가 자동으로 이 경로를 확인하고, 파일이 있으면 로컬 모델을 사용합니다.


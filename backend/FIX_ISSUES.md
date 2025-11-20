# 🔧 문제 해결 가이드

## 문제 1: ControlNet 모델 로딩 실패

**원인**: 로컬 ControlNet 모델이 Hugging Face 형식이 아님 (`.pth`, `.yaml`만 있음)

**해결**: 
- 코드가 자동으로 Hugging Face에서 다운로드하도록 수정됨
- 또는 Hugging Face에서 전체 모델 다운로드:
  ```python
  from diffusers import ControlNetModel
  ControlNetModel.from_pretrained("lllyasviel/control_v11f1p_sd15_depth")
  ```

## 문제 2: Gemini API 키 오류

**원인**: API 키가 잘못되었거나 설정되지 않음

**해결**:
1. `.env` 파일 확인:
   ```
   GEMINI_API_KEY=AIza... (올바른 키)
   ```

2. API 키 발급 확인:
   - https://makersuite.google.com/app/apikey
   - "Create API Key" 클릭
   - 키가 `AIza`로 시작해야 함

3. 서버 재시작:
   ```cmd
   # 서버 중지 후 재시작
   uvicorn app.main:app --reload --port 8000
   ```

**참고**: API 키가 없어도 기본 카피로 작동합니다.


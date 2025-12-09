"""하자 감지 모듈 - 학습된 모델 사용 옵션"""

# 옵션 1: YOLO 기반 하자 감지 (학습 필요)
# Ultralytics YOLO를 사용한 하자 감지 예시

"""
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import base64

class DefectDetector:
    def __init__(self, model_path: str = "models/defect_detector.pt"):
        # 학습된 모델 로드
        self.model = YOLO(model_path)
        
    def detect_defects(self, image_base64: str) -> dict:
        # base64 이미지 디코딩
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        # YOLO로 하자 감지
        results = self.model(image_np)
        
        defects = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # 하자 감지된 영역
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = box.conf[0].cpu().numpy()
                class_id = int(box.cls[0].cpu().numpy())
                
                defects.append({
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'confidence': float(confidence),
                    'class': class_id
                })
        
        return {
            'defects_found': len(defects) > 0,
            'defects': defects,
            'count': len(defects)
        }
"""

# 옵션 2: Gemini 기반 하자 감지 (현재 방식, 학습 불필요)
# 프롬프트 엔지니어링으로 하자 감지 시도

def detect_defects_with_gemini(image_base64: str, prompt: str) -> dict:
    """
    Gemini를 사용한 하자 감지 (학습 불필요, 프롬프트 기반)
    
    장점:
    - 학습 불필요
    - 즉시 사용 가능
    - 다양한 하자 유형 감지 가능
    
    단점:
    - 정확도가 학습된 모델보다 낮을 수 있음
    - API 비용 발생
    """
    # Gemini API 호출하여 하자 감지
    # 현재 구현된 방식
    pass

# 옵션 3: 하이브리드 접근
# 1단계: Gemini로 빠르게 감지 시도
# 2단계: 확신이 없으면 학습된 모델 사용

"""
def detect_defects_hybrid(image_base64: str, gemini_prompt: str, yolo_model_path: str = None):
    # 1단계: Gemini로 빠른 감지
    gemini_result = detect_defects_with_gemini(image_base64, gemini_prompt)
    
    # Gemini가 확신이 없으면 (confidence 낮음) 학습된 모델 사용
    if gemini_result.get('confidence', 0) < 0.7 and yolo_model_path:
        detector = DefectDetector(yolo_model_path)
        yolo_result = detector.detect_defects(image_base64)
        return yolo_result
    
    return gemini_result
"""

# 학습 모델 구축 가이드
"""
학습 모델 구축 단계:

1. 데이터 수집
   - 하자가 있는 제품 이미지 수집
   - 하자 유형별로 분류 (스크래치, 찌그러짐, 파손 등)
   - 하자 영역에 바운딩 박스 라벨링

2. 데이터셋 준비
   - YOLO 형식: images/, labels/ 폴더 구조
   - 각 이미지에 대응하는 .txt 라벨 파일
   - train/val/test 분할

3. 모델 학습
   - YOLOv8 또는 YOLOv9 사용
   - 사전 학습된 가중치로 시작 (transfer learning)
   - 하이퍼파라미터 튜닝

4. 모델 평가 및 배포
   - 정확도, 재현율, F1 점수 확인
   - 모델 저장 (.pt 파일)
   - API에 통합

필요한 라이브러리:
- ultralytics (YOLO)
- opencv-python
- numpy
- pillow
"""







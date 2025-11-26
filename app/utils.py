"""유틸리티 함수"""
import io
import base64
from typing import Optional
from PIL import Image


def resize_image_if_needed(image: Image.Image, max_size: int = 1500) -> Image.Image:
    """이미지가 너무 크면 리사이즈 (비율 유지)"""
    width, height = image.size
    if width <= max_size and height <= max_size:
        return image
    
    # 비율 유지하며 리사이즈
    if width > height:
        new_width = max_size
        new_height = int(height * (max_size / width))
    else:
        new_height = max_size
        new_width = int(width * (max_size / height))
    
    print(f"[최적화] 이미지 리사이즈: {width}x{height} -> {new_width}x{new_height}")
    return image.resize((new_width, new_height), Image.Resampling.LANCZOS)


def encode_image_to_base64(image_bytes: bytes, optimize: bool = True, max_size: int = 1500) -> str:
    """이미지를 base64로 인코딩 (최적화 옵션 포함)"""
    if optimize:
        try:
            # 이미지 열기
            image = Image.open(io.BytesIO(image_bytes))
            # 리사이즈 필요시
            image = resize_image_if_needed(image, max_size)
            # JPEG로 최적화 (품질 85%)
            output = io.BytesIO()
            if image.mode in ('RGBA', 'LA', 'P'):
                # 투명도가 있으면 PNG로 저장
                image.save(output, format='PNG', optimize=True)
            else:
                # RGB면 JPEG로 저장 (더 작은 크기)
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                image.save(output, format='JPEG', quality=85, optimize=True)
            image_bytes = output.getvalue()
            print(f"[최적화] 이미지 크기 최적화 완료: {len(image_bytes)} bytes")
        except Exception as e:
            print(f"[최적화] 이미지 최적화 실패 (원본 사용): {e}")
    
    return base64.b64encode(image_bytes).decode('utf-8')


def decode_base64_to_image(base64_string: str) -> bytes:
    """base64를 이미지 바이트로 디코딩"""
    return base64.b64decode(base64_string)


def extract_image_from_response(response: dict) -> Optional[str]:
    """Gemini 응답에서 이미지 추출"""
    import traceback
    try:
        print(f"[DEBUG] extract_image_from_response 호출")
        print(f"[DEBUG] response 타입: {type(response)}")
        print(f"[DEBUG] response 키: {list(response.keys()) if isinstance(response, dict) else 'dict 아님'}")
        
        candidates = response.get("candidates", [])
        print(f"[DEBUG] candidates 개수: {len(candidates)}")
        if not candidates:
            print("[DEBUG] candidates가 비어있음")
            return None
        
        content = candidates[0].get("content", {})
        print(f"[DEBUG] content 키: {list(content.keys())}")
        parts = content.get("parts", [])
        print(f"[DEBUG] parts 개수: {len(parts)}")
        
        for i, part in enumerate(parts):
            print(f"[DEBUG] Part {i}: {list(part.keys()) if isinstance(part, dict) else type(part)}")
            if "inlineData" in part:
                print(f"[DEBUG] Part {i}에서 inlineData 발견!")
                data = part["inlineData"].get("data")
                print(f"[DEBUG] 이미지 데이터 길이: {len(data) if data else 0}")
                return data
            elif "inline_data" in part:  # 소문자 언더스코어도 확인
                print(f"[DEBUG] Part {i}에서 inline_data 발견!")
                data = part["inline_data"].get("data")
                print(f"[DEBUG] 이미지 데이터 길이: {len(data) if data else 0}")
                return data
        
        print("[DEBUG] 이미지 데이터를 찾을 수 없음")
        return None
    except Exception as e:
        print(f"이미지 추출 오류: {e}")
        print(traceback.format_exc())
        return None


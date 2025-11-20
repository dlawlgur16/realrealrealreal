"""
rembg를 사용한 배경 제거 엔진
"""
from rembg import remove
from PIL import Image
import os
import uuid

class RemBGEngine:
    """배경 제거를 담당하는 엔진 클래스"""
    
    def __init__(self):
        """초기화: 출력 디렉토리 설정"""
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.output_dir = os.path.join(base_dir, "static", "processed")
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def remove_background(self, image_path: str) -> str:
        """
        이미지의 배경을 제거하고 투명 PNG로 저장합니다.
        
        Args:
            image_path: 원본 이미지 파일 경로
            
        Returns:
            배경이 제거된 이미지 파일 경로
        """
        # 원본 이미지 읽기
        with open(image_path, "rb") as input_file:
            input_data = input_file.read()
        
        # rembg로 배경 제거
        output_data = remove(input_data)
        
        # 결과 저장
        output_filename = f"transparent_{uuid.uuid4().hex[:8]}.png"
        output_path = os.path.join(self.output_dir, output_filename)
        
        with open(output_path, "wb") as output_file:
            output_file.write(output_data)
        
        return output_path


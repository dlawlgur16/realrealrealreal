"""
애플 스타일 포스터 템플릿 엔진
그라데이션 배경, 레이아웃, 폰트 처리
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import uuid
import platform
import numpy as np

class TemplateEngine:
    """애플 스타일 포스터 템플릿을 생성하는 엔진"""
    
    def __init__(self):
        """초기화: 출력 디렉토리 및 템플릿 설정"""
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.output_dir = os.path.join(base_dir, "static")
        os.makedirs(self.output_dir, exist_ok=True)
        
        # 템플릿 색상 설정
        self.templates = {
            "apple": {
                "bg_start": (245, 245, 245),  # #f5f5f5
                "bg_end": (239, 239, 239),    # #efefef
                "text_color": (0, 0, 0),
                "accent_color": (128, 128, 128)
            },
            "funny": {
                "bg_start": (255, 250, 240),
                "bg_end": (255, 245, 230),
                "text_color": (50, 50, 50),
                "accent_color": (255, 150, 0)
            },
            "dramatic": {
                "bg_start": (20, 20, 20),
                "bg_end": (40, 40, 40),
                "text_color": (255, 255, 255),
                "accent_color": (200, 200, 200)
            }
        }
    
    def _create_gradient_background(self, width: int, height: int, start_color: tuple, end_color: tuple) -> Image.Image:
        """
        그라데이션 배경 생성
        
        Args:
            width: 너비
            height: 높이
            start_color: 시작 색상 (RGB)
            end_color: 끝 색상 (RGB)
            
        Returns:
            그라데이션 배경 이미지
        """
        # 그라데이션 생성
        gradient = Image.new("RGB", (width, height))
        draw = ImageDraw.Draw(gradient)
        
        for y in range(height):
            # Y 위치에 따른 색상 보간
            ratio = y / height
            r = int(start_color[0] * (1 - ratio) + end_color[0] * ratio)
            g = int(start_color[1] * (1 - ratio) + end_color[1] * ratio)
            b = int(start_color[2] * (1 - ratio) + end_color[2] * ratio)
            
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        
        return gradient
    
    def _get_font(self, size: int, bold: bool = False):
        """시스템 폰트 가져오기 (고급 San-serif)"""
        try:
            if platform.system() == "Windows":
                # 고급스러운 폰트 우선순위
                font_paths = [
                    "C:/Windows/Fonts/NanumGothic.ttf",      # 나눔고딕 (깔끔한 한글)
                    "C:/Windows/Fonts/NanumBarunGothic.ttf", # 나눔바른고딕
                    "C:/Windows/Fonts/malgun.ttf",           # 맑은 고딕
                    "C:/Windows/Fonts/NotoSansCJK-Regular.ttc", # Noto Sans (고급)
                    "C:/Windows/Fonts/NotoSansKR-Regular.otf",  # Noto Sans KR
                    "C:/Windows/Fonts/AppleSDGothicNeo.ttc",    # Apple SD Gothic (고급)
                    "C:/Windows/Fonts/calibri.ttf",          # Calibri (영문용)
                    "C:/Windows/Fonts/arial.ttf",
                ]
            elif platform.system() == "Darwin":  # macOS
                font_paths = [
                    "/System/Library/Fonts/Helvetica.ttc",
                    "/Library/Fonts/Arial.ttf",
                ]
            else:  # Linux
                font_paths = [
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
                ]
            
            for path in font_paths:
                if os.path.exists(path):
                    return ImageFont.truetype(path, size)
            
            return ImageFont.load_default()
        except:
            return ImageFont.load_default()
    
    async def create_poster(
        self,
        product_image: Image.Image,
        tone: str,
        headline: str,
        subcopy: str,
        cta: str,
        price: str = None
    ) -> str:
        """
        최종 포스터 생성
        
        Args:
            product_image: 제품 이미지 (Stable Diffusion 처리된)
            tone: 스타일 톤
            headline: 헤드라인
            subcopy: 서브카피
            cta: CTA 문구
            price: 가격 정보 (선택)
            
        Returns:
            생성된 포스터 파일 경로
        """
        # 템플릿 설정 가져오기
        template_config = self.templates.get(tone, self.templates["apple"])
        
        # 포스터 크기 (768x1024)
        poster_width = 768
        poster_height = 1024
        
        # 그라데이션 배경 생성
        poster = self._create_gradient_background(
            poster_width,
            poster_height,
            template_config["bg_start"],
            template_config["bg_end"]
        )
        
        draw = ImageDraw.Draw(poster)
        
        # 제품 이미지 리사이즈 및 배치
        max_product_width = poster_width - 100
        max_product_height = poster_height - 400  # 텍스트 공간 확보
        
        img_ratio = product_image.width / product_image.height
        if img_ratio > 1:
            new_width = min(max_product_width, product_image.width)
            new_height = int(new_width / img_ratio)
        else:
            new_height = min(max_product_height, product_image.height)
            new_width = int(new_height * img_ratio)
        
        product_image = product_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 제품 이미지 중앙 배치
        img_x = (poster_width - new_width) // 2
        img_y = 150
        
        # 그림자 효과
        shadow = Image.new("RGBA", (new_width + 20, new_height + 20), (0, 0, 0, 30))
        poster.paste(shadow, (img_x - 10, img_y + 10), shadow)
        
        # 제품 이미지 배치
        if product_image.mode == "RGBA":
            poster.paste(product_image, (img_x, img_y), product_image)
        else:
            poster.paste(product_image, (img_x, img_y))
        
        # 폰트 설정
        headline_font = self._get_font(42, bold=True)
        subcopy_font = self._get_font(28)
        cta_font = self._get_font(24)
        price_font = self._get_font(32, bold=True)
        
        text_color = template_config["text_color"]
        accent_color = template_config["accent_color"]
        
        # 텍스트 위치 계산
        text_y_start = img_y + new_height + 40
        
        # 헤드라인 (상단 중앙)
        headline_bbox = draw.textbbox((0, 0), headline, font=headline_font)
        headline_width = headline_bbox[2] - headline_bbox[0]
        headline_x = (poster_width - headline_width) // 2
        draw.text((headline_x, 60), headline, fill=text_color, font=headline_font)
        
        # 서브카피 (중앙)
        subcopy_bbox = draw.textbbox((0, 0), subcopy, font=subcopy_font)
        subcopy_width = subcopy_bbox[2] - subcopy_bbox[0]
        subcopy_x = (poster_width - subcopy_width) // 2
        draw.text((subcopy_x, text_y_start), subcopy, fill=text_color, font=subcopy_font)
        
        # 하단 영역
        bottom_y = poster_height - 120
        
        # CTA (하단 왼쪽)
        cta_bbox = draw.textbbox((0, 0), cta, font=cta_font)
        cta_x = 40
        draw.text((cta_x, bottom_y), cta, fill=accent_color, font=cta_font)
        
        # 가격 정보 (하단 오른쪽)
        if price:
            price_text = f"{price}원"
            price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
            price_width = price_bbox[2] - price_bbox[0]
            price_x = poster_width - price_width - 40
            draw.text((price_x, bottom_y), price_text, fill=text_color, font=price_font)
        
        # 결과 저장
        output_filename = f"poster_{uuid.uuid4().hex[:8]}.png"
        output_path = os.path.join(self.output_dir, output_filename)
        poster.save(output_path, "PNG", quality=95)
        
        return output_path


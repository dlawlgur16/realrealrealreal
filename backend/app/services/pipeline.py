"""
전체 포스터 생성 파이프라인
1. 배경 제거 (rembg)
2. Stable Diffusion img2img + ControlNet 처리
3. Gemini 카피 생성
4. 템플릿 합성
"""
import os
from PIL import Image
from app.services.rembg_engine import RemBGEngine
from app.services.sd_pipeline import SDPipeline
from app.services.copywriter import CopyWriter
from app.services.template_engine import TemplateEngine

class PosterPipeline:
    """전체 포스터 생성 파이프라인"""
    
    def __init__(self):
        """초기화: 모든 엔진 로드"""
        self.rembg_engine = RemBGEngine()
        self.sd_pipeline = SDPipeline()
        self.copywriter = CopyWriter()
        self.template_engine = TemplateEngine()
    
    async def process(
        self,
        image_path: str,
        tone: str,
        product_name: str = "제품",
        description: str = "",
        price: str = None
    ) -> dict:
        """
        전체 파이프라인 실행
        
        Args:
            image_path: 업로드된 이미지 경로
            tone: 스타일 톤 ("apple", "funny", "dramatic")
            product_name: 제품명
            description: 제품 설명
            price: 가격
            
        Returns:
            결과 딕셔너리 (headline, subcopy, cta, result_url)
        """
        try:
            # 1. 배경 제거
            print("Step 1: Removing background...")
            transparent_image_path = await self.rembg_engine.remove_background(image_path)
            transparent_image = Image.open(transparent_image_path).convert("RGB")
            
            # 2. Stable Diffusion img2img 처리
            print("Step 2: Processing with Stable Diffusion...")
            prompt = self._get_sd_prompt(tone, product_name)
            print(f"   SD Prompt: {prompt}")
            processed_image = await self.sd_pipeline.process(
                input_image=transparent_image,
                prompt=prompt,
                denoise_strength=0.30,
                cfg_scale=5.0,
                num_inference_steps=24,
                controlnet_conditioning_scale=0.75
            )
            print(f"   SD processing result: {type(processed_image)}")
            
            # 3. 카피 생성
            print("Step 3: Generating copy with Gemini...")
            copy_result = await self.copywriter.generate_copy(
                tone=tone,
                product_name=product_name,
                description=description,
                price=price
            )
            
            # 4. 템플릿 합성
            print("Step 4: Creating final poster...")
            result_path = await self.template_engine.create_poster(
                product_image=processed_image,
                tone=tone,
                headline=copy_result["headline"],
                subcopy=copy_result["subcopy"],
                cta=copy_result["cta"],
                price=price
            )
            
            # 결과 URL 생성
            result_url = f"/static/{os.path.basename(result_path)}"
            
            # 임시 파일 정리
            if os.path.exists(transparent_image_path):
                os.remove(transparent_image_path)
            
            return {
                "result_url": result_url,
                "headline": copy_result["headline"],
                "subcopy": copy_result["subcopy"],
                "cta": copy_result["cta"]
            }
        
        except Exception as e:
            print(f"Pipeline error: {e}")
            raise e
    
    def _get_sd_prompt(self, tone: str, product_name: str) -> str:
        """
        톤에 따른 Stable Diffusion 프롬프트 생성
        
        Args:
            tone: 스타일 톤
            product_name: 제품명
            
        Returns:
            프롬프트 문자열
        """
        prompts = {
            "apple": f"professional product photography, studio lighting, minimalist, {product_name}, high quality, 4k, elegant, sophisticated, clean background, soft shadows",
            "funny": f"playful product photography, colorful, fun, {product_name}, cartoonish style, vibrant, humorous",
            "dramatic": f"dramatic product photography, bold lighting, cinematic, {product_name}, powerful, intense, high contrast"
        }
        
        return prompts.get(tone, prompts["apple"])

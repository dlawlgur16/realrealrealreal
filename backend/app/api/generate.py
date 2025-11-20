from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import os
from app.services.pipeline import PosterPipeline

router = APIRouter()

@router.post("/generate-poster")
async def generate_poster(
    file: UploadFile = File(...),
    tone: str = Form(...),
    price: Optional[str] = Form(None),
    description: Optional[str] = Form(""),
    product_name: Optional[str] = Form("")
):
    """
    이미지를 업로드하고 AI 포스터를 생성합니다.
    
    - **file**: 업로드할 이미지 파일
    - **tone**: 스타일 톤 ("apple", "funny", "dramatic")
    - **price**: 제품 가격 (선택)
    - **description**: 제품 설명 (선택)
    - **product_name**: 제품명 (선택)
    
    처리 과정:
    1. 배경 제거 (rembg)
    2. Stable Diffusion img2img + ControlNet 처리
    3. Gemini 카피 생성
    4. 템플릿 합성
    """
    import sys
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"📥 POST /api/generate-poster 요청 받음", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)
    print(f"   파일: {file.filename}")
    print(f"   톤: {tone}")
    print(f"   제품명: {product_name}")
    print(f"   설명: {description}")
    print(f"   가격: {price}")
    print(f"{'='*60}\n")
    
    try:
        # 파일 저장
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        upload_dir = os.path.join(base_dir, "static", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # 파일명 안전 처리
        safe_filename = file.filename.replace(" ", "_")
        file_path = os.path.join(upload_dir, safe_filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 파이프라인 실행
        print("🚀 파이프라인 시작...")
        pipeline = PosterPipeline()
        result = await pipeline.process(
            image_path=file_path,
            tone=tone,
            product_name=product_name or "제품",
            description=description,
            price=price
        )
        
        print(f"✅ 파이프라인 완료!")
        print(f"   결과 URL: {result.get('result_url', 'N/A')}")
        print(f"   헤드라인: {result.get('headline', 'N/A')}")
        
        # 임시 파일 삭제
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return JSONResponse(content=result)
    
    except Exception as e:
        print(f"\n❌ 에러 발생: {e}")
        import traceback
        traceback.print_exc()
        print(f"{'='*60}\n")
        
        # 에러 발생 시 임시 파일 정리
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


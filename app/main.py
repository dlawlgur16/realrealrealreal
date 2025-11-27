"""
당근 부스터 (Karrot Booster) - 백엔드 API 서버
중고거래 프리미엄 포토 서비스

핵심 기능:
1. 포스터형 썸네일 생성 (Aesthetic Hook)
2. 인증 필수 부분 클린 보정 (Trust Proof)
3. 하자 부분 감성적 강조 (The Honesty)
"""

import time
import traceback
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.config import client
from app.models import ProcessResult
from app.prompts import get_prompt_by_type, add_reference_image_instructions, POSTER_THUMBNAIL_PROMPT, SERIAL_ENHANCEMENT_PROMPT, DEFECT_HIGHLIGHT_PROMPT
from app.utils import encode_image_to_base64, extract_image_from_response
from app.gemini_client import call_gemini_api

# 로깅 설정
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="당근 부스터 API",
    description="중고거래 프리미엄 포토 서비스 - AI 기반 이미지 변환",
    version="1.0.0"
)

# 전역 예외 핸들러
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """모든 예외를 캐치하여 로깅"""
    error_msg = f"예외 발생: {type(exc).__name__}: {str(exc)}"
    error_trace = traceback.format_exc()
    logger.error(f"{error_msg}\n{error_trace}")
    print(f"\n{'='*50}", flush=True)
    print(f"에러 발생!", flush=True)
    print(f"타입: {type(exc).__name__}", flush=True)
    print(f"메시지: {str(exc)}", flush=True)
    print(f"트레이스백:\n{error_trace}", flush=True)
    print(f"{'='*50}\n", flush=True)
    response = JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": f"서버 오류: {str(exc)}",
            "error_type": type(exc).__name__
        }
    )
    # CORS 헤더 추가
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용
    allow_credentials=False,  # credentials와 wildcard origin은 함께 사용 불가
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
    expose_headers=["*"],  # 모든 헤더 노출
)


# ============== API 엔드포인트 ==============

@app.get("/")
async def root():
    """API 상태 확인"""
    return {
        "service": "당근 부스터 API",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "포스터형 썸네일 생성 (poster)",
            "인증 부분 클린 보정 (serial)",
            "하자 부분 강조 (defect)"
        ]
    }


@app.post("/api/process", response_model=ProcessResult)
async def process_image(
    request: Request,
    file: UploadFile = File(...),
    process_type: str = Form("poster"),
    additional_instructions: Optional[str] = Form(None),
    mask_x: Optional[int] = Form(None),
    mask_y: Optional[int] = Form(None),
    mask_width: Optional[int] = Form(None),
    mask_height: Optional[int] = Form(None)
):
    """
    이미지 처리 API
    
    - process_type: "poster" | "serial" | "defect"
    - file: 처리할 메인 이미지 파일
    - additional_instructions: 추가 지시사항 (선택)
    - mask_*: 특정 영역 지정 좌표 (serial, defect 타입용)
    - reference_files: 레퍼런스 이미지 파일들 (선택, 여러 장 가능) - form-data에서 직접 파싱
    """
    start_time = time.time()
    
    # Request에서 레퍼런스 파일만 파싱 (나머지는 FastAPI가 자동으로 파싱)
    form = await request.form() if request else None
    
    # 타입 변환
    if mask_x is not None:
        try:
            mask_x = int(mask_x)
        except:
            mask_x = None
    if mask_y is not None:
        try:
            mask_y = int(mask_y)
        except:
            mask_y = None
    if mask_width is not None:
        try:
            mask_width = int(mask_width)
        except:
            mask_width = None
    if mask_height is not None:
        try:
            mask_height = int(mask_height)
        except:
            mask_height = None
    
    print(f"\n[API] /api/process 요청 받음", flush=True)
    print(f"[API] process_type: {process_type}", flush=True)
    print(f"[API] file.content_type: {file.content_type}", flush=True)
    print(f"[API] file.filename: {file.filename}", flush=True)
    
    # 파일 유효성 검사
    if not hasattr(file, 'content_type') or not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    # 메인 이미지 읽기 및 최적화
    print("[API] 메인 이미지 파일 읽는 중...", flush=True)
    image_bytes = await file.read()
    print(f"[API] 원본 이미지 크기: {len(image_bytes)} bytes", flush=True)
    image_base64 = encode_image_to_base64(image_bytes, optimize=True, max_size=1500)
    print(f"[API] base64 인코딩 완료: {len(image_base64)} chars", flush=True)
    
    # 레퍼런스 이미지 읽기 및 최적화 (Request에서 직접 파싱)
    reference_images_base64 = []
    try:
        if form:
            reference_files_list = form.getlist("reference_files")
        else:
            reference_files_list = []
        print(f"[DEBUG] form.getlist('reference_files') 결과: {len(reference_files_list) if reference_files_list else 0}개", flush=True)
        if reference_files_list:
            print(f"[API] 레퍼런스 이미지 {len(reference_files_list)}개 처리 중...", flush=True)
            for i, ref_file in enumerate(reference_files_list):
                print(f"[DEBUG] 레퍼런스 파일 {i+1}: 타입={type(ref_file)}, 값={ref_file}", flush=True)
                
                # UploadFile 또는 StarletteUploadFile 모두 처리
                is_upload_file = isinstance(ref_file, (UploadFile, StarletteUploadFile))
                has_read = hasattr(ref_file, 'read')
                has_content_type = hasattr(ref_file, 'content_type')
                
                print(f"[DEBUG] 레퍼런스 파일 {i+1}: is_upload_file={is_upload_file}, has_read={has_read}, has_content_type={has_content_type}", flush=True)
                
                if has_read and has_content_type:
                    content_type = ref_file.content_type
                    print(f"[DEBUG] 레퍼런스 파일 {i+1}: content_type={content_type}", flush=True)
                    
                    if content_type and content_type.startswith("image/"):
                        ref_bytes = await ref_file.read()
                        print(f"[DEBUG] 레퍼런스 파일 {i+1}: 읽기 완료, {len(ref_bytes)} bytes", flush=True)
                        ref_base64 = encode_image_to_base64(ref_bytes, optimize=True, max_size=1500)
                        reference_images_base64.append(ref_base64)
                        print(f"[API] ✅ 레퍼런스 이미지 {i+1} 처리 완료: {len(ref_bytes)} bytes -> base64 길이: {len(ref_base64)}", flush=True)
                    else:
                        print(f"[DEBUG] 레퍼런스 파일 {i+1}: content_type이 이미지가 아님: {content_type}", flush=True)
                else:
                    print(f"[DEBUG] 레퍼런스 파일 {i+1}: read 또는 content_type 속성 없음", flush=True)
    except Exception as e:
        print(f"[API] 레퍼런스 이미지 파싱 중 오류 (무시하고 계속): {e}", flush=True)
        print(traceback.format_exc(), flush=True)
    
    print(f"[DEBUG] 최종 reference_images_base64 개수: {len(reference_images_base64)}", flush=True)
    
    # 프롬프트 구성
    prompt = get_prompt_by_type(process_type, additional_instructions)
    
    # 레퍼런스 이미지가 있으면 프롬프트에 추가 지시
    prompt = add_reference_image_instructions(prompt, len(reference_images_base64))
    
    # 마스크 좌표가 있으면 프롬프트에 추가
    if mask_x is not None and mask_y is not None:
        mask_info = f"\n[Target Area Coordinates]\nThe target area is located at: x={mask_x}, y={mask_y}"
        if mask_width and mask_height:
            mask_info += f", width={mask_width}, height={mask_height}"
        prompt += mask_info
    
    try:
        # Gemini API 호출
        response = await call_gemini_api(
            image_base64=image_base64,
            prompt=prompt,
            mime_type=file.content_type,
            reference_images=reference_images_base64 if reference_images_base64 else None
        )
        
        # 결과 이미지 추출
        print(f"[DEBUG] 응답 구조 확인: {list(response.keys()) if isinstance(response, dict) else 'dict 아님'}", flush=True)
        result_image = extract_image_from_response(response)
        print(f"[DEBUG] 추출된 이미지: {'있음' if result_image else '없음'}", flush=True)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        if result_image:
            return ProcessResult(
                success=True,
                image_base64=result_image,
                message="이미지 처리가 완료되었습니다.",
                process_type=process_type,
                processing_time_ms=processing_time
            )
        else:
            # 이미지 생성 실패시 텍스트 응답 확인
            text_response = ""
            try:
                candidates = response.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    for part in parts:
                        if "text" in part:
                            text_response = part["text"]
            except:
                pass
            
            return ProcessResult(
                success=False,
                image_base64=None,
                message=f"이미지 생성에 실패했습니다. {text_response}",
                process_type=process_type,
                processing_time_ms=processing_time
            )
            
    except HTTPException:
        raise
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"처리 중 오류 발생:\n{error_trace}", flush=True)
        processing_time = int((time.time() - start_time) * 1000)
        return ProcessResult(
            success=False,
            image_base64=None,
            message=f"처리 중 오류 발생: {str(e)}",
            process_type=process_type,
            processing_time_ms=processing_time
        )


@app.post("/api/poster")
async def create_poster_thumbnail(
    request: Request,
    file: UploadFile = File(...),
    style: Optional[str] = Form("minimal"),
    background_color: Optional[str] = Form("#F8F8F8")
):
    """
    포스터형 썸네일 생성 (전용 엔드포인트)

    - style: "minimal" | "vintage" | "modern" | "warm"
    - background_color: 배경 색상 (hex)
    """
    print("\n" + "="*60, flush=True)
    print("[POSTER API] 요청 받음!", flush=True)
    print(f"[POSTER API] style: {style}", flush=True)
    print(f"[POSTER API] background_color: {background_color}", flush=True)
    print(f"[POSTER API] file: {file.filename if file else 'None'}", flush=True)
    print("="*60 + "\n", flush=True)
    style_prompts = {
        "minimal": "Minimalist, clean, museum-display quality",
        "vintage": "Warm vintage aesthetic with nostalgic lighting",
        "modern": "Contemporary, sleek, high-tech feel",
        "warm": "Cozy, inviting atmosphere with warm tones"
    }
    
    additional = f"Style: {style_prompts.get(style, style_prompts['minimal'])}. Background color preference: {background_color}"
    
    return await process_image(
        request=request,
        file=file,
        process_type="poster",
        additional_instructions=additional
    )


@app.post("/api/serial")
async def enhance_serial_area(
    request: Request,
    file: UploadFile = File(...),
    x: int = Form(...),
    y: int = Form(...),
    width: int = Form(...),
    height: int = Form(...)
):
    """
    시리얼 넘버/인증 영역 선명화 (전용 엔드포인트)
    
    - x, y: 영역 시작 좌표
    - width, height: 영역 크기
    """
    return await process_image(
        request=request,
        file=file,
        process_type="serial",
        mask_x=x,
        mask_y=y,
        mask_width=width,
        mask_height=height
    )


@app.post("/api/defect")
async def highlight_defect(
    request: Request,
    file: UploadFile = File(...),
    x: int = Form(...),
    y: int = Form(...),
    width: int = Form(...),
    height: int = Form(...),
    defect_description: Optional[str] = Form(None)
):
    """
    하자 부분 강조 (전용 엔드포인트)
    
    - x, y: 하자 영역 시작 좌표
    - width, height: 하자 영역 크기
    - defect_description: 하자 설명 (선택)
    """
    additional = None
    if defect_description:
        additional = f"Defect description: {defect_description}"
    
    return await process_image(
        request=request,
        file=file,
        process_type="defect",
        additional_instructions=additional,
        mask_x=x,
        mask_y=y,
        mask_width=width,
        mask_height=height
    )


@app.get("/api/prompts")
async def get_prompts():
    """현재 사용 중인 프롬프트 템플릿 조회 (개발/디버깅용)"""
    return {
        "poster": POSTER_THUMBNAIL_PROMPT,
        "serial": SERIAL_ENHANCEMENT_PROMPT,
        "defect": DEFECT_HIGHLIGHT_PROMPT
    }
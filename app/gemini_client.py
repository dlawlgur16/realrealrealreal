"""Gemini API 클라이언트"""
import io
import base64
import traceback
from typing import Optional, List
from fastapi import HTTPException
from PIL import Image
from google.genai import types

from app.config import client, GEMINI_MODEL


async def call_gemini_api(
    image_base64: str, 
    prompt: str, 
    mime_type: str = "image/jpeg", 
    reference_images: Optional[List[str]] = None
) -> dict:
    """Gemini API 호출 (Google Genai SDK 사용)
    
    Args:
        image_base64: 처리할 메인 이미지 (base64)
        prompt: 프롬프트
        mime_type: 이미지 MIME 타입
        reference_images: 레퍼런스 이미지 리스트 (base64, 선택사항)
    """
    
    print(f"\n[DEBUG] call_gemini_api 호출됨")
    print(f"[DEBUG] 이미지 base64 길이: {len(image_base64)}")
    print(f"[DEBUG] 프롬프트 길이: {len(prompt)}")
    print(f"[DEBUG] 레퍼런스 이미지 개수: {len(reference_images) if reference_images else 0}")
    
    if not client:
        print("[ERROR] Gemini 클라이언트가 초기화되지 않았습니다!")
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY가 설정되지 않았습니다.")
    
    try:
        print("[DEBUG] base64를 이미지로 변환 중...")
        # 메인 이미지 변환
        image_bytes = base64.b64decode(image_base64)
        image_input = Image.open(io.BytesIO(image_bytes))
        print(f"[DEBUG] 메인 이미지 크기: {image_input.size}, 모드: {image_input.mode}")
        
        # contents 리스트 구성 (문서 예제 기반)
        contents = []
        
        # 레퍼런스 이미지가 있으면 먼저 추가 (문서의 "Style Transfer" 예제 방식)
        if reference_images:
            print(f"[DEBUG] 레퍼런스 이미지 {len(reference_images)}개를 먼저 추가...")
            for i, ref_img_base64 in enumerate(reference_images):
                try:
                    ref_bytes = base64.b64decode(ref_img_base64)
                    ref_image = Image.open(io.BytesIO(ref_bytes))
                    contents.append(ref_image)
                    print(f"[DEBUG] 레퍼런스 이미지 {i+1} 추가: {ref_image.size}, 모드: {ref_image.mode}")
                except Exception as e:
                    print(f"[WARNING] 레퍼런스 이미지 {i+1} 변환 실패: {e}")
                    print(traceback.format_exc())
        
        # 프롬프트 추가
        contents.append(prompt)
        
        # 메인 이미지 추가 (마지막에)
        contents.append(image_input)
        
        print(f"[DEBUG] Gemini API 호출 중... (모델: {GEMINI_MODEL}, 총 {len(contents)}개 콘텐츠)")
        print(f"[DEBUG] 입력 이미지 크기: {image_input.size[0]}x{image_input.size[1]} pixels")
        # Gemini API 호출 - 이미지 생성 설정 추가
        # 입력 이미지 크기를 프롬프트에 추가하여 고해상도 출력 유도
        contents_with_size = contents.copy()
        if len(contents_with_size) > 0 and isinstance(contents_with_size[-1], str):
            # 마지막 프롬프트에 해상도 정보 추가
            size_hint = f"\n\n[CRITICAL RESOLUTION REQUIREMENT]\nThe input image is {image_input.size[0]}x{image_input.size[1]} pixels. The output image MUST be at least the same size or larger. Generate at MINIMUM 2048x2048 pixels, preferably 3072x3072 or 4096x4096 pixels. DO NOT output at 1024x1024."
            contents_with_size[-1] = contents_with_size[-1] + size_hint
        
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents_with_size,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],  # 텍스트와 이미지 모두 허용 (문서 예제 방식)
            )
        )
        print(f"[DEBUG] Gemini API 응답 받음")
        print(f"[DEBUG] response 타입: {type(response)}")
        print(f"[DEBUG] response 속성 목록: {[attr for attr in dir(response) if not attr.startswith('_')]}")
        
        # 응답을 dict 형태로 변환
        result = {
            "candidates": [{
                "content": {
                    "parts": []
                }
            }]
        }
        
        # 문서 예제 방식: response.parts를 직접 사용
        parts = None
        if hasattr(response, 'parts'):
            try:
                parts = response.parts
                parts_len = len(parts) if hasattr(parts, '__len__') else 'N/A'
                print(f"[DEBUG] response.parts 사용, 타입: {type(parts)}, 길이: {parts_len}")
                if parts_len == 0:
                    print("[WARNING] response.parts가 비어있음!")
            except Exception as e:
                print(f"[DEBUG] response.parts 접근 오류: {e}")
                parts = None
        
        if not parts or (hasattr(parts, '__len__') and len(parts) == 0):
            # fallback: candidates 사용
            print("[DEBUG] response.parts가 없거나 비어있음, candidates 확인...")
            if hasattr(response, 'candidates'):
                print(f"[DEBUG] response.candidates 타입: {type(response.candidates)}")
                if response.candidates:
                    print(f"[DEBUG] candidates 길이: {len(response.candidates)}")
                    candidate = response.candidates[0]
                    print(f"[DEBUG] candidate 타입: {type(candidate)}")
                    print(f"[DEBUG] candidate 속성: {[attr for attr in dir(candidate) if not attr.startswith('_')]}")
                    if hasattr(candidate, 'content'):
                        content = candidate.content
                        print(f"[DEBUG] content 타입: {type(content)}")
                        if content and hasattr(content, 'parts'):
                            parts = content.parts
                            parts_len = len(parts) if hasattr(parts, '__len__') else 'N/A'
                            print(f"[DEBUG] candidate.content.parts 사용, 타입: {type(parts)}, 길이: {parts_len}")
        
        if not parts or (hasattr(parts, '__len__') and len(parts) == 0):
            print("[ERROR] parts를 찾을 수 없거나 비어있음. response 전체 구조:")
            try:
                print(f"[DEBUG] response 문자열 표현: {str(response)[:500]}")
            except:
                pass
            print(f"  - hasattr(response, 'parts'): {hasattr(response, 'parts')}")
            print(f"  - hasattr(response, 'candidates'): {hasattr(response, 'candidates')}")
            return result
        
        part_count = 0
        for part in parts:
            part_count += 1
            print(f"\n[DEBUG] ===== Part {part_count} 분석 시작 =====")
            print(f"[DEBUG] Part {part_count}: 타입={type(part)}")
            print(f"[DEBUG] Part {part_count}: 속성 목록={[attr for attr in dir(part) if not attr.startswith('_')]}")
            
            # part의 모든 속성 값 확인
            try:
                if hasattr(part, '__dict__'):
                    print(f"[DEBUG] Part {part_count}: __dict__ 키={list(part.__dict__.keys())}")
            except:
                pass
            
            # 텍스트 확인
            if hasattr(part, 'text'):
                try:
                    text_value = part.text
                    print(f"[DEBUG] Part {part_count}: text 속성 값 = {text_value}")
                    if text_value is not None:
                        print(f"[DEBUG] Part {part_count}: 텍스트 발견 - {text_value[:100]}...")
                        result["candidates"][0]["content"]["parts"].append({
                            "text": text_value
                        })
                except Exception as e:
                    print(f"[DEBUG] Part {part_count}: text 접근 오류: {e}")
            
            # 이미지 확인 - 모든 가능한 방법 시도
            image_found = False
            
            # 방법 1: inline_data 확인 후 직접 bytes 데이터 사용 (수정된 부분)
            if hasattr(part, 'inline_data'):
                try:
                    inline_data = part.inline_data
                    print(f"[DEBUG] Part {part_count}: inline_data 존재")
                    if inline_data is not None:
                        print(f"[DEBUG] Part {part_count}: inline_data 타입={type(inline_data)}")
                        if hasattr(inline_data, 'mime_type'):
                            print(f"[DEBUG] Part {part_count}: mime_type={inline_data.mime_type}")
                        if hasattr(inline_data, 'data'):
                            data_bytes = inline_data.data
                            print(f"[DEBUG] Part {part_count}: data 타입={type(data_bytes)}, 길이={len(data_bytes) if hasattr(data_bytes, '__len__') else 'N/A'}")
                            
                            # 직접 bytes 데이터를 base64로 인코딩
                            if isinstance(data_bytes, bytes) and len(data_bytes) > 0:
                                image_base64_result = base64.b64encode(data_bytes).decode('utf-8')
                                mime_type_result = getattr(inline_data, 'mime_type', 'image/png')
                                result["candidates"][0]["content"]["parts"].append({
                                    "inlineData": {
                                        "mimeType": mime_type_result,
                                        "data": image_base64_result
                                    }
                                })
                                print(f"[DEBUG] Part {part_count}: 이미지 변환 성공! base64 길이: {len(image_base64_result)}")
                                image_found = True
                except Exception as e:
                    print(f"[DEBUG] Part {part_count}: inline_data 처리 오류: {e}")
                    print(traceback.format_exc())
            
            # 방법 2: as_image() 메서드 직접 사용 (fallback)
            if not image_found and hasattr(part, 'as_image'):
                try:
                    print(f"[DEBUG] Part {part_count}: as_image() 메서드 직접 호출 시도...")
                    image = part.as_image()
                    if image:
                        print(f"[DEBUG] Part {part_count}: 이미지 발견! 크기: {image.size}")
                        img_byte_arr = io.BytesIO()
                        # 원본 품질 유지 (압축 최소화)
                        image.save(img_byte_arr, format='PNG', optimize=False, compress_level=0)
                        img_byte_arr = img_byte_arr.getvalue()
                        image_base64_result = base64.b64encode(img_byte_arr).decode('utf-8')
                        result["candidates"][0]["content"]["parts"].append({
                            "inlineData": {
                                "mimeType": "image/png",
                                "data": image_base64_result
                            }
                        })
                        print(f"[DEBUG] Part {part_count}: 이미지 변환 성공!")
                        image_found = True
                except Exception as e:
                    print(f"[DEBUG] Part {part_count}: as_image() 직접 호출 오류: {e}")
                    print(traceback.format_exc())
            
            if not image_found and hasattr(part, 'inline_data') and part.inline_data is not None:
                print(f"[DEBUG] Part {part_count}: inline_data가 있었지만 이미지 추출 실패")
            
            print(f"[DEBUG] ===== Part {part_count} 분석 완료 =====\n")
        
        return result
        
    except Exception as e:
        error_detail = f"Gemini API 오류: {str(e)}\n{traceback.format_exc()}"
        print(f"\n{'='*50}")
        print("Gemini API 호출 중 에러 발생!")
        print(error_detail)
        print(f"{'='*50}\n")
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API 오류: {str(e)}"
        )
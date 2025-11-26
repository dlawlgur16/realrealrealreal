"""Pydantic 데이터 모델"""
from typing import Optional
from pydantic import BaseModel


class ImageProcessRequest(BaseModel):
    """이미지 처리 요청"""
    process_type: str  # "poster", "serial", "defect"
    additional_instructions: Optional[str] = None
    mask_coordinates: Optional[dict] = None  # {"x": 0, "y": 0, "width": 100, "height": 100}


class ProcessResult(BaseModel):
    """처리 결과"""
    success: bool
    image_base64: Optional[str] = None
    message: str
    process_type: str
    processing_time_ms: int


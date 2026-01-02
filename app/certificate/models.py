"""
Pydantic 모델 - 인증서 API 요청/응답 스키마
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CertificateType(str, Enum):
    """인증서 유형"""
    POSTER = "poster"
    SERIAL = "serial"
    DEFECT = "defect"


class CertificateStatus(str, Enum):
    """인증서 상태"""
    ACTIVE = "active"
    REVOKED = "revoked"
    PENDING = "pending"


# ============ 요청 모델 ============

class IssueCertificateRequest(BaseModel):
    """인증서 발급 요청"""
    image_base64: str = Field(..., description="Base64 인코딩된 이미지")
    process_type: CertificateType = Field(..., description="인증서 유형")
    user_id: str = Field(..., description="사용자 ID (Firebase UID)")
    image_url: Optional[str] = Field(None, description="Supabase Storage URL")


class VerifyImageRequest(BaseModel):
    """이미지로 인증서 검증 요청"""
    image_base64: str = Field(..., description="Base64 인코딩된 이미지")


# ============ 응답 모델 ============

class CertificateResponse(BaseModel):
    """인증서 정보 응답"""
    cert_id: str = Field(..., description="인증서 ID (hex)")
    image_hash: str = Field(..., description="이미지 SHA-256 해시")
    image_url: Optional[str] = Field(None, description="이미지 URL")
    cert_type: CertificateType = Field(..., description="인증서 유형")
    user_id: str = Field(..., description="사용자 ID")
    tx_hash: str = Field(..., description="블록체인 트랜잭션 해시")
    block_number: int = Field(..., description="블록 번호")
    status: CertificateStatus = Field(..., description="인증서 상태")
    created_at: datetime = Field(..., description="발급 일시")
    verify_url: str = Field(..., description="검증 URL")


class IssueCertificateResponse(BaseModel):
    """인증서 발급 응답"""
    success: bool
    certificate: Optional[CertificateResponse] = None
    error: Optional[str] = None


class VerifyCertificateResponse(BaseModel):
    """인증서 검증 응답"""
    is_valid: bool = Field(..., description="유효 여부")
    certificate: Optional[CertificateResponse] = None
    blockchain_verified: bool = Field(default=False, description="블록체인 검증 완료 여부")
    message: str = Field(..., description="검증 결과 메시지")


class UserCertificatesResponse(BaseModel):
    """사용자 인증서 목록 응답"""
    user_id: str
    total_count: int
    certificates: List[CertificateResponse]


# ============ 내부 모델 ============

class CertificateDB(BaseModel):
    """데이터베이스 인증서 모델"""
    id: Optional[str] = None
    cert_id: str
    user_id: str
    image_url: str
    image_hash: str
    cert_type: str
    tx_hash: str
    block_number: int
    status: str = "active"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

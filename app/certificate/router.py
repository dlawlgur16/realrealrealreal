"""
인증서 API 라우터

디지털 인증서 발급, 조회, 검증 API 엔드포인트
"""
import os
from fastapi import APIRouter, HTTPException, Query, Request, Header, Depends
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Firebase Admin SDK
import firebase_admin
from firebase_admin import auth, credentials

# Firebase 초기화 (한 번만)
if not firebase_admin._apps:
    # 서비스 계정 JSON 경로 (환경변수 또는 기본 경로)
    service_account_path = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        "/app/ocean-seal-firebase-adminsdk-fbsvc-7e063c46ae.json"
    )
    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    else:
        # 서비스 계정 파일 없으면 인증 비활성화
        print("[WARNING] Firebase service account not found. Auth disabled.")
        firebase_admin.initialize_app()

from .models import (
    IssueCertificateRequest,
    VerifyImageRequest,
    IssueCertificateResponse,
    VerifyCertificateResponse,
    UserCertificatesResponse,
    CertificateResponse
)
from .service import certificate_service

router = APIRouter(prefix="/api/certificate", tags=["Certificate"])


# ============== 인증 헬퍼 함수 ==============

async def verify_firebase_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Firebase ID Token 검증

    Returns:
        검증된 user_id (Firebase UID) 또는 None (개발 환경에서 인증 비활성화 시)
    """
    # 개발 환경에서는 인증 건너뛰기 (선택)
    if os.getenv("ENV") == "development" and os.getenv("SKIP_AUTH") == "true":
        return None

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header required"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format. Use: Bearer <token>"
        )

    token = authorization.split(" ")[1]

    try:
        # Firebase ID 토큰 검증
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


@router.post("/issue", response_model=IssueCertificateResponse)
@limiter.limit("5/minute")  # 분당 5회 제한 (블록체인 비용 때문에 더 엄격)
async def issue_certificate(
    request: Request,
    cert_request: IssueCertificateRequest,
    verified_user_id: str = Depends(verify_firebase_token)
):
    """
    디지털 인증서 발급 (인증 필요)

    이미지를 분석하여 SHA-256 해시를 생성하고,
    Polygon 블록체인에 기록하여 위변조 방지 인증서를 발급합니다.

    **Authorization**: Bearer <Firebase ID Token> 필요

    - **image_base64**: Base64 인코딩된 이미지
    - **process_type**: 인증서 유형 (poster, serial, defect)
    - **user_id**: 사용자 ID (Firebase UID) - 토큰에서 검증됨
    - **image_url**: (선택) Supabase Storage URL
    """
    # 토큰에서 추출한 user_id 사용 (요청 body의 user_id 무시 - 보안)
    actual_user_id = verified_user_id if verified_user_id else cert_request.user_id

    result = await certificate_service.issue_certificate(
        image_base64=cert_request.image_base64,
        process_type=cert_request.process_type,
        user_id=actual_user_id,
        image_url=cert_request.image_url
    )

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result


@router.get("/{cert_id}", response_model=CertificateResponse)
async def get_certificate(cert_id: str):
    """
    인증서 상세 조회

    인증서 ID로 인증서 정보를 조회합니다.
    짧은 ID (8자리)도 지원합니다.

    - **cert_id**: 인증서 ID (전체 또는 앞 8자리)
    """
    certificate = await certificate_service.get_certificate(cert_id)

    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")

    return certificate


@router.get("/verify/{cert_id}", response_model=VerifyCertificateResponse)
async def verify_certificate(cert_id: str):
    """
    인증서 검증 (공개 API)

    인증서 ID로 인증서의 유효성을 검증합니다.
    블록체인과 DB 양쪽에서 검증을 수행합니다.

    인증 불필요 - 누구나 검증 가능

    - **cert_id**: 인증서 ID
    """
    result = await certificate_service.verify_certificate(cert_id)
    return result


@router.post("/verify-image", response_model=VerifyCertificateResponse)
async def verify_by_image(request: VerifyImageRequest):
    """
    이미지로 인증서 검증

    이미지를 업로드하여 해당 이미지에 대한 인증서를 검색하고 검증합니다.

    - **image_base64**: Base64 인코딩된 이미지
    """
    result = await certificate_service.verify_by_image(request.image_base64)
    return result


@router.get("/user/{user_id}", response_model=UserCertificatesResponse)
async def get_user_certificates(
    user_id: str,
    verified_user_id: str = Depends(verify_firebase_token)
):
    """
    사용자의 인증서 목록 조회 (인증 필요)

    특정 사용자가 발급받은 모든 인증서 목록을 조회합니다.
    본인의 인증서만 조회 가능합니다.

    **Authorization**: Bearer <Firebase ID Token> 필요

    - **user_id**: 사용자 ID (Firebase UID)
    """
    # 본인 확인: URL의 user_id와 토큰의 user_id 일치 확인
    if verified_user_id and verified_user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only view your own certificates."
        )

    result = await certificate_service.get_user_certificates(user_id)
    return result


@router.delete("/{cert_id}")
async def revoke_certificate(
    cert_id: str,
    verified_user_id: str = Depends(verify_firebase_token)
):
    """
    인증서 취소 (인증 필요)

    인증서를 취소 상태로 변경합니다.
    취소된 인증서는 검증 시 유효하지 않은 것으로 표시됩니다.
    본인의 인증서만 취소 가능합니다.

    **Authorization**: Bearer <Firebase ID Token> 필요

    - **cert_id**: 인증서 ID
    """
    # 인증서 소유자 확인
    certificate = await certificate_service.get_certificate(cert_id)
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if verified_user_id and certificate.user_id != verified_user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only revoke your own certificates."
        )

    success, error = await certificate_service.revoke_certificate(cert_id)

    if not success:
        raise HTTPException(status_code=400, detail=error)

    return {"success": True, "message": "Certificate revoked"}

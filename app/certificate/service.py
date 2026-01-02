"""
인증서 서비스 - 비즈니스 로직

블록체인 + Supabase를 조합하여 인증서를 발급/관리합니다.
"""
import os
import re
import hashlib
from typing import Optional, List, Tuple
from datetime import datetime
from supabase import create_client, Client

from .blockchain import blockchain_service
from .models import (
    CertificateType,
    CertificateStatus,
    CertificateResponse,
    CertificateDB,
    IssueCertificateResponse,
    VerifyCertificateResponse,
    UserCertificatesResponse
)


class CertificateService:
    """인증서 서비스"""

    def __init__(self):
        # Supabase 클라이언트
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")  # 서비스 키 사용

        if supabase_url and supabase_key:
            self.supabase: Client = create_client(supabase_url, supabase_key)
        else:
            self.supabase = None

        # 검증 웹페이지 URL
        self.verify_base_url = os.getenv(
            "VERIFY_WEB_URL",
            "https://ocean-seal.shop/verify"
        )

    def _get_verify_url(self, cert_id: str) -> str:
        """인증서 검증 URL 생성"""
        # cert_id에서 0x 제거하고 앞 8자리만 사용 (짧은 URL)
        short_id = cert_id[2:10] if cert_id.startswith("0x") else cert_id[:8]
        return f"{self.verify_base_url}/{short_id}"

    def _hash_user_id(self, user_id: str) -> str:
        """사용자 ID 해시 (개인정보 보호)"""
        return hashlib.sha256(user_id.encode()).hexdigest()[:16]

    async def issue_certificate(
        self,
        image_base64: str,
        process_type: CertificateType,
        user_id: str,
        image_url: Optional[str] = None
    ) -> IssueCertificateResponse:
        """
        인증서 발급

        1. 이미지 해시 계산
        2. 블록체인에 기록
        3. Supabase에 메타데이터 저장
        """
        try:
            # 1. 이미지 해시 계산
            image_hash = blockchain_service.compute_image_hash_from_base64(image_base64)

            # 2. 중복 체크 (이미 발급된 이미지인지)
            if self.supabase:
                existing = self.supabase.table("certificates").select("*").eq(
                    "image_hash", image_hash
                ).execute()

                if existing.data:
                    # 이미 발급된 인증서 반환
                    cert_data = existing.data[0]
                    return IssueCertificateResponse(
                        success=True,
                        certificate=self._to_response(cert_data)
                    )

            # 3. 블록체인에 발급
            hashed_user_id = self._hash_user_id(user_id)

            success, result, error = await blockchain_service.issue_certificate(
                image_hash=image_hash,
                cert_type=process_type.value,
                user_id=hashed_user_id
            )

            if not success:
                # 블록체인 실패 시 오프체인으로 발급
                cert_id = self._generate_offchain_cert_id(image_hash, user_id)
                tx_hash = "offchain"
                block_number = 0
            else:
                cert_id = result['cert_id']
                tx_hash = result['tx_hash']
                block_number = result['block_number']

            # 4. Supabase에 저장
            cert_db = CertificateDB(
                cert_id=cert_id,
                user_id=user_id,
                image_url=image_url or "",
                image_hash=image_hash,
                cert_type=process_type.value,
                tx_hash=tx_hash,
                block_number=block_number,
                status=CertificateStatus.ACTIVE.value
            )

            if self.supabase:
                insert_result = self.supabase.table("certificates").insert({
                    "cert_id": cert_db.cert_id,
                    "user_id": cert_db.user_id,
                    "image_url": cert_db.image_url,
                    "image_hash": cert_db.image_hash,
                    "cert_type": cert_db.cert_type,
                    "tx_hash": cert_db.tx_hash,
                    "block_number": cert_db.block_number,
                    "status": cert_db.status
                }).execute()

                if insert_result.data:
                    cert_data = insert_result.data[0]
                    return IssueCertificateResponse(
                        success=True,
                        certificate=self._to_response(cert_data)
                    )

            # Supabase 없이도 응답 생성
            return IssueCertificateResponse(
                success=True,
                certificate=CertificateResponse(
                    cert_id=cert_id,
                    image_hash=image_hash,
                    image_url=image_url,
                    cert_type=process_type,
                    user_id=user_id,
                    tx_hash=tx_hash,
                    block_number=block_number,
                    status=CertificateStatus.ACTIVE,
                    created_at=datetime.utcnow(),
                    verify_url=self._get_verify_url(cert_id)
                )
            )

        except Exception as e:
            return IssueCertificateResponse(
                success=False,
                error=str(e)
            )

    def _generate_offchain_cert_id(self, image_hash: str, user_id: str) -> str:
        """오프체인 인증서 ID 생성 (블록체인 실패 시)"""
        data = f"{image_hash}{user_id}{datetime.utcnow().timestamp()}"
        return "0x" + hashlib.sha256(data.encode()).hexdigest()

    def _validate_cert_id(self, cert_id: str) -> bool:
        """cert_id 유효성 검사 (SQL Injection 방지)"""
        # 영숫자와 0x 접두사만 허용
        if not re.match(r'^(0x)?[a-fA-F0-9]+$', cert_id):
            return False
        # 최대 길이 제한 (66자 = 0x + 64자 해시)
        if len(cert_id) > 66:
            return False
        return True

    async def get_certificate(self, cert_id: str) -> Optional[CertificateResponse]:
        """인증서 조회"""
        if not self.supabase:
            return None

        # 입력값 검증 (SQL Injection 방지)
        if not self._validate_cert_id(cert_id):
            return None

        # cert_id가 짧은 경우 (8자리) LIKE 검색
        if len(cert_id) <= 10:
            # 0x 접두사 제거 후 검색
            search_id = cert_id[2:] if cert_id.startswith("0x") else cert_id
            result = self.supabase.table("certificates").select("*").like(
                "cert_id", f"%{search_id}%"
            ).execute()
        else:
            result = self.supabase.table("certificates").select("*").eq(
                "cert_id", cert_id
            ).execute()

        if result.data:
            return self._to_response(result.data[0])
        return None

    async def verify_certificate(self, cert_id: str) -> VerifyCertificateResponse:
        """
        인증서 검증

        1. Supabase에서 메타데이터 조회
        2. 블록체인에서 해시 검증
        """
        # 1. DB에서 조회
        certificate = await self.get_certificate(cert_id)

        if not certificate:
            return VerifyCertificateResponse(
                is_valid=False,
                blockchain_verified=False,
                message="인증서를 찾을 수 없습니다."
            )

        # 2. 상태 확인
        if certificate.status == CertificateStatus.REVOKED:
            return VerifyCertificateResponse(
                is_valid=False,
                certificate=certificate,
                blockchain_verified=False,
                message="이 인증서는 취소되었습니다."
            )

        # 3. 블록체인 검증 (온체인 인증서인 경우)
        blockchain_verified = False
        if certificate.tx_hash != "offchain":
            is_valid, _, error = await blockchain_service.verify_certificate(certificate.cert_id)
            blockchain_verified = is_valid

        return VerifyCertificateResponse(
            is_valid=True,
            certificate=certificate,
            blockchain_verified=blockchain_verified,
            message="유효한 인증서입니다." if blockchain_verified else "유효한 인증서입니다. (오프체인)"
        )

    async def verify_by_image(self, image_base64: str) -> VerifyCertificateResponse:
        """이미지로 인증서 검증"""
        # 이미지 해시 계산
        image_hash = blockchain_service.compute_image_hash_from_base64(image_base64)

        # DB에서 해시로 검색
        if self.supabase:
            result = self.supabase.table("certificates").select("*").eq(
                "image_hash", image_hash
            ).execute()

            if result.data:
                certificate = self._to_response(result.data[0])
                return await self.verify_certificate(certificate.cert_id)

        return VerifyCertificateResponse(
            is_valid=False,
            blockchain_verified=False,
            message="이 이미지에 대한 인증서를 찾을 수 없습니다."
        )

    async def get_user_certificates(self, user_id: str) -> UserCertificatesResponse:
        """사용자의 인증서 목록 조회"""
        certificates = []

        if self.supabase:
            result = self.supabase.table("certificates").select("*").eq(
                "user_id", user_id
            ).order("created_at", desc=True).execute()

            if result.data:
                certificates = [self._to_response(cert) for cert in result.data]

        return UserCertificatesResponse(
            user_id=user_id,
            total_count=len(certificates),
            certificates=certificates
        )

    async def revoke_certificate(self, cert_id: str) -> Tuple[bool, Optional[str]]:
        """인증서 취소"""
        if not self.supabase:
            return False, "Database not configured"

        # DB 업데이트
        result = self.supabase.table("certificates").update({
            "status": CertificateStatus.REVOKED.value
        }).eq("cert_id", cert_id).execute()

        if not result.data:
            return False, "Certificate not found"

        # 블록체인에서도 취소 (선택적)
        # await blockchain_service.revoke_certificate(cert_id)

        return True, None

    def _to_response(self, data: dict) -> CertificateResponse:
        """DB 데이터를 응답 모델로 변환"""
        return CertificateResponse(
            cert_id=data['cert_id'],
            image_hash=data['image_hash'],
            image_url=data.get('image_url'),
            cert_type=CertificateType(data['cert_type']),
            user_id=data['user_id'],
            tx_hash=data['tx_hash'],
            block_number=data['block_number'],
            status=CertificateStatus(data['status']),
            created_at=datetime.fromisoformat(data['created_at'].replace('Z', '+00:00')) if data.get('created_at') else datetime.utcnow(),
            verify_url=self._get_verify_url(data['cert_id'])
        )


# 싱글톤 인스턴스
certificate_service = CertificateService()

"""
Polygon 블록체인 연동 모듈

스마트 컨트랙트와 통신하여 인증서를 발급/검증합니다.
"""
import os
import hashlib
import base64
from typing import Optional, Tuple
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()

# 배포된 컨트랙트 ABI (OceanSealCert)
CONTRACT_ABI = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {
        "anonymous": False,
        "inputs":[
            {"indexed":True,"name":"certId","type":"bytes32"},
            {"indexed":False,"name":"timestamp","type":"uint256"}
        ],
        "name":"Issued",
        "type":"event"
    },
    {
        "inputs":[],
        "name":"admin",
        "outputs":[{"name":"","type":"address"}],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[{"name":"","type":"bytes32"}],
        "name":"certificates",
        "outputs":[{"name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[{"name":"certId","type":"bytes32"}],
        "name":"issue",
        "outputs":[{"name":"","type":"uint256"}],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[{"name":"certId","type":"bytes32"}],
        "name":"verify",
        "outputs":[{"name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    }
]


class BlockchainService:
    """Polygon 블록체인 서비스"""

    def __init__(self):
        # 환경 변수에서 설정 로드
        self.rpc_url = os.getenv(
            "POLYGON_RPC_URL",
            "https://rpc-amoy.polygon.technology"
        )
        self.private_key = os.getenv("POLYGON_PRIVATE_KEY")
        self.contract_address = os.getenv("CERTIFICATE_CONTRACT_ADDRESS")

        # Web3 초기화
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))

        # 관리자 계정 (서버 지갑)
        if self.private_key:
            self.admin_account = Account.from_key(self.private_key)
        else:
            self.admin_account = None

        # 컨트랙트 인스턴스
        if self.contract_address and self.contract_address != "배포_필요":
            try:
                self.contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.contract_address),
                    abi=CONTRACT_ABI
                )
            except Exception as e:
                print(f"[Blockchain] 컨트랙트 초기화 실패: {e}")
                self.contract = None
        else:
            self.contract = None

    def is_configured(self) -> bool:
        """블록체인 설정이 완료되었는지 확인"""
        return (
            self.w3.is_connected() and
            self.admin_account is not None and
            self.contract is not None
        )

    def compute_image_hash(self, image_data: bytes) -> str:
        """
        이미지의 SHA-256 해시 계산

        Args:
            image_data: 이미지 바이너리 데이터

        Returns:
            해시 문자열 (0x 접두사 포함)
        """
        hash_bytes = hashlib.sha256(image_data).digest()
        return "0x" + hash_bytes.hex()

    def compute_image_hash_from_base64(self, base64_image: str) -> str:
        """
        Base64 이미지의 SHA-256 해시 계산

        Args:
            base64_image: Base64 인코딩된 이미지

        Returns:
            해시 문자열 (0x 접두사 포함)
        """
        # Base64 헤더 제거 (data:image/...;base64, 부분)
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]

        image_data = base64.b64decode(base64_image)
        return self.compute_image_hash(image_data)

    async def issue_certificate(
        self,
        image_hash: str,
        cert_type: str,
        user_id: str
    ) -> Tuple[bool, Optional[dict], Optional[str]]:
        """
        블록체인에 인증서 발급

        Args:
            image_hash: 이미지 해시 (0x 접두사 포함)
            cert_type: 인증서 유형 (poster, serial, defect)
            user_id: 사용자 ID

        Returns:
            (성공 여부, 결과 데이터, 에러 메시지)
        """
        if not self.is_configured():
            return False, None, "Blockchain not configured"

        try:
            # certId 생성 (image_hash + cert_type + user_id의 해시)
            cert_data = f"{image_hash}{cert_type}{user_id}"
            cert_id_hash = hashlib.sha256(cert_data.encode()).digest()

            # 트랜잭션 구성
            nonce = self.w3.eth.get_transaction_count(self.admin_account.address)
            gas_price = self.w3.eth.gas_price

            tx = self.contract.functions.issue(cert_id_hash).build_transaction({
                'from': self.admin_account.address,
                'nonce': nonce,
                'gas': 100000,
                'gasPrice': gas_price,
                'chainId': self.w3.eth.chain_id
            })

            # 서명 및 전송
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.admin_account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)

            # 영수증 대기
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

            if receipt['status'] != 1:
                return False, None, "Transaction failed"

            # 이벤트에서 정보 추출
            cert_id = "0x" + cert_id_hash.hex()

            result = {
                'cert_id': cert_id,
                'tx_hash': tx_hash.hex(),
                'block_number': receipt['blockNumber'],
                'gas_used': receipt['gasUsed']
            }

            print(f"[Blockchain] 인증서 발급 성공: {cert_id[:18]}...")
            return True, result, None

        except Exception as e:
            print(f"[Blockchain] 인증서 발급 실패: {e}")
            return False, None, str(e)

    async def verify_certificate(self, cert_id: str) -> Tuple[bool, Optional[dict], Optional[str]]:
        """
        블록체인에서 인증서 검증

        Args:
            cert_id: 인증서 ID (0x 접두사 포함)

        Returns:
            (유효 여부, 인증서 정보, 에러 메시지)
        """
        if not self.is_configured():
            return False, None, "Blockchain not configured"

        try:
            # cert_id를 bytes32로 변환
            cert_id_bytes = bytes.fromhex(cert_id[2:] if cert_id.startswith("0x") else cert_id)

            # 컨트랙트에서 타임스탬프 조회
            timestamp = self.contract.functions.verify(cert_id_bytes).call()

            if timestamp == 0:
                return False, None, "Certificate not found on blockchain"

            result = {
                'timestamp': timestamp,
                'is_valid': True
            }

            return True, result, None

        except Exception as e:
            print(f"[Blockchain] 인증서 검증 실패: {e}")
            return False, None, str(e)

    def get_polygonscan_url(self, tx_hash: str) -> str:
        """PolygonScan 트랜잭션 URL 반환"""
        if "amoy" in self.rpc_url.lower():
            return f"https://amoy.polygonscan.com/tx/{tx_hash}"
        else:
            return f"https://polygonscan.com/tx/{tx_hash}"


# 싱글톤 인스턴스
blockchain_service = BlockchainService()

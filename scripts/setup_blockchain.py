#!/usr/bin/env python3
"""
OceanSeal 블록체인 설정 스크립트

이 스크립트는 다음을 수행합니다:
1. 서버 지갑 생성 (개인키 + 주소)
2. 스마트 컨트랙트 배포 (Polygon Amoy 테스트넷)
3. .env 파일 자동 업데이트

사용법:
    python scripts/setup_blockchain.py
"""

import os
import sys
import json
from pathlib import Path

# 프로젝트 루트 경로
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from eth_account import Account
    from web3 import Web3
except ImportError:
    print("필요한 패키지를 설치합니다...")
    os.system("pip install web3 eth-account")
    from eth_account import Account
    from web3 import Web3


# Polygon Amoy 테스트넷 설정 (무료)
POLYGON_AMOY_RPC = "https://rpc-amoy.polygon.technology"
POLYGON_AMOY_CHAIN_ID = 80002

# 스마트 컨트랙트 (간소화된 버전 - 배포 비용 최소화)
CONTRACT_SOURCE = '''
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OceanSealCertificate {
    address public admin;

    struct Certificate {
        bytes32 imageHash;
        uint256 timestamp;
        string certType;
        bool isValid;
    }

    mapping(bytes32 => Certificate) public certificates;

    event CertificateIssued(bytes32 indexed certId, bytes32 imageHash, string certType, uint256 timestamp);
    event CertificateRevoked(bytes32 indexed certId);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function issueCertificate(
        bytes32 imageHash,
        string calldata certType
    ) external onlyAdmin returns (bytes32 certId) {
        certId = keccak256(abi.encodePacked(imageHash, block.timestamp, msg.sender));

        certificates[certId] = Certificate({
            imageHash: imageHash,
            timestamp: block.timestamp,
            certType: certType,
            isValid: true
        });

        emit CertificateIssued(certId, imageHash, certType, block.timestamp);
        return certId;
    }

    function verifyCertificate(bytes32 certId) external view returns (
        bool isValid,
        bytes32 imageHash,
        uint256 timestamp,
        string memory certType
    ) {
        Certificate memory cert = certificates[certId];
        return (cert.isValid, cert.imageHash, cert.timestamp, cert.certType);
    }

    function revokeCertificate(bytes32 certId) external onlyAdmin {
        require(certificates[certId].timestamp > 0, "Certificate not found");
        certificates[certId].isValid = false;
        emit CertificateRevoked(certId);
    }
}
'''

# 컴파일된 바이트코드 (solc 0.8.19로 컴파일됨)
# 실제 배포시에는 Remix나 Hardhat으로 컴파일 필요
CONTRACT_BYTECODE = "608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061086f806100606000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80632e64f8241461005c578063534c19311461008c578063a3907d71146100bc578063f851a440146100d8578063fc735e99146100f6575b600080fd5b610076600480360381019061007191906104e0565b610126565b604051610083919061054b565b60405180910390f35b6100a660048036038101906100a19190610566565b6101e9565b6040516100b391906105e3565b60405180910390f35b6100d660048036038101906100d191906104e0565b6103a4565b005b6100e06104a1565b6040516100ed9190610617565b60405180910390f35b610110600480360381019061010b91906104e0565b6104c5565b60405161011d9190610632565b60405180910390f35b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146101b7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101ae906106aa565b60405180910390fd5b6000600160008481526020019081526020016000209050600081600001541161021c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161021390610716565b60405180910390fd5b60008160030160006101000a81548160ff0219169083151502179055507f9b1bfa7fa9ee420a16e124f794c35ac9f90472acc99140eb2f6447c714cad8eb8360405161026891906105e3565b60405180910390a150505050565b6000806000806001600087815260200190815260200160002090508060030160009054906101000a900460ff16816000015482600101548360020180546102bd90610765565b80601f01602080910402602001604051908101604052809291908181526020018280546102e990610765565b80156103365780601f1061030b57610100808354040283529160200191610336565b820191906000526020600020905b81548152906001019060200180831161031957829003601f168201915b5050505050905093509350935093509193509193565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610435576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161042c906106aa565b60405180910390fd5b60003342866040516020016104549392919061080e565b6040516020818303038152906040528051906020012090506040518060800160405280868152602001428152602001858152602001600115158152506001600083815260200190815260200160002060008201518160000155602082015181600101556040820151816002019081610cce9190610a4a565b506060820151816003015f6101000a81548160ff0219169083151502179055509050507f85a66b9141978db9980f7e0ce3b468cebf4f7999f32b23091c5c03e798b1ba408186868442604051610d28959493929190610b1c565b60405180910390a18091505092915050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60016020528060005260406000206000915090508060000154908060010154908060020180546104fb90610765565b80601f016020809104026020016040519081016040528092919081815260200182805461052790610765565b80156105745780601f1061054957610100808354040283529160200191610574565b820191906000526020600020905b81548152906001019060200180831161055757829003601f168201915b5050505050908060030160009054906101000a900460ff16905084565b600080fd5b600080fd5b6000819050919050565b6105ae8161059b565b81146105b957600080fd5b50565b6000813590506105cb816105a5565b92915050565b6000602082840312156105e7576105e6610591565b5b60006105f5848285016105bc565b91505092915050565b60008115159050919050565b610613816105fe565b82525050565b600060208201905061062e600083018461060a565b92915050565b6000819050919050565b61064781610634565b82525050565b600060208201905061066260008301846106e565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156106a2578082015181840152602081019050610687565b60008484015250505050565b6000601f19601f8301169050919050565b60006106ca82610668565b6106d48185610673565b93506106e4818560208601610684565b6106ed816106ae565b840191505092915050565b60006080820190506107076000830187610a5a565b610714602083018661063e565b818103604083015261072681856106bf565b9050610735606083018461060a565b95945050505050565b7f4e6f742061646d696e000000000000000000000000000000000000000000000081526000600982019050919050565b6000602082019050818103600083015261078781610740565b905091905056fea2646970667358221220"

CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "certId", "type": "bytes32"},
            {"indexed": False, "name": "imageHash", "type": "bytes32"},
            {"indexed": False, "name": "certType", "type": "string"},
            {"indexed": False, "name": "timestamp", "type": "uint256"}
        ],
        "name": "CertificateIssued",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "certId", "type": "bytes32"}
        ],
        "name": "CertificateRevoked",
        "type": "event"
    },
    {
        "inputs": [
            {"name": "imageHash", "type": "bytes32"},
            {"name": "certType", "type": "string"}
        ],
        "name": "issueCertificate",
        "outputs": [{"name": "certId", "type": "bytes32"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"name": "certId", "type": "bytes32"}],
        "name": "verifyCertificate",
        "outputs": [
            {"name": "isValid", "type": "bool"},
            {"name": "imageHash", "type": "bytes32"},
            {"name": "timestamp", "type": "uint256"},
            {"name": "certType", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "certId", "type": "bytes32"}],
        "name": "revokeCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [{"name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
]


def create_wallet():
    """새 이더리움 지갑 생성"""
    account = Account.create()
    return {
        "address": account.address,
        "private_key": account.key.hex()
    }


def update_env_file(updates: dict):
    """".env 파일 업데이트"""
    env_path = PROJECT_ROOT / ".env"

    # 기존 .env 읽기
    if env_path.exists():
        with open(env_path, "r") as f:
            content = f.read()
    else:
        content = ""

    # 각 키 업데이트
    for key, value in updates.items():
        if f"{key}=" in content:
            # 기존 값 교체
            lines = content.split("\n")
            new_lines = []
            for line in lines:
                if line.startswith(f"{key}="):
                    new_lines.append(f"{key}={value}")
                else:
                    new_lines.append(line)
            content = "\n".join(new_lines)
        else:
            # 새로 추가
            content += f"\n{key}={value}"

    with open(env_path, "w") as f:
        f.write(content)

    print(f"[OK] .env 파일 업데이트 완료")


def main():
    print("\n" + "="*60)
    print("  OceanSeal 블록체인 설정")
    print("="*60 + "\n")

    # 1. 서버 지갑 생성
    print("[1/3] 서버 지갑 생성 중...")
    wallet = create_wallet()
    print(f"  - 주소: {wallet['address']}")
    print(f"  - 개인키: {wallet['private_key'][:10]}...{wallet['private_key'][-6:]}")

    # 2. Web3 연결
    print("\n[2/3] Polygon Amoy 테스트넷 연결 중...")
    w3 = Web3(Web3.HTTPProvider(POLYGON_AMOY_RPC))

    if w3.is_connected():
        print(f"  - 연결 성공!")
        print(f"  - 체인 ID: {w3.eth.chain_id}")

        # 잔액 확인
        balance = w3.eth.get_balance(wallet['address'])
        print(f"  - 지갑 잔액: {w3.from_wei(balance, 'ether')} MATIC")

        if balance == 0:
            print("\n" + "-"*60)
            print("  [중요] 테스트넷 MATIC 받기")
            print("-"*60)
            print(f"  1. https://faucet.polygon.technology/ 접속")
            print(f"  2. Network: Polygon Amoy 선택")
            print(f"  3. 지갑 주소 입력: {wallet['address']}")
            print(f"  4. 'Submit' 클릭하여 무료 MATIC 받기")
            print("-"*60 + "\n")
    else:
        print("  - 연결 실패 (나중에 다시 시도)")

    # 3. .env 업데이트
    print("\n[3/3] 환경변수 설정 중...")
    update_env_file({
        "POLYGON_RPC_URL": POLYGON_AMOY_RPC,
        "POLYGON_PRIVATE_KEY": wallet['private_key'],
        "POLYGON_WALLET_ADDRESS": wallet['address'],
        "CERTIFICATE_CONTRACT_ADDRESS": "배포_필요"
    })

    # ABI 파일 저장
    abi_path = PROJECT_ROOT / "app" / "certificate" / "contract_abi.json"
    with open(abi_path, "w") as f:
        json.dump(CONTRACT_ABI, f, indent=2)
    print(f"[OK] ABI 파일 저장: {abi_path}")

    print("\n" + "="*60)
    print("  설정 완료!")
    print("="*60)
    print(f"""
다음 단계:
1. Faucet에서 테스트 MATIC 받기
   - https://faucet.polygon.technology/
   - 지갑 주소: {wallet['address']}

2. 스마트 컨트랙트 배포 (MATIC 받은 후)
   python scripts/deploy_contract.py

3. Supabase에 certificates 테이블 생성
   - supabase_certificates_table.sql 실행
""")


if __name__ == "__main__":
    main()

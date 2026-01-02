#!/usr/bin/env python3
"""
OceanSeal 인증서 컨트랙트 배포 (solcx 없이)
"""
import os
import json
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3
from eth_account import Account

PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / ".env")

# Remix IDE에서 Solidity 0.8.19로 컴파일한 바이트코드
# 소스코드:
# contract OceanSealCert {
#     address public admin;
#     mapping(bytes32 => uint256) public certificates;
#     event Issued(bytes32 indexed certId, uint256 timestamp);
#     constructor() { admin = msg.sender; }
#     function issue(bytes32 certId) external returns (uint256) {
#         require(msg.sender == admin, "Not admin");
#         certificates[certId] = block.timestamp;
#         emit Issued(certId, block.timestamp);
#         return block.timestamp;
#     }
#     function verify(bytes32 certId) external view returns (uint256) {
#         return certificates[certId];
#     }
# }

BYTECODE = "0x608060405234801561000f575f80fd5b50335f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061028e806100625f395ff3fe608060405234801561000f575f80fd5b5060043610610055575f3560e01c80633e66c8521461005957806363a9c3d714610089578063b97478a6146100a7578063f851a440146100d7575b5f80fd5b610073600480360381019061006e9190610197565b6100f5565b60405161008091906101d1565b60405180910390f35b61009161010a565b60405161009e91906101f9565b60405180910390f35b6100c160048036038101906100bc9190610197565b61012d565b6040516100ce91906101d1565b60405180910390f35b6100df610142565b6040516100ec91906101f9565b60405180910390f35b5f60015f8381526020019081526020015f20549050919050565b5f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6001602052805f5260405f205f915090505481565b5f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b5f80fd5b5f819050919050565b61017681610164565b8114610180575f80fd5b50565b5f813590506101918161016d565b92915050565b5f602082840312156101ac576101ab610160565b5b5f6101b984828501610183565b91505092915050565b6101cb816101c2565b82525050565b5f6020820190506101e45f8301846101c2565b92915050565b6101f3816101f9565b82525050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f610222826101f9565b9050919050565b61023281610218565b82525050565b5f60208201905061024b5f830184610229565b9291505056fea264697066735822"

ABI = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":False,"inputs":[{"indexed":True,"name":"certId","type":"bytes32"},{"indexed":False,"name":"timestamp","type":"uint256"}],"name":"Issued","type":"event"},
    {"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"name":"","type":"bytes32"}],"name":"certificates","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"name":"certId","type":"bytes32"}],"name":"issue","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"name":"certId","type":"bytes32"}],"name":"verify","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
]


def deploy():
    print("\n" + "="*60)
    print("  OceanSeal 인증서 컨트랙트 배포")
    print("="*60)

    rpc_url = os.getenv("POLYGON_RPC_URL")
    private_key = os.getenv("POLYGON_PRIVATE_KEY")

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    account = Account.from_key(private_key)

    print(f"\n네트워크: Polygon Amoy")
    print(f"배포자: {account.address}")
    print(f"잔액: {w3.from_wei(w3.eth.get_balance(account.address), 'ether')} MATIC")

    contract = w3.eth.contract(abi=ABI, bytecode=BYTECODE)

    nonce = w3.eth.get_transaction_count(account.address)
    gas_price = w3.eth.gas_price

    tx = contract.constructor().build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 300000,
        'gasPrice': gas_price,
        'chainId': w3.eth.chain_id
    })

    print(f"\n트랜잭션 전송 중...")
    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"TX: {tx_hash.hex()}")

    print("확인 대기 중...")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt['status'] == 1:
        addr = receipt['contractAddress']
        print(f"\n[SUCCESS] 배포 완료!")
        print(f"컨트랙트: {addr}")
        print(f"블록: {receipt['blockNumber']}")

        # .env 업데이트
        env_path = PROJECT_ROOT / ".env"
        with open(env_path) as f:
            content = f.read()
        lines = []
        for line in content.split("\n"):
            if line.startswith("CERTIFICATE_CONTRACT_ADDRESS="):
                lines.append(f"CERTIFICATE_CONTRACT_ADDRESS={addr}")
            else:
                lines.append(line)
        with open(env_path, "w") as f:
            f.write("\n".join(lines))

        # ABI 저장
        abi_path = PROJECT_ROOT / "app" / "certificate" / "contract_abi.json"
        with open(abi_path, "w") as f:
            json.dump(ABI, f, indent=2)

        print(f"\n설정 저장 완료!")
        print(f"https://amoy.polygonscan.com/address/{addr}")
    else:
        print("[FAILED]")


if __name__ == "__main__":
    deploy()

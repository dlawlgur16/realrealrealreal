// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OceanSealCertificate
 * @dev 이미지 해시를 블록체인에 기록하여 위변조 방지 인증서를 발급하는 컨트랙트
 *
 * LVMH Aura 스타일의 디지털 인증서 시스템
 * - NFT가 아닌 단순 해시 저장 방식
 * - 서버 지갑(admin)만 발급 가능 (커스터디 방식)
 * - 사용자 지갑 연결 불필요
 */
contract OceanSealCertificate {

    // 인증서 구조체
    struct Certificate {
        bytes32 imageHash;      // 이미지 SHA-256 해시
        uint256 timestamp;      // 발급 시간 (Unix timestamp)
        string certType;        // 인증서 유형: poster, serial, defect
        string userId;          // 사용자 ID (해시화된 Firebase UID)
        bool isValid;           // 유효 여부 (취소 시 false)
    }

    // 관리자 주소 (서버 지갑)
    address public admin;

    // 총 발급 인증서 수
    uint256 public totalCertificates;

    // 인증서 ID => 인증서 정보
    mapping(bytes32 => Certificate) public certificates;

    // 이미지 해시 => 인증서 ID (중복 발급 방지)
    mapping(bytes32 => bytes32) public hashToCertId;

    // 사용자 ID => 인증서 ID 목록
    mapping(string => bytes32[]) public userCertificates;

    // 이벤트
    event CertificateIssued(
        bytes32 indexed certId,
        bytes32 indexed imageHash,
        string certType,
        string userId,
        uint256 timestamp
    );

    event CertificateRevoked(
        bytes32 indexed certId,
        uint256 timestamp
    );

    event AdminTransferred(
        address indexed previousAdmin,
        address indexed newAdmin
    );

    // 관리자만 실행 가능
    modifier onlyAdmin() {
        require(msg.sender == admin, "OceanSeal: caller is not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev 인증서 발급
     * @param _imageHash 이미지의 SHA-256 해시 (bytes32)
     * @param _certType 인증서 유형 (poster, serial, defect)
     * @param _userId 사용자 ID (Firebase UID 해시)
     * @return certId 발급된 인증서 ID
     */
    function issueCertificate(
        bytes32 _imageHash,
        string calldata _certType,
        string calldata _userId
    ) external onlyAdmin returns (bytes32) {
        // 이미 발급된 이미지인지 확인
        require(
            hashToCertId[_imageHash] == bytes32(0),
            "OceanSeal: certificate already exists for this image"
        );

        // 인증서 ID 생성 (이미지 해시 + 타임스탬프 + 사용자 조합)
        bytes32 certId = keccak256(
            abi.encodePacked(_imageHash, block.timestamp, _userId)
        );

        // 인증서 저장
        certificates[certId] = Certificate({
            imageHash: _imageHash,
            timestamp: block.timestamp,
            certType: _certType,
            userId: _userId,
            isValid: true
        });

        // 매핑 업데이트
        hashToCertId[_imageHash] = certId;
        userCertificates[_userId].push(certId);
        totalCertificates++;

        emit CertificateIssued(
            certId,
            _imageHash,
            _certType,
            _userId,
            block.timestamp
        );

        return certId;
    }

    /**
     * @dev 인증서 검증
     * @param _certId 인증서 ID
     * @return isValid 유효 여부
     * @return cert 인증서 정보
     */
    function verifyCertificate(bytes32 _certId)
        external
        view
        returns (bool isValid, Certificate memory cert)
    {
        cert = certificates[_certId];
        isValid = cert.isValid && cert.timestamp > 0;
        return (isValid, cert);
    }

    /**
     * @dev 이미지 해시로 인증서 검증
     * @param _imageHash 이미지 해시
     * @return exists 인증서 존재 여부
     * @return certId 인증서 ID
     * @return cert 인증서 정보
     */
    function verifyByImageHash(bytes32 _imageHash)
        external
        view
        returns (bool exists, bytes32 certId, Certificate memory cert)
    {
        certId = hashToCertId[_imageHash];
        if (certId == bytes32(0)) {
            return (false, bytes32(0), cert);
        }
        cert = certificates[certId];
        return (cert.isValid, certId, cert);
    }

    /**
     * @dev 인증서 취소 (관리자만)
     * @param _certId 취소할 인증서 ID
     */
    function revokeCertificate(bytes32 _certId) external onlyAdmin {
        require(
            certificates[_certId].timestamp > 0,
            "OceanSeal: certificate does not exist"
        );
        require(
            certificates[_certId].isValid,
            "OceanSeal: certificate already revoked"
        );

        certificates[_certId].isValid = false;

        emit CertificateRevoked(_certId, block.timestamp);
    }

    /**
     * @dev 사용자의 인증서 목록 조회
     * @param _userId 사용자 ID
     * @return certIds 인증서 ID 목록
     */
    function getUserCertificates(string calldata _userId)
        external
        view
        returns (bytes32[] memory)
    {
        return userCertificates[_userId];
    }

    /**
     * @dev 사용자의 인증서 개수 조회
     * @param _userId 사용자 ID
     * @return count 인증서 개수
     */
    function getUserCertificateCount(string calldata _userId)
        external
        view
        returns (uint256)
    {
        return userCertificates[_userId].length;
    }

    /**
     * @dev 관리자 권한 이전
     * @param _newAdmin 새 관리자 주소
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "OceanSeal: new admin is zero address");
        emit AdminTransferred(admin, _newAdmin);
        admin = _newAdmin;
    }

    /**
     * @dev 배치 인증서 발급 (가스비 절감)
     * @param _imageHashes 이미지 해시 배열
     * @param _certTypes 인증서 유형 배열
     * @param _userIds 사용자 ID 배열
     * @return certIds 발급된 인증서 ID 배열
     */
    function batchIssueCertificates(
        bytes32[] calldata _imageHashes,
        string[] calldata _certTypes,
        string[] calldata _userIds
    ) external onlyAdmin returns (bytes32[] memory) {
        require(
            _imageHashes.length == _certTypes.length &&
            _certTypes.length == _userIds.length,
            "OceanSeal: array lengths must match"
        );
        require(_imageHashes.length <= 50, "OceanSeal: max 50 certificates per batch");

        bytes32[] memory certIds = new bytes32[](_imageHashes.length);

        for (uint256 i = 0; i < _imageHashes.length; i++) {
            // 이미 발급된 이미지는 건너뛰기
            if (hashToCertId[_imageHashes[i]] != bytes32(0)) {
                certIds[i] = hashToCertId[_imageHashes[i]];
                continue;
            }

            bytes32 certId = keccak256(
                abi.encodePacked(_imageHashes[i], block.timestamp, _userIds[i], i)
            );

            certificates[certId] = Certificate({
                imageHash: _imageHashes[i],
                timestamp: block.timestamp,
                certType: _certTypes[i],
                userId: _userIds[i],
                isValid: true
            });

            hashToCertId[_imageHashes[i]] = certId;
            userCertificates[_userIds[i]].push(certId);
            totalCertificates++;
            certIds[i] = certId;

            emit CertificateIssued(
                certId,
                _imageHashes[i],
                _certTypes[i],
                _userIds[i],
                block.timestamp
            );
        }

        return certIds;
    }
}

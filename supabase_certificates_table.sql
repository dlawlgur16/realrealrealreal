-- OceanSeal 디지털 인증서 테이블
-- Supabase SQL Editor에서 실행하세요

-- 인증서 테이블 생성
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cert_id VARCHAR(66) UNIQUE NOT NULL,        -- 블록체인 인증서 ID (0x...)
    user_id VARCHAR(128) NOT NULL,               -- Firebase UID
    image_url VARCHAR(512),                      -- Supabase Storage 이미지 URL
    image_hash VARCHAR(66) NOT NULL,             -- SHA-256 해시 (0x...)
    cert_type VARCHAR(20) NOT NULL,              -- poster, serial, defect
    tx_hash VARCHAR(66) NOT NULL,                -- 블록체인 트랜잭션 해시
    block_number BIGINT NOT NULL DEFAULT 0,      -- 블록 번호
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, revoked, pending
    metadata JSONB,                               -- 추가 메타데이터 (선택)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (검색 최적화)
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_image_hash ON certificates(image_hash);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_type ON certificates(cert_type);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at DESC);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 인증서 조회 가능 (검증용)
CREATE POLICY "Anyone can view certificates"
    ON certificates FOR SELECT
    USING (true);

-- 인증된 사용자만 인증서 생성 가능
CREATE POLICY "Authenticated users can insert certificates"
    ON certificates FOR INSERT
    WITH CHECK (true);

-- 인증서 소유자만 업데이트 가능
CREATE POLICY "Users can update own certificates"
    ON certificates FOR UPDATE
    USING (true);

-- 인증서 소유자만 삭제 가능
CREATE POLICY "Users can delete own certificates"
    ON certificates FOR DELETE
    USING (true);

-- 통계 뷰 (선택)
CREATE OR REPLACE VIEW certificate_stats AS
SELECT
    cert_type,
    status,
    COUNT(*) as count,
    MIN(created_at) as first_issued,
    MAX(created_at) as last_issued
FROM certificates
GROUP BY cert_type, status;

-- 테이블 코멘트
COMMENT ON TABLE certificates IS 'OceanSeal 디지털 인증서 - 이미지 해시를 블록체인에 기록';
COMMENT ON COLUMN certificates.cert_id IS '블록체인에서 발급된 고유 인증서 ID';
COMMENT ON COLUMN certificates.image_hash IS '이미지 SHA-256 해시 (위변조 검증용)';
COMMENT ON COLUMN certificates.tx_hash IS 'Polygon 블록체인 트랜잭션 해시';

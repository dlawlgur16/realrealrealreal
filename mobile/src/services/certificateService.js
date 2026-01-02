/**
 * 디지털 인증서 서비스
 *
 * 블록체인 기반 이미지 인증서 발급/조회/검증 API 연동
 */

import { API_URL } from '../config/api';
import { getCurrentUser, getIdToken } from './authService';

/**
 * 인증서 발급
 * @param {string} imageBase64 - Base64 인코딩된 이미지
 * @param {string} processType - 인증서 유형 (poster, serial, defect)
 * @param {string} imageUrl - (선택) Supabase Storage URL
 * @returns {Promise<{success: boolean, certificate?: object, error?: string}>}
 */
export const issueCertificate = async (imageBase64, processType, imageUrl = null) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // Firebase ID 토큰 가져오기
    const token = await getIdToken();
    if (!token) {
      return { success: false, error: '인증 토큰을 가져올 수 없습니다. 다시 로그인해주세요.' };
    }

    const response = await fetch(`${API_URL}/api/certificate/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        image_base64: imageBase64,
        process_type: processType,
        user_id: user.uid,
        image_url: imageUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || '인증서 발급에 실패했습니다.' };
    }

    return { success: true, certificate: data.certificate };
  } catch (error) {
    console.error('인증서 발급 에러:', error);
    return { success: false, error: error.message || '네트워크 오류가 발생했습니다.' };
  }
};

/**
 * 인증서 조회
 * @param {string} certId - 인증서 ID
 * @returns {Promise<{success: boolean, certificate?: object, error?: string}>}
 */
export const getCertificate = async (certId) => {
  try {
    const response = await fetch(`${API_URL}/api/certificate/${certId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: '인증서를 찾을 수 없습니다.' };
      }
      return { success: false, error: '인증서 조회에 실패했습니다.' };
    }

    const data = await response.json();
    return { success: true, certificate: data };
  } catch (error) {
    console.error('인증서 조회 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 인증서 검증
 * @param {string} certId - 인증서 ID
 * @returns {Promise<{success: boolean, isValid?: boolean, certificate?: object, message?: string}>}
 */
export const verifyCertificate = async (certId) => {
  try {
    const response = await fetch(`${API_URL}/api/certificate/verify/${certId}`);

    if (!response.ok) {
      return { success: false, error: '인증서 검증에 실패했습니다.' };
    }

    const data = await response.json();
    return {
      success: true,
      isValid: data.is_valid,
      certificate: data.certificate,
      blockchainVerified: data.blockchain_verified,
      message: data.message,
    };
  } catch (error) {
    console.error('인증서 검증 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자의 인증서 목록 조회
 * @returns {Promise<{success: boolean, certificates?: array, error?: string}>}
 */
export const getUserCertificates = async () => {
  try {
    const user = await getCurrentUser();
    console.log('getUserCertificates - user:', user);
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.', certificates: [] };
    }

    // Firebase ID 토큰 가져오기
    const token = await getIdToken();
    console.log('getUserCertificates - token exists:', !!token);
    if (!token) {
      return { success: false, error: '인증 토큰을 가져올 수 없습니다.', certificates: [] };
    }

    const url = `${API_URL}/api/certificate/user/${user.uid}`;
    console.log('getUserCertificates - API URL:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('getUserCertificates - response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getUserCertificates - error response:', errorText);
      return { success: false, error: '인증서 목록 조회에 실패했습니다.', certificates: [] };
    }

    const data = await response.json();
    console.log('getUserCertificates - data:', data);
    return {
      success: true,
      certificates: data.certificates || [],
      totalCount: data.total_count || 0,
    };
  } catch (error) {
    console.error('인증서 목록 조회 에러:', error);
    return { success: false, error: error.message, certificates: [] };
  }
};

/**
 * 인증서 유형 한글 라벨
 */
export const CERT_TYPE_LABELS = {
  poster: '판매 포스터',
  serial: '개인정보 블러',
  defect: '하자 표시',
};

/**
 * 인증서 상태 한글 라벨
 */
export const CERT_STATUS_LABELS = {
  active: '유효',
  revoked: '취소됨',
  pending: '처리 중',
};

/**
 * 짧은 인증서 ID 생성 (표시용)
 * @param {string} certId - 전체 인증서 ID
 * @returns {string} 앞 8자리
 */
export const getShortCertId = (certId) => {
  if (!certId) return '';
  const id = certId.startsWith('0x') ? certId.slice(2) : certId;
  return id.slice(0, 8).toUpperCase();
};

/**
 * 날짜 포맷팅
 * @param {string} dateString - ISO 날짜 문자열
 * @returns {string} 포맷팅된 날짜
 */
export const formatCertDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

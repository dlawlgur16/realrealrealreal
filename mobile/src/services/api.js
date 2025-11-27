import axios from 'axios';

// API 기본 URL - 개발 환경에 맞게 변경하세요
// 실제 디바이스에서 테스트 시 컴퓨터의 로컬 IP 사용
const API_BASE_URL = 'http://192.168.0.245:8000';

/**
 * 이미지를 처리하는 통합 API 호출 함수
 * @param {string} imageUri - 로컬 이미지 URI
 * @param {string} processType - "poster" | "serial" | "defect"
 * @param {object} options - 추가 옵션
 * @returns {Promise<object>} - 처리 결과
 */
export const processImage = async (imageUri, processType, options = {}) => {
  try {
    const formData = new FormData();

    // 이미지 파일 추가
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    });

    // process_type 추가
    formData.append('process_type', processType);

    // 추가 옵션 처리
    if (options.additionalInstructions) {
      formData.append('additional_instructions', options.additionalInstructions);
    }

    if (options.maskX !== undefined) {
      formData.append('mask_x', String(options.maskX));
    }
    if (options.maskY !== undefined) {
      formData.append('mask_y', String(options.maskY));
    }
    if (options.maskWidth !== undefined) {
      formData.append('mask_width', String(options.maskWidth));
    }
    if (options.maskHeight !== undefined) {
      formData.append('mask_height', String(options.maskHeight));
    }

    console.log('API 요청:', API_BASE_URL + '/api/process', processType);

    const response = await axios.post(
      `${API_BASE_URL}/api/process`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60초 타임아웃
      }
    );

    return response.data;
  } catch (error) {
    console.error('API 에러:', error);
    
    // 네트워크 에러에 대한 더 자세한 정보 제공
    const isNetworkError = 
      error.isAxiosError && (
        error.code === 'ERR_NETWORK' ||
        error.code === 'NETWORK_ERROR' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('network')
      );
    
    if (isNetworkError) {
      const networkError = new Error(
        `네트워크 연결 오류: 백엔드 서버(${API_BASE_URL})에 연결할 수 없습니다.\n\n` +
        `확인 사항:\n` +
        `1. 백엔드 서버가 실행 중인지 확인하세요\n` +
        `2. IP 주소(${API_BASE_URL})가 올바른지 확인하세요\n` +
        `3. 모바일 디바이스와 서버가 같은 네트워크에 있는지 확인하세요\n` +
        `4. 방화벽이 연결을 차단하지 않는지 확인하세요`
      );
      networkError.name = 'NetworkError';
      throw networkError;
    }
    
    throw error;
  }
};

/**
 * 포스터형 썸네일 생성
 */
export const createPoster = async (imageUri, style = 'minimal', backgroundColor = '#F8F8F8') => {
  try {
    const formData = new FormData();

    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    });

    formData.append('style', style);
    formData.append('background_color', backgroundColor);

    const response = await axios.post(
      `${API_BASE_URL}/api/poster`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Poster API 에러:', error);
    
    // 네트워크 에러에 대한 더 자세한 정보 제공
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      const networkError = new Error(
        `네트워크 연결 오류: 백엔드 서버(${API_BASE_URL})에 연결할 수 없습니다.\n\n` +
        `확인 사항:\n` +
        `1. 백엔드 서버가 실행 중인지 확인하세요\n` +
        `2. IP 주소(${API_BASE_URL})가 올바른지 확인하세요\n` +
        `3. 모바일 디바이스와 서버가 같은 네트워크에 있는지 확인하세요\n` +
        `4. 방화벽이 연결을 차단하지 않는지 확인하세요`
      );
      networkError.name = 'NetworkError';
      throw networkError;
    }
    
    throw error;
  }
};

/**
 * 시리얼 넘버 영역 선명화
 */
export const enhanceSerial = async (imageUri, x, y, width, height) => {
  try {
    const formData = new FormData();

    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    });

    formData.append('x', String(x));
    formData.append('y', String(y));
    formData.append('width', String(width));
    formData.append('height', String(height));

    const response = await axios.post(
      `${API_BASE_URL}/api/serial`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Serial API 에러:', error);
    
    // 네트워크 에러에 대한 더 자세한 정보 제공
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      const networkError = new Error(
        `네트워크 연결 오류: 백엔드 서버(${API_BASE_URL})에 연결할 수 없습니다.\n\n` +
        `확인 사항:\n` +
        `1. 백엔드 서버가 실행 중인지 확인하세요\n` +
        `2. IP 주소(${API_BASE_URL})가 올바른지 확인하세요\n` +
        `3. 모바일 디바이스와 서버가 같은 네트워크에 있는지 확인하세요\n` +
        `4. 방화벽이 연결을 차단하지 않는지 확인하세요`
      );
      networkError.name = 'NetworkError';
      throw networkError;
    }
    
    throw error;
  }
};

/**
 * 하자 부분 강조
 */
export const highlightDefect = async (imageUri, x, y, width, height, defectDescription = null) => {
  try {
    const formData = new FormData();

    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    });

    formData.append('x', String(x));
    formData.append('y', String(y));
    formData.append('width', String(width));
    formData.append('height', String(height));

    if (defectDescription) {
      formData.append('defect_description', defectDescription);
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/defect`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Defect API 에러:', error);
    
    // 네트워크 에러에 대한 더 자세한 정보 제공
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      const networkError = new Error(
        `네트워크 연결 오류: 백엔드 서버(${API_BASE_URL})에 연결할 수 없습니다.\n\n` +
        `확인 사항:\n` +
        `1. 백엔드 서버가 실행 중인지 확인하세요\n` +
        `2. IP 주소(${API_BASE_URL})가 올바른지 확인하세요\n` +
        `3. 모바일 디바이스와 서버가 같은 네트워크에 있는지 확인하세요\n` +
        `4. 방화벽이 연결을 차단하지 않는지 확인하세요`
      );
      networkError.name = 'NetworkError';
      throw networkError;
    }
    
    throw error;
  }
};

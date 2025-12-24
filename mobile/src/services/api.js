import axios from 'axios';

// API 기본 URL - 개발 환경에 맞게 변경하세요
// 실제 디바이스에서 테스트 시 컴퓨터의 로컬 IP 사용
// npm run setup-api 명령어로 자동 설정 가능
const API_BASE_URL = 'https://api.ocean-seal.shop';

// 재시도 설정
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1초

// 딜레이 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 에러 타입 감지 및 사용자 친화적 메시지 생성
 */
const getErrorMessage = (error) => {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  // 네트워크 에러
  const isNetworkError =
    error.isAxiosError && (
      error.code === 'ERR_NETWORK' ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('network')
    );

  if (isNetworkError) {
    return {
      title: '서버 연결 실패',
      message: '백엔드 서버에 연결할 수 없습니다.',
      suggestions: [
        '백엔드 서버가 실행 중인지 확인하세요',
        '모바일과 서버가 같은 Wi-Fi에 연결되어 있는지 확인하세요',
        'API URL이 올바른지 확인하세요',
        '방화벽 설정을 확인하세요'
      ],
      type: 'network'
    };
  }

  // 타임아웃 에러
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      title: '처리 시간 초과',
      message: '서버 응답 시간이 초과되었습니다.',
      suggestions: [
        '이미지 크기가 너무 크지 않은지 확인하세요',
        '네트워크 연결이 안정적인지 확인하세요',
        '잠시 후 다시 시도해주세요'
      ],
      type: 'timeout'
    };
  }

  // 서버 에러 (500번대)
  if (error.response?.status >= 500) {
    return {
      title: '서버 오류',
      message: error.response.data?.message || '서버에서 오류가 발생했습니다.',
      suggestions: [
        'GEMINI_API_KEY가 올바르게 설정되어 있는지 확인하세요',
        '백엔드 서버 로그를 확인하세요',
        '잠시 후 다시 시도해주세요'
      ],
      type: 'server'
    };
  }

  // 클라이언트 에러 (400번대)
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return {
      title: '요청 오류',
      message: error.response.data?.message || '잘못된 요청입니다.',
      suggestions: [
        '이미지 파일이 올바른 형식인지 확인하세요',
        '필수 파라미터가 누락되지 않았는지 확인하세요'
      ],
      type: 'client'
    };
  }

  // 기타 에러
  return {
    title: '오류 발생',
    message: error.message || '알 수 없는 오류가 발생했습니다.',
    suggestions: ['잠시 후 다시 시도해주세요'],
    type: 'unknown'
  };
};

/**
 * 재시도 로직이 있는 API 호출
 */
const callApiWithRetry = async (apiCall, retries = MAX_RETRIES) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`재시도 ${attempt}/${retries}...`);
        await delay(RETRY_DELAY * attempt); // 지수 백오프
      }

      return await apiCall();
    } catch (error) {
      lastError = error;

      // 재시도하면 안 되는 에러 (400번대)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        break;
      }

      // 마지막 시도면 에러 발생
      if (attempt === retries) {
        break;
      }

      console.log(`시도 ${attempt + 1} 실패, 재시도 중...`);
    }
  }

  throw lastError;
};

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

    // 재시도 로직과 함께 API 호출
    const response = await callApiWithRetry(async () => {
      return await axios.post(
        `${API_BASE_URL}/api/process`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60초 타임아웃
        }
      );
    });

    return response.data;
  } catch (error) {
    console.error('API 에러:', error);

    // 사용자 친화적인 에러 메시지 생성
    const errorInfo = getErrorMessage(error);

    // 에러 객체에 추가 정보 포함
    const enhancedError = new Error(errorInfo.message);
    enhancedError.name = errorInfo.title;
    enhancedError.suggestions = errorInfo.suggestions;
    enhancedError.type = errorInfo.type;
    enhancedError.originalError = error;

    throw enhancedError;
  }
};

/**
 * 포스터형 썸네일 생성
 * @param {string} imageUri - 메인 이미지 URI
 * @param {string} style - 스타일 ('minimal', 'vintage', 'modern', 'warm')
 * @param {string} backgroundColor - 배경 색상 (hex)
 * @param {string[]} referenceImages - 레퍼런스 이미지 URI 배열
 */
export const createPoster = async (imageUri, style = 'minimal', backgroundColor = '#F8F8F8', referenceImages = []) => {
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

    // 레퍼런스 이미지 추가
    if (referenceImages && referenceImages.length > 0) {
      console.log(`레퍼런스 이미지 ${referenceImages.length}개 추가 중...`);
      referenceImages.forEach((refUri, index) => {
        const refFilename = refUri.split('/').pop() || `reference_${index}.jpg`;
        const refMatch = /\.(\w+)$/.exec(refFilename);
        const refType = refMatch ? `image/${refMatch[1]}` : 'image/jpeg';
        
        formData.append('reference_files', {
          uri: refUri,
          name: refFilename,
          type: refType,
        });
      });
      console.log('레퍼런스 이미지 추가 완료');
    }

    console.log('createPoster API 요청:', API_BASE_URL + '/api/poster', `레퍼런스: ${referenceImages.length}개`);

    const response = await callApiWithRetry(async () => {
      return await axios.post(
        `${API_BASE_URL}/api/poster`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );
    });

    return response.data;
  } catch (error) {
    console.error('Poster API 에러:', error);

    const errorInfo = getErrorMessage(error);
    const enhancedError = new Error(errorInfo.message);
    enhancedError.name = errorInfo.title;
    enhancedError.suggestions = errorInfo.suggestions;
    enhancedError.type = errorInfo.type;
    enhancedError.originalError = error;

    throw enhancedError;
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

    const response = await callApiWithRetry(async () => {
      return await axios.post(
        `${API_BASE_URL}/api/serial`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );
    });

    return response.data;
  } catch (error) {
    console.error('Serial API 에러:', error);

    const errorInfo = getErrorMessage(error);
    const enhancedError = new Error(errorInfo.message);
    enhancedError.name = errorInfo.title;
    enhancedError.suggestions = errorInfo.suggestions;
    enhancedError.type = errorInfo.type;
    enhancedError.originalError = error;

    throw enhancedError;
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

    const response = await callApiWithRetry(async () => {
      return await axios.post(
        `${API_BASE_URL}/api/defect`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );
    });

    return response.data;
  } catch (error) {
    console.error('Defect API 에러:', error);

    const errorInfo = getErrorMessage(error);
    const enhancedError = new Error(errorInfo.message);
    enhancedError.name = errorInfo.title;
    enhancedError.suggestions = errorInfo.suggestions;
    enhancedError.type = errorInfo.type;
    enhancedError.originalError = error;

    throw enhancedError;
  }
};

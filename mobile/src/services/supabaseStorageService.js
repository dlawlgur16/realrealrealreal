import { supabase, STORAGE_BUCKET } from '../config/supabase';
import { getCurrentUser } from './authService';
import { decode } from 'base64-arraybuffer';

/**
 * Supabase Storage에 이미지 업로드
 * @param {string} base64Image - base64 인코딩된 이미지 (data:image/... 포함 가능)
 * @param {string} processType - 처리 타입 (poster, serial, defect)
 * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
 */
export const uploadImageToSupabase = async (base64Image, processType = 'poster') => {
  try {
    // 로그인 확인
    const user = await getCurrentUser();
    if (!user) {
      console.log('Supabase Storage: 로그인되지 않음, 업로드 건너뜀');
      return { success: false, error: 'not_logged_in' };
    }

    // base64 데이터 정리
    let base64Data = base64Image;
    let contentType = 'image/jpeg';

    if (base64Image.includes('data:image')) {
      const matches = base64Image.match(/data:image\/(\w+);base64,(.+)/);
      if (matches) {
        contentType = `image/${matches[1]}`;
        base64Data = matches[2];
      }
    }

    // 파일 경로 생성 (user_id/type/timestamp.jpg)
    const timestamp = Date.now();
    const extension = contentType.split('/')[1] || 'jpg';
    const filePath = `${user.uid}/${processType}/${timestamp}.${extension}`;

    // ArrayBuffer로 변환
    const arrayBuffer = decode(base64Data);

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase 업로드 에러:', error);
      return { success: false, error: error.message };
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    console.log('Supabase 업로드 성공:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Supabase Storage 업로드 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자의 저장된 이미지 목록 조회
 * @param {string} processType - 필터링할 타입 (all, poster, serial, defect)
 * @returns {Promise<{success: boolean, images?: Array, error?: string}>}
 */
export const getUserImages = async (processType = 'all') => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, images: [], error: 'not_logged_in' };
    }

    const userPath = user.uid;
    const types = processType === 'all' ? ['poster', 'serial', 'defect'] : [processType];
    let allImages = [];

    for (const type of types) {
      const folderPath = `${userPath}/${type}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folderPath, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.log(`${type} 폴더 조회 에러:`, error.message);
        continue;
      }

      if (data && data.length > 0) {
        const images = data
          .filter(file => file.name && !file.name.startsWith('.'))
          .map(file => {
            const filePath = `${folderPath}/${file.name}`;
            const { data: urlData } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(filePath);

            // 파일명에서 timestamp 추출
            const timestampMatch = file.name.match(/(\d+)\./);
            const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : Date.now();

            return {
              path: filePath,
              url: urlData.publicUrl,
              type,
              timestamp,
              name: file.name,
            };
          });

        allImages = [...allImages, ...images];
      }
    }

    // timestamp 기준 정렬 (최신순)
    allImages.sort((a, b) => b.timestamp - a.timestamp);

    return { success: true, images: allImages };
  } catch (error) {
    console.error('이미지 목록 조회 에러:', error);
    return { success: false, images: [], error: error.message };
  }
};

/**
 * 이미지 삭제
 * @param {string} path - 삭제할 파일 경로
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImage = async (path) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'not_logged_in' };
    }

    // 본인 파일인지 확인
    if (!path.startsWith(user.uid)) {
      return { success: false, error: '권한이 없습니다.' };
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      console.error('이미지 삭제 에러:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('이미지 삭제 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 타입별 이미지 개수 조회
 * @returns {Promise<{poster: number, serial: number, defect: number, total: number}>}
 */
export const getImageCounts = async () => {
  const counts = { poster: 0, serial: 0, defect: 0, total: 0 };

  try {
    const user = await getCurrentUser();
    if (!user) {
      return counts;
    }

    const types = ['poster', 'serial', 'defect'];

    for (const type of types) {
      const folderPath = `${user.uid}/${type}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folderPath);

      if (!error && data) {
        const validFiles = data.filter(file => file.name && !file.name.startsWith('.'));
        counts[type] = validFiles.length;
        counts.total += validFiles.length;
      }
    }

    return counts;
  } catch (error) {
    console.error('이미지 개수 조회 에러:', error);
    return counts;
  }
};

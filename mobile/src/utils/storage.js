import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * base64 이미지를 디바이스에 저장
 * @param {string} base64Image - base64 인코딩된 이미지
 * @param {string} filename - 저장할 파일명
 * @returns {Promise<string>} - 저장된 파일 URI
 */
export const saveBase64Image = async (base64Image, filename = null) => {
  try {
    console.log('이미지 저장 시작...');
    
    // 미디어 라이브러리 권한 요청
    console.log('권한 요청 중...');
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    console.log('권한 상태:', status, 'canAskAgain:', canAskAgain);

    if (status !== 'granted') {
      const errorMsg = canAskAgain 
        ? '미디어 라이브러리 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.'
        : '미디어 라이브러리 접근 권한이 거부되었습니다. 설정에서 수동으로 권한을 허용해주세요.';
      throw new Error(errorMsg);
    }

    // 파일명 생성
    const timestamp = new Date().getTime();
    const finalFilename = filename || `karrot_booster_${timestamp}.jpg`;
    console.log('파일명:', finalFilename);

    // 임시 파일 경로
    const fileUri = FileSystem.documentDirectory + finalFilename;
    console.log('파일 경로:', fileUri);

    // base64 문자열에서 data:image/... 프리픽스 제거
    let base64Data = base64Image;
    let mimeType = 'image/jpeg'; // 기본값
    
    if (base64Image.includes(',')) {
      const parts = base64Image.split(',');
      const header = parts[0];
      base64Data = parts[1];
      
      // MIME 타입 추출 (고품질 유지)
      if (header.includes('image/png')) {
        mimeType = 'image/png';
      } else if (header.includes('image/jpeg') || header.includes('image/jpg')) {
        mimeType = 'image/jpeg';
      }
    }
    if (base64Data.startsWith('data:')) {
      // data:image/jpeg;base64, 형태도 처리
      const parts = base64Data.split(',');
      base64Data = parts.length > 1 ? parts[1] : base64Data;
    }
    
    console.log('base64 데이터 길이:', base64Data.length);
    console.log('MIME 타입:', mimeType);
    
    // 이미지 크기 확인 (디버깅용)
    try {
      const img = new Image();
      img.onload = () => {
        console.log(`이미지 크기: ${img.width}x${img.height} pixels`);
      };
      img.src = base64Image;
    } catch (e) {
      console.log('이미지 크기 확인 실패:', e);
    }

    // base64 데이터 URI 생성 (고품질 유지)
    const dataUri = `data:${mimeType};base64,${base64Data}`;
    
    // 파일 시스템을 통해 저장 (압축 방지, 원본 그대로)
    console.log('파일 시스템에 저장 중 (원본 그대로, 압축 없음)...');
    try {
      // 파일명 확장자 설정 (MIME 타입에 따라)
      const extension = mimeType.includes('png') ? 'png' : 'jpg';
      const finalFileUri = fileUri.replace(/\.(jpg|jpeg|png)$/i, `.${extension}`);
      
      // base64 데이터를 파일로 저장 (압축 없음)
      if (FileSystem.EncodingType && FileSystem.EncodingType.Base64) {
        await FileSystem.writeAsStringAsync(finalFileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        // EncodingType이 없는 경우 base64 문자열 그대로 저장
        await FileSystem.writeAsStringAsync(finalFileUri, base64Data);
      }
      console.log('파일 저장 완료:', finalFileUri);
      
      // 파일 존재 확인
      const fileInfo = await FileSystem.getInfoAsync(finalFileUri);
      if (!fileInfo.exists) {
        throw new Error('파일 저장에 실패했습니다.');
      }
      console.log('파일 확인 완료, 크기:', fileInfo.size, 'bytes');
      console.log('원본 base64 길이:', base64Data.length, 'chars');
      console.log('예상 원본 파일 크기:', Math.floor(base64Data.length * 3 / 4), 'bytes (base64 디코딩 후)');
      
      // 파일에서 미디어 라이브러리로 추가 (원본 그대로)
      // MediaLibrary.createAssetAsync는 파일을 읽을 때 압축할 수 있으므로
      // 파일 크기와 저장된 이미지 크기를 비교하여 압축 여부 확인
      console.log('미디어 라이브러리에 추가 중 (원본 그대로)...');
      const asset = await MediaLibrary.createAssetAsync(finalFileUri);
      console.log('미디어 라이브러리 추가 완료:', asset.uri);
      console.log('저장된 이미지 크기:', asset.width, 'x', asset.height);
      
      // 앨범에 저장
      try {
        const album = await MediaLibrary.getAlbumAsync('Karrot Booster');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('Karrot Booster', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
        console.log('앨범 저장 완료');
      } catch (albumError) {
        console.log('앨범 생성/추가 중 에러 (무시):', albumError);
      }
      
      console.log('이미지 저장 완료 (원본 그대로):', asset.uri);
      return asset.uri;
    } catch (fileError) {
      console.log('파일 시스템 저장 실패, 직접 저장 시도:', fileError);
      
      // 대체 방법: 직접 저장
      try {
        const asset = await MediaLibrary.createAssetAsync(dataUri);
        console.log('직접 저장 완료:', asset.uri);
        
        try {
          const album = await MediaLibrary.getAlbumAsync('Karrot Booster');
          if (album == null) {
            await MediaLibrary.createAlbumAsync('Karrot Booster', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
        } catch (albumError) {
          console.log('앨범 생성/추가 중 에러 (무시):', albumError);
        }
        
        return asset.uri;
      } catch (directError) {
        console.error('모든 저장 방법 실패:', directError);
        throw directError;
      }
    }
  } catch (error) {
    console.error('이미지 저장 에러 상세:', error);
    console.error('에러 스택:', error.stack);
    throw error;
  }
};

/**
 * URI로부터 이미지를 미디어 라이브러리에 저장
 * @param {string} uri - 이미지 URI
 * @returns {Promise<string>} - 저장된 파일 URI
 */
export const saveImageFromUri = async (uri) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('미디어 라이브러리 접근 권한이 필요합니다.');
    }

    const asset = await MediaLibrary.createAssetAsync(uri);

    try {
      const album = await MediaLibrary.getAlbumAsync('Karrot Booster');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Karrot Booster', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    } catch (albumError) {
      console.log('앨범 생성/추가 중 에러 (무시):', albumError);
    }

    return asset.uri;
  } catch (error) {
    console.error('이미지 저장 에러:', error);
    throw error;
  }
};

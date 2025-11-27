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
    if (base64Image.includes(',')) {
      base64Data = base64Image.split(',')[1];
    }
    if (base64Data.startsWith('data:')) {
      // data:image/jpeg;base64, 형태도 처리
      const parts = base64Data.split(',');
      base64Data = parts.length > 1 ? parts[1] : base64Data;
    }
    
    console.log('base64 데이터 길이:', base64Data.length);

    // base64 데이터 URI 생성
    const dataUri = `data:image/jpeg;base64,${base64Data}`;
    
    // MediaLibrary에 직접 저장 시도 (base64 데이터 URI 지원)
    console.log('미디어 라이브러리에 직접 저장 시도...');
    try {
      const asset = await MediaLibrary.createAssetAsync(dataUri);
      console.log('직접 저장 완료:', asset.uri);
      
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
      
      console.log('이미지 저장 완료:', asset.uri);
      return asset.uri;
    } catch (directError) {
      console.log('직접 저장 실패, 파일 시스템 사용:', directError);
      
      // 대체 방법: 파일 시스템을 통해 저장
      console.log('파일 쓰기 중...');
      // 레거시 API 사용 (EncodingType 지원)
      if (FileSystem.EncodingType && FileSystem.EncodingType.Base64) {
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        // EncodingType이 없는 경우 문자열로 저장
        await FileSystem.writeAsStringAsync(fileUri, base64Data);
      }
      console.log('파일 쓰기 완료');
      
      // 파일 존재 확인
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('파일 저장에 실패했습니다.');
      }
      console.log('파일 확인 완료:', fileInfo);
      
      // 파일에서 미디어 라이브러리로 추가
      console.log('미디어 라이브러리에 추가 중...');
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      console.log('미디어 라이브러리 추가 완료:', asset.uri);
      
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
      
      console.log('이미지 저장 완료:', asset.uri);
      return asset.uri;
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

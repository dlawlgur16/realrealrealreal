import * as MediaLibrary from 'expo-media-library';

/**
 * Base64 이미지를 갤러리에 저장
 * @param {string} base64Image - data:image/jpeg;base64, 형태의 base64 이미지
 * @param {string} filename - 저장할 파일명
 */
export async function saveBase64Image(base64Image, filename) {
  try {
    // 권한 요청
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('갤러리 저장 권한이 필요합니다.');
    }

    // base64 데이터 추출
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // 임시 파일로 저장 후 갤러리에 추가
    const uri = `data:image/jpeg;base64,${base64Data}`;
    
    // MediaLibrary에 저장
    const asset = await MediaLibrary.createAssetAsync(uri);
    await MediaLibrary.createAlbumAsync('Karrot Booster', asset, false);
    
    return asset;
  } catch (error) {
    console.error('이미지 저장 오류:', error);
    throw error;
  }
}


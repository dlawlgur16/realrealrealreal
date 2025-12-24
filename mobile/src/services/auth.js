import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const API_BASE_URL = 'https://api.ocean-seal.shop';
const TOKEN_KEY = '@karrot_booster_token';
const USER_KEY = '@karrot_booster_user';

// WebBrowser 결과 처리 완료
WebBrowser.maybeCompleteAuthSession();

/**
 * 구글 로그인
 */
export const loginWithGoogle = async () => {
  try {
    const redirectUrl = Linking.createURL('/auth/callback');
    const authUrl = `${API_BASE_URL}/auth/google/login?redirect_uri=${encodeURIComponent(redirectUrl)}`;

    console.log('Opening Google OAuth:', authUrl);

    // 브라우저에서 OAuth 플로우 시작
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      redirectUrl
    );

    if (result.type === 'success') {
      // URL에서 토큰 추출
      const { url } = result;
      const params = new URL(url).searchParams;
      const token = params.get('token');

      if (token) {
        // 토큰으로 사용자 정보 가져오기
        const user = await getCurrentUser(token);

        // 토큰 및 사용자 정보 저장
        await saveToken(token);
        await saveUser(user);

        return { success: true, user, token };
      } else {
        throw new Error('토큰을 받지 못했습니다');
      }
    } else {
      return { success: false, cancelled: true };
    }
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 현재 사용자 정보 가져오기
 */
export const getCurrentUser = async (token = null) => {
  try {
    const authToken = token || await getToken();

    if (!authToken) {
      throw new Error('인증 토큰이 없습니다');
    }

    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const logout = async () => {
  try {
    const token = await getToken();

    if (token) {
      // 서버에 로그아웃 요청
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // 로컬 데이터 삭제
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }
};

/**
 * 토큰 저장
 */
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Save token error:', error);
  }
};

/**
 * 토큰 가져오기
 */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
};

/**
 * 사용자 정보 저장
 */
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Save user error:', error);
  }
};

/**
 * 사용자 정보 가져오기
 */
export const getUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

/**
 * 인증 상태 확인
 */
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

/**
 * 인증된 API 요청을 위한 헤더 가져오기
 */
export const getAuthHeaders = async () => {
  const token = await getToken();
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

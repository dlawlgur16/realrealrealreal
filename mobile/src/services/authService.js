/**
 * Firebase Authentication Service
 *
 * Google 로그인 + 카카오 로그인 (OIDC) 구현
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig, kakaoConfig, googleConfig } from '../config/firebase';

// WebBrowser 세션 완료 처리
WebBrowser.maybeCompleteAuthSession();

// Firebase 초기화 (AsyncStorage로 인증 상태 영구 저장)
let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // AsyncStorage를 사용하여 인증 상태를 앱 재시작 후에도 유지
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

// Storage Keys
const USER_KEY = '@ocean_seal_user';
const TOKEN_KEY = '@ocean_seal_token';

/**
 * 에러 메시지 한글화
 */
const getErrorMessage = (error) => {
  const errorCode = error.code || error.message;

  const errorMessages = {
    'auth/popup-closed-by-user': '로그인이 취소되었습니다.',
    'auth/cancelled-popup-request': '로그인이 취소되었습니다.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/too-many-requests': '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/operation-not-allowed': '이 로그인 방식은 현재 사용할 수 없습니다.',
    'auth/invalid-credential': '인증 정보가 올바르지 않습니다.',
    'auth/account-exists-with-different-credential':
      '이미 다른 방식으로 가입된 이메일입니다.',
  };

  return errorMessages[errorCode] || `로그인 실패: ${errorCode}`;
};

/**
 * Google 로그인
 */
export const loginWithGoogle = async (promptAsync) => {
  try {
    const result = await promptAsync();

    if (result.type === 'success') {
      const { id_token, access_token } = result.params;

      // Firebase에 Google 인증 정보로 로그인
      const credential = GoogleAuthProvider.credential(id_token, access_token);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // 사용자 정보 저장
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'google',
      };

      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(TOKEN_KEY, await user.getIdToken());

      return { success: true, user: userData };
    } else if (result.type === 'cancel') {
      return { success: false, cancelled: true, error: '로그인이 취소되었습니다.' };
    } else {
      return { success: false, error: '로그인에 실패했습니다.' };
    }
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
};

/**
 * 카카오 로그인 (OIDC 방식)
 *
 * Firebase의 OpenID Connect 제공업체를 통해 카카오 로그인 처리
 */
export const loginWithKakao = async () => {
  try {
    // 카카오 OAuth 인증 URL 생성
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'ocean-seal',
      path: 'auth/kakao/callback',
    });

    const authUrl = `https://kauth.kakao.com/oauth/authorize?` +
      `client_id=${kakaoConfig.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid%20profile_nickname%20profile_image%20account_email`;

    // 브라우저에서 카카오 로그인 페이지 열기
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success') {
      // URL에서 authorization code 추출
      const url = new URL(result.url);
      const code = url.searchParams.get('code');

      if (!code) {
        throw new Error('인증 코드를 받지 못했습니다.');
      }

      // 카카오 토큰 교환
      const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: kakaoConfig.clientId,
          redirect_uri: redirectUri,
          code: code,
        }).toString(),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || '토큰 교환 실패');
      }

      // Firebase OIDC 제공업체로 로그인
      const provider = new OAuthProvider('oidc.kakao');
      const credential = provider.credential({
        idToken: tokenData.id_token,
      });

      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // 사용자 정보 저장
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'kakao',
      };

      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(TOKEN_KEY, await user.getIdToken());

      return { success: true, user: userData };
    } else if (result.type === 'cancel') {
      return { success: false, cancelled: true, error: '로그인이 취소되었습니다.' };
    } else {
      return { success: false, error: '로그인에 실패했습니다.' };
    }
  } catch (error) {
    console.error('Kakao login error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
};

/**
 * 로그아웃
 */
export const logout = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 현재 로그인된 사용자 가져오기
 */
export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * 인증 상태 확인
 */
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

/**
 * Firebase Auth 상태 초기화 대기
 * 앱 시작 시 Firebase가 저장된 인증 상태를 복원할 때까지 대기
 */
const waitForAuthInit = () => {
  return new Promise((resolve) => {
    // 이미 currentUser가 있으면 바로 resolve
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    // auth 상태 변경 대기 (최대 5초)
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Firebase ID 토큰 가져오기 (백엔드 API 호출용)
 * - 토큰이 만료된 경우 자동으로 새로고침
 * - Firebase auth 상태 초기화를 기다림
 */
export const getIdToken = async () => {
  try {
    // Firebase auth 상태 초기화 대기
    let currentUser = auth.currentUser;
    if (!currentUser) {
      currentUser = await waitForAuthInit();
    }

    if (currentUser) {
      // getIdToken(true)는 토큰을 강제로 새로고침
      const token = await currentUser.getIdToken(true);
      // 새 토큰을 AsyncStorage에도 저장
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return token;
    }

    // Firebase에 사용자가 없으면 null 반환
    // (로그인 필요)
    console.log('No authenticated user found');
    return null;
  } catch (error) {
    console.error('Get ID token error:', error);
    return null;
  }
};

/**
 * 인증 상태 변경 리스너
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: user.providerData[0]?.providerId || 'unknown',
      };
      callback(userData);
    } else {
      callback(null);
    }
  });
};

/**
 * Google Auth Hook (Expo용)
 *
 * 컴포넌트에서 사용:
 * const [request, response, promptAsync] = useGoogleAuth();
 */
export const useGoogleAuth = () => {
  return Google.useAuthRequest({
    clientId: googleConfig.webClientId,
    iosClientId: googleConfig.iosClientId,
    androidClientId: googleConfig.androidClientId,
  });
};

export { auth };

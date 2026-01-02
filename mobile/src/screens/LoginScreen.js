import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  loginWithGoogle,
  loginWithKakao,
  useGoogleAuth,
} from '../services/authService';

const { height } = Dimensions.get('window');

export default function LoginScreen({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);

  // Google Auth Hook
  const [request, response, promptAsync] = useGoogleAuth();

  // Google 로그인 응답 처리
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response);
    } else if (response?.type === 'error') {
      setIsLoading(false);
      setLoadingProvider(null);
      Alert.alert('오류', 'Google 로그인에 실패했습니다.');
    }
  }, [response]);

  const handleGoogleResponse = async (response) => {
    try {
      const result = await loginWithGoogle(() => Promise.resolve(response));
      if (result.success) {
        onLogin('google', result.user);
      } else if (!result.cancelled) {
        Alert.alert('로그인 실패', result.error);
      }
    } catch (error) {
      Alert.alert('오류', '로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingProvider('google');

    try {
      await promptAsync();
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('오류', '로그인을 시작할 수 없습니다.');
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleKakaoLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingProvider('kakao');

    try {
      const result = await loginWithKakao();

      if (result.success) {
        onLogin('kakao', result.user);
      } else if (result.cancelled) {
        // 사용자가 취소한 경우 - 조용히 처리
      } else {
        Alert.alert('로그인 실패', result.error);
      }
    } catch (error) {
      console.error('Kakao login error:', error);
      Alert.alert('오류', '카카오 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleGuestLogin = () => {
    if (isLoading) return;
    onLogin('guest');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.background}
      >
        {/* 로고 */}
        <View style={styles.headerContainer}>
          <Text style={styles.logo}>OceanSeal</Text>
          <Text style={styles.subtitle}>
            AI로 더 특별한 중고거래 사진
          </Text>
        </View>

        {/* 로그인 버튼 */}
        <View style={styles.buttonContainer}>
          {/* Google 로그인 */}
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
            disabled={isLoading || !request}
          >
            {loadingProvider === 'google' ? (
              <ActivityIndicator size="small" color="#1a1a1a" />
            ) : (
              <View style={styles.socialButtonInner}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Google로 계속하기</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 카카오 로그인 */}
          <TouchableOpacity
            style={[styles.socialButton, styles.kakaoButton]}
            onPress={handleKakaoLogin}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {loadingProvider === 'kakao' ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <View style={styles.socialButtonInner}>
                <Text style={styles.kakaoIcon}>💬</Text>
                <Text style={styles.kakaoButtonText}>카카오로 계속하기</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 구분선 */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.divider} />
          </View>

          {/* 게스트 로그인 */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestLogin}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Text style={styles.guestButtonText}>로그인 없이 시작하기</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            로그인하면 서비스 이용약관 및{'\n'}
            개인정보 처리방침에 동의하는 것으로 간주됩니다
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  background: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
    marginBottom: 32,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    letterSpacing: 0.3,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
  },
  socialButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
  },
  kakaoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: '#6B6B6B',
    paddingHorizontal: 16,
    fontSize: 13,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#A0A0A0',
  },
  termsText: {
    fontSize: 11,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ onLogin }) {
  const handleGoogleLogin = () => {
    console.log('구글 로그인 시작');
    onLogin('google');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 배경 그라데이션 */}
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.background}
      >
        {/* 로고 및 타이틀 */}
        <View style={styles.headerContainer}>
          <Text style={styles.logo}>🥕</Text>
          <Text style={styles.title}>당근 부스터</Text>
          <Text style={styles.subtitle}>
            AI로 더 특별한 중고거래 사진
          </Text>
        </View>

        {/* 기능 소개 */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="🎨"
            title="포스터형 썸네일"
            description="눈에 띄는 감각적인 사진"
          />
          <FeatureItem
            icon="✨"
            title="인증 부분 선명화"
            description="시리얼 넘버 깔끔하게"
          />
          <FeatureItem
            icon="🔍"
            title="하자 부분 강조"
            description="투명한 거래를 위해"
          />
        </View>

        {/* 로그인 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <View style={styles.googleButtonInner}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Google로 시작하기</Text>
            </View>
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

function FeatureItem({ icon, title, description }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
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
    marginTop: height * 0.12,
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
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
  featuresContainer: {
    marginBottom: 60,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#A0A0A0',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  googleButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  termsText: {
    fontSize: 11,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

// OceanSeal 색상 팔레트
const COLORS = {
  primary: '#007AFF',
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#1D1D1F',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  poster: '#22C55E',    // 초록 - 포스터
  privacy: '#8B5CF6',   // 보라 - 개인정보
  defect: '#F59E0B',    // 주황 - 하자
};

export default function HomeScreen({ navigation, onLogout, isGuest }) {
  const features = [
    {
      id: 'poster',
      icon: '🌟',
      title: '포스터형 썸네일',
      subtitle: 'Aesthetic Hook',
      description: '평범한 중고물품 사진을 스튜디오급 썸네일로 변환합니다',
      color: COLORS.poster,
      route: 'Poster',
      tag: '가장 인기',
    },
    {
      id: 'serial',
      icon: '🛡️',
      title: '개인정보 보호',
      subtitle: 'Trust Proof',
      description: '시리얼 넘버, 모델명 등 민감 정보를 자동으로 제거합니다',
      color: COLORS.privacy,
      route: 'Serial',
      tag: '안전 거래',
    },
    {
      id: 'defect',
      icon: '⚠️',
      title: '하자 강조 표시',
      subtitle: 'The Honesty',
      description: '하자 부분을 명확히 표시하여 신뢰도를 높입니다',
      color: COLORS.defect,
      route: 'Defect',
      tag: '신뢰 UP',
    },
  ];

  const handleFeaturePress = (route) => {
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>OceanSeal</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI</Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            {!isGuest && (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate('MyCertificates')}
                  style={styles.certButton}
                >
                  <Text style={styles.certText}>인증서</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('MyImages')}
                  style={styles.myImagesButton}
                >
                  <Text style={styles.myImagesText}>내 이미지</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>{isGuest ? '로그인' : '로그아웃'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.tagline}>신뢰를 거래하는 기술</Text>
      </View>

      {/* Feature Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>기능 선택</Text>

        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => handleFeaturePress(feature.route)}
            activeOpacity={0.7}
          >
            {/* Tag */}
            <View style={[styles.tag, { backgroundColor: feature.color + '15' }]}>
              <Text style={[styles.tagText, { color: feature.color }]}>
                {feature.tag}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: feature.color + '15' }]}>
                <Text style={styles.icon}>{feature.icon}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>

            {/* Arrow */}
            <View style={[styles.arrowContainer, { backgroundColor: feature.color }]}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>OceanSeal이란?</Text>
              <Text style={styles.infoDescription}>
                AI 기술로 중고거래 사진을 '신뢰할 수 있는 인증 정보'로 변환하는 서비스입니다.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Gemini AI</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  certButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#22C55E' + '15',
  },
  certText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#22C55E',
  },
  myImagesButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
  },
  myImagesText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  badge: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featureCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  tag: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    paddingRight: 40,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

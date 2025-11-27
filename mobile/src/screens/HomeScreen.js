import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const features = [
    {
      id: 'poster',
      title: '포스터형 썸네일',
      description: '상품을 더 매력적으로 보여주는\n프리미엄 포스터를 만들어요',
      icon: '🎨',
      color: '#FF6B6B',
    },
    {
      id: 'serial',
      title: '인증 정보 선명화',
      description: '시리얼 넘버나 인증서를\n깔끔하게 보정해요',
      icon: '✨',
      color: '#4ECDC4',
    },
    {
      id: 'defect',
      title: '하자 부분 강조',
      description: '솔직한 거래를 위해\n하자 부분을 감성적으로 표현해요',
      icon: '🔍',
      color: '#FFE66D',
    },
  ];

  const handleFeaturePress = (featureId) => {
    const screenMap = {
      poster: 'Poster',
      serial: 'Serial',
      defect: 'Defect',
    };
    navigation.navigate(screenMap[featureId]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>당근 부스터</Text>
        <Text style={styles.subtitle}>중고거래 프리미엄 포토 서비스</Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={[styles.featureCard, { borderLeftColor: feature.color }]}
            onPress={() => handleFeaturePress(feature.id)}
            activeOpacity={0.7}
          >
            <View style={styles.featureIcon}>
              <Text style={styles.iconText}>{feature.icon}</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          AI가 당신의 중고거래를 더 특별하게 만들어요
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
  },
  featuresContainer: {
    flex: 1,
    padding: 16,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  arrow: {
    fontSize: 32,
    color: '#DEE2E6',
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
  },
});

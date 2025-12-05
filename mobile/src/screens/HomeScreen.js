import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 더 민감한 스와이프

export default function HomeScreen({ navigation }) {
  const features = [
    {
      id: 'poster',
      title: 'Pro Poster',
      subtitle: '01',
      description: 'Transform your product photos into stunning, premium-quality images',
      icon: '🎨',
      color: '#4A90E2',
      route: 'Poster',
    },
    {
      id: 'serial',
      title: 'Privacy Blur',
      subtitle: '02',
      description: 'Automatically remove serial numbers and sensitive information',
      icon: '🔒',
      color: '#9B59B6',
      route: 'Serial',
    },
    {
      id: 'defect',
      title: 'Defect Scan',
      subtitle: '03',
      description: 'Detect and highlight product defects for transparent selling',
      icon: '🔍',
      color: '#E74C3C',
      route: 'Defect',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isAnimating && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isAnimating) {
          position.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isAnimating) return;

        const { dx, vx } = gestureState;
        const velocity = Math.abs(vx);
        const shouldSwipe = Math.abs(dx) > SWIPE_THRESHOLD || velocity > 0.3;

        if (shouldSwipe) {
          if (dx < 0 && currentIndex < features.length - 1) {
            setIsAnimating(true);
            Animated.spring(position, {
              toValue: -SCREEN_WIDTH,
              useNativeDriver: true,
              tension: 65,
              friction: 7,
            }).start(() => {
              position.setValue(0);
              setCurrentIndex(currentIndex + 1);
              setIsAnimating(false);
            });
          } else if (dx > 0 && currentIndex > 0) {
            setIsAnimating(true);
            Animated.spring(position, {
              toValue: SCREEN_WIDTH,
              useNativeDriver: true,
              tension: 65,
              friction: 7,
            }).start(() => {
              position.setValue(0);
              setCurrentIndex(currentIndex - 1);
              setIsAnimating(false);
            });
          } else {
            Animated.spring(position, {
              toValue: 0,
              useNativeDriver: true,
              tension: 65,
              friction: 7,
            }).start();
          }
        } else {
          Animated.spring(position, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  const handleStart = () => {
    navigation.navigate(features[currentIndex].route);
  };

  const handleDotPress = (index) => {
    if (index !== currentIndex && !isAnimating) {
      setIsAnimating(true);
      Animated.spring(position, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 7,
      }).start(() => {
        setCurrentIndex(index);
        setIsAnimating(false);
      });
    }
  };

  const currentFeature = features[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>SnapPro</Text>
        <Text style={styles.subtitle}>AI-Powered Product Enhancement</Text>
      </View>

      {/* Swipeable Card */}
      <View style={styles.cardContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateX: position }],
            },
          ]}
        >
          {/* Card */}
          <View style={[styles.cardFrame, { backgroundColor: currentFeature.color }]}>
            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  {currentFeature.icon}
                </Text>
              </View>

              <Text style={styles.featureTitle}>{currentFeature.title}</Text>
              <Text style={styles.featureDescription}>
                {currentFeature.description}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Swipe Indicators - removed for cleaner design */}
      </View>

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dotContainer}
            onPress={() => handleDotPress(index)}
            disabled={isAnimating}
          >
            <View
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
                currentIndex === index && { backgroundColor: feature.color },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: currentFeature.color }]}
        onPress={handleStart}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>
          Get Started →
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Swipe to explore features
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    width: SCREEN_WIDTH - 40,
  },
  cardFrame: {
    borderRadius: 24,
    padding: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 60,
  },
  icon: {
    fontSize: 64,
  },
  featureTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  dotContainer: {
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  dotActive: {
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  startButton: {
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
});

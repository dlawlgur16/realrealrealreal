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
      title: 'PRO POSTER',
      subtitle: '01',
      description: 'TRANSFORM PRODUCT PHOTOS\nINTO PREMIUM QUALITY',
      icon: '▸',
      glowColor: '#00F5FF',
      route: 'Poster',
    },
    {
      id: 'serial',
      title: 'PRIVACY BLUR',
      subtitle: '02',
      description: 'CONCEAL SENSITIVE\nINFORMATION',
      icon: '▹',
      glowColor: '#B026FF',
      route: 'Serial',
    },
    {
      id: 'defect',
      title: 'DEFECT SCAN',
      subtitle: '03',
      description: 'EXPOSE FLAWS FOR\nTRANSPARENT SELLING',
      icon: '▸',
      glowColor: '#FF6B35',
      route: 'Defect',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Neon glow pulse animation
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1C" />

      {/* Grid Background Pattern */}
      <View style={styles.gridBackground} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>SNAP//PRO</Text>
          <View style={styles.statusIndicator}>
            <Animated.View
              style={[
                styles.statusDot,
                {
                  backgroundColor: currentFeature.glowColor,
                  opacity: glowOpacity,
                }
              ]}
            />
            <Text style={styles.statusText}>READY</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>AI-POWERED ENHANCEMENT SYSTEM</Text>
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
          {/* Card Frame */}
          <View style={styles.cardFrame}>
            {/* Top Corner Brackets */}
            <View style={[styles.cornerBracket, styles.cornerTopLeft]} />
            <View style={[styles.cornerBracket, styles.cornerTopRight]} />

            {/* Feature Number */}
            <View style={styles.featureNumberContainer}>
              <Text style={[styles.featureNumber, { color: currentFeature.glowColor }]}>
                {currentFeature.subtitle}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={[styles.icon, { color: currentFeature.glowColor }]}>
                  {currentFeature.icon}
                </Text>
                <Animated.View
                  style={[
                    styles.iconGlow,
                    {
                      backgroundColor: currentFeature.glowColor,
                      opacity: glowOpacity,
                    }
                  ]}
                />
              </View>

              <Text style={styles.featureTitle}>{currentFeature.title}</Text>

              <View style={styles.descriptionContainer}>
                <View style={[
                  styles.accentLine,
                  { backgroundColor: currentFeature.glowColor },
                  currentIndex === 0 && styles.accentLineLeft,
                  currentIndex === 1 && styles.accentLineCenter,
                  currentIndex === 2 && styles.accentLineRight,
                ]} />
                <Text style={styles.featureDescription}>
                  {currentFeature.description}
                </Text>
              </View>
            </View>

            {/* Bottom Corner Brackets */}
            <View style={[styles.cornerBracket, styles.cornerBottomLeft]} />
            <View style={[styles.cornerBracket, styles.cornerBottomRight]} />
          </View>
        </Animated.View>

        {/* Swipe Indicators */}
        {currentIndex > 0 && (
          <View style={[styles.swipeIndicator, styles.swipeIndicatorLeft]}>
            <Text style={styles.swipeText}>←</Text>
          </View>
        )}
        {currentIndex < features.length - 1 && (
          <View style={[styles.swipeIndicator, styles.swipeIndicatorRight]}>
            <Text style={styles.swipeText}>→</Text>
          </View>
        )}
      </View>

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <View style={styles.paginationLine} />
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
                currentIndex === index && { backgroundColor: feature.glowColor },
              ]}
            />
            <Text style={[
              styles.dotLabel,
              currentIndex === index && { color: feature.glowColor },
            ]}>
              {feature.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.paginationLine} />
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={[styles.startButton, { borderColor: currentFeature.glowColor }]}
        onPress={handleStart}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.buttonGlow,
            {
              backgroundColor: currentFeature.glowColor,
              opacity: glowOpacity,
            }
          ]}
        />
        <View style={styles.buttonContent}>
          <Text style={[styles.startButtonText, { color: currentFeature.glowColor }]}>
            INITIATE
          </Text>
          <Text style={styles.startButtonArrow}>▸</Text>
        </View>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>
          SWIPE TO SELECT MODULE // TAP TO EXECUTE
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '700',
    color: '#E8E8E8',
    letterSpacing: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#888888',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
    letterSpacing: 1.5,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: SCREEN_WIDTH - 40,
  },
  cardFrame: {
    backgroundColor: '#242424',
    borderWidth: 2,
    borderColor: '#3D3D3D',
    padding: 40,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#666666',
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  featureNumberContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  featureNumber: {
    fontFamily: 'monospace',
    fontSize: 64,
    fontWeight: '700',
    opacity: 0.08,
    letterSpacing: -2,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#3D3D3D',
    backgroundColor: '#1C1C1C',
  },
  icon: {
    fontSize: 72,
    fontWeight: '700',
    zIndex: 2,
  },
  iconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 0,
    zIndex: 1,
  },
  featureTitle: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '700',
    color: '#E8E8E8',
    marginBottom: 8,
    letterSpacing: 4,
    textAlign: 'center',
  },
  descriptionContainer: {
    width: '100%',
    paddingTop: 20,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
    marginTop: 20,
    position: 'relative',
  },
  accentLine: {
    position: 'absolute',
    top: -1,
    width: 80,
    height: 2,
  },
  accentLineLeft: {
    left: 0,
  },
  accentLineCenter: {
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  accentLineRight: {
    right: 0,
  },
  featureDescription: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#888888',
    lineHeight: 16,
    letterSpacing: 1,
    textAlign: 'center',
  },
  swipeIndicator: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeIndicatorLeft: {
    left: 30,
  },
  swipeIndicatorRight: {
    right: 30,
  },
  swipeText: {
    color: '#666666',
    fontSize: 20,
    fontWeight: '300',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  paginationLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3D3D3D',
  },
  dotContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#3D3D3D',
    marginBottom: 6,
  },
  dotActive: {
    width: 8,
    height: 8,
  },
  dotLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#555555',
    letterSpacing: 1,
  },
  startButton: {
    marginHorizontal: 24,
    borderWidth: 2,
    backgroundColor: '#2A2A2A',
    overflow: 'hidden',
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
  },
  startButtonArrow: {
    fontSize: 20,
    color: '#E8E8E8',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginBottom: 12,
  },
  footerText: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#555555',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Text,
} from 'react-native';

/**
 * 이미지에서 영역을 선택할 수 있는 컴포넌트
 */
export default function ImageAreaSelector({ imageUri, onAreaSelected, color = '#4ECDC4' }) {
  const [selection, setSelection] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [imageLayout, setImageLayout] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const startPos = useRef(null);

  // 이미지 로드 시 실제 크기 가져오기
  useEffect(() => {
    if (imageUri) {
      Image.getSize(
        imageUri,
        (width, height) => {
          setImageSize({ width, height });
        },
        (error) => {
          console.error('이미지 크기 가져오기 실패:', error);
          // 기본값 설정
          setImageSize({ width: 1000, height: 1000 });
        }
      );
    }
  }, [imageUri]);

  // 이미지 레이아웃 정보 저장
  const handleImageLayout = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setImageLayout({ x, y, width, height });
  };

  // 터치 이벤트 처리
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        if (!imageLayout) return;

        const { locationX, locationY } = evt.nativeEvent;
        startPos.current = { x: locationX, y: locationY };
        setIsSelecting(true);
        setSelection({
          x: locationX,
          y: locationY,
          width: 0,
          height: 0,
        });
      },

      onPanResponderMove: (evt) => {
        if (!startPos.current || !imageLayout) return;

        const { locationX, locationY } = evt.nativeEvent;
        const x = Math.min(startPos.current.x, locationX);
        const y = Math.min(startPos.current.y, locationY);
        const width = Math.abs(locationX - startPos.current.x);
        const height = Math.abs(locationY - startPos.current.y);

        // 이미지 영역 내로 제한
        const clampedX = Math.max(0, Math.min(x, imageLayout.width));
        const clampedY = Math.max(0, Math.min(y, imageLayout.height));
        const clampedWidth = Math.min(width, imageLayout.width - clampedX);
        const clampedHeight = Math.min(height, imageLayout.height - clampedY);

        setSelection({
          x: clampedX,
          y: clampedY,
          width: clampedWidth,
          height: clampedHeight,
        });
      },

      onPanResponderRelease: () => {
        if (!selection || !imageLayout || !imageSize) {
          setIsSelecting(false);
          return;
        }

        // 최소 크기 체크 (10x10 픽셀 이상)
        if (selection.width < 10 || selection.height < 10) {
          setSelection(null);
          setIsSelecting(false);
          return;
        }

        // 실제 이미지 크기 대비 비율 계산
        const scaleX = imageSize.width / imageLayout.width;
        const scaleY = imageSize.height / imageLayout.height;

        const actualArea = {
          x: Math.round(selection.x * scaleX),
          y: Math.round(selection.y * scaleY),
          width: Math.round(selection.width * scaleX),
          height: Math.round(selection.height * scaleY),
        };

        if (onAreaSelected) {
          onAreaSelected(actualArea);
        }

        setIsSelecting(false);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View
        style={styles.imageWrapper}
        {...panResponder.panHandlers}
        onLayout={handleImageLayout}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
        {selection && selection.width > 0 && selection.height > 0 && (
          <View
            style={[
              styles.selectionBox,
              {
                left: selection.x,
                top: selection.y,
                width: selection.width,
                height: selection.height,
                borderColor: color,
                backgroundColor: `${color}20`, // 20% 투명도
              },
            ]}
          />
        )}
        {isSelecting && (
          <View style={styles.instructionOverlay}>
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>드래그하여 영역 선택</Text>
            </View>
          </View>
        )}
      </View>
      {selection && selection.width > 10 && selection.height > 10 && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            선택된 영역: {Math.round(selection.width)} × {Math.round(selection.height)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    minHeight: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E9ECEF',
  },
  image: {
    width: '100%',
    height: 300,
  },
  selectionBox: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 4,
    pointerEvents: 'none',
  },
  instructionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  instructionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#6C757D',
  },
});


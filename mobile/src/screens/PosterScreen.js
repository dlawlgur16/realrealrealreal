import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPoster } from '../services/api';
import { saveBase64Image } from '../utils/storage';

export default function PosterScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('minimal');
  const [referenceImages, setReferenceImages] = useState([]);

  const styles_options = [
    { id: 'minimal', label: '미니멀', emoji: '⚪' },
    { id: 'vintage', label: '빈티지', emoji: '🟤' },
    { id: 'modern', label: '모던', emoji: '⚫' },
    { id: 'warm', label: '따뜻한', emoji: '🟠' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setProcessedImage(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setProcessedImage(null);
    }
  };

  const pickReferenceImage = async () => {
    Alert.alert(
      '상품 사진 추가',
      '어떤 방법으로 추가하시겠어요?',
      [
        {
          text: '갤러리에서 선택',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsMultipleSelection: true,
              quality: 1,
            });
            if (!result.canceled && result.assets) {
              const newImages = result.assets.map(asset => asset.uri);
              setReferenceImages([...referenceImages, ...newImages]);
            }
          },
        },
        {
          text: '카메라로 촬영',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled && result.assets) {
              setReferenceImages([...referenceImages, result.assets[0].uri]);
            }
          },
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  const removeReferenceImage = (index) => {
    const newImages = referenceImages.filter((_, i) => i !== index);
    setReferenceImages(newImages);
  };

  const processImage = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '먼저 이미지를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await createPoster(selectedImage, selectedStyle, referenceImages);

      if (result.success && result.image_base64) {
        setProcessedImage(`data:image/png;base64,${result.image_base64}`);
        Alert.alert('성공', result.message);
      } else {
        Alert.alert('실패', result.message || '이미지 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('처리 에러:', error);
      
      // 네트워크 에러에 대한 더 자세한 메시지 표시
      if (error.name === 'NetworkError' || error.message?.includes('Network Error')) {
        Alert.alert(
          '네트워크 연결 오류',
          error.message || '백엔드 서버에 연결할 수 없습니다.\n\n서버가 실행 중인지 확인해주세요.',
          [{ text: '확인' }]
        );
      } else {
        Alert.alert('오류', error.message || '이미지 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveImage = async () => {
    if (!processedImage) {
      Alert.alert('알림', '저장할 이미지가 없습니다.');
      return;
    }

    try {
      console.log('이미지 저장 시작...');
      const savedUri = await saveBase64Image(processedImage, `poster_${Date.now()}.jpg`);
      console.log('저장된 URI:', savedUri);
      Alert.alert('저장 완료', '이미지가 갤러리에 저장되었습니다.');
    } catch (error) {
      console.error('저장 에러:', error);
      console.error('에러 메시지:', error.message);
      Alert.alert(
        '저장 실패', 
        error.message || '이미지 저장 중 오류가 발생했습니다.\n\n설정에서 저장 권한을 확인해주세요.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>포스터형 썸네일 생성</Text>
          <Text style={styles.subtitle}>상품을 더 매력적으로 보여주세요</Text>
        </View>

        <View style={styles.content}>
          {/* 이미지 선택 */}
          {!selectedImage && (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>🎨</Text>
              <Text style={styles.placeholderText}>
                상품 이미지를 선택하세요
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.pickButton}
                  onPress={pickImage}
                >
                  <Text style={styles.pickButtonText}>갤러리에서 선택</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pickButton}
                  onPress={takePhoto}
                >
                  <Text style={styles.pickButtonText}>사진 촬영</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 선택된 이미지 */}
          {selectedImage && (
            <View style={styles.imageContainer}>
              <Text style={styles.sectionTitle}>원본 이미지</Text>
              <Image source={{ uri: selectedImage }} style={styles.image} />
              <TouchableOpacity
                style={styles.changeButton}
                onPress={pickImage}
              >
                <Text style={styles.changeButtonText}>다른 이미지 선택</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 상품 추가 사진 (여러 각도) */}
          {selectedImage && (
            <View style={styles.referenceContainer}>
              <View style={styles.referenceHeader}>
                <View>
                  <Text style={styles.sectionTitle}>상품 추가 사진</Text>
                  <Text style={styles.referenceSubtitle}>
                    앞면, 옆면, 뒷면 등 여러 각도 사진을 추가하세요
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addReferenceButton}
                  onPress={pickReferenceImage}
                >
                  <Text style={styles.addReferenceButtonText}>+ 추가</Text>
                </TouchableOpacity>
              </View>
              {referenceImages.length > 0 && (
                <View style={styles.referenceImagesGrid}>
                  {referenceImages.map((uri, index) => (
                    <View key={index} style={styles.referenceImageWrapper}>
                      <Image source={{ uri }} style={styles.referenceImage} />
                      <View style={styles.referenceImageLabel}>
                        <Text style={styles.referenceImageLabelText}>
                          사진 {index + 1}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeReferenceButton}
                        onPress={() => removeReferenceImage(index)}
                      >
                        <Text style={styles.removeReferenceButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {referenceImages.length === 0 && (
                <View style={styles.emptyReferenceContainer}>
                  <Text style={styles.emptyReferenceText}>
                    📸 상품의 여러 각도 사진을 추가하면{'\n'}
                    더 정확한 포스터를 생성할 수 있습니다
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* 스타일 선택 */}
          {selectedImage && (
            <View style={styles.styleContainer}>
              <Text style={styles.sectionTitle}>스타일 선택</Text>
              <View style={styles.styleButtons}>
                {styles_options.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[
                      styles.styleButton,
                      selectedStyle === style.id && styles.styleButtonActive,
                    ]}
                    onPress={() => setSelectedStyle(style.id)}
                  >
                    <Text style={styles.styleEmoji}>{style.emoji}</Text>
                    <Text
                      style={[
                        styles.styleLabel,
                        selectedStyle === style.id && styles.styleLabelActive,
                      ]}
                    >
                      {style.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 처리 버튼 */}
          {selectedImage && (
            <TouchableOpacity
              style={[styles.processButton, loading && styles.buttonDisabled]}
              onPress={processImage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.processButtonText}>포스터 생성하기</Text>
              )}
            </TouchableOpacity>
          )}

          {/* 처리된 이미지 */}
          {processedImage && (
            <View style={styles.resultContainer}>
              <Text style={styles.sectionTitle}>생성된 포스터</Text>
              <Image source={{ uri: processedImage }} style={styles.image} />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveImage}
              >
                <Text style={styles.saveButtonText}>갤러리에 저장</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    fontSize: 24,
    color: '#FF6B6B',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  content: {
    padding: 20,
  },
  imagePlaceholder: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  pickButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
  },
  changeButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#6C757D',
    fontSize: 14,
  },
  styleContainer: {
    marginBottom: 20,
  },
  styleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  styleButton: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  styleButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  styleEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  styleLabel: {
    fontSize: 12,
    color: '#6C757D',
  },
  styleLabelActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  processButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  processButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  referenceContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  referenceSubtitle: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  addReferenceButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addReferenceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  referenceImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  referenceImageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  referenceImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E9ECEF',
  },
  referenceImageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  referenceImageLabelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  removeReferenceButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeReferenceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  emptyReferenceContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 8,
  },
  emptyReferenceText: {
    fontSize: 13,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
});

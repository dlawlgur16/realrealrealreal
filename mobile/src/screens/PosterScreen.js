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
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPoster } from '../services/api';
import { saveBase64Image } from '../utils/storage';

// OceanSeal 색상 팔레트
const COLORS = {
  primary: '#007AFF',
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#1D1D1F',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accent: '#22C55E',
  success: '#22C55E',
};

export default function PosterScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('dramatic');
  const [referenceImages, setReferenceImages] = useState([]);

  const styleOptions = [
    { id: 'dramatic', label: '드라마틱', desc: '대비 강한 포스터', icon: '🎬' },
    { id: 'tone_on_tone', label: '톤온톤', desc: '모노크롬 하모니', icon: '🎨' },
    { id: 'modern', label: '모던', desc: '프리미엄 광고', icon: '✨' },
    { id: 'artistic', label: '아티스틱', desc: '시네마틱 감성', icon: '🖼️' },
    { id: 'hero', label: '히어로', desc: '제품 런칭 비주얼', icon: '🚀' },
    { id: 'museum', label: '뮤지엄', desc: '갤러리 전시', icon: '🏛️' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
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
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setProcessedImage(null);
    }
  };

  const pickReferenceImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setReferenceImages([...referenceImages, ...newImages]);
    }
  };

  const removeReferenceImage = (index) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
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
        Alert.alert('완료', '포스터가 생성되었습니다!');
      } else {
        Alert.alert('실패', result.message || '이미지 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert('오류', error.message || '이미지 처리 중 오류가 발생했습니다.');
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
      await saveBase64Image(processedImage, `poster_${Date.now()}.jpg`);
      Alert.alert('저장 완료', '이미지가 갤러리에 저장되었습니다.');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('저장 실패', error.message || '이미지 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>포스터형 썸네일</Text>
          <Text style={styles.headerSubtitle}>Aesthetic Hook</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🌟</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Image Upload Section */}
          {!selectedImage ? (
            <View style={styles.uploadSection}>
              <View style={styles.uploadCard}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadTitle}>이미지 업로드</Text>
                <Text style={styles.uploadDescription}>
                  변환할 제품 사진을 선택해주세요
                </Text>
                <View style={styles.uploadButtons}>
                  <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text style={styles.uploadButtonIcon}>🖼️</Text>
                    <Text style={styles.uploadButtonText}>갤러리</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                    <Text style={styles.uploadButtonIcon}>📸</Text>
                    <Text style={styles.uploadButtonText}>카메라</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <>
              {/* Selected Image */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>원본 이미지</Text>
                <View style={styles.imageCard}>
                  <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="cover" />
                </View>
                <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                  <Text style={styles.changeButtonText}>이미지 변경</Text>
                </TouchableOpacity>
              </View>

              {/* Reference Images */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>레퍼런스 이미지 (선택)</Text>
                  <TouchableOpacity style={styles.addButton} onPress={pickReferenceImage}>
                    <Text style={styles.addButtonText}>+ 추가</Text>
                  </TouchableOpacity>
                </View>

                {referenceImages.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.referenceScroll}>
                    {referenceImages.map((uri, index) => (
                      <View key={index} style={styles.referenceItem}>
                        <Image source={{ uri }} style={styles.referenceImage} />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeReferenceImage(index)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyReference}>
                    <Text style={styles.emptyReferenceText}>
                      스타일 참고용 이미지를 추가하면{'\n'}더 좋은 결과를 얻을 수 있어요
                    </Text>
                  </View>
                )}
              </View>

              {/* Style Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>스타일 선택</Text>
                <View style={styles.styleGrid}>
                  {styleOptions.map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleButton,
                        selectedStyle === style.id && styles.styleButtonActive,
                      ]}
                      onPress={() => setSelectedStyle(style.id)}
                    >
                      <Text style={styles.styleIcon}>{style.icon}</Text>
                      <Text style={[
                        styles.styleLabel,
                        selectedStyle === style.id && styles.styleLabelActive,
                      ]}>
                        {style.label}
                      </Text>
                      <Text style={styles.styleDesc}>{style.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Process Button */}
              <TouchableOpacity
                style={[styles.processButton, loading && styles.processButtonDisabled]}
                onPress={processImage}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.processButtonText}>생성 중...</Text>
                  </View>
                ) : (
                  <Text style={styles.processButtonText}>🌟 포스터 생성하기</Text>
                )}
              </TouchableOpacity>

              {/* Result */}
              {processedImage && (
                <View style={styles.section}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.sectionTitle}>생성된 포스터</Text>
                    <View style={styles.successBadge}>
                      <Text style={styles.successBadgeText}>✓ 완료</Text>
                    </View>
                  </View>
                  <View style={styles.imageCard}>
                    <Image source={{ uri: processedImage }} style={styles.image} resizeMode="cover" />
                  </View>
                  <View style={styles.resultActions}>
                    <TouchableOpacity style={styles.saveButton} onPress={saveImage}>
                      <Text style={styles.saveButtonText}>💾 저장하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => setProcessedImage(null)}
                    >
                      <Text style={styles.retryButtonText}>다시 생성</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.accent + '15',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  uploadSection: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 400,
  },
  uploadCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonIcon: {
    fontSize: 16,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  imageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#F0F0F0',
  },
  changeButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  changeButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  referenceScroll: {
    marginTop: -8,
  },
  referenceItem: {
    marginRight: 12,
    position: 'relative',
  },
  referenceImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    backgroundColor: '#FF3B30',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyReference: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyReferenceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: -8,
  },
  styleButton: {
    width: '31%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  styleButtonActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '08',
  },
  styleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  styleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  styleLabelActive: {
    color: COLORS.accent,
  },
  styleDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  processButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  processButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  processButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successBadge: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  successBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  retryButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

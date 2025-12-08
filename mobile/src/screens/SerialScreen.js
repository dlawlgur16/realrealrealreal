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
import { enhanceSerial } from '../services/api';
import { saveBase64Image } from '../utils/storage';

// OceanSeal 색상 팔레트
const COLORS = {
  primary: '#007AFF',
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#1D1D1F',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accent: '#8B5CF6',  // 보라색 - 개인정보 보호
  success: '#22C55E',
};

export default function SerialScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const processImage = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '먼저 이미지를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await enhanceSerial(selectedImage, 0, 0, 0, 0);

      if (result.success && result.image_base64) {
        setProcessedImage(`data:image/png;base64,${result.image_base64}`);
        Alert.alert('완료', '개인정보가 제거되었습니다!');
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
      await saveBase64Image(processedImage, `privacy_${Date.now()}.jpg`);
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
          <Text style={styles.headerTitle}>개인정보 보호</Text>
          <Text style={styles.headerSubtitle}>Trust Proof</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🛡️</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>자동 감지 및 제거</Text>
              <Text style={styles.infoDescription}>
                시리얼 번호, 모델명, IMEI, QR코드 등 민감한 정보를 AI가 자동으로 감지하여 자연스럽게 제거합니다.
              </Text>
            </View>
          </View>

          {/* Image Upload Section */}
          {!selectedImage ? (
            <View style={styles.uploadSection}>
              <View style={styles.uploadCard}>
                <Text style={styles.uploadIcon}>🔒</Text>
                <Text style={styles.uploadTitle}>이미지 업로드</Text>
                <Text style={styles.uploadDescription}>
                  개인정보가 포함된 제품 사진을 선택해주세요
                </Text>
                <View style={styles.uploadButtons}>
                  <TouchableOpacity style={[styles.uploadButton, { backgroundColor: COLORS.accent }]} onPress={pickImage}>
                    <Text style={styles.uploadButtonIcon}>🖼️</Text>
                    <Text style={styles.uploadButtonText}>갤러리</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.uploadButton, { backgroundColor: COLORS.accent }]} onPress={takePhoto}>
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

              {/* Process Button */}
              <TouchableOpacity
                style={[styles.processButton, loading && styles.processButtonDisabled]}
                onPress={processImage}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.processButtonText}>처리 중...</Text>
                  </View>
                ) : (
                  <Text style={styles.processButtonText}>🛡️ 개인정보 제거하기</Text>
                )}
              </TouchableOpacity>

              {/* Result */}
              {processedImage && (
                <View style={styles.section}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.sectionTitle}>처리된 이미지</Text>
                    <View style={styles.successBadge}>
                      <Text style={styles.successBadgeText}>✓ 보호됨</Text>
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
                      <Text style={styles.retryButtonText}>다시 처리</Text>
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
  infoCard: {
    backgroundColor: COLORS.accent + '10',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  uploadSection: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 350,
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
  processButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
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

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
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { enhanceSerial } from '../services/api';
import { saveBase64Image } from '../utils/storage';

export default function SerialScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState({
    x: 100,
    y: 100,
    width: 200,
    height: 100,
  });

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

  const processImage = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '먼저 이미지를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await enhanceSerial(
        selectedImage,
        area.x,
        area.y,
        area.width,
        area.height
      );

      if (result.success && result.image_base64) {
        setProcessedImage(`data:image/jpeg;base64,${result.image_base64}`);
        Alert.alert('성공', result.message);
      } else {
        Alert.alert('실패', result.message || '이미지 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('처리 에러:', error);
      Alert.alert('오류', '이미지 처리 중 오류가 발생했습니다.');
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
      await saveBase64Image(processedImage, `serial_${Date.now()}.jpg`);
      Alert.alert('저장 완료', '이미지가 갤러리에 저장되었습니다.');
    } catch (error) {
      console.error('저장 에러:', error);
      Alert.alert('오류', '이미지 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>인증 정보 선명화</Text>
          <Text style={styles.subtitle}>
            시리얼 넘버나 인증서를 깔끔하게 보정하세요
          </Text>
        </View>

        <View style={styles.content}>
          {!selectedImage && (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>✨</Text>
              <Text style={styles.placeholderText}>
                인증 정보가 포함된 이미지를 선택하세요
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

          {selectedImage && (
            <View style={styles.areaContainer}>
              <Text style={styles.sectionTitle}>인증 영역 좌표</Text>
              <Text style={styles.helpText}>
                선명화할 영역의 위치와 크기를 입력하세요
              </Text>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>X 좌표</Text>
                  <TextInput
                    style={styles.input}
                    value={String(area.x)}
                    onChangeText={(text) =>
                      setArea({ ...area, x: parseInt(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="100"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Y 좌표</Text>
                  <TextInput
                    style={styles.input}
                    value={String(area.y)}
                    onChangeText={(text) =>
                      setArea({ ...area, y: parseInt(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="100"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>너비</Text>
                  <TextInput
                    style={styles.input}
                    value={String(area.width)}
                    onChangeText={(text) =>
                      setArea({ ...area, width: parseInt(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="200"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>높이</Text>
                  <TextInput
                    style={styles.input}
                    value={String(area.height)}
                    onChangeText={(text) =>
                      setArea({ ...area, height: parseInt(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="100"
                  />
                </View>
              </View>
            </View>
          )}

          {selectedImage && (
            <TouchableOpacity
              style={[styles.processButton, loading && styles.buttonDisabled]}
              onPress={processImage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.processButtonText}>선명화 처리하기</Text>
              )}
            </TouchableOpacity>
          )}

          {processedImage && (
            <View style={styles.resultContainer}>
              <Text style={styles.sectionTitle}>처리된 이미지</Text>
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
    color: '#4ECDC4',
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
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickButton: {
    backgroundColor: '#4ECDC4',
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
  areaContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  processButton: {
    backgroundColor: '#4ECDC4',
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
});

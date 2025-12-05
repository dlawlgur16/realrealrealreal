import React, { useState, useRef } from 'react';
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
  Animated,
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

  const PRIMARY_COLOR = '#4A90E2'; // Soft Blue

  const styles_options = [
    { id: 'minimal', label: 'POSTER', code: 'MIN' },
    { id: 'tone_on_tone', label: 'TONE', code: 'TON' },
    { id: 'modern_luxury', label: 'LUXURY', code: 'LUX' },
    { id: 'artistic', label: 'ARTISTIC', code: 'ART' },
    { id: 'hero', label: 'HERO', code: 'HRO' },
    { id: 'exhibition', label: 'EXHIBIT', code: 'EXH' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,  // 크롭 없이 원본 그대로 사용
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setProcessedImage(null);
    }
  };

  const takePhoto = async () => {
    const { status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,  // 크롭 없이 원본 그대로 사용
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
      Alert.alert('Permission Required', 'Photo library access permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,  // 크롭 없이 원본 그대로 사용
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setReferenceImages([...referenceImages, ...newImages]);
    }
  };

  const takeReferencePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setReferenceImages([...referenceImages, result.assets[0].uri]);
    }
  };

  const removeReferenceImage = (index) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const processImage = async () => {
    if (!selectedImage) {
      Alert.alert('Notice', 'Please select an image first.');
      return;
    }

    setLoading(true);
    try {
      const result = await createPoster(selectedImage, selectedStyle, referenceImages);

      if (result.success && result.image_base64) {
        setProcessedImage(`data:image/png;base64,${result.image_base64}`);
        Alert.alert('Success', 'Processing complete');
      } else {
        Alert.alert('Failed', result.message || 'Image processing failed.');
      }
    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert('Error', error.message || 'An error occurred during image processing.');
    } finally {
      setLoading(false);
    }
  };

  const saveImage = async () => {
    if (!processedImage) {
      Alert.alert('Notice', 'No image to save.');
      return;
    }

    try {
      const savedUri = await saveBase64Image(processedImage, `poster_${Date.now()}.jpg`);
      Alert.alert('Saved', 'Image has been saved to gallery.');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save Failed', error.message || 'An error occurred while saving the image.');
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>PRO POSTER</Text>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: PRIMARY_COLOR,
                }
              ]}
            />
          </View>
          <View style={styles.headerDivider} />
          <Text style={styles.subtitle}>MODULE//01 // TRANSFORM</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Image Upload Section */}
          {!selectedImage && (
            <View style={styles.uploadFrame}>
              <View style={[styles.cornerBracket, styles.cornerTopLeft]} />
              <View style={[styles.cornerBracket, styles.cornerTopRight]} />

              <View style={styles.uploadContent}>
                <Text style={[styles.uploadIcon, { color: PRIMARY_COLOR }]}>▸</Text>
                <Text style={styles.uploadTitle}>INPUT REQUIRED</Text>
                <View style={[styles.dividerShort, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.uploadSubtext}>
                  JPG, PNG // MAX 10MB
                </Text>

                <View style={styles.uploadButtons}>
                  <TouchableOpacity
                    style={[styles.uploadButton, { borderColor: PRIMARY_COLOR }]}
                    onPress={pickImage}
                  >
                    <Text style={[styles.uploadButtonText, { color: PRIMARY_COLOR }]}>
                      GALLERY
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.uploadButton, { borderColor: PRIMARY_COLOR }]}
                    onPress={takePhoto}
                  >
                    <Text style={[styles.uploadButtonText, { color: PRIMARY_COLOR }]}>
                      CAMERA
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.cornerBracket, styles.cornerBottomLeft]} />
              <View style={[styles.cornerBracket, styles.cornerBottomRight]} />
            </View>
          )}

          {/* Selected Image */}
          {selectedImage && (
            <View style={styles.imageSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIndicator, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.sectionTitle}>SOURCE IMAGE</Text>
              </View>
              <View style={styles.imageFrame}>
                <Image source={{ uri: selectedImage }} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageLabel}>INPUT</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={pickImage}
              >
                <Text style={styles.changeButtonText}>↻ CHANGE</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reference Images */}
          {selectedImage && (
            <View style={styles.referenceSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIndicator, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.sectionTitle}>REFERENCE IMAGES</Text>
                <View style={styles.referenceButtons}>
                  <TouchableOpacity
                    style={[styles.addButton, { borderColor: PRIMARY_COLOR }]}
                    onPress={pickReferenceImage}
                  >
                    <Text style={[styles.addButtonText, { color: PRIMARY_COLOR }]}>+ GALLERY</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addButton, { borderColor: PRIMARY_COLOR, marginLeft: 8 }]}
                    onPress={takeReferencePhoto}
                  >
                    <Text style={[styles.addButtonText, { color: PRIMARY_COLOR }]}>+ CAMERA</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {referenceImages.length > 0 ? (
                <View style={styles.referenceGrid}>
                  {referenceImages.map((uri, index) => (
                    <View key={index} style={styles.referenceItem}>
                      <Image source={{ uri }} style={styles.referenceImage} />
                      <View style={styles.referenceLabel}>
                        <Text style={styles.referenceLabelText}>REF-{String(index + 1).padStart(2, '0')}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeReferenceImage(index)}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyReference}>
                  <Text style={styles.emptyReferenceText}>
                    NO REFERENCE IMAGES{'\n'}ADD FOR ENHANCED RESULTS
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Style Selection */}
          {selectedImage && (
            <View style={styles.styleSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIndicator, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.sectionTitle}>PROCESSING MODE</Text>
              </View>
              <View style={styles.styleGrid}>
                {styles_options.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[
                      styles.styleButton,
                      selectedStyle === style.id && { borderColor: PRIMARY_COLOR },
                    ]}
                    onPress={() => setSelectedStyle(style.id)}
                  >
                    <Text style={styles.styleCode}>{style.code}</Text>
                    <Text
                      style={[
                        styles.styleLabel,
                        selectedStyle === style.id && { color: PRIMARY_COLOR },
                      ]}
                    >
                      {style.label}
                    </Text>
                    {selectedStyle === style.id && (
                      <Animated.View
                        style={[
                          styles.styleGlow,
                          {
                            backgroundColor: PRIMARY_COLOR,
                            opacity: glowOpacity,
                          }
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Process Button */}
          {selectedImage && (
            <TouchableOpacity
              style={[styles.processButton, { borderColor: PRIMARY_COLOR }]}
              onPress={processImage}
              disabled={loading}
            >
              <Animated.View
                style={[
                  styles.buttonGlow,
                  {
                    backgroundColor: PRIMARY_COLOR,
                    opacity: loading ? 0.5 : glowOpacity,
                  }
                ]}
              />
              <View style={styles.processButtonContent}>
                {loading ? (
                  <>
                    <ActivityIndicator color={PRIMARY_COLOR} size="small" />
                    <Text style={[styles.processButtonText, { color: PRIMARY_COLOR }]}>
                      PROCESSING...
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.processButtonText, { color: PRIMARY_COLOR }]}>
                    ▸ EXECUTE TRANSFORM
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Result */}
          {processedImage && (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <Animated.View
                  style={[
                    styles.resultIndicator,
                    {
                      backgroundColor: PRIMARY_COLOR,
                      opacity: glowOpacity,
                    }
                  ]}
                />
                <Text style={styles.resultTitle}>OUTPUT // COMPLETE</Text>
              </View>

              <View style={styles.imageFrame}>
                <Image source={{ uri: processedImage }} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageLabel}>OUTPUT</Text>
                </View>
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: PRIMARY_COLOR }]}
                  onPress={saveImage}
                >
                  <Text style={[styles.actionButtonText, { color: PRIMARY_COLOR }]}>
                    ↓ SAVE
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setProcessedImage(null)}
                >
                  <Text style={styles.actionButtonText}>↻ RETRY</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonContainer: {
    marginRight: 16,
  },
  backButton: {
    fontSize: 28,
    color: '#333333',
    fontWeight: '300',
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#999999',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  uploadFrame: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cornerBracket: {
    display: 'none',
  },
  cornerTopLeft: {
    display: 'none',
  },
  cornerTopRight: {
    display: 'none',
  },
  cornerBottomLeft: {
    display: 'none',
  },
  cornerBottomRight: {
    display: 'none',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  dividerShort: {
    width: 60,
    height: 3,
    marginBottom: 12,
    borderRadius: 2,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 24,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  uploadButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIndicator: {
    width: 4,
    height: 14,
    marginRight: 10,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  imageFrame: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#F0F0F0',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  imageLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  changeButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  changeButtonText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  referenceSection: {
    marginBottom: 24,
  },
  referenceButtons: {
    flexDirection: 'row',
  },
  addButton: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  referenceItem: {
    width: '31%',
    aspectRatio: 1,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  referenceImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  referenceLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 2,
  },
  referenceLabelText: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#E8E8E8',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B35',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#E8E8E8',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  emptyReference: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyReferenceText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
  styleSection: {
    marginBottom: 24,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleButton: {
    width: '31%',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  styleCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 4,
  },
  styleLabel: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '500',
  },
  styleGlow: {
    display: 'none',
  },
  processButton: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonGlow: {
    display: 'none',
  },
  processButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  processButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultSection: {
    marginBottom: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
});

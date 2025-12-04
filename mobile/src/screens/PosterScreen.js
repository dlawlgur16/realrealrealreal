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
  const glowAnim = useRef(new Animated.Value(0)).current;

  const NEON_COLOR = '#00F5FF'; // Cyan for Poster

  // Neon glow pulse
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

  const styles_options = [
    { id: 'minimal', label: 'EDITORIAL', code: 'MIN' },
    { id: 'vintage', label: 'FILM', code: 'VIN' },
    { id: 'catalogue', label: 'STUDIO', code: 'STU' },
    { id: 'tone_on_tone', label: 'PASTEL', code: 'PAS' },
    { id: 'dream', label: 'MINIATURE', code: 'DRM' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access permission is required.');
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
    const { status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access permission is required.');
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access permission is required.');
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
            <Animated.View
              style={[
                styles.statusDot,
                {
                  backgroundColor: NEON_COLOR,
                  opacity: glowOpacity,
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
                <Text style={[styles.uploadIcon, { color: NEON_COLOR }]}>▸</Text>
                <Text style={styles.uploadTitle}>INPUT REQUIRED</Text>
                <View style={[styles.dividerShort, { backgroundColor: NEON_COLOR }]} />
                <Text style={styles.uploadSubtext}>
                  JPG, PNG // MAX 10MB
                </Text>

                <View style={styles.uploadButtons}>
                  <TouchableOpacity
                    style={[styles.uploadButton, { borderColor: NEON_COLOR }]}
                    onPress={pickImage}
                  >
                    <Text style={[styles.uploadButtonText, { color: NEON_COLOR }]}>
                      GALLERY
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.uploadButton, { borderColor: NEON_COLOR }]}
                    onPress={takePhoto}
                  >
                    <Text style={[styles.uploadButtonText, { color: NEON_COLOR }]}>
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
                <View style={[styles.sectionIndicator, { backgroundColor: NEON_COLOR }]} />
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
                <View style={[styles.sectionIndicator, { backgroundColor: NEON_COLOR }]} />
                <Text style={styles.sectionTitle}>REFERENCE IMAGES</Text>
                <TouchableOpacity
                  style={[styles.addButton, { borderColor: NEON_COLOR }]}
                  onPress={pickReferenceImage}
                >
                  <Text style={[styles.addButtonText, { color: NEON_COLOR }]}>+ ADD</Text>
                </TouchableOpacity>
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
                <View style={[styles.sectionIndicator, { backgroundColor: NEON_COLOR }]} />
                <Text style={styles.sectionTitle}>PROCESSING MODE</Text>
              </View>
              <View style={styles.styleGrid}>
                {styles_options.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[
                      styles.styleButton,
                      selectedStyle === style.id && { borderColor: NEON_COLOR },
                    ]}
                    onPress={() => setSelectedStyle(style.id)}
                  >
                    <Text style={styles.styleCode}>{style.code}</Text>
                    <Text
                      style={[
                        styles.styleLabel,
                        selectedStyle === style.id && { color: NEON_COLOR },
                      ]}
                    >
                      {style.label}
                    </Text>
                    {selectedStyle === style.id && (
                      <Animated.View
                        style={[
                          styles.styleGlow,
                          {
                            backgroundColor: NEON_COLOR,
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
              style={[styles.processButton, { borderColor: NEON_COLOR }]}
              onPress={processImage}
              disabled={loading}
            >
              <Animated.View
                style={[
                  styles.buttonGlow,
                  {
                    backgroundColor: NEON_COLOR,
                    opacity: loading ? 0.5 : glowOpacity,
                  }
                ]}
              />
              <View style={styles.processButtonContent}>
                {loading ? (
                  <>
                    <ActivityIndicator color={NEON_COLOR} size="small" />
                    <Text style={[styles.processButtonText, { color: NEON_COLOR }]}>
                      PROCESSING...
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.processButtonText, { color: NEON_COLOR }]}>
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
                      backgroundColor: NEON_COLOR,
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
                  style={[styles.actionButton, { borderColor: NEON_COLOR }]}
                  onPress={saveImage}
                >
                  <Text style={[styles.actionButtonText, { color: NEON_COLOR }]}>
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
    backgroundColor: '#1C1C1C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#1C1C1C',
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  backButtonContainer: {
    marginRight: 16,
  },
  backButton: {
    fontSize: 28,
    color: '#E8E8E8',
    fontWeight: '300',
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '700',
    color: '#E8E8E8',
    letterSpacing: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  uploadFrame: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 40,
    position: 'relative',
    marginBottom: 24,
  },
  cornerBracket: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#555555',
  },
  cornerTopLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTopRight: {
    top: -1,
    right: -1,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadTitle: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    color: '#E8E8E8',
    letterSpacing: 2,
    marginBottom: 12,
  },
  dividerShort: {
    width: 60,
    height: 2,
    marginBottom: 12,
  },
  uploadSubtext: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#888888',
    marginBottom: 24,
    letterSpacing: 1,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  uploadButton: {
    flex: 1,
    borderWidth: 2,
    backgroundColor: '#2A2A2A',
    paddingVertical: 14,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
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
    height: 12,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#E8E8E8',
    letterSpacing: 1.5,
    flex: 1,
  },
  imageFrame: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#2A2A2A',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  imageLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#E8E8E8',
    letterSpacing: 1,
  },
  changeButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  changeButtonText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#888888',
    letterSpacing: 1,
  },
  referenceSection: {
    marginBottom: 24,
  },
  addButton: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addButtonText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
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
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  referenceImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
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
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyReferenceText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0.5,
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
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#3D3D3D',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  styleCode: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '700',
    color: '#555555',
    marginBottom: 4,
  },
  styleLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#888888',
    letterSpacing: 1,
  },
  styleGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  processButton: {
    borderWidth: 2,
    backgroundColor: '#2A2A2A',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  processButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  processButtonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  resultTitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#E8E8E8',
    letterSpacing: 1.5,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#3D3D3D',
    backgroundColor: '#2A2A2A',
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1,
  },
});

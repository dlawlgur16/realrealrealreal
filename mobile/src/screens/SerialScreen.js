import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, SafeAreaView, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { enhanceSerial } from '../services/api';
import { saveBase64Image } from '../utils/storage';

export default function SerialScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const NEON_COLOR = '#B026FF';

  React.useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

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

  const processImage = async () => {
    if (!selectedImage) {
      Alert.alert('Notice', 'Please select an image first.');
      return;
    }
    setLoading(true);
    try {
      const result = await enhanceSerial(selectedImage, 0, 0, 0, 0);
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
      await saveBase64Image(processedImage, `privacy_${Date.now()}.jpg`);
      Alert.alert('Saved', 'Image has been saved to gallery.');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save Failed', error.message || 'An error occurred while saving the image.');
    }
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>PRIVACY BLUR</Text>
            <Animated.View style={[styles.statusDot, { backgroundColor: NEON_COLOR, opacity: glowOpacity }]} />
          </View>
          <View style={styles.headerDivider} />
          <Text style={styles.subtitle}>MODULE//02 // CONCEAL</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {!selectedImage && (
            <View style={styles.uploadFrame}>
              <View style={[styles.cornerBracket, styles.cornerTopLeft]} />
              <View style={[styles.cornerBracket, styles.cornerTopRight]} />
              <View style={styles.uploadContent}>
                <Text style={[styles.uploadIcon, { color: NEON_COLOR }]}>▹</Text>
                <Text style={styles.uploadTitle}>INPUT REQUIRED</Text>
                <View style={[styles.dividerShort, { backgroundColor: NEON_COLOR }]} />
                <Text style={styles.uploadSubtext}>JPG, PNG // MAX 10MB</Text>
                <View style={styles.uploadButtons}>
                  <TouchableOpacity style={[styles.uploadButton, { borderColor: NEON_COLOR }]} onPress={pickImage}>
                    <Text style={[styles.uploadButtonText, { color: NEON_COLOR }]}>GALLERY</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.cornerBracket, styles.cornerBottomLeft]} />
              <View style={[styles.cornerBracket, styles.cornerBottomRight]} />
            </View>
          )}

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
              <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                <Text style={styles.changeButtonText}>↻ CHANGE</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedImage && (
            <TouchableOpacity style={[styles.processButton, { borderColor: NEON_COLOR }]} onPress={processImage} disabled={loading}>
              <Animated.View style={[styles.buttonGlow, { backgroundColor: NEON_COLOR, opacity: loading ? 0.5 : glowOpacity }]} />
              <View style={styles.processButtonContent}>
                {loading ? (
                  <>
                    <ActivityIndicator color={NEON_COLOR} size="small" />
                    <Text style={[styles.processButtonText, { color: NEON_COLOR }]}>PROCESSING...</Text>
                  </>
                ) : (
                  <Text style={[styles.processButtonText, { color: NEON_COLOR }]}>▸ EXECUTE BLUR</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {processedImage && (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <Animated.View style={[styles.resultIndicator, { backgroundColor: NEON_COLOR, opacity: glowOpacity }]} />
                <Text style={styles.resultTitle}>OUTPUT // COMPLETE</Text>
              </View>
              <View style={styles.imageFrame}>
                <Image source={{ uri: processedImage }} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageLabel}>OUTPUT</Text>
                </View>
              </View>
              <View style={styles.resultActions}>
                <TouchableOpacity style={[styles.actionButton, { borderColor: NEON_COLOR }]} onPress={saveImage}>
                  <Text style={[styles.actionButtonText, { color: NEON_COLOR }]}>↓ SAVE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setProcessedImage(null)}>
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
  container: { flex: 1, backgroundColor: '#1C1C1C' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, backgroundColor: '#1C1C1C', borderBottomWidth: 1, borderBottomColor: '#3D3D3D' },
  backButtonContainer: { marginRight: 16 },
  backButton: { fontSize: 28, color: '#E8E8E8', fontWeight: '300' },
  headerContent: { flex: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontFamily: 'monospace', fontSize: 20, fontWeight: '700', color: '#E8E8E8', letterSpacing: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  headerDivider: { height: 1, backgroundColor: '#3D3D3D', marginBottom: 8 },
  subtitle: { fontFamily: 'monospace', fontSize: 10, color: '#666666', letterSpacing: 1 },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  uploadFrame: { backgroundColor: '#2A2A2A', borderWidth: 1, borderColor: '#3D3D3D', padding: 40, position: 'relative', marginBottom: 24 },
  cornerBracket: { position: 'absolute', width: 16, height: 16, borderColor: '#555555' },
  cornerTopLeft: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTopRight: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBottomLeft: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBottomRight: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  uploadContent: { alignItems: 'center' },
  uploadIcon: { fontSize: 48, marginBottom: 16 },
  uploadTitle: { fontFamily: 'monospace', fontSize: 16, fontWeight: '700', color: '#E8E8E8', letterSpacing: 2, marginBottom: 12 },
  dividerShort: { width: 60, height: 2, marginBottom: 12 },
  uploadSubtext: { fontFamily: 'monospace', fontSize: 10, color: '#888888', marginBottom: 24, letterSpacing: 1 },
  uploadButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  uploadButton: { flex: 1, borderWidth: 2, backgroundColor: '#2A2A2A', paddingVertical: 14, alignItems: 'center' },
  uploadButtonText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  imageSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIndicator: { width: 4, height: 12, marginRight: 8 },
  sectionTitle: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: '#E8E8E8', letterSpacing: 1.5, flex: 1 },
  imageFrame: { position: 'relative', borderWidth: 1, borderColor: '#3D3D3D' },
  image: { width: '100%', height: 280, backgroundColor: '#2A2A2A' },
  imageOverlay: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 12, paddingVertical: 4 },
  imageLabel: { fontFamily: 'monospace', fontSize: 10, color: '#E8E8E8', letterSpacing: 1 },
  changeButton: { marginTop: 8, paddingVertical: 10, borderWidth: 1, borderColor: '#3D3D3D', alignItems: 'center', backgroundColor: '#2A2A2A' },
  changeButtonText: { fontFamily: 'monospace', fontSize: 11, color: '#888888', letterSpacing: 1 },
  processButton: { borderWidth: 2, backgroundColor: '#2A2A2A', marginBottom: 24, position: 'relative', overflow: 'hidden' },
  buttonGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 },
  processButtonContent: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, gap: 12 },
  processButtonText: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  resultSection: { marginBottom: 24 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  resultIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  resultTitle: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: '#E8E8E8', letterSpacing: 1.5 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionButton: { flex: 1, borderWidth: 2, borderColor: '#3D3D3D', backgroundColor: '#2A2A2A', paddingVertical: 14, alignItems: 'center' },
  actionButtonText: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: '#888888', letterSpacing: 1 },
});

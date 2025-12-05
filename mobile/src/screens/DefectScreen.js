import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, SafeAreaView, Animated, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { highlightDefect } from '../services/api';
import { saveBase64Image } from '../utils/storage';

export default function DefectScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const PRIMARY_COLOR = '#E74C3C'; // Soft Red/Orange for Defect module

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
      const result = await highlightDefect(selectedImage, 0, 0, 0, 0, description || null);
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
      await saveBase64Image(processedImage, `defect_${Date.now()}.jpg`);
      Alert.alert('Saved', 'Image has been saved to gallery.');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save Failed', error.message || 'An error occurred while saving the image.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Defect Highlight</Text>
          <Text style={styles.subtitle}>Automatically detect and highlight product defects</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {!selectedImage && (
            <View style={styles.uploadFrame}>
              <View style={styles.uploadContent}>
                <Text style={[styles.uploadIcon, { color: PRIMARY_COLOR }]}>⚠️</Text>
                <Text style={styles.uploadTitle}>Select Your Photo</Text>
                <Text style={styles.uploadSubtext}>AI will automatically detect scratches, dents, and defects</Text>
                <View style={styles.uploadButtons}>
                  <TouchableOpacity style={[styles.uploadButton, { backgroundColor: PRIMARY_COLOR }]} onPress={pickImage}>
                    <Text style={styles.uploadButtonText}>📁 Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.uploadButton, { backgroundColor: PRIMARY_COLOR }]} onPress={takePhoto}>
                    <Text style={styles.uploadButtonText}>📷 Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {selectedImage && (
            <View style={styles.imageSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Original Image</Text>
              </View>
              <View style={styles.imageFrame}>
                <Image source={{ uri: selectedImage }} style={styles.image} />
              </View>
              <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                <Text style={styles.changeButtonText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedImage && (
            <View style={styles.descriptionSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Defect Description (Optional)</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Describe the defects you want to highlight..."
                placeholderTextColor="#AAAAAA"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          {selectedImage && (
            <TouchableOpacity style={[styles.processButton, { backgroundColor: loading ? '#CCC' : PRIMARY_COLOR }]} onPress={processImage} disabled={loading}>
              <View style={styles.processButtonContent}>
                {loading ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.processButtonText}>Processing...</Text>
                  </>
                ) : (
                  <Text style={styles.processButtonText}>🔍 Detect Defects</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {processedImage && (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>✅ Defects Highlighted</Text>
              </View>
              <View style={styles.imageFrame}>
                <Image source={{ uri: processedImage }} style={styles.image} />
              </View>
              <View style={styles.resultActions}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: PRIMARY_COLOR }]} onPress={saveImage}>
                  <Text style={styles.actionButtonText}>💾 Save to Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#95A5A6' }]} onPress={() => setProcessedImage(null)}>
                  <Text style={styles.actionButtonText}>🔄 Try Again</Text>
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
  container: { flex: 1, backgroundColor: '#F8F8F8' },
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
  backButtonContainer: { marginRight: 16 },
  backButton: { fontSize: 28, color: '#333333', fontWeight: '300' },
  headerContent: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', color: '#333333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666666' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  uploadFrame: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadContent: { alignItems: 'center' },
  uploadIcon: { fontSize: 48, marginBottom: 16 },
  uploadTitle: { fontSize: 20, fontWeight: '700', color: '#333333', marginBottom: 12 },
  uploadSubtext: { fontSize: 14, color: '#666666', marginBottom: 24, textAlign: 'center', lineHeight: 20 },
  uploadButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  uploadButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  uploadButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  imageSection: { marginBottom: 24 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333333' },
  imageFrame: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: '100%', height: 280 },
  changeButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  changeButtonText: { fontSize: 14, color: '#666666', fontWeight: '500' },
  descriptionSection: { marginBottom: 24 },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333333',
    textAlignVertical: 'top',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  processButton: {
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processButtonContent: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, gap: 12 },
  processButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  resultSection: { marginBottom: 24 },
  resultHeader: { marginBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#333333' },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});

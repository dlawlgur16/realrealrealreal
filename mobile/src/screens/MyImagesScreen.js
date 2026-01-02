import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserImages, deleteImage, getImageCounts } from '../services/supabaseStorageService';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 48) / 3;

const COLORS = {
  primary: '#007AFF',
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#1D1D1F',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  poster: '#22C55E',
  serial: '#8B5CF6',
  defect: '#F59E0B',
  danger: '#EF4444',
};

const TYPE_COLORS = {
  poster: COLORS.poster,
  serial: COLORS.serial,
  defect: COLORS.defect,
};

const TYPE_LABELS = {
  poster: '포스터',
  serial: '개인정보',
  defect: '하자',
};

export default function MyImagesScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [counts, setCounts] = useState({ poster: 0, serial: 0, defect: 0, total: 0 });
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadImages = useCallback(async () => {
    try {
      const result = await getUserImages(selectedFilter);
      if (result.success) {
        setImages(result.images);
      }
    } catch (error) {
      console.error('이미지 로드 에러:', error);
    }
  }, [selectedFilter]);

  const loadCounts = async () => {
    const result = await getImageCounts();
    setCounts(result);
  };

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await Promise.all([loadImages(), loadCounts()]);
      setLoading(false);
    };
    initLoad();
  }, [loadImages]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadImages(), loadCounts()]);
    setRefreshing(false);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const handleImagePress = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const handleDeleteImage = async () => {
    if (!selectedImage) return;

    Alert.alert(
      '이미지 삭제',
      '이 이미지를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteImage(selectedImage.path);
            if (result.success) {
              setModalVisible(false);
              setSelectedImage(null);
              onRefresh();
              Alert.alert('완료', '이미지가 삭제되었습니다.');
            } else {
              Alert.alert('실패', result.error || '삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderFilterButton = (filter, label, count) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
        filter !== 'all' && { borderColor: TYPE_COLORS[filter] },
        selectedFilter === filter && filter !== 'all' && { backgroundColor: TYPE_COLORS[filter] },
      ]}
      onPress={() => handleFilterChange(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderImageItem = ({ item }) => (
    <TouchableOpacity style={styles.imageItem} onPress={() => handleImagePress(item)}>
      <Image source={{ uri: item.url }} style={styles.thumbnail} />
      <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[item.type] }]}>
        <Text style={styles.typeBadgeText}>{TYPE_LABELS[item.type]}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📷</Text>
      <Text style={styles.emptyTitle}>저장된 이미지가 없습니다</Text>
      <Text style={styles.emptyDescription}>
        이미지를 처리하고 저장하면 여기에 표시됩니다
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyButtonText}>이미지 만들러 가기</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>이미지 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 이미지</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', '전체', counts.total)}
        {renderFilterButton('poster', '포스터', counts.poster)}
        {renderFilterButton('serial', '개인정보', counts.serial)}
        {renderFilterButton('defect', '하자', counts.defect)}
      </View>

      {/* Image Grid */}
      {images.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.path}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Image Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {selectedImage && (
              <>
                <Image
                  source={{ uri: selectedImage.url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <View style={styles.modalInfo}>
                  <View style={[styles.modalTypeBadge, { backgroundColor: TYPE_COLORS[selectedImage.type] }]}>
                    <Text style={styles.modalTypeBadgeText}>{TYPE_LABELS[selectedImage.type]}</Text>
                  </View>
                  <Text style={styles.modalDate}>{formatDate(selectedImage.timestamp)}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteImage}>
                  <Text style={styles.deleteButtonText}>삭제하기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.card,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  gridContainer: {
    padding: 16,
  },
  imageItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalTypeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    margin: 16,
    marginTop: 0,
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

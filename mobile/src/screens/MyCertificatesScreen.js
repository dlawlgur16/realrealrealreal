/**
 * 내 인증서 목록 화면
 *
 * 사용자가 발급받은 디지털 인증서 목록을 표시
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getUserCertificates,
  getShortCertId,
  formatCertDate,
  CERT_TYPE_LABELS,
  CERT_STATUS_LABELS,
} from '../services/certificateService';

const COLORS = {
  primary: '#007AFF',
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#1D1D1F',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  poster: '#22C55E',
  serial: '#8B5CF6',
  defect: '#F59E0B',
};

const TYPE_COLORS = {
  poster: COLORS.poster,
  serial: COLORS.serial,
  defect: COLORS.defect,
};

export default function MyCertificatesScreen({ navigation }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCertificates = useCallback(async () => {
    try {
      console.log('인증서 목록 조회 시작...');
      const result = await getUserCertificates();
      console.log('인증서 목록 조회 결과:', JSON.stringify(result, null, 2));
      if (result.success) {
        setCertificates(result.certificates);
      } else {
        console.error('인증서 목록 조회 실패:', result.error);
      }
    } catch (error) {
      console.error('인증서 목록 로드 에러:', error);
    }
  }, []);

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await loadCertificates();
      setLoading(false);
    };
    initLoad();
  }, [loadCertificates]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCertificates();
    setRefreshing(false);
  };

  const handleCertPress = (cert) => {
    // 검증 페이지 열기
    if (cert.verify_url) {
      Linking.openURL(cert.verify_url);
    }
  };

  const handleShare = async (cert) => {
    try {
      await Share.share({
        message: `OceanSeal 디지털 인증서\n\n인증서 번호: #${getShortCertId(cert.cert_id)}\n유형: ${CERT_TYPE_LABELS[cert.cert_type]}\n\n검증: ${cert.verify_url}`,
      });
    } catch (error) {
      console.error('공유 에러:', error);
    }
  };

  const renderCertificateItem = ({ item }) => {
    const typeColor = TYPE_COLORS[item.cert_type] || COLORS.primary;
    const isValid = item.status === 'active';

    return (
      <TouchableOpacity
        style={styles.certCard}
        onPress={() => handleCertPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.certHeader}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>
              {CERT_TYPE_LABELS[item.cert_type] || item.cert_type}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare(item)}
          >
            <Text style={styles.shareIcon}>↗</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.certBody}>
          <Text style={styles.certId}>#{getShortCertId(item.cert_id)}</Text>
          <Text style={styles.certDate}>{formatCertDate(item.created_at)}</Text>
        </View>

        <View style={styles.certFooter}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isValid ? COLORS.success : COLORS.danger }
            ]} />
            <Text style={[
              styles.statusText,
              { color: isValid ? COLORS.success : COLORS.danger }
            ]}>
              {CERT_STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>

          {item.tx_hash && item.tx_hash !== 'offchain' && (
            <Text style={styles.blockchainBadge}>Polygon</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📜</Text>
      <Text style={styles.emptyTitle}>발급된 인증서가 없습니다</Text>
      <Text style={styles.emptyDescription}>
        이미지를 처리하고 인증서를 발급하면{'\n'}여기에 표시됩니다
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyButtonText}>이미지 처리하러 가기</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>인증서 불러오는 중...</Text>
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
        <Text style={styles.headerTitle}>내 인증서</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>{certificates.length}</Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>🔒</Text>
        <Text style={styles.infoText}>
          인증서는 블록체인에 기록되어 위변조가 불가능합니다
        </Text>
      </View>

      {/* Certificate List */}
      {certificates.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={certificates}
          renderItem={renderCertificateItem}
          keyExtractor={(item) => item.cert_id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    lineHeight: 18,
  },
  listContainer: {
    padding: 16,
  },
  certCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  certBody: {
    marginBottom: 12,
  },
  certId: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  certDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  blockchainBadge: {
    fontSize: 12,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    lineHeight: 20,
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
});

/**
 * 인증서 발급 버튼 컴포넌트
 *
 * 이미지 처리 결과 화면에서 사용
 * 버튼 클릭 → 인증서 발급 → QR코드 표시
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
  Modal,
} from 'react-native';
import { issueCertificate, getShortCertId, CERT_TYPE_LABELS } from '../services/certificateService';

const COLORS = {
  primary: '#007AFF',
  success: '#22C55E',
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#1D1D1F',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

export default function CertificateButton({
  imageBase64,
  processType,
  imageUrl,
  onSuccess,
  style,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleIssueCertificate = async () => {
    if (loading || certificate) return;

    setLoading(true);

    try {
      const result = await issueCertificate(imageBase64, processType, imageUrl);

      if (result.success) {
        setCertificate(result.certificate);
        setShowModal(true);
        onSuccess?.(result.certificate);
      } else {
        Alert.alert('발급 실패', result.error || '인증서 발급에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', error.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = () => {
    if (certificate) {
      setShowModal(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          certificate && styles.buttonCompleted,
          disabled && styles.buttonDisabled,
          style,
        ]}
        onPress={certificate ? handleViewCertificate : handleIssueCertificate}
        disabled={loading || disabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : certificate ? (
          <View style={styles.buttonContent}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.buttonText}>인증서 보기</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>인증서 발급</Text>
        )}
      </TouchableOpacity>

      {/* 인증서 발급 완료 모달 */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 헤더 */}
            <View style={styles.modalHeader}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.modalTitle}>인증서 발급 완료</Text>
            </View>

            {/* 인증서 정보 */}
            {certificate && (
              <View style={styles.certInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>인증서 번호</Text>
                  <Text style={styles.infoValue}>#{getShortCertId(certificate.cert_id)}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>유형</Text>
                  <Text style={styles.infoValue}>{CERT_TYPE_LABELS[processType] || processType}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>상태</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>유효</Text>
                  </View>
                </View>

                {certificate.tx_hash && certificate.tx_hash !== 'offchain' && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>블록체인</Text>
                    <Text style={styles.infoValue}>Polygon</Text>
                  </View>
                )}
              </View>
            )}

            {/* QR 코드 안내 */}
            <View style={styles.qrSection}>
              <Text style={styles.qrHint}>
                QR코드로 언제든지 진위를 확인할 수 있습니다
              </Text>
              <Text style={styles.verifyUrl}>
                {certificate?.verify_url || 'ocean-seal.shop/verify/...'}
              </Text>
            </View>

            {/* 닫기 버튼 */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonCompleted: {
    backgroundColor: COLORS.success,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 6,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successIconText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  certInfo: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  verifyUrl: {
    fontSize: 12,
    color: COLORS.primary,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

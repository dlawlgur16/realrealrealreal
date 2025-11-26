import React, { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, Shield, AlertCircle, Download, RefreshCw, ChevronRight, Check, X, Move } from 'lucide-react';

// 스타일 상수
const COLORS = {
  primary: '#FF6F0F',
  primaryHover: '#E5630D',
  secondary: '#FFF4ED',
  success: '#22C55E',
  warning: '#F59E0B',
  dark: '#1A1A1A',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  white: '#FFFFFF',
  border: '#E5E7EB'
};

// API 엔드포인트 (실제 배포시 환경변수로 변경)
const API_BASE_URL = 'http://localhost:8000';

// ============== 메인 앱 컴포넌트 ==============
export default function KarrotBooster() {
  const [currentStep, setCurrentStep] = useState('upload'); // upload, select, process, result
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [processType, setProcessType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [maskArea, setMaskArea] = useState(null);
  const [referenceImages, setReferenceImages] = useState([]);
  
  const fileInputRef = useRef(null);
  const referenceInputRef = useRef(null);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setSelectedImageUrl(URL.createObjectURL(file));
      setCurrentStep('select');
      setError(null);
      setResultImage(null);
      setMaskArea(null);
      setReferenceImages([]); // 새 이미지 선택시 레퍼런스 초기화
    }
  }, []);

  // 레퍼런스 이미지 선택 핸들러
  const handleReferenceSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      setReferenceImages(prev => [...prev, ...imageFiles]);
      // 같은 파일을 다시 선택할 수 있도록 input 초기화
      if (e.target) {
        e.target.value = '';
      }
    }
  }, []);

  // 레퍼런스 이미지 제거
  const handleRemoveReference = useCallback((index) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 드래그 앤 드롭 핸들러
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setSelectedImageUrl(URL.createObjectURL(file));
      setCurrentStep('select');
      setError(null);
      setResultImage(null);
      setMaskArea(null);
    }
  }, []);

  // 처리 타입 선택
  const handleProcessTypeSelect = (type) => {
    setProcessType(type);
    if (type === 'poster') {
      // 포스터는 바로 처리
      handleProcess(type);
    } else {
      // serial, defect는 영역 선택 필요
      setCurrentStep('process');
    }
  };

  // 이미지 처리 API 호출
  const handleProcess = async (type = processType, area = maskArea) => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('process_type', type);
    
    // 레퍼런스 이미지 추가
    if (referenceImages.length > 0) {
      referenceImages.forEach((refImage) => {
        formData.append('reference_files', refImage);
      });
    }
    
    if (area && (type === 'serial' || type === 'defect')) {
      formData.append('mask_x', Math.round(area.x));
      formData.append('mask_y', Math.round(area.y));
      formData.append('mask_width', Math.round(area.width));
      formData.append('mask_height', Math.round(area.height));
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/process`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success && result.image_base64) {
        setResultImage(`data:image/png;base64,${result.image_base64}`);
        setCurrentStep('result');
      } else {
        setError(result.message || '이미지 처리에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 영역 선택 완료 후 처리
  const handleAreaSelected = (area) => {
    setMaskArea(area);
    handleProcess(processType, area);
  };

  // 다운로드
  const handleDownload = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `karrot-booster-${processType}-${Date.now()}.png`;
    link.click();
  };

  // 리셋
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedImage(null);
    setSelectedImageUrl(null);
    setProcessType(null);
    setResultImage(null);
    setError(null);
    setMaskArea(null);
    setReferenceImages([]);
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🥕</span>
          <span style={styles.logoText}>당근 부스터</span>
        </div>
        <p style={styles.tagline}>중고물품을 프리미엄으로 변환하세요</p>
      </header>

      {/* 진행 상태 */}
      <StepIndicator currentStep={currentStep} />

      {/* 메인 콘텐츠 */}
      <main style={styles.main}>
        {currentStep === 'upload' && (
          <UploadSection
            onFileSelect={handleFileSelect}
            onDrop={handleDrop}
            fileInputRef={fileInputRef}
          />
        )}

        {currentStep === 'select' && (
          <SelectTypeSection
            imageUrl={selectedImageUrl}
            onSelect={handleProcessTypeSelect}
            onBack={handleReset}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 'process' && (
          <AreaSelectSection
            imageUrl={selectedImageUrl}
            processType={processType}
            onAreaSelected={handleAreaSelected}
            onBack={() => setCurrentStep('select')}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 'result' && (
          <ResultSection
            originalUrl={selectedImageUrl}
            resultUrl={resultImage}
            processType={processType}
            onDownload={handleDownload}
            onReset={handleReset}
            onRetry={() => handleProcess()}
          />
        )}

        {/* 에러 메시지 */}
        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={styles.errorClose}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* 로딩 오버레이 */}
        {isProcessing && <LoadingOverlay />}
      </main>

      {/* 푸터 */}
      <footer style={styles.footer}>
        <p>Powered by Gemini 3 Pro Image • Made for 당근마켓 판매자</p>
      </footer>
    </div>
  );
}

// ============== 서브 컴포넌트 ==============

// 단계 표시기
function StepIndicator({ currentStep }) {
  const steps = [
    { key: 'upload', label: '이미지 업로드' },
    { key: 'select', label: '기능 선택' },
    { key: 'process', label: '처리 중' },
    { key: 'result', label: '완료' }
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <div style={{
            ...styles.step,
            ...(index <= currentIndex ? styles.stepActive : {})
          }}>
            <div style={{
              ...styles.stepCircle,
              ...(index <= currentIndex ? styles.stepCircleActive : {})
            }}>
              {index < currentIndex ? <Check size={14} /> : index + 1}
            </div>
            <span style={styles.stepLabel}>{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div style={{
              ...styles.stepLine,
              ...(index < currentIndex ? styles.stepLineActive : {})
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// 업로드 섹션
function UploadSection({ onFileSelect, onDrop, fileInputRef }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      style={{
        ...styles.uploadArea,
        ...(isDragging ? styles.uploadAreaDragging : {})
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { setIsDragging(false); onDrop(e); }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />
      <Upload size={48} color={COLORS.primary} />
      <h3 style={styles.uploadTitle}>이미지를 드래그하거나 클릭하세요</h3>
      <p style={styles.uploadSubtitle}>JPG, PNG 파일 지원 • 최대 10MB</p>
    </div>
  );
}

// 기능 선택 섹션
function SelectTypeSection({ imageUrl, onSelect, onBack, isProcessing, referenceImages, onReferenceSelect, onRemoveReference, referenceInputRef }) {
  const features = [
    {
      type: 'poster',
      icon: <Sparkles size={32} />,
      title: '포스터형 썸네일',
      description: '스튜디오급 배경과 조명으로 변환',
      tag: '가장 인기',
      color: COLORS.primary
    },
    {
      type: 'serial',
      icon: <Shield size={32} />,
      title: '인증 영역 선명화',
      description: '시리얼 넘버, 모델명 등 강조',
      tag: '신뢰도 UP',
      color: COLORS.success
    },
    {
      type: 'defect',
      icon: <AlertCircle size={32} />,
      title: '하자 부분 강조',
      description: '정직한 상태 표시로 신뢰 확보',
      tag: '정직함',
      color: COLORS.warning
    }
  ];

  return (
    <div style={styles.selectSection}>
      {/* 미리보기 */}
      <div style={styles.previewContainer}>
        <img src={imageUrl} alt="업로드된 이미지" style={styles.previewImage} />
        <button onClick={onBack} style={styles.changeButton}>
          <RefreshCw size={16} /> 다른 이미지
        </button>
      </div>

      {/* 레퍼런스 이미지 섹션 */}
      <div style={styles.referenceSection}>
        <div style={styles.referenceHeader}>
          <h4 style={styles.referenceTitle}>레퍼런스 이미지 (선택사항)</h4>
          <p style={styles.referenceDesc}>원하는 스타일의 이미지를 추가하면 더 일관된 결과를 얻을 수 있습니다. 여러 이미지를 한 번에 선택하거나 여러 번 추가할 수 있습니다.</p>
        </div>
        <input
          ref={referenceInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onReferenceSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => referenceInputRef.current?.click()}
          style={styles.referenceAddButton}
          disabled={isProcessing}
        >
          <Upload size={16} /> 레퍼런스 이미지 추가
        </button>
        {referenceImages.length > 0 && (
          <div style={styles.referenceGrid}>
            {referenceImages.map((refImg, index) => (
              <div key={index} style={styles.referenceItem}>
                <img
                  src={URL.createObjectURL(refImg)}
                  alt={`레퍼런스 ${index + 1}`}
                  style={styles.referenceThumb}
                />
                <button
                  onClick={() => onRemoveReference(index)}
                  style={styles.referenceRemove}
                  disabled={isProcessing}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 기능 카드 */}
      <div style={styles.featureGrid}>
        {features.map((feature) => (
          <button
            key={feature.type}
            style={styles.featureCard}
            onClick={() => onSelect(feature.type)}
            disabled={isProcessing}
          >
            <span style={styles.featureTag}>{feature.tag}</span>
            <div style={{ ...styles.featureIcon, backgroundColor: `${feature.color}15`, color: feature.color }}>
              {feature.icon}
            </div>
            <h4 style={styles.featureTitle}>{feature.title}</h4>
            <p style={styles.featureDesc}>{feature.description}</p>
            <ChevronRight size={20} style={styles.featureArrow} />
          </button>
        ))}
      </div>
    </div>
  );
}

// 영역 선택 섹션
function AreaSelectSection({ imageUrl, processType, onAreaSelected, onBack, isProcessing }) {
  const [selection, setSelection] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const imageRef = useRef(null);

  const typeLabels = {
    serial: '시리얼 넘버/인증 영역',
    defect: '하자 부분'
  };

  const handleMouseDown = (e) => {
    if (isProcessing) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setIsSelecting(true);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !startPos) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelection({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const handleConfirm = () => {
    if (selection && selection.width > 10 && selection.height > 10) {
      // 이미지 실제 크기 대비 비율 계산
      const img = imageRef.current;
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;
      
      onAreaSelected({
        x: selection.x * scaleX,
        y: selection.y * scaleY,
        width: selection.width * scaleX,
        height: selection.height * scaleY
      });
    }
  };

  return (
    <div style={styles.areaSelectSection}>
      <div style={styles.areaSelectHeader}>
        <button onClick={onBack} style={styles.backButton}>← 뒤로</button>
        <h3>{typeLabels[processType]}을 드래그로 선택하세요</h3>
      </div>
      
      <div 
        style={styles.areaSelectContainer}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          ref={imageRef}
          src={imageUrl} 
          alt="영역 선택" 
          style={styles.areaSelectImage}
          draggable={false}
        />
        
        {selection && (
          <div style={{
            ...styles.selectionBox,
            left: selection.x,
            top: selection.y,
            width: selection.width,
            height: selection.height
          }}>
            <Move size={20} style={styles.selectionIcon} />
          </div>
        )}
      </div>

      <div style={styles.areaSelectActions}>
        <button 
          onClick={() => setSelection(null)} 
          style={styles.secondaryButton}
          disabled={!selection}
        >
          초기화
        </button>
        <button 
          onClick={handleConfirm}
          style={{
            ...styles.primaryButton,
            opacity: (selection && selection.width > 10) ? 1 : 0.5
          }}
          disabled={!selection || selection.width <= 10 || isProcessing}
        >
          {isProcessing ? '처리 중...' : '이 영역으로 처리하기'}
        </button>
      </div>
    </div>
  );
}

// 결과 섹션
function ResultSection({ originalUrl, resultUrl, processType, onDownload, onReset, onRetry }) {
  const typeLabels = {
    poster: '포스터형 썸네일',
    serial: '인증 영역 선명화',
    defect: '하자 부분 강조'
  };

  return (
    <div style={styles.resultSection}>
      <div style={styles.resultHeader}>
        <span style={styles.successBadge}>
          <Check size={16} /> 완료
        </span>
        <h3>{typeLabels[processType]} 처리 완료!</h3>
      </div>

      <div style={styles.compareContainer}>
        <div style={styles.compareItem}>
          <span style={styles.compareLabel}>원본</span>
          <img src={originalUrl} alt="원본" style={styles.compareImage} />
        </div>
        <div style={styles.compareArrow}>→</div>
        <div style={styles.compareItem}>
          <span style={styles.compareLabelResult}>결과</span>
          <img src={resultUrl} alt="결과" style={styles.compareImage} />
        </div>
      </div>

      <div style={styles.resultActions}>
        <button onClick={onReset} style={styles.secondaryButton}>
          <RefreshCw size={18} /> 새로운 이미지
        </button>
        <button onClick={onRetry} style={styles.secondaryButton}>
          다시 시도
        </button>
        <button onClick={onDownload} style={styles.primaryButton}>
          <Download size={18} /> 다운로드
        </button>
      </div>

      <div style={styles.tipBox}>
        <strong>💡 판매 팁:</strong> 이 이미지를 첫 번째 사진으로 사용하고, 나머지는 실제 제품 사진을 올려 신뢰도를 높이세요!
      </div>
    </div>
  );
}

// 로딩 오버레이
function LoadingOverlay() {
  return (
    <div style={styles.loadingOverlay}>
      <div style={styles.loadingContent}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>AI가 이미지를 처리하고 있습니다...</p>
        <p style={styles.loadingSubtext}>약 10~30초 소요됩니다</p>
      </div>
    </div>
  );
}

// ============== 스타일 ==============
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAFAFA',
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    textAlign: 'center',
    padding: '32px 20px 16px',
    backgroundColor: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  logoIcon: {
    fontSize: '32px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: COLORS.dark,
  },
  tagline: {
    fontSize: '14px',
    color: COLORS.gray,
    margin: 0,
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    backgroundColor: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
    gap: '8px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: 0.4,
  },
  stepActive: {
    opacity: 1,
  },
  stepCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: COLORS.lightGray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: COLORS.gray,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: COLORS.dark,
    display: 'none',
    '@media (min-width: 640px)': {
      display: 'block',
    },
  },
  stepLine: {
    width: '40px',
    height: '2px',
    backgroundColor: COLORS.lightGray,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px 20px',
    position: 'relative',
  },
  uploadArea: {
    backgroundColor: COLORS.white,
    border: `2px dashed ${COLORS.border}`,
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  uploadAreaDragging: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondary,
  },
  uploadTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: COLORS.dark,
    margin: '16px 0 8px',
  },
  uploadSubtitle: {
    fontSize: '14px',
    color: COLORS.gray,
    margin: 0,
  },
  selectSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  previewContainer: {
    position: 'relative',
    backgroundColor: COLORS.white,
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  previewImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  changeButton: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: COLORS.gray,
    cursor: 'pointer',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  featureCard: {
    position: 'relative',
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  featureTag: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    fontSize: '11px',
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.secondary,
    padding: '4px 8px',
    borderRadius: '4px',
  },
  featureIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.dark,
    margin: '0 0 8px',
  },
  featureDesc: {
    fontSize: '13px',
    color: COLORS.gray,
    margin: 0,
    lineHeight: 1.5,
  },
  featureArrow: {
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    color: COLORS.gray,
  },
  areaSelectSection: {
    backgroundColor: COLORS.white,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  areaSelectHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  backButton: {
    padding: '8px 12px',
    backgroundColor: COLORS.lightGray,
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: COLORS.dark,
    cursor: 'pointer',
  },
  areaSelectContainer: {
    position: 'relative',
    cursor: 'crosshair',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  areaSelectImage: {
    width: '100%',
    display: 'block',
    userSelect: 'none',
  },
  selectionBox: {
    position: 'absolute',
    border: `3px solid ${COLORS.primary}`,
    backgroundColor: 'rgba(255, 111, 15, 0.2)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIcon: {
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    borderRadius: '50%',
    padding: '4px',
  },
  areaSelectActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: COLORS.white,
    color: COLORS.dark,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  resultSection: {
    backgroundColor: COLORS.white,
    borderRadius: '16px',
    padding: '32px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  resultHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  successBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#DCFCE7',
    color: COLORS.success,
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  compareContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  compareItem: {
    flex: 1,
    position: 'relative',
  },
  compareLabel: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    padding: '4px 10px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: COLORS.white,
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  compareLabelResult: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    padding: '4px 10px',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  compareImage: {
    width: '100%',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
  compareArrow: {
    fontSize: '24px',
    color: COLORS.gray,
    flexShrink: 0,
  },
  resultActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  tipBox: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: COLORS.secondary,
    borderRadius: '12px',
    fontSize: '14px',
    color: COLORS.dark,
    lineHeight: 1.6,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '12px',
    marginTop: '20px',
    color: '#DC2626',
    fontSize: '14px',
  },
  errorClose: {
    marginLeft: 'auto',
    padding: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#DC2626',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.white,
    borderRadius: '20px',
    padding: '40px 60px',
    textAlign: 'center',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: `4px solid ${COLORS.lightGray}`,
    borderTop: `4px solid ${COLORS.primary}`,
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.dark,
    margin: '0 0 8px',
  },
  loadingSubtext: {
    fontSize: '14px',
    color: COLORS.gray,
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    padding: '24px 20px',
    borderTop: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    marginTop: '40px',
  },
  referenceSection: {
    backgroundColor: COLORS.white,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
    border: `1px solid ${COLORS.border}`,
  },
  referenceHeader: {
    marginBottom: '12px',
  },
  referenceTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.dark,
    margin: '0 0 4px',
  },
  referenceDesc: {
    fontSize: '13px',
    color: COLORS.gray,
    margin: 0,
  },
  referenceAddButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: COLORS.lightGray,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: COLORS.dark,
    cursor: 'pointer',
    marginBottom: '12px',
  },
  referenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '12px',
  },
  referenceItem: {
    position: 'relative',
    width: '100%',
    paddingTop: '100%',
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${COLORS.border}`,
  },
  referenceThumb: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  referenceRemove: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: COLORS.white,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },
};

// CSS 애니메이션 (글로벌 스타일에 추가 필요)
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
  }
  
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  button:active {
    transform: translateY(0);
  }
`;

// 글로벌 스타일 삽입
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}

import { useState } from 'react'
import ImageUploader from '../components/ImageUploader'
import StyleSelector from '../components/StyleSelector'
import ResultDisplay from '../components/ResultDisplay'
import axios from 'axios'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedTone, setSelectedTone] = useState<string>('apple')
  const [productName, setProductName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingStep, setLoadingStep] = useState<string>('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('이미지를 선택해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    setLoadingStep('배경 제거 중...')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('tone', selectedTone)
      formData.append('product_name', productName)
      formData.append('description', description)
      formData.append('price', price)

      console.log('🚀 API 요청 시작:', {
        url: 'http://localhost:8000/api/generate-poster',
        tone: selectedTone,
        product_name: productName,
        hasFile: !!selectedFile
      })

      // 진행 상태 시뮬레이션 (실제로는 서버에서 SSE로 받을 수 있음)
      const progressSteps = [
        '배경 제거 중...',
        'Stable Diffusion 처리 중...',
        '광고 카피 생성 중...',
        '포스터 합성 중...'
      ]
      
      let stepIndex = 0
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length - 1) {
          stepIndex++
          setLoadingStep(progressSteps[stepIndex])
        }
      }, 3000)

      // axios가 multipart/form-data를 자동으로 처리하도록 Content-Type 헤더 제거
      const response = await axios.post('http://localhost:8000/api/generate-poster', formData, {
        timeout: 300000, // 5분 타임아웃
      })
      
      console.log('✅ API 응답 받음:', response.data)

      clearInterval(progressInterval)
      setResult(response.data)
      setLoadingStep('완료!')
    } catch (err: any) {
      console.error('❌ API 에러:', err)
      console.error('   에러 상세:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      })
      setError(err.response?.data?.detail || '포스터 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  return (
    <div className="container">
      <header>
        <h1>내 똥템을 애플처럼</h1>
        <p className="subtitle">중고거래 AI 포스터 에디터</p>
      </header>

      <main>
        <div className="upload-section">
          <ImageUploader
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>제품명</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="예: 선풍기"
            />
          </div>

          <div className="form-group">
            <label>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="제품에 대한 간단한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>가격 (선택)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="예: 30000"
            />
          </div>

          <StyleSelector
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
          />

          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={loading || !selectedFile}
          >
            {loading ? (loadingStep || '처리 중...') : '포스터 생성하기'}
          </button>

          {loading && loadingStep && (
            <div className="loading-status">
              <div className="loading-spinner"></div>
              <p>{loadingStep}</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        {result && (
          <ResultDisplay result={result} />
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        header {
          text-align: center;
          margin-bottom: 40px;
        }

        h1 {
          font-size: 2.5rem;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #666;
          font-size: 1.2rem;
          margin-top: 10px;
        }

        .upload-section {
          margin-bottom: 30px;
        }

        .form-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .generate-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .generate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
        }

        .generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 15px;
          padding: 12px;
          background: #fee;
          color: #c33;
          border-radius: 8px;
          text-align: center;
        }

        .loading-status {
          margin-top: 15px;
          padding: 20px;
          background: #f0f0f0;
          border-radius: 8px;
          text-align: center;
        }

        .loading-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-status p {
          margin: 0;
          color: #666;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}


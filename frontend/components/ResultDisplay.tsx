interface ResultDisplayProps {
  result: {
    result_url: string
    headline: string
    subcopy: string
    cta: string
  }
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `http://localhost:8000${result.result_url}`
    link.download = 'poster.png'
    link.click()
  }

  return (
    <div className="result-display">
      <h2>생성된 포스터</h2>
      
      <div className="poster-container">
        <img
          src={`http://localhost:8000${result.result_url}`}
          alt="Generated Poster"
          className="poster-image"
        />
      </div>

      <div className="copy-info">
        <div className="copy-item">
          <strong>헤드라인:</strong>
          <p>{result.headline}</p>
        </div>
        <div className="copy-item">
          <strong>서브카피:</strong>
          <p>{result.subcopy}</p>
        </div>
        <div className="copy-item">
          <strong>CTA:</strong>
          <p>{result.cta}</p>
        </div>
      </div>

      <button className="download-button" onClick={handleDownload}>
        포스터 다운로드
      </button>

      <style jsx>{`
        .result-display {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 30px;
        }

        h2 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
        }

        .poster-container {
          text-align: center;
          margin-bottom: 30px;
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
        }

        .poster-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .copy-info {
          margin-bottom: 20px;
        }

        .copy-item {
          margin-bottom: 16px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .copy-item strong {
          display: block;
          margin-bottom: 8px;
          color: #667eea;
        }

        .copy-item p {
          margin: 0;
          color: #333;
          line-height: 1.6;
        }

        .download-button {
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

        .download-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </div>
  )
}


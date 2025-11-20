import { useRef } from 'react'

interface ImageUploaderProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
}

export default function ImageUploader({ onFileSelect, selectedFile }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div className="upload-area" onClick={handleClick}>
        {selectedFile ? (
          <div className="preview">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="preview-image"
            />
            <p className="file-name">{selectedFile.name}</p>
          </div>
        ) : (
          <div className="upload-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>이미지를 클릭하여 업로드</p>
            <p className="hint">JPG, PNG 파일 지원</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .uploader {
          width: 100%;
        }

        .upload-area {
          width: 100%;
          min-height: 300px;
          border: 3px dashed #ccc;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          background: #fafafa;
        }

        .upload-area:hover {
          border-color: #667eea;
          background: #f5f5ff;
        }

        .upload-placeholder {
          text-align: center;
          color: #999;
        }

        .upload-placeholder svg {
          margin-bottom: 16px;
          color: #667eea;
        }

        .upload-placeholder p {
          margin: 8px 0;
          font-size: 16px;
        }

        .hint {
          font-size: 14px;
          color: #bbb;
        }

        .preview {
          width: 100%;
          padding: 20px;
          text-align: center;
        }

        .preview-image {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .file-name {
          margin-top: 12px;
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}


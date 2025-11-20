interface StyleSelectorProps {
  selectedTone: string
  onToneChange: (tone: string) => void
}

export default function StyleSelector({ selectedTone, onToneChange }: StyleSelectorProps) {
  const styles = [
    { value: 'apple', label: '애플 스타일', emoji: '🍎', description: '미니멀하고 고급스러운' },
    { value: 'funny', label: '병맛 스타일', emoji: '😂', description: '유머러스하고 재미있는' },
    { value: 'dramatic', label: '드라마틱 스타일', emoji: '🎬', description: '강렬하고 임팩트 있는' },
  ]

  return (
    <div className="style-selector">
      <label>스타일 선택</label>
      <div className="style-options">
        {styles.map((style) => (
          <div
            key={style.value}
            className={`style-option ${selectedTone === style.value ? 'selected' : ''}`}
            onClick={() => onToneChange(style.value)}
          >
            <div className="emoji">{style.emoji}</div>
            <div className="style-info">
              <div className="style-label">{style.label}</div>
              <div className="style-description">{style.description}</div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .style-selector {
          margin-bottom: 20px;
        }

        .style-selector > label {
          display: block;
          margin-bottom: 12px;
          font-weight: 600;
          color: #333;
        }

        .style-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .style-option {
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
        }

        .style-option:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .style-option.selected {
          border-color: #667eea;
          background: #f5f5ff;
        }

        .emoji {
          font-size: 32px;
        }

        .style-info {
          flex: 1;
        }

        .style-label {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .style-description {
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  )
}


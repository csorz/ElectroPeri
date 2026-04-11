import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Tesseract from 'tesseract.js'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function OcrToolPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [recognizedText, setRecognizedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setRecognizedText('')

    // 创建本地预览
    const reader = new FileReader()
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRecognize = async () => {
    if (!imageUrl) {
      setError('请先选择图片')
      return
    }

    setLoading(true)
    setProgress(0)
    setError(null)

    try {
      const result = await Tesseract.recognize(imageUrl, 'chi_sim+eng', {
        logger: (m) => {
          if (m.status === 'loading tesseract core') {
            setStatus('加载 Tesseract 核心...')
            setProgress(5)
          } else if (m.status === 'initializing tesseract') {
            setStatus('初始化 Tesseract...')
            setProgress(10)
          } else if (m.status === 'loading language traineddata') {
            setStatus('加载语言包...')
            setProgress(20)
          } else if (m.status === 'initializing api') {
            setStatus('初始化 API...')
            setProgress(30)
          } else if (m.status === 'recognizing text') {
            setStatus('识别文字中...')
            setProgress(30 + Math.round(m.progress * 70))
          }
        }
      })

      setProgress(100)
      setRecognizedText(result.data.text)
      setStatus('识别完成')
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'OCR 识别失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setImageUrl(null)
    setRecognizedText('')
    setError(null)
    setProgress(0)
    setStatus('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/ocr" className="toolbox-back">
        ← 返回 OCR 与识别
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📝</span>
          <h1>文字识别</h1>
        </div>
        <p className="page-sub">OCR 图片文字识别，支持中英文</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">选择图片</div>
          <input
            type="file"
            ref={fileInputRef}
            className="tool-file"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        {imageUrl && (
          <div className="tool-block">
            <div className="tool-block-title">图片预览</div>
            <img
              src={imageUrl}
              alt="预览"
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
            />
          </div>
        )}

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRecognize}
            disabled={!imageUrl || loading}
          >
            {loading ? `${status} ${progress}%` : '开始识别'}
          </button>
          {recognizedText && (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(recognizedText)}>
                复制结果
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClear}>
                清除
              </button>
            </>
          )}
        </div>

        {loading && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                height: 6,
                background: '#e0e0e0',
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#4fc3f7',
                  transition: 'width 0.3s'
                }}
              />
            </div>
          </div>
        )}

        {recognizedText && (
          <div className="tool-block">
            <div className="tool-block-title">识别结果</div>
            <pre className="tool-result mono" style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflow: 'auto' }}>
              {recognizedText}
            </pre>
          </div>
        )}
      </section>

      <div className="tool-notice">
        <p>💡 提示：此工具使用 Tesseract.js 进行本地 OCR 识别，无需上传图片到服务器。</p>
        <p>首次使用需要下载语言包，请耐心等待。</p>
      </div>
    </div>
  )
}

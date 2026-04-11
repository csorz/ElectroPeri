import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function OcrToolPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [recognizedText, setRecognizedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
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
      setProgress(10)
      // 动态加载 Tesseract.js (需要安装依赖: npm install tesseract.js)
      // 使用 Function 构造器来避免静态分析
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const loadTesseract = new Function('return import("tesseract.js")')
      const Tesseract = await loadTesseract()

      setProgress(30)
      const result = await Tesseract.recognize(imageUrl, 'chi_sim+eng', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(30 + Math.round(m.progress * 70))
          }
        }
      })

      setProgress(100)
      setRecognizedText(result.data.text)
    } catch (e) {
      console.error(e)
      setError('OCR 识别需要安装 tesseract.js 依赖')
      setRecognizedText(`OCR 识别需要 tesseract.js 库支持。

安装方法：
npm install tesseract.js

推荐在线 OCR 工具：
- 百度 OCR: https://cloud.baidu.com/product/ocr
- 腾讯云 OCR: https://cloud.tencent.com/product/ocr
- 谷歌云 Vision: https://cloud.google.com/vision`)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setImageUrl(null)
    setRecognizedText('')
    setError(null)
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
        <p className="page-sub">OCR 图片文字识别（需要安装 tesseract.js）</p>
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
            {loading ? `识别中... ${progress}%` : '开始识别'}
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
        <p>如需使用，请先安装依赖：<code>npm install tesseract.js</code></p>
      </div>
    </div>
  )
}

import { useCallback, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import jsQR from 'jsqr'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { copyToClipboard } from '../clipboard'
import { renderQRCode, QR_STYLE_NAMES, type QrStyle } from '../../../utils/qrStyles'
import '../toolbox.css'

type TabType = 'generate' | 'decode' | 'batch'

export default function QrCodeToolPage() {
  const [activeTab, setActiveTab] = useState<TabType>('generate')

  // Generate tab state
  const [text, setText] = useState('')
  const [debouncedText, setDebouncedText] = useState('')
  const [style, setStyle] = useState<QrStyle>('standard')
  const [size, setSize] = useState(300)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [gradientStart, setGradientStart] = useState('#4fc3f7')
  const [gradientEnd, setGradientEnd] = useState('#29b6f6')
  const [logoFile, setLogoFile] = useState<string | null>(null)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const generateCanvasRef = useRef<HTMLCanvasElement>(null)

  // Decode tab state
  const [decodeImage, setDecodeImage] = useState<ImageData | null>(null)
  const [decodeImageUrl, setDecodeImageUrl] = useState<string | null>(null)
  const [decodedText, setDecodedText] = useState<string | null>(null)
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const decodeCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Batch tab state
  const [batchText, setBatchText] = useState('')
  const [batchResults, setBatchResults] = useState<{ text: string; url: string }[]>([])
  const [batchGenerating, setBatchGenerating] = useState(false)
  const [batchError, setBatchError] = useState<string | null>(null)
  const batchCanvasRef = useRef<HTMLCanvasElement>(null)

  // Debounce effect for instant generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text)
    }, 300)
    return () => clearTimeout(timer)
  }, [text])

  // Auto-generate QR when debounced text or options change
  useEffect(() => {
    if (!debouncedText.trim()) {
      setResultUrl(null)
      setGenerateError(null)
      return
    }

    const generate = async () => {
      const canvas = generateCanvasRef.current
      if (!canvas) return

      setGenerateError(null)

      try {
        await renderQRCode(canvas, debouncedText, {
          style,
          size,
          fgColor,
          bgColor,
          gradientStart: style === 'gradient' ? gradientStart : undefined,
          gradientEnd: style === 'gradient' ? gradientEnd : undefined,
          logoImage: style === 'logo' && logoFile ? logoFile : undefined,
          logoSize: style === 'logo' ? size * 0.2 : undefined,
          errorCorrection
        })

        const url = canvas.toDataURL('image/png')
        setResultUrl(url)
      } catch (err) {
        setGenerateError(err instanceof Error ? err.message : '生成二维码失败')
        setResultUrl(null)
      }
    }

    generate()
  }, [debouncedText, style, size, fgColor, bgColor, gradientStart, gradientEnd, logoFile, errorCorrection])

  // Handle logo file upload
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setLogoFile(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Download QR code
  const handleDownload = useCallback(() => {
    if (resultUrl) {
      const a = document.createElement('a')
      a.href = resultUrl
      a.download = 'qrcode.png'
      a.click()
    }
  }, [resultUrl])

  // Copy QR code to clipboard
  const handleCopyImage = useCallback(async () => {
    if (!resultUrl) return

    try {
      const response = await fetch(resultUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
    } catch {
      // Fallback to copying data URL
      copyToClipboard(resultUrl)
    }
  }, [resultUrl])

  // Handle image drop for decode
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      loadImageForDecode(file)
    }
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Load image for decoding
  const loadImageForDecode = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = decodeCanvasRef.current
        if (!canvas) return

        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        setDecodeImage(imageData)
        setDecodeImageUrl(reader.result as string)
        setDecodedText(null)
        setDecodeError(null)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  // Handle file input change for decode
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      loadImageForDecode(file)
    }
  }, [])

  // Decode QR code
  const handleDecode = useCallback(() => {
    if (!decodeImage) {
      setDecodeError('请先上传图片')
      return
    }

    const code = jsQR(decodeImage.data, decodeImage.width, decodeImage.height)

    if (code) {
      setDecodedText(code.data)
      setDecodeError(null)
    } else {
      setDecodedText(null)
      setDecodeError('未能在图片中找到二维码')
    }
  }, [decodeImage])

  // Generate batch QR codes
  const handleBatchGenerate = useCallback(async () => {
    const lines = batchText.split('\n').filter(line => line.trim())

    if (lines.length === 0) {
      setBatchError('请输入要生成的内容')
      return
    }

    setBatchGenerating(true)
    setBatchError(null)
    setBatchResults([])

    const canvas = batchCanvasRef.current
    if (!canvas) {
      setBatchGenerating(false)
      return
    }

    const results: { text: string; url: string }[] = []

    for (const line of lines) {
      try {
        await renderQRCode(canvas, line, {
          style: 'standard',
          size: 200,
          fgColor,
          bgColor,
          errorCorrection
        })

        results.push({
          text: line,
          url: canvas.toDataURL('image/png')
        })
      } catch (err) {
        setBatchError(`生成 "${line}" 失败: ${err instanceof Error ? err.message : '未知错误'}`)
        break
      }
    }

    setBatchResults(results)
    setBatchGenerating(false)
  }, [batchText, fgColor, bgColor, errorCorrection])

  // Download batch as ZIP
  const handleBatchDownloadZip = useCallback(async () => {
    if (batchResults.length === 0) return

    const zip = new JSZip()

    for (let i = 0; i < batchResults.length; i++) {
      const { url, text } = batchResults[i]
      // Extract base64 data from data URL
      const base64Data = url.split(',')[1]
      const fileName = `qrcode_${i + 1}_${text.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`
      zip.file(fileName, base64Data, { base64: true })
    }

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'qrcodes.zip')
  }, [batchResults])

  // Copy decoded text
  const handleCopyDecoded = useCallback(() => {
    if (decodedText) {
      copyToClipboard(decodedText)
    }
  }, [decodedText])

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/image" className="toolbox-back">
        ← 返回图片工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📱</span>
          <h1>二维码工具</h1>
        </div>
        <p className="page-sub">生成、解析、批量处理二维码</p>
      </div>

      {/* Tab Navigation */}
      <div className="tool-card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '0' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'generate' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('generate')}
          >
            生成
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'decode' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('decode')}
          >
            解析
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'batch' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('batch')}
          >
            批量
          </button>
        </div>
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <section className="tool-card">
          {generateError && (
            <div className="error-message">
              <span>❌ {generateError}</span>
            </div>
          )}

          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">输入内容</div>
            <textarea
              className="tool-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入要生成二维码的文本或链接..."
              rows={4}
            />
          </div>

          <div className="tool-row">
            <label className="tool-label">
              样式
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as QrStyle)}
              >
                {Object.entries(QR_STYLE_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="tool-inline">
            <label className="tool-label">
              尺寸
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(Math.min(800, Math.max(100, parseInt(e.target.value) || 100)))}
                min="100"
                max="800"
                style={{ width: '80px' }}
              />
            </label>

            <label className="tool-label">
              前景色
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                style={{ width: '50px', height: '32px' }}
              />
            </label>

            <label className="tool-label">
              背景色
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: '50px', height: '32px' }}
              />
            </label>
          </div>

          {style === 'gradient' && (
            <div className="tool-inline">
              <label className="tool-label">
                渐变起始色
                <input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  style={{ width: '50px', height: '32px' }}
                />
              </label>
              <label className="tool-label">
                渐变结束色
                <input
                  type="color"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  style={{ width: '50px', height: '32px' }}
                />
              </label>
            </div>
          )}

          {style === 'logo' && (
            <div className="tool-row">
              <label className="tool-label">
                Logo 图片
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ maxWidth: '280px' }}
                />
              </label>
              {logoFile && (
                <div style={{ marginTop: '8px' }}>
                  <img
                    src={logoFile}
                    alt="Logo preview"
                    style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="tool-row">
            <label className="tool-label">
              容错级别
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
              >
                <option value="L">L - 7%</option>
                <option value="M">M - 15%</option>
                <option value="Q">Q - 25%</option>
                <option value="H">H - 30%</option>
              </select>
            </label>
          </div>

          {resultUrl && (
            <div className="tool-block">
              <div className="tool-block-title">二维码预览</div>
              <img
                src={resultUrl}
                alt="QR Code"
                style={{ marginTop: '12px', borderRadius: '4px', border: '1px solid #eee', maxWidth: '100%' }}
              />
              <div className="tool-actions">
                <button type="button" className="btn btn-primary" onClick={handleDownload}>
                  下载二维码
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCopyImage}>
                  复制图片
                </button>
              </div>
            </div>
          )}

          <canvas ref={generateCanvasRef} style={{ display: 'none' }} />
        </section>
      )}

      {/* Decode Tab */}
      {activeTab === 'decode' && (
        <section className="tool-card">
          {decodeError && (
            <div className="error-message">
              <span>❌ {decodeError}</span>
            </div>
          )}

          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">上传二维码图片</div>
            <div
              className={`preview-area ${isDragging ? 'dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '150px',
                border: isDragging ? '2px dashed #4fc3f7' : '2px dashed #ddd',
                background: isDragging ? '#f0faff' : '#fafafa',
                transition: 'all 0.2s'
              }}
            >
              {decodeImageUrl ? (
                <img
                  src={decodeImageUrl}
                  alt="Uploaded QR"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                />
              ) : (
                <>
                  <span style={{ fontSize: '48px', marginBottom: '8px' }}>📷</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    拖拽图片到此处，或点击选择文件
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="tool-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDecode}
              disabled={!decodeImage}
            >
              解析二维码
            </button>
          </div>

          {decodedText && (
            <div className="tool-block">
              <div className="tool-block-title">解析结果</div>
              <div className="tool-result mono" style={{ marginBottom: '8px' }}>
                {decodedText}
              </div>
              <div className="tool-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCopyDecoded}>
                  复制结果
                </button>
              </div>
            </div>
          )}

          <canvas ref={decodeCanvasRef} style={{ display: 'none' }} />
        </section>
      )}

      {/* Batch Tab */}
      {activeTab === 'batch' && (
        <section className="tool-card">
          {batchError && (
            <div className="error-message">
              <span>❌ {batchError}</span>
            </div>
          )}

          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">批量输入（每行一个）</div>
            <textarea
              className="tool-textarea"
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="每行输入一个要生成二维码的文本或链接..."
              rows={8}
            />
          </div>

          <div className="tool-inline">
            <label className="tool-label">
              前景色
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                style={{ width: '50px', height: '32px' }}
              />
            </label>
            <label className="tool-label">
              背景色
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: '50px', height: '32px' }}
              />
            </label>
            <label className="tool-label">
              容错级别
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
              >
                <option value="L">L - 7%</option>
                <option value="M">M - 15%</option>
                <option value="Q">Q - 25%</option>
                <option value="H">H - 30%</option>
              </select>
            </label>
          </div>

          <div className="tool-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleBatchGenerate}
              disabled={!batchText.trim() || batchGenerating}
            >
              {batchGenerating ? '生成中...' : '批量生成'}
            </button>
            {batchResults.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBatchDownloadZip}
              >
                下载 ZIP
              </button>
            )}
          </div>

          {batchResults.length > 0 && (
            <div className="tool-block">
              <div className="tool-block-title">生成结果 ({batchResults.length} 个)</div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '16px',
                  marginTop: '12px'
                }}
              >
                {batchResults.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign: 'center',
                      padding: '8px',
                      background: '#f9f9f9',
                      borderRadius: '8px'
                    }}
                  >
                    <img
                      src={result.url}
                      alt={`QR ${index + 1}`}
                      style={{ maxWidth: '100%', borderRadius: '4px' }}
                    />
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={result.text}
                    >
                      {result.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <canvas ref={batchCanvasRef} style={{ display: 'none' }} />
        </section>
      )}
    </div>
  )
}

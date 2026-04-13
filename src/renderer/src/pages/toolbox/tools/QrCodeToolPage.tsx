import { useCallback, useState, useRef, useEffect } from 'react'
import jsQR from 'jsqr'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { copyToClipboard } from '../clipboard'
import { renderQRCode, QR_STYLE_NAMES, type QrStyle } from '../../../utils/qrStyles'
import './ToolPage.css'

type TabType = 'concept' | 'demo' | 'code'
type DemoTabType = 'generate' | 'decode' | 'batch'

export default function QrCodeToolPage() {
  const [activeTab, setActiveTab] = useState<TabType>('concept')
  const [demoTab, setDemoTab] = useState<DemoTabType>('generate')

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
    <div className="tool-page">
      <div className="tool-header">
        <h1>📱 二维码生成</h1>
        <p>QR Code Generator - 生成、解析、批量处理二维码</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>高容量存储</h3>
                <p>最大可存储 7089 个数字或 4296 个字母数字字符</p>
              </div>
              <div className="feature-card">
                <h3>容错机制</h3>
                <p>四级容错，即使部分损坏仍可正确读取</p>
              </div>
              <div className="feature-card">
                <h3>快速识别</h3>
                <p>三个定位图案确保 360 度任意角度快速扫描</p>
              </div>
              <div className="feature-card">
                <h3>多种编码</h3>
                <p>支持数字、字母数字、字节、汉字四种编码模式</p>
              </div>
            </div>

            <h2>QR 码结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌───────────────────────────────────────────┐
    │  ┌───┐             ┌───┐             ┌───┐ │
    │  │▓▓▓│             │▓▓▓│             │▓▓▓│ │
    │  │▓▓▓│   定位图案   │▓▓▓│             │▓▓▓│ │
    │  │▓▓▓│             │▓▓▓│             │▓▓▓│ │
    │  └───┘             └───┘             └───┘ │
    │        ┌───────────────────────┐           │
    │        │      定位图案         │           │
    │        └───────────────────────┘           │
    │  ┌───┐                                   ┌───┐
    │  │▓▓▓│    数据区域 + 纠错码              │▓▓▓│
    │  │▓▓▓│                                   │▓▓▓│
    │  │▓▓▓│                                   │▓▓▓│
    │  └───┘                                   └───┘
    │           ┌───┐    ┌───┐                  │
    │           │▓▓▓│    │▓▓▓│   校正图案       │
    │           └───┘    └───┘                  │
    └───────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>容错级别</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>级别</th>
                  <th>容错率</th>
                  <th>适用场景</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>L (Low)</td>
                  <td>7%</td>
                  <td>数据量大，环境干净</td>
                </tr>
                <tr>
                  <td>M (Medium)</td>
                  <td>15%</td>
                  <td>一般场景</td>
                </tr>
                <tr>
                  <td>Q (Quartile)</td>
                  <td>25%</td>
                  <td>可能部分遮挡</td>
                </tr>
                <tr>
                  <td>H (High)</td>
                  <td>30%</td>
                  <td>嵌入 Logo、恶劣环境</td>
                </tr>
              </tbody>
            </table>

            <div className="info-box">
              <strong>容错原理</strong>
              <p>
                QR 码使用 Reed-Solomon 纠错算法，在数据中添加冗余信息。
                容错级别越高，冗余信息越多，可恢复的损坏比例越大，但数据容量会减小。
              </p>
            </div>

            <h2>编码模式</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>数字模式</h3>
                <p>仅数字 0-9，最高效，最多 7089 字符</p>
              </div>
              <div className="feature-card">
                <h3>字母数字模式</h3>
                <p>0-9、A-Z、特殊符号，最多 4296 字符</p>
              </div>
              <div className="feature-card">
                <h3>字节模式</h3>
                <p>8 位字节数据，UTF-8 编码，最多 2953 字符</p>
              </div>
              <div className="feature-card">
                <h3>汉字模式</h3>
                <p>Shift-JIS 编码汉字，最多 1817 字符</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>网址链接</strong> - 快速打开网页，营销推广</li>
              <li><strong>支付收款</strong> - 支付宝、微信支付码</li>
              <li><strong>身份识别</strong> - 电子票务、会员卡、健康码</li>
              <li><strong>产品溯源</strong> - 商品信息、防伪验证</li>
              <li><strong>WiFi 分享</strong> - 扫码连接 WiFi</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            {/* Demo Tab Navigation */}
            <div className="tool-tabs" style={{ marginBottom: '16px' }}>
              <button className={demoTab === 'generate' ? 'active' : ''} onClick={() => setDemoTab('generate')}>生成</button>
              <button className={demoTab === 'decode' ? 'active' : ''} onClick={() => setDemoTab('decode')}>解析</button>
              <button className={demoTab === 'batch' ? 'active' : ''} onClick={() => setDemoTab('batch')}>批量</button>
            </div>

            {/* Generate Tab */}
            {demoTab === 'generate' && (
              <div className="connection-demo">
                {generateError && (
                  <div className="info-box warning">
                    <strong>错误</strong>
                    <p>{generateError}</p>
                  </div>
                )}

                <div className="result-box" style={{ textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '12px' }}>输入内容</h4>
                  <textarea
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="输入要生成二维码的文本或链接..."
                    rows={4}
                  />
                </div>

                <div className="config-grid" style={{ marginTop: '16px' }}>
                  <div className="config-item">
                    <label>样式</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value as QrStyle)}
                    >
                      {Object.entries(QR_STYLE_NAMES).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="config-item">
                    <label>尺寸</label>
                    <input
                      type="number"
                      value={size}
                      onChange={(e) => setSize(Math.min(800, Math.max(100, parseInt(e.target.value) || 100)))}
                      min="100"
                      max="800"
                    />
                  </div>
                  <div className="config-item">
                    <label>前景色</label>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      style={{ width: '60px', height: '32px' }}
                    />
                  </div>
                  <div className="config-item">
                    <label>背景色</label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ width: '60px', height: '32px' }}
                    />
                  </div>
                </div>

                {style === 'gradient' && (
                  <div className="config-grid" style={{ marginTop: '12px' }}>
                    <div className="config-item">
                      <label>渐变起始色</label>
                      <input
                        type="color"
                        value={gradientStart}
                        onChange={(e) => setGradientStart(e.target.value)}
                        style={{ width: '60px', height: '32px' }}
                      />
                    </div>
                    <div className="config-item">
                      <label>渐变结束色</label>
                      <input
                        type="color"
                        value={gradientEnd}
                        onChange={(e) => setGradientEnd(e.target.value)}
                        style={{ width: '60px', height: '32px' }}
                      />
                    </div>
                  </div>
                )}

                {style === 'logo' && (
                  <div className="config-grid" style={{ marginTop: '12px' }}>
                    <div className="config-item">
                      <label>Logo 图片</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </div>
                    {logoFile && (
                      <img
                        src={logoFile}
                        alt="Logo preview"
                        style={{ maxWidth: '60px', maxHeight: '60px', borderRadius: '4px' }}
                      />
                    )}
                  </div>
                )}

                <div className="config-grid" style={{ marginTop: '12px' }}>
                  <div className="config-item">
                    <label>容错级别</label>
                    <select
                      value={errorCorrection}
                      onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    >
                      <option value="L">L - 7%</option>
                      <option value="M">M - 15%</option>
                      <option value="Q">Q - 25%</option>
                      <option value="H">H - 30%</option>
                    </select>
                  </div>
                </div>

                {resultUrl && (
                  <div className="result-box" style={{ textAlign: 'left', marginTop: '16px' }}>
                    <h4 style={{ marginBottom: '12px' }}>二维码预览</h4>
                    <img
                      src={resultUrl}
                      alt="QR Code"
                      style={{ borderRadius: '4px', border: '1px solid #eee', maxWidth: '100%' }}
                    />
                    <div className="demo-controls" style={{ marginTop: '12px' }}>
                      <button onClick={handleDownload}>下载二维码</button>
                      <button onClick={handleCopyImage}>复制图片</button>
                    </div>
                  </div>
                )}

                <canvas ref={generateCanvasRef} style={{ display: 'none' }} />
              </div>
            )}

            {/* Decode Tab */}
            {demoTab === 'decode' && (
              <div className="connection-demo">
                {decodeError && (
                  <div className="info-box warning">
                    <strong>错误</strong>
                    <p>{decodeError}</p>
                  </div>
                )}

                <div className="result-box" style={{ textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '12px' }}>上传二维码图片</h4>
                  <div
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
                      transition: 'all 0.2s',
                      borderRadius: '4px'
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
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

                <div className="demo-controls" style={{ marginTop: '12px' }}>
                  <button onClick={handleDecode} disabled={!decodeImage}>
                    解析二维码
                  </button>
                </div>

                {decodedText && (
                  <div className="result-box" style={{ textAlign: 'left', marginTop: '12px' }}>
                    <h4 style={{ marginBottom: '12px' }}>解析结果</h4>
                    <div style={{
                      padding: '12px',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '13px',
                      wordBreak: 'break-all'
                    }}>
                      {decodedText}
                    </div>
                    <div className="demo-controls" style={{ marginTop: '12px' }}>
                      <button onClick={handleCopyDecoded}>复制结果</button>
                    </div>
                  </div>
                )}

                <canvas ref={decodeCanvasRef} style={{ display: 'none' }} />
              </div>
            )}

            {/* Batch Tab */}
            {demoTab === 'batch' && (
              <div className="connection-demo">
                {batchError && (
                  <div className="info-box warning">
                    <strong>错误</strong>
                    <p>{batchError}</p>
                  </div>
                )}

                <div className="result-box" style={{ textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '12px' }}>批量输入（每行一个）</h4>
                  <textarea
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    placeholder="每行输入一个要生成二维码的文本或链接..."
                    rows={8}
                  />
                </div>

                <div className="config-grid" style={{ marginTop: '16px' }}>
                  <div className="config-item">
                    <label>前景色</label>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      style={{ width: '60px', height: '32px' }}
                    />
                  </div>
                  <div className="config-item">
                    <label>背景色</label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ width: '60px', height: '32px' }}
                    />
                  </div>
                  <div className="config-item">
                    <label>容错级别</label>
                    <select
                      value={errorCorrection}
                      onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    >
                      <option value="L">L - 7%</option>
                      <option value="M">M - 15%</option>
                      <option value="Q">Q - 25%</option>
                      <option value="H">H - 30%</option>
                    </select>
                  </div>
                </div>

                <div className="demo-controls" style={{ marginTop: '12px' }}>
                  <button onClick={handleBatchGenerate} disabled={!batchText.trim() || batchGenerating}>
                    {batchGenerating ? '生成中...' : '批量生成'}
                  </button>
                  {batchResults.length > 0 && (
                    <button onClick={handleBatchDownloadZip}>
                      下载 ZIP
                    </button>
                  )}
                </div>

                {batchResults.length > 0 && (
                  <div className="result-box" style={{ textAlign: 'left', marginTop: '12px' }}>
                    <h4 style={{ marginBottom: '12px' }}>生成结果 ({batchResults.length} 个)</h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '16px'
                    }}>
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
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }} title={result.text}>
                            {result.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <canvas ref={batchCanvasRef} style={{ display: 'none' }} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`import QRCode from 'qrcode'

// 生成二维码到 Canvas
async function generateQRCode(text, options = {}) {
  const canvas = document.getElementById('qrcode')
  await QRCode.toCanvas(canvas, text, {
    width: options.size || 300,
    margin: 2,
    color: {
      dark: options.fgColor || '#000000',
      light: options.bgColor || '#ffffff'
    },
    errorCorrectionLevel: options.errorLevel || 'M'
  })
}

// 生成二维码 Data URL
async function generateQRCodeDataUrl(text) {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'H'
  })
}

// 使用示例
await generateQRCode('https://example.com', { size: 200 })
const dataUrl = await generateQRCodeDataUrl('Hello World')`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import qrcode
from qrcode.image.styledpil import StyledPilImage

# 生成二维码
def generate_qrcode(text, output_path, **options):
    qr = qrcode.QRCode(
        version=options.get('version', 1),
        error_correction=getattr(qrcode.constants,
            f"ERROR_CORRECT_{options.get('error_level', 'M')}"),
        box_size=options.get('box_size', 10),
        border=options.get('border', 4),
    )
    qr.add_data(text)
    qr.make(fit=True)

    img = qr.make_image(
        fill_color=options.get('fg_color', 'black'),
        back_color=options.get('bg_color', 'white')
    )
    img.save(output_path)

# 解析二维码
from pyzbar.pyzbar import decode
from PIL import Image

def decode_qrcode(image_path):
    img = Image.open(image_path)
    results = decode(img)
    return [r.data.decode('utf-8') for r in results]

# 使用示例
generate_qrcode('https://example.com', 'qr.png')
texts = decode_qrcode('qr.png')`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "github.com/skip2/go-qrcode"
)

func main() {
    // 生成二维码 PNG 文件
    err := qrcode.WriteFile(
        "https://example.com",
        qrcode.Medium,
        256,
        "qrcode.png",
    )
    if err != nil {
        panic(err)
    }

    // 生成二维码到内存
    png, err := qrcode.Encode(
        "Hello World",
        qrcode.High,
        256,
    )
    if err != nil {
        panic(err)
    }
    // png 是 []byte 类型的 PNG 图片数据
    _ = png
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

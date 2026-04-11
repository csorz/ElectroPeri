import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function QrCodeToolPage() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(200)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 简单的 QR Code 生成器实现
  const generateQRCode = () => {
    if (!text.trim()) {
      setError('请输入要生成二维码的内容')
      return
    }

    setError(null)
    const canvas = canvasRef.current
    if (!canvas) return

    // 使用简单的 Canvas 绘制模拟二维码
    // 实际项目中建议使用 qrcode-generator 或 qrcode 库
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // 填充背景
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)

    // 生成简单的伪随机图案作为演示
    // 注意：这不是真正的 QR 码，仅用于演示
    const moduleCount = 21 + Math.floor(text.length / 10) * 4
    const moduleSize = size / moduleCount

    ctx.fillStyle = fgColor

    // 绘制定位图案
    const drawFinderPattern = (x: number, y: number) => {
      // 外框
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize)
      ctx.fillStyle = bgColor
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize)
      ctx.fillStyle = fgColor
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize)
    }

    drawFinderPattern(0, 0)
    drawFinderPattern(moduleCount - 7, 0)
    drawFinderPattern(0, moduleCount - 7)

    // 基于文本生成伪随机数据图案
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const random = (i: number) => {
      const x = Math.sin(seed + i) * 10000
      return x - Math.floor(x)
    }

    for (let y = 0; y < moduleCount; y++) {
      for (let x = 0; x < moduleCount; x++) {
        // 跳过定位图案区域
        if (
          (x < 8 && y < 8) ||
          (x >= moduleCount - 8 && y < 8) ||
          (x < 8 && y >= moduleCount - 8)
        ) {
          continue
        }

        if (random(y * moduleCount + x) > 0.5) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    const url = canvas.toDataURL('image/png')
    setResultUrl(url)
  }

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a')
      a.href = resultUrl
      a.download = 'qrcode.png'
      a.click()
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/image" className="toolbox-back">
        ← 返回图片工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📱</span>
          <h1>二维码生成</h1>
        </div>
        <p className="page-sub">将文本或链接生成为二维码图片</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
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

        <div className="tool-inline">
          <label className="tool-label">
            尺寸
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value) || 200)}
              min="100"
              max="500"
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

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={generateQRCode}
            disabled={!text.trim()}
          >
            生成二维码
          </button>
        </div>

        {resultUrl && (
          <div className="tool-block">
            <div className="tool-block-title">二维码预览</div>
            <img
              src={resultUrl}
              alt="QR Code"
              style={{ marginTop: '12px', borderRadius: '4px', border: '1px solid #eee' }}
            />
            <div className="tool-meta" style={{ marginTop: '8px' }}>
              提示：当前为演示版本，建议安装 qrcode 库以生成可扫描的二维码
            </div>
            <div className="tool-actions">
              <button type="button" className="btn btn-secondary" onClick={handleDownload}>
                下载二维码
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(resultUrl)}>
                复制 Data URL
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </section>
    </div>
  )
}

import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

type WatermarkPosition = 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'tile'

export default function WatermarkToolPage() {
  const [file, setFile] = useState<File | null>(null)
  const [watermarkText, setWatermarkText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [fontColor, setFontColor] = useState('#ffffff')
  const [opacity, setOpacity] = useState(0.5)
  const [position, setPosition] = useState<WatermarkPosition>('center')
  const [rotation, setRotation] = useState(0)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setResultUrl(null)
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }
      setFile(selectedFile)
    } else {
      setFile(null)
    }
  }

  const drawWatermark = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    _width: number,
    _height: number,
    rotate: number
  ) => {
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.font = `${fontSize}px Arial, sans-serif`
    ctx.fillStyle = fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.translate(x, y)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.fillText(text, 0, 0)
    ctx.restore()
  }

  const handleAddWatermark = async () => {
    if (!file || !watermarkText) return
    setProcessing(true)
    setError(null)

    try {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 绘制原图
        ctx.drawImage(img, 0, 0)

        const { width, height } = canvas
        const padding = 20

        if (position === 'tile') {
          // 平铺水印
          const gap = 150
          for (let y = padding; y < height - padding; y += gap) {
            for (let x = padding; x < width - padding; x += gap) {
              drawWatermark(ctx, watermarkText, x, y, width, height, rotation)
            }
          }
        } else {
          let x = width / 2
          let y = height / 2

          switch (position) {
            case 'topLeft':
              x = padding + fontSize
              y = padding + fontSize
              break
            case 'topRight':
              x = width - padding - fontSize
              y = padding + fontSize
              break
            case 'bottomLeft':
              x = padding + fontSize
              y = height - padding - fontSize
              break
            case 'bottomRight':
              x = width - padding - fontSize
              y = height - padding - fontSize
              break
            default:
              x = width / 2
              y = height / 2
          }

          drawWatermark(ctx, watermarkText, x, y, width, height, rotation)
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              setResultUrl(url)
            }
            setProcessing(false)
          },
          'image/png'
        )
      }
      img.onerror = () => {
        setError('图片加载失败')
        setProcessing(false)
      }
      img.src = URL.createObjectURL(file)
    } catch {
      setError('添加水印失败')
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (resultUrl && file) {
      const a = document.createElement('a')
      a.href = resultUrl
      a.download = `watermarked_${file.name.replace(/\.[^.]+$/, '')}.png`
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
          <span className="page-icon">💧</span>
          <h1>图片水印</h1>
        </div>
        <p className="page-sub">为图片添加文字水印</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-row">
          <label className="tool-label">
            选择图片
            <input type="file" className="tool-file" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {file && <div className="tool-meta">已选：{file.name}</div>}

        <div className="tool-row">
          <label className="tool-label">
            水印文字
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="输入水印文字..."
            />
          </label>
        </div>

        <div className="tool-inline">
          <label className="tool-label">
            字体大小
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
              min="12"
              max="100"
              style={{ width: '80px' }}
            />
          </label>

          <label className="tool-label">
            字体颜色
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              style={{ width: '50px', height: '32px' }}
            />
          </label>

          <label className="tool-label">
            透明度: {Math.round(opacity * 100)}%
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
          </label>
        </div>

        <div className="tool-row">
          <label className="tool-label">
            水印位置
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as WatermarkPosition)}
            >
              <option value="center">居中</option>
              <option value="topLeft">左上角</option>
              <option value="topRight">右上角</option>
              <option value="bottomLeft">左下角</option>
              <option value="bottomRight">右下角</option>
              <option value="tile">平铺</option>
            </select>
          </label>
        </div>

        <div className="tool-row">
          <label className="tool-label">
            旋转角度: {rotation}°
            <input
              type="range"
              min="-90"
              max="90"
              step="15"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              style={{ width: '200px' }}
            />
          </label>
        </div>

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddWatermark}
            disabled={!file || !watermarkText || processing}
          >
            {processing ? '处理中...' : '添加水印'}
          </button>
        </div>

        {resultUrl && (
          <div className="tool-block">
            <div className="tool-block-title">结果预览</div>
            <img
              src={resultUrl}
              alt="带水印图片"
              style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '12px', borderRadius: '4px' }}
            />
            <div className="tool-actions">
              <button type="button" className="btn btn-secondary" onClick={handleDownload}>
                下载图片
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(resultUrl)}>
                复制 Blob URL
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </section>
    </div>
  )
}

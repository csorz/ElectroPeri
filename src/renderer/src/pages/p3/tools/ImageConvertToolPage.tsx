import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export default function ImageConvertToolPage() {
  const [file, setFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/png')
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setConvertedUrl(null)
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

  const handleConvert = async () => {
    if (!file) return
    setConverting(true)
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

        // 对于 JPEG，需要填充白色背景
        if (targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              setConvertedUrl(url)
            }
            setConverting(false)
          },
          targetFormat,
          0.92
        )
      }
      img.onerror = () => {
        setError('图片加载失败')
        setConverting(false)
      }
      img.src = URL.createObjectURL(file)
    } catch {
      setError('转换失败')
      setConverting(false)
    }
  }

  const handleDownload = () => {
    if (convertedUrl && file) {
      const a = document.createElement('a')
      a.href = convertedUrl
      const ext = targetFormat.split('/')[1]
      a.download = file.name.replace(/\.[^.]+$/, '') + '.' + ext
      a.click()
    }
  }

  const getFormatName = (format: ImageFormat) => {
    const names: Record<ImageFormat, string> = {
      'image/png': 'PNG',
      'image/jpeg': 'JPG',
      'image/webp': 'WebP'
    }
    return names[format]
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/image" className="toolbox-back">
        ← 返回图片工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔄</span>
          <h1>图片格式转换</h1>
        </div>
        <p className="page-sub">PNG、JPG、WebP 格式互转</p>
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

        {file && (
          <div className="tool-meta">已选：{file.name} ({file.type || '未知格式'})</div>
        )}

        <div className="tool-row">
          <label className="tool-label">
            目标格式
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WebP</option>
            </select>
          </label>
        </div>

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConvert}
            disabled={!file || converting}
          >
            {converting ? '转换中...' : '转换格式'}
          </button>
        </div>

        {convertedUrl && (
          <div className="tool-block">
            <div className="tool-block-title">转换结果 ({getFormatName(targetFormat)})</div>
            <img
              src={convertedUrl}
              alt="转换后图片"
              style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '12px', borderRadius: '4px' }}
            />
            <div className="tool-actions">
              <button type="button" className="btn btn-secondary" onClick={handleDownload}>
                下载 {getFormatName(targetFormat)} 图片
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(convertedUrl)}>
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

import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function ImageCompressToolPage() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(0.8)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setCompressedUrl(null)
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }
      setFile(selectedFile)
      setOriginalSize(selectedFile.size)
    } else {
      setFile(null)
      setOriginalSize(0)
    }
  }

  const handleCompress = async () => {
    if (!file) return
    setCompressing(true)
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

        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedSize(blob.size)
              const url = URL.createObjectURL(blob)
              setCompressedUrl(url)
            }
            setCompressing(false)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => {
        setError('图片加载失败')
        setCompressing(false)
      }
      img.src = URL.createObjectURL(file)
    } catch {
      setError('压缩失败')
      setCompressing(false)
    }
  }

  const handleDownload = () => {
    if (compressedUrl) {
      const a = document.createElement('a')
      a.href = compressedUrl
      a.download = `compressed_${file?.name || 'image'}.jpg`
      a.click()
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const savedPercent = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/image" className="toolbox-back">
        ← 返回图片工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🗜️</span>
          <h1>图片压缩</h1>
        </div>
        <p className="page-sub">使用 Canvas 压缩图片，支持调整压缩质量</p>
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
          <div className="tool-meta">已选：{file.name} ({formatSize(originalSize)})</div>
        )}

        <div className="tool-row">
          <label className="tool-label">
            压缩质量: {Math.round(quality * 100)}%
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCompress}
            disabled={!file || compressing}
          >
            {compressing ? '压缩中...' : '压缩图片'}
          </button>
        </div>

        {compressedUrl && (
          <div className="tool-block">
            <div className="tool-block-title">压缩结果</div>
            <div className="tool-meta">
              原始大小: {formatSize(originalSize)} → 压缩后: {formatSize(compressedSize)}
              <br />
              节省: {savedPercent}%
            </div>
            <img
              src={compressedUrl}
              alt="压缩后图片"
              style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '12px', borderRadius: '4px' }}
            />
            <div className="tool-actions">
              <button type="button" className="btn btn-secondary" onClick={handleDownload}>
                下载图片
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(compressedUrl)}>
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

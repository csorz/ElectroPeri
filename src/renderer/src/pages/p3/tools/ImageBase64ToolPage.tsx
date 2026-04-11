import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function ImageBase64ToolPage() {
  const [mode, setMode] = useState<'imageToBase64' | 'base64ToImage'>('imageToBase64')
  const [file, setFile] = useState<File | null>(null)
  const [base64Input, setBase64Input] = useState('')
  const [base64Output, setBase64Output] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setBase64Output('')
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }
      setFile(selectedFile)
      // 自动转换为 Base64
      const reader = new FileReader()
      reader.onload = () => {
        setBase64Output(reader.result as string)
      }
      reader.onerror = () => {
        setError('读取文件失败')
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFile(null)
    }
  }

  const handleConvertToImage = () => {
    setError(null)
    setImageUrl(null)

    let base64Data = base64Input.trim()

    // 如果包含 data:image 前缀，直接使用
    if (!base64Data.startsWith('data:image')) {
      // 尝试添加前缀
      base64Data = 'data:image/png;base64,' + base64Data
    }

    // 验证是否为有效的 Base64
    try {
      const img = new Image()
      img.onload = () => {
        setImageUrl(base64Data)
      }
      img.onerror = () => {
        setError('无效的 Base64 图片数据')
      }
      img.src = base64Data
    } catch {
      setError('转换失败，请检查 Base64 数据')
    }
  }

  const handleDownload = () => {
    if (imageUrl) {
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = 'image_from_base64.png'
      a.click()
    }
  }

  const handleSwap = () => {
    setMode(mode === 'imageToBase64' ? 'base64ToImage' : 'imageToBase64')
    setError(null)
    setBase64Output('')
    setImageUrl(null)
    setFile(null)
    setBase64Input('')
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/image" className="toolbox-back">
        ← 返回图片工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📦</span>
          <h1>图片 Base64 互转</h1>
        </div>
        <p className="page-sub">图片与 Base64 编码相互转换</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            模式
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'imageToBase64' | 'base64ToImage')}
            >
              <option value="imageToBase64">图片转 Base64</option>
              <option value="base64ToImage">Base64 转图片</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {mode === 'imageToBase64' ? (
          <>
            <div className="tool-row">
              <label className="tool-label">
                选择图片
                <input
                  ref={fileInputRef}
                  type="file"
                  className="tool-file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {file && (
              <div className="tool-meta">已选：{file.name}</div>
            )}

            {base64Output && (
              <div className="tool-block">
                <div className="tool-block-title">Base64 输出</div>
                <textarea
                  className="tool-textarea"
                  value={base64Output}
                  readOnly
                  rows={6}
                />
                <div className="tool-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => onCopy(base64Output)}>
                    复制 Base64
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleSwap}>
                    切换为 Base64 转图片
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="tool-block-title">Base64 输入</div>
              <textarea
                className="tool-textarea"
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="输入 Base64 编码（可带或不带 data:image 前缀）..."
                rows={6}
              />
            </div>

            <div className="tool-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConvertToImage}
                disabled={!base64Input.trim()}
              >
                转换为图片
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleSwap}>
                切换为图片转 Base64
              </button>
            </div>

            {imageUrl && (
              <div className="tool-block">
                <div className="tool-block-title">图片预览</div>
                <img
                  src={imageUrl}
                  alt="转换结果"
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
                />
                <div className="tool-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleDownload}>
                    下载图片
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => onCopy(imageUrl)}>
                    复制 Data URL
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

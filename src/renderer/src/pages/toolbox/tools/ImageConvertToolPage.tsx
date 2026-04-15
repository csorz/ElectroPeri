import { useCallback, useState, useRef } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export default function ImageConvertToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

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
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔄 格式转换</h1>
        <p>Image Format Conversion - PNG、JPG、WebP 格式互转</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>无损转有损</h3>
                <p>PNG 转 JPG 可大幅减小文件体积，但会丢失透明通道和部分画质</p>
              </div>
              <div className="feature-card">
                <h3>有损转无损</h3>
                <p>JPG 转 PNG 保留当前画质，但文件体积可能增大</p>
              </div>
              <div className="feature-card">
                <h3>WebP 优势</h3>
                <p>Google 开发的现代格式，同等画质下体积比 JPG 小 25-34%</p>
              </div>
              <div className="feature-card">
                <h3>透明度处理</h3>
                <p>转换为 JPG 时需填充背景色，否则透明区域会变黑</p>
              </div>
            </div>

            <h2>格式特性对比</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────────────────────────────────────────────────────┐
    │                      图片格式特性对比                        │
    ├─────────┬──────────┬──────────┬──────────┬─────────────────┤
    │  格式   │ 压缩类型 │ 透明通道 │ 动画支持 │   浏览器兼容    │
    ├─────────┼──────────┼──────────┼──────────┼─────────────────┤
    │  PNG    │  无损    │   支持   │  APNG    │     优秀        │
    │  JPEG   │  有损    │  不支持  │  不支持  │     优秀        │
    │  WebP   │ 有损/无损 │   支持   │   支持   │     良好        │
    │  GIF    │  无损    │   支持   │   支持   │     优秀        │
    │  AVIF   │  有损    │   支持   │   支持   │     较新        │
    └─────────┴──────────┴──────────┴──────────┴─────────────────┘
              `}</pre>
            </div>

            <h2>格式详解</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>PNG (Portable Network Graphics)</h3>
                <p>无损压缩格式，支持 24 位真彩色和 8 位透明通道。适合图标、截图、UI 元素等需要精确像素的场景。</p>
              </div>
              <div className="feature-card">
                <h3>JPEG (Joint Photographic Experts Group)</h3>
                <p>有损压缩格式，适合照片和复杂图像。不支持透明度，压缩率高但画质会下降。</p>
              </div>
              <div className="feature-card">
                <h3>WebP (Web Picture)</h3>
                <p>Google 开发的现代图片格式，支持有损和无损压缩，支持透明通道和动画。相比 JPEG 同等画质下体积更小。</p>
              </div>
            </div>

            <div className="info-box warning">
              <strong>注意事项</strong>
              <ul>
                <li>PNG 转 JPG 会丢失透明通道，透明区域会变成指定背景色</li>
                <li>JPG 转 PNG 不会恢复已损失的画质</li>
                <li>反复转换有损格式会累积画质损失</li>
                <li>旧浏览器可能不支持 WebP 格式</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>网页优化</strong> - 将 PNG 图标转为 WebP，减小体积</li>
              <li><strong>照片分享</strong> - 将 RAW 或 PNG 转为 JPG 便于分享</li>
              <li><strong>透明处理</strong> - 为不支持透明背景的场景转换格式</li>
              <li><strong>兼容性处理</strong> - 将 WebP 转为 JPG 供旧浏览器使用</li>
              <li><strong>批量处理</strong> - 统一网站图片格式</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>格式转换工具</h2>
            <div className="connection-demo">
              {error && (
                <div className="info-box warning">
                  <strong>错误</strong>
                  <p>{error}</p>
                </div>
              )}

              <div className="config-grid">
                <div className="config-item">
                  <label>选择图片</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="config-item">
                  <label>目标格式</label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                  >
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>
              </div>

              {file && (
                <div className="step-info">
                  <p>已选择: {file.name} ({file.type || '未知格式'})</p>
                </div>
              )}

              <div className="demo-controls">
                <button onClick={handleConvert} disabled={!file || converting}>
                  {converting ? '转换中...' : '转换格式'}
                </button>
              </div>

              {convertedUrl && (
                <div className="result-box" style={{ textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '12px' }}>转换结果 ({getFormatName(targetFormat)})</h4>
                  <img
                    src={convertedUrl}
                    alt="转换后图片"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '12px', borderRadius: '4px' }}
                  />
                  <div className="demo-controls" style={{ marginTop: '12px' }}>
                    <button onClick={handleDownload}>下载 {getFormatName(targetFormat)} 图片</button>
                    <button onClick={() => onCopy(convertedUrl)}>复制 Blob URL</button>
                  </div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// Canvas 格式转换
async function convertImage(file, targetFormat, quality = 0.92) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')

      // JPEG 需要填充白色背景
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)

      canvas.toBlob(resolve, targetFormat, quality)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// 使用示例
const pngBlob = await convertImage(jpgFile, 'image/png')
const webpBlob = await convertImage(pngFile, 'image/webp', 0.8)`}</pre>
            </div>

            <h2>Python 示例 (Pillow)</h2>
            <div className="code-block">
              <pre>{`from PIL import Image

def convert_image(input_path, output_path, target_format='PNG'):
    """转换图片格式"""
    img = Image.open(input_path)

    # 转换为 JPEG 需要处理透明通道
    if target_format.upper() == 'JPEG':
        if img.mode in ('RGBA', 'P'):
            # 创建白色背景
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[3])
            img = background

    img.save(output_path, target_format)

# 使用示例
convert_image('input.png', 'output.jpg', 'JPEG')
convert_image('input.jpg', 'output.webp', 'WEBP')`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "image"
    "image/jpeg"
    "image/png"
    "os"
)

func convertPNGtoJPG(input, output string, quality int) error {
    // 读取 PNG
    file, err := os.Open(input)
    if err != nil {
        return err
    }
    defer file.Close()

    img, err := png.Decode(file)
    if err != nil {
        return err
    }

    // 转换为 JPEG
    outFile, err := os.Create(output)
    if err != nil {
        return err
    }
    defer outFile.Close()

    return jpeg.Encode(outFile, img, &jpeg.Options{Quality: quality})
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

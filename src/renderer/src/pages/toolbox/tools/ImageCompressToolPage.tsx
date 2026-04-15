import { useCallback, useState, useRef } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function ImageCompressToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

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
    <div className="tool-page">
      <div className="tool-header">
        <h1>🗜️ 图片压缩</h1>
        <p>Image Compression - 减小图片体积，节省存储空间</p>
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
                <h3>有损压缩</h3>
                <p>JPEG 等格式通过丢弃人眼不敏感的高频信息实现压缩，压缩率高但有画质损失</p>
              </div>
              <div className="feature-card">
                <h3>无损压缩</h3>
                <p>PNG 等格式使用 DEFLATE 算法，压缩后可完全还原，适合需要保真的场景</p>
              </div>
              <div className="feature-card">
                <h3>质量可调</h3>
                <p>通过调整压缩质量参数，在文件大小和画质之间取得平衡</p>
              </div>
              <div className="feature-card">
                <h3>Canvas 处理</h3>
                <p>浏览器 Canvas API 提供原生的图片压缩能力，无需服务器参与</p>
              </div>
            </div>

            <h2>压缩原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    原始图片
        │
        ├──→ 读取像素数据 (RGB/RGBA)
        │
        ├──→ 色彩空间转换 (RGB → YCbCr)
        │
        ├──→ 分块处理 (8×8 像素块)
        │
        ├──→ 离散余弦变换 (DCT)
        │
        ├──→ 量化 (根据质量参数丢弃高频)
        │
        ├──→ 熵编码 (Huffman 编码)
        │
        └──→ 压缩后图片 (JPEG)
              `}</pre>
            </div>
            <div className="info-box">
              <strong>JPEG 压缩流程</strong>
              <p>
                JPEG 使用有损压缩算法，主要步骤包括色彩空间转换、DCT 变换、量化和熵编码。
                量化步骤会根据质量参数丢弃高频信息，这是画质损失的主要来源。
              </p>
            </div>

            <h2>常见格式对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>格式</th>
                  <th>压缩类型</th>
                  <th>透明度</th>
                  <th>适用场景</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>JPEG</td>
                  <td>有损</td>
                  <td>不支持</td>
                  <td>照片、复杂图像</td>
                </tr>
                <tr>
                  <td>PNG</td>
                  <td>无损</td>
                  <td>支持</td>
                  <td>图标、截图、需要透明</td>
                </tr>
                <tr>
                  <td>WebP</td>
                  <td>有损/无损</td>
                  <td>支持</td>
                  <td>现代网页图片</td>
                </tr>
                <tr>
                  <td>GIF</td>
                  <td>无损</td>
                  <td>支持</td>
                  <td>简单动画</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>网页优化</strong> - 减小图片体积，提升页面加载速度</li>
              <li><strong>移动端适配</strong> - 为不同设备提供不同大小的图片</li>
              <li><strong>存储节省</strong> - 减少服务器存储和带宽成本</li>
              <li><strong>图片上传</strong> - 上传前压缩，减少传输时间</li>
              <li><strong>缩略图生成</strong> - 快速生成预览图</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>图片压缩工具</h2>
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
              </div>

              {file && (
                <div className="step-info">
                  <p>已选择: {file.name} ({formatSize(originalSize)})</p>
                </div>
              )}

              <div className="config-grid">
                <div className="config-item">
                  <label>压缩质量: {Math.round(quality * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="demo-controls">
                <button onClick={handleCompress} disabled={!file || compressing}>
                  {compressing ? '压缩中...' : '压缩图片'}
                </button>
              </div>

              {compressedUrl && (
                <div className="result-box" style={{ textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '12px' }}>压缩结果</h4>
                  <div className="step-info">
                    <p>原始大小: {formatSize(originalSize)}</p>
                    <p>压缩后: {formatSize(compressedSize)}</p>
                    <p><strong>节省: {savedPercent}%</strong></p>
                  </div>
                  <img
                    src={compressedUrl}
                    alt="压缩后图片"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '12px', borderRadius: '4px' }}
                  />
                  <div className="demo-controls" style={{ marginTop: '12px' }}>
                    <button onClick={handleDownload}>下载图片</button>
                    <button onClick={() => onCopy(compressedUrl)}>复制 Blob URL</button>
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
              <pre>{`// Canvas 图片压缩
async function compressImage(file, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        quality
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// 使用示例
const compressed = await compressImage(file, 0.7)
const url = URL.createObjectURL(compressed)`}</pre>
            </div>

            <h2>Python 示例 (Pillow)</h2>
            <div className="code-block">
              <pre>{`from PIL import Image

def compress_image(input_path, output_path, quality=80):
    """压缩图片"""
    img = Image.open(input_path)

    # 转换为 RGB（去除 alpha 通道）
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')

    # 保存为 JPEG，指定质量
    img.save(output_path, 'JPEG', quality=quality, optimize=True)

# 使用示例
compress_image('input.png', 'output.jpg', quality=70)`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "image"
    "image/jpeg"
    "os"
)

func compressImage(input, output string, quality int) error {
    // 读取图片
    file, err := os.Open(input)
    if err != nil {
        return err
    }
    defer file.Close()

    img, _, err := image.Decode(file)
    if err != nil {
        return err
    }

    // 写入压缩后的图片
    outFile, err := os.Create(output)
    if err != nil {
        return err
    }
    defer outFile.Close()

    // quality 范围 1-100
    return jpeg.Encode(outFile, img, &jpeg.Options{Quality: quality})
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

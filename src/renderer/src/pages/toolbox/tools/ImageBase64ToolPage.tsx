import { useCallback, useState, useRef } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function ImageBase64ToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

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
    <div className="tool-page">
      <div className="tool-header">
        <h1>📦 图片 Base64</h1>
        <p>Image Base64 Encoding - 图片与 Base64 编码相互转换</p>
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
                <h3>Base64 编码</h3>
                <p>将二进制数据转换为 64 个可打印字符，便于在文本协议中传输</p>
              </div>
              <div className="feature-card">
                <h3>Data URL</h3>
                <p>以 data: 开头的 URL 格式，可将图片直接嵌入 HTML/CSS 中</p>
              </div>
              <div className="feature-card">
                <h3>内联图片</h3>
                <p>减少 HTTP 请求，适合小图标和简单图形的嵌入</p>
              </div>
              <div className="feature-card">
                <h3>文本传输</h3>
                <p>图片转为文本后可通过 JSON、XML 等文本格式传输</p>
              </div>
            </div>

            <h2>Base64 编码原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    原始数据 (二进制)
           │
           ▼
    ┌──────────────────────────────────┐
    │  每 3 字节 (24 位) 为一组         │
    │  重新划分为 4 组，每组 6 位        │
    └──────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │  每组 6 位可表示 0-63 的值         │
    │  映射到 Base64 字符表             │
    │  A-Z, a-z, 0-9, +, /             │
    └──────────────────────────────────┘
           │
           ▼
    Base64 编码字符串
              `}</pre>
            </div>

            <h2>Data URL 格式</h2>
            <div className="info-box">
              <strong>Data URL 结构</strong>
              <p>
                <code>data:[&lt;mediatype&gt;][;base64],&lt;data&gt;</code>
              </p>
              <ul>
                <li><strong>mediatype</strong> - MIME 类型，如 image/png、image/jpeg</li>
                <li><strong>;base64</strong> - 表示数据使用 Base64 编码</li>
                <li><strong>data</strong> - 编码后的数据内容</li>
              </ul>
            </div>

            <div className="diagram-box">
              <pre className="ascii-art">{`
    示例 Data URL:

    data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB
    CAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU
    5ErkJggg==

    │          │      │                               │
    └──────────┴──────┴───────────────────────────────┘
      协议     MIME   编码标识      Base64 编码数据
              类型
              `}</pre>
            </div>

            <h2>优缺点对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>方面</th>
                  <th>优点</th>
                  <th>缺点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>传输</td>
                  <td>可在文本协议中传输</td>
                  <td>体积增加约 33%</td>
                </tr>
                <tr>
                  <td>请求</td>
                  <td>减少 HTTP 请求数</td>
                  <td>无法利用浏览器缓存</td>
                </tr>
                <tr>
                  <td>嵌入</td>
                  <td>可直接嵌入 HTML/CSS</td>
                  <td>HTML 文件体积增大</td>
                </tr>
                <tr>
                  <td>处理</td>
                  <td>便于 JSON 序列化</td>
                  <td>编码/解码需要计算</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>小图标嵌入</strong> - 将小图标转为 Base64 嵌入 CSS，减少请求</li>
              <li><strong>邮件图片</strong> - 邮件中使用 Base64 图片避免外链问题</li>
              <li><strong>API 传输</strong> - 通过 JSON API 传输图片数据</li>
              <li><strong>数据存储</strong> - 在数据库中存储图片</li>
              <li><strong>剪贴板</strong> - 复制粘贴图片时使用 Data URL</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>Base64 转换工具</h2>
            <div className="connection-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>转换模式</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'imageToBase64' | 'base64ToImage')}
                  >
                    <option value="imageToBase64">图片转 Base64</option>
                    <option value="base64ToImage">Base64 转图片</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="info-box warning">
                  <strong>错误</strong>
                  <p>{error}</p>
                </div>
              )}

              {mode === 'imageToBase64' ? (
                <>
                  <div className="config-grid">
                    <div className="config-item">
                      <label>选择图片</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {file && (
                    <div className="step-info">
                      <p>已选择: {file.name}</p>
                    </div>
                  )}

                  {base64Output && (
                    <div className="result-box" style={{ textAlign: 'left' }}>
                      <h4 style={{ marginBottom: '12px' }}>Base64 输出</h4>
                      <textarea
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: '12px',
                          resize: 'vertical'
                        }}
                        value={base64Output}
                        readOnly
                        rows={6}
                      />
                      <div className="demo-controls" style={{ marginTop: '12px' }}>
                        <button onClick={() => onCopy(base64Output)}>复制 Base64</button>
                        <button onClick={handleSwap}>切换为 Base64 转图片</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="result-box" style={{ textAlign: 'left' }}>
                    <h4 style={{ marginBottom: '12px' }}>Base64 输入</h4>
                    <textarea
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'Consolas, Monaco, monospace',
                        fontSize: '12px',
                        resize: 'vertical'
                      }}
                      value={base64Input}
                      onChange={(e) => setBase64Input(e.target.value)}
                      placeholder="输入 Base64 编码（可带或不带 data:image 前缀）..."
                      rows={6}
                    />
                  </div>

                  <div className="demo-controls" style={{ marginTop: '12px' }}>
                    <button onClick={handleConvertToImage} disabled={!base64Input.trim()}>
                      转换为图片
                    </button>
                    <button onClick={handleSwap}>切换为图片转 Base64</button>
                  </div>

                  {imageUrl && (
                    <div className="result-box" style={{ textAlign: 'left', marginTop: '12px' }}>
                      <h4 style={{ marginBottom: '12px' }}>图片预览</h4>
                      <img
                        src={imageUrl}
                        alt="转换结果"
                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
                      />
                      <div className="demo-controls" style={{ marginTop: '12px' }}>
                        <button onClick={handleDownload}>下载图片</button>
                        <button onClick={() => onCopy(imageUrl)}>复制 Data URL</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 图片转 Base64
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Base64 转 Blob
function base64ToBlob(base64, mimeType = 'image/png') {
  const byteString = atob(base64.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  return new Blob([ab], { type: mimeType })
}

// 使用示例
const base64 = await imageToBase64(file)
const blob = base64ToBlob(base64, 'image/png')`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import base64

# 图片转 Base64
def image_to_base64(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()
    return base64.b64encode(data).decode('utf-8')

# Base64 转图片
def base64_to_image(base64_str, output_path):
    # 去除 data:image/xxx;base64, 前缀
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]

    data = base64.b64decode(base64_str)
    with open(output_path, 'wb') as f:
        f.write(data)

# 使用示例
b64 = image_to_base64('image.png')
base64_to_image(b64, 'output.png')`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/base64"
    "os"
)

// 图片转 Base64
func imageToBase64(filePath string) (string, error) {
    data, err := os.ReadFile(filePath)
    if err != nil {
        return "", err
    }
    return base64.StdEncoding.EncodeToString(data), nil
}

// Base64 转图片
func base64ToImage(base64Str, outputPath string) error {
    data, err := base64.StdEncoding.DecodeString(base64Str)
    if err != nil {
        return err
    }
    return os.WriteFile(outputPath, data, 0644)
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

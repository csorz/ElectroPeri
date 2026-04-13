import { useCallback, useState, useRef } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

type WatermarkPosition = 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'tile'

export default function WatermarkToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

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
    <div className="tool-page">
      <div className="tool-header">
        <h1>💧 图片水印</h1>
        <p>Image Watermark - 为图片添加文字水印保护版权</p>
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
                <h3>版权保护</h3>
                <p>添加水印标识图片所有权，防止未经授权的使用</p>
              </div>
              <div className="feature-card">
                <h3>品牌宣传</h3>
                <p>在图片上展示品牌 Logo 或名称，增强品牌曝光</p>
              </div>
              <div className="feature-card">
                <h3>透明控制</h3>
                <p>调整水印透明度，在保护版权的同时不影响图片观感</p>
              </div>
              <div className="feature-card">
                <h3>位置灵活</h3>
                <p>支持多种水印位置，包括居中、角落和平铺模式</p>
              </div>
            </div>

            <h2>水印类型</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────────────────────────────────────────────────────┐
    │                        水印类型                             │
    ├─────────────────────────────────────────────────────────────┤
    │                                                             │
    │   文字水印                    图片水印                       │
    │   ┌─────────────┐            ┌─────────────┐                │
    │   │   © 2024    │            │   [LOGO]    │                │
    │   │  MyBrand    │            │             │                │
    │   └─────────────┘            └─────────────┘                │
    │                                                             │
    │   平铺水印                    角落水印                       │
    │   ┌─────────────┐            ┌─────────────┐                │
    │   │ ©24  ©24  © │            │             │ © 2024        │
    │   │ ©24  ©24  © │            │             │               │
    │   │ ©24  ©24  © │            └─────────────┘                │
    │   └─────────────┘                                           │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>水印参数说明</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>参数</th>
                  <th>说明</th>
                  <th>建议值</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>透明度</td>
                  <td>水印的不透明度，越高越明显</td>
                  <td>30%-50%</td>
                </tr>
                <tr>
                  <td>字体大小</td>
                  <td>文字水印的字号</td>
                  <td>根据图片尺寸调整</td>
                </tr>
                <tr>
                  <td>旋转角度</td>
                  <td>水印的倾斜角度</td>
                  <td>-45° 到 45°</td>
                </tr>
                <tr>
                  <td>位置</td>
                  <td>水印在图片上的位置</td>
                  <td>平铺或角落</td>
                </tr>
              </tbody>
            </table>

            <div className="info-box">
              <strong>最佳实践</strong>
              <ul>
                <li>水印透明度控制在 30%-50%，既能保护版权又不影响观感</li>
                <li>平铺水印可防止裁剪去除，安全性更高</li>
                <li>颜色选择与图片形成对比，建议使用白色或深灰色</li>
                <li>避免水印覆盖图片主体内容</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>摄影作品</strong> - 保护摄影师版权，防止盗用</li>
              <li><strong>电商图片</strong> - 防止商品图片被竞争对手盗用</li>
              <li><strong>社交媒体</strong> - 品牌宣传和内容标识</li>
              <li><strong>文档图片</strong> - 标识文档来源和密级</li>
              <li><strong>预览图</strong> - 低质量预览图添加水印引导购买原图</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>水印工具</h2>
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
                  <label>水印文字</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="输入水印文字..."
                  />
                </div>
              </div>

              {file && (
                <div className="step-info">
                  <p>已选择: {file.name}</p>
                </div>
              )}

              <div className="config-grid">
                <div className="config-item">
                  <label>字体大小</label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
                    min="12"
                    max="100"
                  />
                </div>
                <div className="config-item">
                  <label>字体颜色</label>
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    style={{ width: '60px', height: '32px' }}
                  />
                </div>
                <div className="config-item">
                  <label>透明度: {Math.round(opacity * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="config-grid">
                <div className="config-item">
                  <label>水印位置</label>
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
                </div>
                <div className="config-item">
                  <label>旋转角度: {rotation}度</label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="15"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="demo-controls">
                <button onClick={handleAddWatermark} disabled={!file || !watermarkText || processing}>
                  {processing ? '处理中...' : '添加水印'}
                </button>
              </div>

              {resultUrl && (
                <div className="result-box" style={{ textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '12px' }}>结果预览</h4>
                  <img
                    src={resultUrl}
                    alt="带水印图片"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '12px', borderRadius: '4px' }}
                  />
                  <div className="demo-controls" style={{ marginTop: '12px' }}>
                    <button onClick={handleDownload}>下载图片</button>
                    <button onClick={() => onCopy(resultUrl)}>复制 Blob URL</button>
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
              <pre>{`// Canvas 添加文字水印
function addWatermark(imageUrl, text, options = {}) {
  const {
    fontSize = 24,
    color = '#ffffff',
    opacity = 0.5,
    position = 'center',
    rotation = 0
  } = options

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      // 设置水印样式
      ctx.globalAlpha = opacity
      ctx.font = \`\${fontSize}px Arial\`
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 计算位置
      let x = canvas.width / 2
      let y = canvas.height / 2

      // 绘制旋转水印
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.fillText(text, 0, 0)
      ctx.restore()

      canvas.toBlob(resolve, 'image/png')
    }
    img.src = imageUrl
  })
}`}</pre>
            </div>

            <h2>Python 示例 (Pillow)</h2>
            <div className="code-block">
              <pre>{`from PIL import Image, ImageDraw, ImageFont

def add_watermark(image_path, text, output_path, **options):
    """添加文字水印"""
    opacity = options.get('opacity', 128)  # 0-255
    font_size = options.get('font_size', 24)
    position = options.get('position', 'center')

    img = Image.open(image_path).convert('RGBA')

    # 创建透明层
    txt = Image.new('RGBA', img.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(txt)

    # 加载字体
    try:
        font = ImageFont.truetype('arial.ttf', font_size)
    except:
        font = ImageFont.load_default()

    # 计算位置
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    positions = {
        'center': ((img.width - text_width) // 2, (img.height - text_height) // 2),
        'bottom_right': (img.width - text_width - 20, img.height - text_height - 20),
        'top_left': (20, 20),
    }

    x, y = positions.get(position, positions['center'])

    # 绘制文字
    draw.text((x, y), text, fill=(255, 255, 255, opacity), font=font)

    # 合并图层
    watermarked = Image.alpha_composite(img, txt)
    watermarked.save(output_path, 'PNG')`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "image"
    "image/color"
    "image/draw"
    "image/png"
    "os"

    "golang.org/x/image/font"
    "golang.org/x/image/font/basicfont"
    "golang.org/x/image/math/fixed"
)

func addWatermark(inputPath, outputPath, text string) error {
    // 读取图片
    file, err := os.Open(inputPath)
    if err != nil {
        return err
    }
    defer file.Close()

    img, _, err := image.Decode(file)
    if err != nil {
        return err
    }

    // 创建 RGBA 图像
    bounds := img.Bounds()
    rgba := image.NewRGBA(bounds)
    draw.Draw(rgba, bounds, img, bounds.Min, draw.Src)

    // 绘制水印
    drawer := &font.Drawer{
        Dst:  rgba,
        Src:  image.NewUniform(color.RGBA{255, 255, 255, 128}),
        Face: basicfont.Face7x13,
        Dot:  fixed.Point26_6{X: fixed.I(20), Y: fixed.I(bounds.Max.Y - 20)},
    }
    drawer.DrawString(text)

    // 保存图片
    outFile, err := os.Create(outputPath)
    if err != nil {
        return err
    }
    defer outFile.Close()

    return png.Encode(outFile, rgba)
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

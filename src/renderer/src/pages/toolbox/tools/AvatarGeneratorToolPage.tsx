import { useCallback, useState, useRef, useEffect } from 'react'
import './ToolPage.css'

type AvatarStyle = 'initials' | 'emoji' | 'pattern' | 'gradient'

interface AvatarOptions {
  style: AvatarStyle
  text: string
  size: number
  bgColor: string
  textColor: string
  emoji: string
}

export default function AvatarGeneratorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [options, setOptions] = useState<AvatarOptions>({
    style: 'initials',
    text: 'AB',
    size: 128,
    bgColor: '#4A90D9',
    textColor: '#FFFFFF',
    emoji: '😊'
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const emojis = ['😊', '😂', '🥳', '😎', '🤩', '😍', '🥰', '🤗', '😇', '🤓', '😺', '🦊', '🐻', '🐼', '🦁', '🐸']

  const colors = [
    '#4A90D9', '#E74C3C', '#2ECC71', '#F1C40F', '#9B59B6',
    '#1ABC9C', '#E67E22', '#34495E', '#16A085', '#C0392B'
  ]

  const generateAvatar = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { style, text, size, bgColor, textColor, emoji } = options

    // 清空画布
    ctx.clearRect(0, 0, size, size)

    switch (style) {
      case 'initials':
        // 绘制背景圆
        ctx.fillStyle = bgColor
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.fill()

        // 绘制文字
        ctx.fillStyle = textColor
        ctx.font = `bold ${size * 0.4}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text.substring(0, 2).toUpperCase(), size / 2, size / 2)
        break

      case 'emoji':
        // 绘制背景圆
        ctx.fillStyle = bgColor
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.fill()

        // 绘制 emoji
        ctx.font = `${size * 0.5}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(emoji, size / 2, size / 2)
        break

      case 'pattern':
        // 绘制背景
        ctx.fillStyle = bgColor
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.fill()

        // 绘制随机图案
        ctx.fillStyle = textColor
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * size
          const y = Math.random() * size
          const r = Math.random() * (size * 0.15) + (size * 0.05)
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case 'gradient':
        // 绘制渐变背景
        const gradient = ctx.createLinearGradient(0, 0, size, size)
        gradient.addColorStop(0, bgColor)
        gradient.addColorStop(1, textColor)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.fill()
        break
    }
  }, [options])

  // 当选项改变时重新生成
  const handleOptionChange = <K extends keyof AvatarOptions>(
    key: K,
    value: AvatarOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleDownload = useCallback(() => {
    generateAvatar()
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `avatar-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [generateAvatar])

  const handleCopyToClipboard = useCallback(async () => {
    generateAvatar()
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png')
      })
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      alert('已复制到剪贴板')
    } catch {
      alert('复制失败')
    }
  }, [generateAvatar])

  // 初始生成和选项变化时自动生成
  useEffect(() => {
    generateAvatar()
  }, [generateAvatar])

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>👤 头像生成</h1>
        <p>Canvas API - 生成个性化头像图片</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>Canvas API 核心概念</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Canvas 元素</h3>
                <p>HTML5 Canvas 提供了一个可编程的绘图区域，通过 JavaScript 可以绑定各种图形</p>
              </div>
              <div className="feature-card">
                <h3>2D 上下文</h3>
                <p>getContext('2d') 返回一个 CanvasRenderingContext2D 对象，提供绑制方法</p>
              </div>
              <div className="feature-card">
                <h3>绑定路径</h3>
                <p>使用 beginPath、arc、fill 等方法绑制圆形、矩形、线条等形状</p>
              </div>
              <div className="feature-card">
                <h3>图像导出</h3>
                <p>toDataURL 和 toBlob 方法可以将 Canvas 内容导出为图片</p>
              </div>
            </div>

            <h2>绑制流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────────────────────────────────────────────┐
    │                 Canvas 绑制流程                      │
    └─────────────────────────────────────────────────────┘

    1. 获取 Canvas 元素
       const canvas = document.getElementById('canvas')

    2. 获取 2D 上下文
       const ctx = canvas.getContext('2d')

    3. 设置样式
       ctx.fillStyle = '#4A90D9'
       ctx.strokeStyle = '#333'

    4. 绑制路径
       ctx.beginPath()
       ctx.arc(x, y, radius, 0, Math.PI * 2)
       ctx.fill()

    5. 导出图像
       canvas.toDataURL('image/png')
              `}</pre>
            </div>

            <h2>常用绑制方法</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>方法</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>fillRect()</code></td><td>填充矩形</td></tr>
                  <tr><td><code>arc()</code></td><td>绘制圆弧/圆</td></tr>
                  <tr><td><code>fillText()</code></td><td>绘制文本</td></tr>
                  <tr><td><code>drawImage()</code></td><td>绘制图像</td></tr>
                  <tr><td><code>createLinearGradient()</code></td><td>创建线性渐变</td></tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>头像生成</strong> - 根据用户名首字母生成个性化头像</li>
              <li><strong>图片处理</strong> - 裁剪、缩放、添加水印</li>
              <li><strong>数据可视化</strong> - 图表、热力图</li>
              <li><strong>游戏开发</strong> - 2D 游戏图形渲染</li>
              <li><strong>签名板</strong> - 手写签名捕获</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>头像预览</h2>
            <div className="avatar-demo">
              <div className="avatar-preview">
                <canvas
                  ref={canvasRef}
                  width={options.size}
                  height={options.size}
                  style={{ borderRadius: '50%', border: '2px solid #ddd' }}
                />
              </div>

              <h3>样式选择</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {[
                  { value: 'initials', label: '首字母' },
                  { value: 'emoji', label: 'Emoji' },
                  { value: 'pattern', label: '图案' },
                  { value: 'gradient', label: '渐变' }
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => handleOptionChange('style', style.value as AvatarStyle)}
                    style={{
                      padding: '8px 16px',
                      background: options.style === style.value ? '#4fc3f7' : '#e0e0e0',
                      color: options.style === style.value ? '#fff' : '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>

              {options.style === 'initials' && (
                <div className="avatar-config">
                  <div className="config-item">
                    <label>输入文字</label>
                    <input
                      type="text"
                      value={options.text}
                      onChange={(e) => handleOptionChange('text', e.target.value)}
                      placeholder="输入2个字符"
                      maxLength={2}
                    />
                  </div>
                </div>
              )}

              {options.style === 'emoji' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>选择 Emoji</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {emojis.map((e) => (
                      <button
                        key={e}
                        onClick={() => handleOptionChange('emoji', e)}
                        style={{
                          fontSize: '20px',
                          padding: '8px 12px',
                          background: options.emoji === e ? '#4fc3f7' : '#e0e0e0',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <h3>颜色设置</h3>
              <div className="avatar-config">
                <div className="config-item">
                  <label>背景色</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={options.bgColor}
                      onChange={(e) => handleOptionChange('bgColor', e.target.value)}
                      style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={options.bgColor}
                      onChange={(e) => handleOptionChange('bgColor', e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                {options.style !== 'gradient' && (
                  <div className="config-item">
                    <label>前景色</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="color"
                        value={options.textColor}
                        onChange={(e) => handleOptionChange('textColor', e.target.value)}
                        style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={options.textColor}
                        onChange={(e) => handleOptionChange('textColor', e.target.value)}
                        style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '13px', color: '#666' }}>预设颜色</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleOptionChange('bgColor', color)}
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: color,
                        border: options.bgColor === color ? '2px solid #000' : '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <h3 style={{ marginTop: 16 }}>尺寸设置</h3>
              <div className="avatar-config">
                <div className="config-item">
                  <label>尺寸: {options.size}px</label>
                  <input
                    type="range"
                    min="64"
                    max="256"
                    step="16"
                    value={options.size}
                    onChange={(e) => handleOptionChange('size', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="demo-controls" style={{ marginTop: 16 }}>
                <button onClick={generateAvatar}>生成头像</button>
                <button onClick={handleDownload} style={{ background: '#e0e0e0', color: '#333' }}>下载 PNG</button>
                <button onClick={handleCopyToClipboard} style={{ background: '#e0e0e0', color: '#333' }}>复制到剪贴板</button>
              </div>

              <div className="usage-tips" style={{ marginTop: 20 }}>
                <h4>使用说明</h4>
                <ul>
                  <li>选择头像样式：首字母、Emoji、图案或渐变</li>
                  <li>自定义背景色和前景色</li>
                  <li>调整头像尺寸大小</li>
                  <li>点击下载按钮保存头像图片</li>
                  <li>支持复制到剪贴板直接粘贴使用</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// Canvas 头像生成器
import { useRef, useCallback, useEffect, useState } from 'react'

interface AvatarOptions {
  text: string
  size: number
  bgColor: string
  textColor: string
}

export function useAvatarGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generate = useCallback((options: AvatarOptions) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { text, size, bgColor, textColor } = options

    // 清空画布
    ctx.clearRect(0, 0, size, size)

    // 绘制圆形背景
    ctx.fillStyle = bgColor
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()

    // 绘制首字母
    ctx.fillStyle = textColor
    ctx.font = \`bold \${size * 0.4}px Arial\`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.substring(0, 2).toUpperCase(), size / 2, size / 2)
  }, [])

  const download = useCallback((filename: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  return { canvasRef, generate, download }
}`}</pre>
            </div>

            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 原生 JavaScript 头像生成
class AvatarGenerator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    this.ctx = this.canvas.getContext('2d')
  }

  generateInitials(text, bgColor, textColor) {
    const size = this.canvas.width

    // 清空
    this.ctx.clearRect(0, 0, size, size)

    // 绘制圆形背景
    this.ctx.fillStyle = bgColor
    this.ctx.beginPath()
    this.ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    this.ctx.fill()

    // 绘制文字
    this.ctx.fillStyle = textColor
    this.ctx.font = \`bold \${size * 0.4}px Arial\`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(text.substring(0, 2).toUpperCase(), size / 2, size / 2)
  }

  generateGradient(startColor, endColor) {
    const size = this.canvas.width

    const gradient = this.ctx.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, startColor)
    gradient.addColorStop(1, endColor)

    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    this.ctx.fill()
  }

  download(filename = 'avatar.png') {
    const link = document.createElement('a')
    link.download = filename
    link.href = this.canvas.toDataURL('image/png')
    link.click()
  }
}

// 使用
const avatar = new AvatarGenerator('myCanvas')
avatar.generateInitials('AB', '#4A90D9', '#FFFFFF')
avatar.download()`}</pre>
            </div>

            <h2>Python 示例（Pillow）</h2>
            <div className="code-block">
              <pre>{`from PIL import Image, ImageDraw, ImageFont

class AvatarGenerator:
    def __init__(self, size=128):
        self.size = size

    def generate_initials(self, text, bg_color, text_color):
        """生成首字母头像"""
        # 创建透明背景图像
        img = Image.new('RGBA', (self.size, self.size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # 绘制圆形背景
        draw.ellipse(
            [0, 0, self.size, self.size],
            fill=bg_color
        )

        # 绘制文字
        font_size = int(self.size * 0.4)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()

        text = text[:2].upper()
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        x = (self.size - text_width) / 2
        y = (self.size - text_height) / 2

        draw.text((x, y), text, fill=text_color, font=font)

        return img

    def generate_gradient(self, start_color, end_color):
        """生成渐变头像"""
        img = Image.new('RGBA', (self.size, self.size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # 创建渐变
        for y in range(self.size):
            ratio = y / self.size
            r = int(start_color[0] * (1 - ratio) + end_color[0] * ratio)
            g = int(start_color[1] * (1 - ratio) + end_color[1] * ratio)
            b = int(start_color[2] * (1 - ratio) + end_color[2] * ratio)

            draw.line([(0, y), (self.size, y)], fill=(r, g, b))

        # 应用圆形遮罩
        mask = Image.new('L', (self.size, self.size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, self.size, self.size], fill=255)

        output = Image.new('RGBA', (self.size, self.size), (0, 0, 0, 0))
        output.paste(img, mask=mask)

        return output

# 使用
avatar = AvatarGenerator(128)
img = avatar.generate_initials('AB', (74, 144, 217), (255, 255, 255))
img.save('avatar.png')`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

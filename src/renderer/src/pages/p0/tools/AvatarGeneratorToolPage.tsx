import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../toolbox.css'

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

  // 初始生成
  const handleGenerate = () => {
    generateAvatar()
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/fun" className="toolbox-back">
        ← 返回娱乐工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">👤</span>
          <h1>头像生成</h1>
        </div>
        <p className="page-sub">生成个性化头像图片</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">头像预览</div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px'
            }}
          >
            <canvas
              ref={canvasRef}
              width={options.size}
              height={options.size}
              style={{ borderRadius: '50%', border: '2px solid #ddd' }}
            />
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">样式选择</div>
          <div className="tool-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
            {[
              { value: 'initials', label: '首字母' },
              { value: 'emoji', label: 'Emoji' },
              { value: 'pattern', label: '图案' },
              { value: 'gradient', label: '渐变' }
            ].map((style) => (
              <button
                key={style.value}
                type="button"
                className={`btn ${options.style === style.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleOptionChange('style', style.value as AvatarStyle)}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {options.style === 'initials' && (
          <div className="tool-block">
            <div className="tool-block-title">输入文字</div>
            <input
              type="text"
              className="tool-input"
              value={options.text}
              onChange={(e) => handleOptionChange('text', e.target.value)}
              placeholder="输入2个字符"
              maxLength={2}
            />
          </div>
        )}

        {options.style === 'emoji' && (
          <div className="tool-block">
            <div className="tool-block-title">选择 Emoji</div>
            <div className="tool-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`btn ${options.emoji === e ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleOptionChange('emoji', e)}
                  style={{ fontSize: '20px', padding: '8px 12px' }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">颜色设置</div>
          <div className="tool-row" style={{ gap: '16px' }}>
            <label className="tool-label">
              背景色
              <input
                type="color"
                value={options.bgColor}
                onChange={(e) => handleOptionChange('bgColor', e.target.value)}
                style={{ marginLeft: '8px', width: '40px', height: '40px', cursor: 'pointer' }}
              />
            </label>
            {options.style !== 'gradient' && (
              <label className="tool-label">
                前景色
                <input
                  type="color"
                  value={options.textColor}
                  onChange={(e) => handleOptionChange('textColor', e.target.value)}
                  style={{ marginLeft: '8px', width: '40px', height: '40px', cursor: 'pointer' }}
                />
              </label>
            )}
          </div>
          <div className="tool-actions" style={{ marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleOptionChange('bgColor', color)}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: color,
                  border: options.bgColor === color ? '2px solid #000' : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">尺寸设置</div>
          <div className="tool-row">
            <label className="tool-label" style={{ flex: 1 }}>
              尺寸: {options.size}px
              <input
                type="range"
                min="64"
                max="256"
                step="16"
                value={options.size}
                onChange={(e) => handleOptionChange('size', parseInt(e.target.value))}
                style={{ marginLeft: '8px', flex: 1 }}
              />
            </label>
          </div>
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleGenerate}>
            生成头像
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDownload}>
            下载 PNG
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCopyToClipboard}>
            复制到剪贴板
          </button>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">使用说明</div>
          <div className="tool-result">
            <ul style={{ paddingLeft: '20px' }}>
              <li>选择头像样式：首字母、Emoji、图案或渐变</li>
              <li>自定义背景色和前景色</li>
              <li>调整头像尺寸大小</li>
              <li>点击下载按钮保存头像图片</li>
              <li>支持复制到剪贴板直接粘贴使用</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

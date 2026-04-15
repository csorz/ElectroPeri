import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function ButtonDesignerToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [text, setText] = useState('按钮')
  const [bgColor, setBgColor] = useState('#3498db')
  const [textColor, setTextColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(16)
  const [paddingX, setPaddingX] = useState(20)
  const [paddingY, setPaddingY] = useState(10)
  const [borderRadius, setBorderRadius] = useState(6)
  const [borderWidth, setBorderWidth] = useState(0)
  const [borderColor, setBorderColor] = useState('#3498db')
  const [shadow, setShadow] = useState(false)
  const [shadowBlur, setShadowBlur] = useState(10)
  const [hoverEffect, setHoverEffect] = useState<'none' | 'darken' | 'lighten' | 'scale'>('darken')
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal')

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const adjustColor = (hex: string, amount: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return hex
    const r = Math.min(255, Math.max(0, parseInt(result[1], 16) + amount))
    const g = Math.min(255, Math.max(0, parseInt(result[2], 16) + amount))
    const b = Math.min(255, Math.max(0, parseInt(result[3], 16) + amount))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  const getHoverBgColor = (): string => {
    switch (hoverEffect) {
      case 'darken': return adjustColor(bgColor, -20)
      case 'lighten': return adjustColor(bgColor, 20)
      default: return bgColor
    }
  }

  const generateCss = (): string => {
    const shadowCss = shadow ? `box-shadow: 0 4px ${shadowBlur}px rgba(0, 0, 0, 0.15);` : ''
    const borderCss = borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor};` : ''

    let hoverCss = ''
    if (hoverEffect === 'darken' || hoverEffect === 'lighten') {
      hoverCss = `
.btn:hover {
  background-color: ${getHoverBgColor()};
}`
    } else if (hoverEffect === 'scale') {
      hoverCss = `
.btn:hover {
  transform: scale(1.05);
}`
    }

    return `.btn {
  display: inline-block;
  padding: ${paddingY}px ${paddingX}px;
  font-size: ${fontSize}px;
  font-weight: ${fontWeight};
  color: ${textColor};
  background-color: ${bgColor};
  border-radius: ${borderRadius}px;
  ${borderCss}
  ${shadowCss}
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}
${hoverCss}

.btn:active {
  transform: scale(0.98);
}`
  }

  const presetStyles = [
    { name: '主要', bg: '#3498db', text: '#fff' },
    { name: '成功', bg: '#27ae60', text: '#fff' },
    { name: '警告', bg: '#f39c12', text: '#fff' },
    { name: '危险', bg: '#e74c3c', text: '#fff' },
    { name: '信息', bg: '#9b59b6', text: '#fff' },
    { name: '暗色', bg: '#34495e', text: '#fff' },
    { name: '浅色', bg: '#ecf0f1', text: '#333', border: '#bdc3c7' },
    { name: '轮廓', bg: 'transparent', text: '#3498db', border: '#3498db' }
  ]

  const applyPreset = (preset: typeof presetStyles[0]) => {
    setBgColor(preset.bg)
    setTextColor(preset.text)
    if (preset.border) {
      setBorderColor(preset.border)
      setBorderWidth(2)
    } else {
      setBorderWidth(0)
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔘 按钮设计</h1>
        <p>CSS 按钮样式设计器</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>按钮样式属性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>背景与颜色</h3>
                <p>background-color 设置按钮背景，color 设置文字颜色，保持足够对比度</p>
              </div>
              <div className="feature-card">
                <h3>内边距 (padding)</h3>
                <p>控制按钮内部空间，垂直和水平方向可分别设置</p>
              </div>
              <div className="feature-card">
                <h3>圆角 (border-radius)</h3>
                <p>设置按钮圆角大小，0 为直角，50% 为圆形或椭圆形</p>
              </div>
              <div className="feature-card">
                <h3>边框 (border)</h3>
                <p>可设置边框宽度、样式和颜色，常用于轮廓按钮</p>
              </div>
            </div>

            <h2>交互状态</h2>
            <div className="info-box">
              <strong>伪类选择器</strong>
              <p>按钮应具有清晰的交互反馈，通过伪类实现不同状态的样式变化：</p>
              <ul>
                <li><strong>:hover</strong> - 鼠标悬停状态</li>
                <li><strong>:active</strong> - 点击按下状态</li>
                <li><strong>:focus</strong> - 获得焦点状态</li>
                <li><strong>:disabled</strong> - 禁用状态</li>
              </ul>
            </div>

            <h2>过渡动画</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  transition: property duration timing-function delay;

  常用配置:
  ┌──────────────────────────────────────────────────────┐
  │ transition: all 0.2s ease;        /* 简写 */        │
  │ transition: background 0.3s;      /* 仅背景 */      │
  │ transition: transform 0.2s ease;  /* 仅变换 */      │
  └──────────────────────────────────────────────────────┘

  时间函数:
  ease        - 开始慢，中间快，结束慢
  linear      - 匀速
  ease-in     - 开始慢
  ease-out    - 结束慢
  ease-in-out - 两头慢，中间快
              `}</pre>
            </div>

            <h2>最佳实践</h2>
            <ul className="scenario-list">
              <li><strong>足够的点击区域</strong> - 最小 44x44px，方便触摸操作</li>
              <li><strong>清晰的视觉反馈</strong> - hover/active 状态有明显变化</li>
              <li><strong>一致性</strong> - 同一应用中按钮风格保持统一</li>
              <li><strong>语义化</strong> - 使用 button 元素而非 div</li>
              <li><strong>无障碍</strong> - 提供焦点样式，支持键盘操作</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>按钮预览</h2>
            <div className="button-demo">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', borderRadius: '8px', padding: '40px', marginBottom: '20px' }}>
                <button
                  style={{
                    padding: `${paddingY}px ${paddingX}px`,
                    fontSize: `${fontSize}px`,
                    fontWeight: fontWeight,
                    color: textColor,
                    backgroundColor: bgColor,
                    borderRadius: `${borderRadius}px`,
                    border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
                    boxShadow: shadow ? `0 4px ${shadowBlur}px rgba(0, 0, 0, 0.15)` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {text}
                </button>
              </div>

              <h3>预设样式</h3>
              <div className="preset-buttons">
                {presetStyles.map((preset) => (
                  <button key={preset.name} onClick={() => applyPreset(preset)} style={{ padding: '8px 16px', fontSize: '14px', color: preset.text, backgroundColor: preset.bg, borderRadius: '4px', border: preset.border ? `2px solid ${preset.border}` : 'none', cursor: 'pointer' }}>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <h2>基本设置</h2>
            <div className="config-grid">
              <div className="config-item">
                <label>按钮文字</label>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="config-item">
                <label>字体大小: {fontSize}px</label>
                <input type="range" min="12" max="32" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} />
              </div>
              <div className="config-item">
                <label>字重</label>
                <select value={fontWeight} onChange={(e) => setFontWeight(e.target.value as typeof fontWeight)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
            </div>

            <h2>颜色设置</h2>
            <div className="config-grid">
              <div className="config-item">
                <label>背景色</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '40px', height: '32px', border: 'none' }} />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
              </div>
              <div className="config-item">
                <label>文字颜色</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '40px', height: '32px', border: 'none' }} />
                  <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
              </div>
            </div>

            <h2>尺寸与边框</h2>
            <div className="config-grid">
              <div className="config-item">
                <label>水平内边距: {paddingX}px</label>
                <input type="range" min="5" max="50" value={paddingX} onChange={(e) => setPaddingX(parseInt(e.target.value))} />
              </div>
              <div className="config-item">
                <label>垂直内边距: {paddingY}px</label>
                <input type="range" min="5" max="30" value={paddingY} onChange={(e) => setPaddingY(parseInt(e.target.value))} />
              </div>
              <div className="config-item">
                <label>圆角: {borderRadius}px</label>
                <input type="range" min="0" max="50" value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value))} />
              </div>
              <div className="config-item">
                <label>边框宽度: {borderWidth}px</label>
                <input type="range" min="0" max="5" value={borderWidth} onChange={(e) => setBorderWidth(parseInt(e.target.value))} />
              </div>
              {borderWidth > 0 && (
                <div className="config-item">
                  <label>边框颜色</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} style={{ width: '40px', height: '32px', border: 'none' }} />
                    <input type="text" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>
                </div>
              )}
            </div>

            <h2>效果设置</h2>
            <div className="config-grid">
              <div className="config-item" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
                <label style={{ margin: 0 }}>添加阴影</label>
              </div>
              {shadow && (
                <div className="config-item">
                  <label>阴影模糊: {shadowBlur}px</label>
                  <input type="range" min="5" max="30" value={shadowBlur} onChange={(e) => setShadowBlur(parseInt(e.target.value))} />
                </div>
              )}
              <div className="config-item">
                <label>悬停效果</label>
                <select value={hoverEffect} onChange={(e) => setHoverEffect(e.target.value as typeof hoverEffect)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="none">无</option>
                  <option value="darken">变暗</option>
                  <option value="lighten">变亮</option>
                  <option value="scale">放大</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>生成的 CSS</h2>
            <div className="code-block">
              <pre>{generateCss()}</pre>
            </div>
            <div className="demo-controls">
              <button onClick={() => onCopy(generateCss())}>复制 CSS</button>
            </div>

            <h2>更多按钮示例</h2>
            <div className="code-block">
              <pre>{`/* 主要按钮 */
.btn-primary {
  background-color: #3498db;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #2980b9;
}

/* 轮廓按钮 */
.btn-outline {
  background-color: transparent;
  color: #3498db;
  padding: 10px 20px;
  border-radius: 6px;
  border: 2px solid #3498db;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background-color: #3498db;
  color: #fff;
}

/* 圆形按钮 */
.btn-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #27ae60;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 禁用状态 */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加载状态 */
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

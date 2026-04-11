import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function ButtonDesignerToolPage() {
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

  // 计算悬停颜色
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
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/css" className="toolbox-back">
        ← 返回 CSS 样式工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔘</span>
          <h1>按钮设计</h1>
        </div>
        <p className="page-sub">CSS 按钮样式设计器</p>
      </div>

      <section className="tool-card">
        {/* 预览 */}
        <div
          style={{
            width: '100%',
            minHeight: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            marginBottom: '24px'
          }}
        >
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

        {/* 预设样式 */}
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">预设样式</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {presetStyles.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: preset.text,
                  backgroundColor: preset.bg,
                  borderRadius: '4px',
                  border: preset.border ? `2px solid ${preset.border}` : 'none',
                  cursor: 'pointer'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 基本设置 */}
        <div className="tool-block">
          <div className="tool-block-title">基本设置</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <label className="tool-label">
              按钮文字
              <input
                type="text"
                className="tool-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            <label className="tool-label">
              字体大小: {fontSize}px
              <input
                type="range"
                min="12"
                max="32"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              />
            </label>
            <label className="tool-label">
              字重
              <select value={fontWeight} onChange={(e) => setFontWeight(e.target.value as typeof fontWeight)}>
                <option value="normal">正常</option>
                <option value="bold">粗体</option>
              </select>
            </label>
          </div>
        </div>

        {/* 颜色设置 */}
        <div className="tool-block">
          <div className="tool-block-title">颜色</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <label className="tool-label">
              背景色
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '40px' }} />
                <input type="text" className="tool-input" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              </div>
            </label>
            <label className="tool-label">
              文字颜色
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '40px' }} />
                <input type="text" className="tool-input" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
              </div>
            </label>
          </div>
        </div>

        {/* 尺寸设置 */}
        <div className="tool-block">
          <div className="tool-block-title">尺寸与边框</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <label className="tool-label">
              水平内边距: {paddingX}px
              <input type="range" min="5" max="50" value={paddingX} onChange={(e) => setPaddingX(parseInt(e.target.value))} />
            </label>
            <label className="tool-label">
              垂直内边距: {paddingY}px
              <input type="range" min="5" max="30" value={paddingY} onChange={(e) => setPaddingY(parseInt(e.target.value))} />
            </label>
            <label className="tool-label">
              圆角: {borderRadius}px
              <input type="range" min="0" max="50" value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value))} />
            </label>
            <label className="tool-label">
              边框宽度: {borderWidth}px
              <input type="range" min="0" max="5" value={borderWidth} onChange={(e) => setBorderWidth(parseInt(e.target.value))} />
            </label>
            {borderWidth > 0 && (
              <label className="tool-label">
                边框颜色
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} style={{ width: '40px' }} />
                  <input type="text" className="tool-input" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
                </div>
              </label>
            )}
          </div>
        </div>

        {/* 效果设置 */}
        <div className="tool-block">
          <div className="tool-block-title">效果</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
              添加阴影
            </label>
            {shadow && (
              <label className="tool-label">
                阴影模糊: {shadowBlur}px
                <input type="range" min="5" max="30" value={shadowBlur} onChange={(e) => setShadowBlur(parseInt(e.target.value))} />
              </label>
            )}
            <label className="tool-label">
              悬停效果
              <select value={hoverEffect} onChange={(e) => setHoverEffect(e.target.value as typeof hoverEffect)}>
                <option value="none">无</option>
                <option value="darken">变暗</option>
                <option value="lighten">变亮</option>
                <option value="scale">放大</option>
              </select>
            </label>
          </div>
        </div>

        {/* CSS 代码 */}
        <div className="tool-block">
          <div className="tool-block-title">CSS 代码</div>
          <pre className="tool-result mono" style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
            {generateCss()}
          </pre>
          <div className="tool-actions" style={{ marginTop: '12px' }}>
            <button type="button" className="btn btn-primary" onClick={() => onCopy(generateCss())}>
              复制 CSS
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

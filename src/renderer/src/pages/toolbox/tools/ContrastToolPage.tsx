import { useCallback, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function ContrastToolPage() {
  const [foregroundColor, setForegroundColor] = useState('#333333')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [contrastRatio, setContrastRatio] = useState<number>(0)
  const [wcagResults, setWcagResults] = useState<{
    normal: { aa: boolean; aaa: boolean }
    large: { aa: boolean; aaa: boolean }
  }>({ normal: { aa: false, aaa: false }, large: { aa: false, aaa: false } })

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // HEX to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  }

  // 计算相对亮度
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // 计算对比度
  const calculateContrast = (fg: string, bg: string): number => {
    const fgRgb = hexToRgb(fg)
    const bgRgb = hexToRgb(bg)
    if (!fgRgb || !bgRgb) return 0

    const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b)
    const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)

    const lighter = Math.max(fgLum, bgLum)
    const darker = Math.min(fgLum, bgLum)

    return (lighter + 0.05) / (darker + 0.05)
  }

  // 检查 WCAG 标准
  const checkWcag = (ratio: number) => {
    setWcagResults({
      normal: { aa: ratio >= 4.5, aaa: ratio >= 7 },
      large: { aa: ratio >= 3, aaa: ratio >= 4.5 }
    })
  }

  useEffect(() => {
    const ratio = calculateContrast(foregroundColor, backgroundColor)
    setContrastRatio(ratio)
    checkWcag(ratio)
  }, [foregroundColor, backgroundColor])

  const getContrastLevel = (ratio: number): { level: string; color: string } => {
    if (ratio >= 7) return { level: 'AAA', color: '#00c853' }
    if (ratio >= 4.5) return { level: 'AA', color: '#64dd17' }
    if (ratio >= 3) return { level: 'AA Large', color: '#ffc107' }
    return { level: 'Fail', color: '#ff5252' }
  }

  const { level, color } = getContrastLevel(contrastRatio)

  // 示例文本预览
  const sampleTexts = [
    { text: '普通文本示例', size: '16px' },
    { text: '大号文本示例', size: '24px' },
    { text: '标题文本示例', size: '32px', weight: 'bold' }
  ]

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/color" className="toolbox-back">
        ← 返回颜色工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">👁️</span>
          <h1>对比度计算</h1>
        </div>
        <p className="page-sub">计算颜色对比度，检查 WCAG 无障碍标准</p>
      </div>

      <section className="tool-card">
        {/* 对比度显示 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
            {contrastRatio.toFixed(2)}:1
          </div>
          <div style={{
            display: 'inline-block',
            padding: '4px 16px',
            borderRadius: '16px',
            background: color,
            color: '#fff',
            fontWeight: 'bold',
            marginTop: '8px'
          }}>
            {level}
          </div>
        </div>

        {/* 颜色选择 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">前景色（文字）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
              />
              <input
                type="text"
                className="tool-input"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                style={{ flex: 1, minWidth: '80px' }}
              />
            </div>
          </div>
          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">背景色</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
              />
              <input
                type="text"
                className="tool-input"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                style={{ flex: 1, minWidth: '80px' }}
              />
            </div>
          </div>
        </div>

        {/* WCAG 标准 */}
        <div className="tool-block">
          <div className="tool-block-title">WCAG 合规性</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <h4 style={{ marginBottom: '8px' }}>普通文本 (14px+)</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  gap: '8px'
                }}>
                  <span>AA (≥ 4.5:1)</span>
                  <span style={{ color: wcagResults.normal.aa ? '#00c853' : '#ff5252' }}>
                    {wcagResults.normal.aa ? '✓ 通过' : '✗ 失败'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  gap: '8px'
                }}>
                  <span>AAA (≥ 7:1)</span>
                  <span style={{ color: wcagResults.normal.aaa ? '#00c853' : '#ff5252' }}>
                    {wcagResults.normal.aaa ? '✓ 通过' : '✗ 失败'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '8px' }}>大号文本 (18px+ 或 14px+ 粗体)</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  gap: '8px'
                }}>
                  <span>AA (≥ 3:1)</span>
                  <span style={{ color: wcagResults.large.aa ? '#00c853' : '#ff5252' }}>
                    {wcagResults.large.aa ? '✓ 通过' : '✗ 失败'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  gap: '8px'
                }}>
                  <span>AAA (≥ 4.5:1)</span>
                  <span style={{ color: wcagResults.large.aaa ? '#00c853' : '#ff5252' }}>
                    {wcagResults.large.aaa ? '✓ 通过' : '✗ 失败'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 预览 */}
        <div className="tool-block">
          <div className="tool-block-title">效果预览</div>
          <div
            style={{
              padding: '24px',
              borderRadius: '8px',
              background: backgroundColor,
              display: 'grid',
              gap: '16px'
            }}
          >
            {sampleTexts.map((sample, index) => (
              <div
                key={index}
                style={{
                  color: foregroundColor,
                  fontSize: sample.size,
                  fontWeight: sample.weight as any
                }}
              >
                {sample.text}
              </div>
            ))}
          </div>
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-secondary" onClick={() => onCopy(`${contrastRatio.toFixed(2)}:1`)}>
            复制对比度
          </button>
        </div>
      </section>
    </div>
  )
}

import { useCallback, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

export default function ColorConvertToolPage() {
  const [hex, setHex] = useState('#ff5722')
  const [rgb, setRgb] = useState<RGB>({ r: 255, g: 87, b: 34 })
  const [hsl, setHsl] = useState<HSL>({ h: 14, s: 100, l: 56 })
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // RGB to HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.round(Math.min(255, Math.max(0, n))).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // HEX to RGB
  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  }

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): HSL => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  // HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): RGB => {
    h /= 360; s /= 100; l /= 100
    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
  }

  // 更新所有值
  const updateFromHex = (newHex: string) => {
    setError(null)
    setHex(newHex)
    const rgbVal = hexToRgb(newHex)
    if (rgbVal) {
      setRgb(rgbVal)
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b))
    } else if (newHex.length >= 7) {
      setError('无效的 HEX 颜色值')
    }
  }

  const updateFromRgb = (newRgb: RGB) => {
    setError(null)
    setRgb(newRgb)
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
  }

  const updateFromHsl = (newHsl: HSL) => {
    setError(null)
    setHsl(newHsl)
    const rgbVal = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    setRgb(rgbVal)
    setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b))
  }

  useEffect(() => {
    updateFromHex(hex)
  }, [])

  const colorStrings = {
    hex: hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/color" className="toolbox-back">
        ← 返回颜色工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔄</span>
          <h1>颜色转换</h1>
        </div>
        <p className="page-sub">RGB、HSL、HEX 颜色格式互转</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {/* 颜色预览 */}
        <div
          style={{
            width: '100%',
            height: '100px',
            borderRadius: '8px',
            background: hex,
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />

        {/* HEX 输入 */}
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">HEX</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="color"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer' }}
            />
            <input
              type="text"
              className="tool-input"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              placeholder="#000000"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* RGB 输入 */}
        <div className="tool-block">
          <div className="tool-block-title">RGB</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <label className="tool-label">
              R
              <input
                type="number"
                className="tool-input"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => updateFromRgb({ ...rgb, r: parseInt(e.target.value) || 0 })}
              />
            </label>
            <label className="tool-label">
              G
              <input
                type="number"
                className="tool-input"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => updateFromRgb({ ...rgb, g: parseInt(e.target.value) || 0 })}
              />
            </label>
            <label className="tool-label">
              B
              <input
                type="number"
                className="tool-input"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => updateFromRgb({ ...rgb, b: parseInt(e.target.value) || 0 })}
              />
            </label>
          </div>
        </div>

        {/* HSL 输入 */}
        <div className="tool-block">
          <div className="tool-block-title">HSL</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <label className="tool-label">
              H (色相)
              <input
                type="number"
                className="tool-input"
                min="0"
                max="360"
                value={hsl.h}
                onChange={(e) => updateFromHsl({ ...hsl, h: parseInt(e.target.value) || 0 })}
              />
            </label>
            <label className="tool-label">
              S (饱和度)
              <input
                type="number"
                className="tool-input"
                min="0"
                max="100"
                value={hsl.s}
                onChange={(e) => updateFromHsl({ ...hsl, s: parseInt(e.target.value) || 0 })}
              />
            </label>
            <label className="tool-label">
              L (亮度)
              <input
                type="number"
                className="tool-input"
                min="0"
                max="100"
                value={hsl.l}
                onChange={(e) => updateFromHsl({ ...hsl, l: parseInt(e.target.value) || 0 })}
              />
            </label>
          </div>
        </div>

        {/* 输出格式 */}
        <div className="tool-block">
          <div className="tool-block-title">CSS 颜色值</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {Object.entries(colorStrings).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '4px'
                }}
              >
                <code className="mono" style={{ color: 'var(--text-secondary)' }}>{value}</code>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                  onClick={() => onCopy(value)}
                >
                  复制
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

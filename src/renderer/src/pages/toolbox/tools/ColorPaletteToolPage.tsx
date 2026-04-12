import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface ColorInfo {
  hex: string
  rgb: string
  name?: string
}

export default function ColorPaletteToolPage() {
  const [baseColor, setBaseColor] = useState('#3498db')
  const [paletteType, setPaletteType] = useState<'complementary' | 'analogous' | 'triadic' | 'split' | 'tetradic'>('complementary')
  const [palette, setPalette] = useState<ColorInfo[]>([])

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

  // RGB to HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.round(Math.min(255, Math.max(0, n))).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
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

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  // HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
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

  const generatePalette = () => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const colors: ColorInfo[] = []

    const addColor = (h: number, s: number, l: number, name?: string) => {
      const newRgb = hslToRgb(h, s, l)
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      colors.push({
        hex,
        rgb: `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`,
        name
      })
    }

    switch (paletteType) {
      case 'complementary':
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 180) % 360, hsl.s, hsl.l, '互补色')
        break
      case 'analogous':
        addColor((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 30) % 360, hsl.s, hsl.l)
        break
      case 'triadic':
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 120) % 360, hsl.s, hsl.l)
        addColor((hsl.h + 240) % 360, hsl.s, hsl.l)
        break
      case 'split':
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 150) % 360, hsl.s, hsl.l)
        addColor((hsl.h + 210) % 360, hsl.s, hsl.l)
        break
      case 'tetradic':
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 90) % 360, hsl.s, hsl.l)
        addColor((hsl.h + 180) % 360, hsl.s, hsl.l)
        addColor((hsl.h + 270) % 360, hsl.s, hsl.l)
        break
    }

    setPalette(colors)
  }

  const generateShades = () => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const shades: ColorInfo[] = []

    for (let i = 95; i >= 5; i -= 10) {
      const newRgb = hslToRgb(hsl.h, hsl.s, i)
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      shades.push({
        hex,
        rgb: `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`,
        name: `${i}%`
      })
    }

    setPalette(shades)
  }

  const generateTints = () => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const tints: ColorInfo[] = []

    for (let s = 100; s >= 10; s -= 10) {
      const newRgb = hslToRgb(hsl.h, s, hsl.l)
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      tints.push({
        hex,
        rgb: `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`,
        name: `${s}% 饱和度`
      })
    }

    setPalette(tints)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/color" className="toolbox-back">
        ← 返回颜色工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🎨</span>
          <h1>调色板</h1>
        </div>
        <p className="page-sub">根据基础色生成配色方案</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label" style={{ flex: 1 }}>
            基础颜色
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
              />
              <input
                type="text"
                className="tool-input"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                style={{ flex: 1, minWidth: '80px' }}
              />
            </div>
          </label>
          <label className="tool-label">
            配色类型
            <select
              value={paletteType}
              onChange={(e) => setPaletteType(e.target.value as typeof paletteType)}
            >
              <option value="complementary">互补色</option>
              <option value="analogous">类似色</option>
              <option value="triadic">三角色</option>
              <option value="split">分裂互补</option>
              <option value="tetradic">四角色</option>
            </select>
          </label>
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={generatePalette}>
            生成配色
          </button>
          <button type="button" className="btn btn-secondary" onClick={generateShades}>
            生成明暗变化
          </button>
          <button type="button" className="btn btn-secondary" onClick={generateTints}>
            生成饱和度变化
          </button>
        </div>

        {palette.length > 0 && (
          <div className="tool-block">
            <div className="tool-block-title">配色方案</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {palette.map((color, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div
                    style={{
                      height: '80px',
                      background: color.hex,
                      cursor: 'pointer'
                    }}
                    onClick={() => onCopy(color.hex)}
                    title="点击复制 HEX"
                  />
                  <div style={{ padding: '8px', background: 'var(--bg-secondary)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{color.name}</div>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{color.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {palette.length > 0 && (
          <div className="tool-block">
            <div className="tool-block-title">CSS 变量</div>
            <pre className="tool-result mono" style={{ fontSize: '12px' }}>
{`:root {
${palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}
}`}
            </pre>
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(`:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`)}>
              复制 CSS 变量
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

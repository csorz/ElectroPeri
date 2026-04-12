import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface ColorHistory {
  hex: string
  rgb: string
  hsl: string
}

export default function ColorPickerToolPage() {
  const [color, setColor] = useState('#3498db')
  const [history, setHistory] = useState<ColorHistory[]>([])

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

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  const rgb = hexToRgb(color)
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 }

  const colorFormats = [
    { label: 'HEX', value: color },
    { label: 'RGB', value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '' },
    { label: 'RGBA', value: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` : '' },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'HSLA', value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` }
  ]

  const addToHistory = () => {
    const newEntry: ColorHistory = {
      hex: color,
      rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '',
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    }
    if (!history.find(h => h.hex === color)) {
      setHistory([newEntry, ...history].slice(0, 20))
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const presetColors = [
    '#ff5722', '#ff9800', '#ffc107', '#8bc34a', '#4caf50',
    '#00bcd4', '#03a9f4', '#2196f3', '#3f51b5', '#673ab7',
    '#9c27b0', '#e91e63', '#f44336', '#795548', '#607d8b',
    '#000000', '#333333', '#666666', '#999999', '#ffffff'
  ]

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/color" className="toolbox-back">
        ← 返回颜色工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🎯</span>
          <h1>颜色提取</h1>
        </div>
        <p className="page-sub">颜色选择与格式转换</p>
      </div>

      <section className="tool-card">
        {/* 大颜色预览 */}
        <div
          style={{
            width: '100%',
            height: '150px',
            borderRadius: '8px',
            background: color,
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              padding: '4px 8px',
              borderRadius: '4px',
              background: hsl.l > 50 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
              color: hsl.l > 50 ? '#fff' : '#000',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          >
            {color}
          </div>
        </div>

        {/* 颜色选择器 */}
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">选择颜色</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              style={{
                width: '80px',
                height: '60px',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            />
            <input
              type="text"
              className="tool-input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
              style={{ flex: '1 1 150px', minWidth: '120px', fontSize: '16px', fontFamily: 'monospace' }}
            />
            <button type="button" className="btn btn-primary" onClick={addToHistory}>
              收藏
            </button>
          </div>
        </div>

        {/* 预设颜色 */}
        <div className="tool-block">
          <div className="tool-block-title">预设颜色</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {presetColors.map((preset) => (
              <div
                key={preset}
                onClick={() => setColor(preset)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  background: preset,
                  cursor: 'pointer',
                  border: preset === '#ffffff' ? '1px solid #ccc' : 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                title={preset}
              />
            ))}
          </div>
        </div>

        {/* 颜色格式 */}
        <div className="tool-block">
          <div className="tool-block-title">颜色格式</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {colorFormats.map((format) => (
              <div
                key={format.label}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  gap: '8px'
                }}
              >
                <div style={{ flex: '1 1 auto', minWidth: '100px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{format.label}</div>
                  <code className="mono" style={{ fontSize: '14px', wordBreak: 'break-all' }}>{format.value}</code>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 12px', fontSize: '12px', flexShrink: 0 }}
                  onClick={() => onCopy(format.value)}
                >
                  复制
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 收藏历史 */}
        {history.length > 0 && (
          <div className="tool-block">
            <div className="tool-block-title">
              收藏的颜色
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: '12px' }}
                onClick={() => setHistory([])}
              >
                清空
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {history.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setColor(item.hex)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    background: item.hex,
                    cursor: 'pointer',
                    border: item.hex === '#ffffff' ? '1px solid #ccc' : 'none',
                    position: 'relative'
                  }}
                  title={`${item.hex}\n${item.rgb}\n${item.hsl}`}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setHistory(history.filter((_, i) => i !== index))
                    }}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#ff5252',
                      color: '#fff',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

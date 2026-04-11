import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function ShadowGeneratorToolPage() {
  const [horizontal, setHorizontal] = useState(5)
  const [vertical, setVertical] = useState(5)
  const [blur, setBlur] = useState(10)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState('#000000')
  const [opacity, setOpacity] = useState(50)
  const [inset, setInset] = useState(false)
  const [layers, setLayers] = useState<{ h: number; v: number; blur: number; spread: number; color: string; inset: boolean }[]>([])

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 将颜色转换为带透明度的 rgba
  const getRgbaColor = (hex: string, alpha: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(0, 0, 0, ${alpha / 100})`
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`
  }

  const generateShadow = () => {
    const rgbaColor = getRgbaColor(color, opacity)
    const insetStr = inset ? 'inset ' : ''
    return `${insetStr}${horizontal}px ${vertical}px ${blur}px ${spread}px ${rgbaColor}`
  }

  const generateAllShadows = (): string => {
    const currentShadow = generateShadow()
    const layerShadows = layers.map(l => {
      const c = getRgbaColor(l.color, opacity)
      const i = l.inset ? 'inset ' : ''
      return `${i}${l.h}px ${l.v}px ${l.blur}px ${l.spread}px ${c}`
    })
    return [...layerShadows, currentShadow].join(',\n    ')
  }

  const addLayer = () => {
    setLayers([...layers, {
      h: horizontal,
      v: vertical,
      blur: blur,
      spread: spread,
      color: color,
      inset: inset
    }])
  }

  const removeLayer = (index: number) => {
    setLayers(layers.filter((_, i) => i !== index))
  }

  const css = `box-shadow: ${generateAllShadows()};`

  const presetShadows = [
    { name: '柔和', css: '0 2px 10px rgba(0, 0, 0, 0.1)', values: { h: 0, v: 2, blur: 10, spread: 0, opacity: 10 } },
    { name: '卡片', css: '0 4px 6px rgba(0, 0, 0, 0.1)', values: { h: 0, v: 4, blur: 6, spread: 0, opacity: 10 } },
    { name: '浮起', css: '0 10px 20px rgba(0, 0, 0, 0.15)', values: { h: 0, v: 10, blur: 20, spread: 0, opacity: 15 } },
    { name: '硬边', css: '5px 5px 0 rgba(0, 0, 0, 0.2)', values: { h: 5, v: 5, blur: 0, spread: 0, opacity: 20 } },
    { name: '内凹', css: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)', values: { h: 0, v: 2, blur: 4, spread: 0, opacity: 10, inset: true } },
    { name: '多层', css: '0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12)', values: {} }
  ]

  const applyPreset = (preset: typeof presetShadows[0]) => {
    if (preset.values && 'h' in preset.values) {
      const v = preset.values as { h: number; v: number; blur: number; spread: number; opacity: number; inset?: boolean }
      setHorizontal(v.h)
      setVertical(v.v)
      setBlur(v.blur)
      setSpread(v.spread)
      setOpacity(v.opacity)
      if ('inset' in v) {
        setInset(v.inset as boolean)
      } else {
        setInset(false)
      }
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/css" className="toolbox-back">
        ← 返回 CSS 样式工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🌫️</span>
          <h1>阴影生成</h1>
        </div>
        <p className="page-sub">CSS box-shadow 阴影效果生成器</p>
      </div>

      <section className="tool-card">
        {/* 预览 */}
        <div
          style={{
            width: '100%',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              width: '150px',
              height: '100px',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: generateShadow()
            }}
          />
        </div>

        {/* 控制参数 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <label className="tool-label">
            水平偏移 (X): {horizontal}px
            <input
              type="range"
              min="-100"
              max="100"
              value={horizontal}
              onChange={(e) => setHorizontal(parseInt(e.target.value))}
            />
            <input
              type="number"
              className="tool-input"
              value={horizontal}
              onChange={(e) => setHorizontal(parseInt(e.target.value) || 0)}
            />
          </label>
          <label className="tool-label">
            垂直偏移 (Y): {vertical}px
            <input
              type="range"
              min="-100"
              max="100"
              value={vertical}
              onChange={(e) => setVertical(parseInt(e.target.value))}
            />
            <input
              type="number"
              className="tool-input"
              value={vertical}
              onChange={(e) => setVertical(parseInt(e.target.value) || 0)}
            />
          </label>
          <label className="tool-label">
            模糊半径: {blur}px
            <input
              type="range"
              min="0"
              max="100"
              value={blur}
              onChange={(e) => setBlur(parseInt(e.target.value))}
            />
            <input
              type="number"
              className="tool-input"
              value={blur}
              onChange={(e) => setBlur(parseInt(e.target.value) || 0)}
            />
          </label>
          <label className="tool-label">
            扩散半径: {spread}px
            <input
              type="range"
              min="-50"
              max="50"
              value={spread}
              onChange={(e) => setSpread(parseInt(e.target.value))}
            />
            <input
              type="number"
              className="tool-input"
              value={spread}
              onChange={(e) => setSpread(parseInt(e.target.value) || 0)}
            />
          </label>
          <label className="tool-label">
            阴影颜色
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '40px', height: '32px', border: 'none' }}
              />
              <input
                type="text"
                className="tool-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </label>
          <label className="tool-label">
            透明度: {opacity}%
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value))}
            />
          </label>
        </div>

        <div className="tool-row">
          <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={inset}
              onChange={(e) => setInset(e.target.checked)}
            />
            内阴影 (inset)
          </label>
          <button type="button" className="btn btn-secondary" onClick={addLayer}>
            添加图层
          </button>
        </div>

        {/* 图层列表 */}
        {layers.length > 0 && (
          <div className="tool-block">
            <div className="tool-block-title">阴影图层</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {layers.map((layer, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '4px'
                  }}
                >
                  <span className="mono" style={{ fontSize: '12px' }}>
                    {layer.inset ? 'inset ' : ''}{layer.h}px {layer.v}px {layer.blur}px {layer.spread}px
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '2px 8px', fontSize: '12px' }}
                    onClick={() => removeLayer(index)}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 预设 */}
        <div className="tool-block">
          <div className="tool-block-title">预设阴影</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
            {presetShadows.map((preset) => (
              <div
                key={preset.name}
                onClick={() => applyPreset(preset)}
                style={{
                  padding: '16px',
                  background: '#fff',
                  borderRadius: '4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: preset.css
                }}
              >
                {preset.name}
              </div>
            ))}
          </div>
        </div>

        {/* CSS 代码 */}
        <div className="tool-block">
          <div className="tool-block-title">CSS 代码</div>
          <pre className="tool-result mono" style={{ fontSize: '13px' }}>
{`.shadow {
  ${css}
}`}
          </pre>
          <div className="tool-actions" style={{ marginTop: '12px' }}>
            <button type="button" className="btn btn-primary" onClick={() => onCopy(css)}>
              复制 CSS
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(generateShadow())}>
              复制阴影值
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

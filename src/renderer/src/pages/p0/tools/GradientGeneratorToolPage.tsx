import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface GradientStop {
  color: string
  position: number
}

export default function GradientGeneratorToolPage() {
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear')
  const [angle, setAngle] = useState(90)
  const [stops, setStops] = useState<GradientStop[]>([
    { color: '#ff5722', position: 0 },
    { color: '#ff9800', position: 50 },
    { color: '#ffc107', position: 100 }
  ])
  const [radialShape, setRadialShape] = useState<'circle' | 'ellipse'>('circle')
  const [radialPosition, setRadialPosition] = useState('center')

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const addStop = () => {
    const newPosition = stops.length > 0 ? Math.min(100, stops[stops.length - 1].position + 25) : 50
    setStops([...stops, { color: '#888888', position: newPosition }])
  }

  const removeStop = (index: number) => {
    if (stops.length > 2) {
      setStops(stops.filter((_, i) => i !== index))
    }
  }

  const updateStop = (index: number, updates: Partial<GradientStop>) => {
    const newStops = [...stops]
    newStops[index] = { ...newStops[index], ...updates }
    setStops(newStops)
  }

  const generateCss = (): string => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position)
    const colorStops = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')

    switch (gradientType) {
      case 'linear':
        return `linear-gradient(${angle}deg, ${colorStops})`
      case 'radial':
        return `radial-gradient(${radialShape} at ${radialPosition}, ${colorStops})`
      case 'conic':
        return `conic-gradient(from ${angle}deg at ${radialPosition}, ${colorStops})`
      default:
        return ''
    }
  }

  const css = generateCss()

  const presetGradients = [
    { name: '日落', stops: [{ color: '#ff512f', position: 0 }, { color: '#f09819', position: 100 }] },
    { name: '海洋', stops: [{ color: '#2193b0', position: 0 }, { color: '#6dd5ed', position: 100 }] },
    { name: '紫罗兰', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
    { name: '森林', stops: [{ color: '#134e5e', position: 0 }, { color: '#71b280', position: 100 }] },
    { name: '火焰', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
    { name: '彩虹', stops: [{ color: '#ff0000', position: 0 }, { color: '#ffff00', position: 25 }, { color: '#00ff00', position: 50 }, { color: '#00ffff', position: 75 }, { color: '#0000ff', position: 100 }] }
  ]

  const applyPreset = (preset: typeof presetGradients[0]) => {
    setStops(preset.stops)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/color" className="toolbox-back">
        ← 返回颜色工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🌈</span>
          <h1>渐变生成</h1>
        </div>
        <p className="page-sub">CSS 渐变代码生成器</p>
      </div>

      <section className="tool-card">
        {/* 预览 */}
        <div
          style={{
            width: '100%',
            height: '150px',
            borderRadius: '8px',
            background: css,
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />

        <div className="tool-row">
          <label className="tool-label">
            渐变类型
            <select value={gradientType} onChange={(e) => setGradientType(e.target.value as typeof gradientType)}>
              <option value="linear">线性渐变</option>
              <option value="radial">径向渐变</option>
              <option value="conic">锥形渐变</option>
            </select>
          </label>
          {(gradientType === 'linear' || gradientType === 'conic') && (
            <label className="tool-label">
              角度
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  style={{ width: '100px' }}
                />
                <input
                  type="number"
                  className="tool-input"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
                  style={{ width: '80px' }}
                />
                <span>deg</span>
              </div>
            </label>
          )}
          {gradientType === 'radial' && (
            <>
              <label className="tool-label">
                形状
                <select value={radialShape} onChange={(e) => setRadialShape(e.target.value as typeof radialShape)}>
                  <option value="circle">圆形</option>
                  <option value="ellipse">椭圆</option>
                </select>
              </label>
              <label className="tool-label">
                位置
                <select value={radialPosition} onChange={(e) => setRadialPosition(e.target.value)}>
                  <option value="center">居中</option>
                  <option value="top left">左上</option>
                  <option value="top right">右上</option>
                  <option value="bottom left">左下</option>
                  <option value="bottom right">右下</option>
                </select>
              </label>
            </>
          )}
        </div>

        {/* 颜色节点 */}
        <div className="tool-block">
          <div className="tool-block-title">
            颜色节点
            <button type="button" className="btn btn-secondary" style={{ marginLeft: 'auto', padding: '4px 12px' }} onClick={addStop}>
              + 添加
            </button>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {stops.map((stop, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(index, { color: e.target.value })}
                  style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="tool-input"
                  value={stop.color}
                  onChange={(e) => updateStop(index, { color: e.target.value })}
                  style={{ width: '120px' }}
                />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) => updateStop(index, { position: parseInt(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ width: '40px', textAlign: 'right' }}>{stop.position}%</span>
                </div>
                {stops.length > 2 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px' }}
                    onClick={() => removeStop(index)}
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 预设 */}
        <div className="tool-block">
          <div className="tool-block-title">预设渐变</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
            {presetGradients.map((preset) => {
              const presetCss = `linear-gradient(90deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
              return (
                <div
                  key={preset.name}
                  style={{
                    height: '60px',
                    borderRadius: '4px',
                    background: presetCss,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    padding: '4px',
                    color: '#fff',
                    fontSize: '12px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </div>
              )
            })}
          </div>
        </div>

        {/* CSS 代码 */}
        <div className="tool-block">
          <div className="tool-block-title">CSS 代码</div>
          <pre className="tool-result mono" style={{ fontSize: '13px' }}>
{`background: ${css};
background: -webkit-${css};`}
          </pre>
          <div className="tool-actions" style={{ marginTop: '12px' }}>
            <button type="button" className="btn btn-primary" onClick={() => onCopy(`background: ${css};`)}>
              复制 CSS
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(`background: ${css};\nbackground: -webkit-${css};`)}>
              复制带前缀
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

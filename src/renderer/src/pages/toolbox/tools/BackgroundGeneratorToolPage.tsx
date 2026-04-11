import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

type BackgroundType = 'solid' | 'linear' | 'radial' | 'repeating-linear' | 'repeating-radial' | 'conic'

interface GradientStop {
  color: string
  position: number
}

export default function BackgroundGeneratorToolPage() {
  const [bgType, setBgType] = useState<BackgroundType>('linear')
  const [solidColor, setSolidColor] = useState('#3498db')
  const [stops, setStops] = useState<GradientStop[]>([
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 }
  ])
  const [angle, setAngle] = useState(135)
  const [radialShape, setRadialShape] = useState<'circle' | 'ellipse'>('circle')
  const [radialPosition, setRadialPosition] = useState('center')
  const [repeatingSize, setRepeatingSize] = useState(20)
  const [stripes, setStripes] = useState(false)
  const [stripeWidth] = useState(10)

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

  const generateBackground = (): string => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position)
    const colorStops = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')

    switch (bgType) {
      case 'solid':
        return solidColor
      case 'linear':
        return `linear-gradient(${angle}deg, ${colorStops})`
      case 'radial':
        return `radial-gradient(${radialShape} at ${radialPosition}, ${colorStops})`
      case 'repeating-linear':
        const repeatColorStops = sortedStops.slice(0, 2).map(s => `${s.color} ${s.position}px`).join(', ')
        return `repeating-linear-gradient(${angle}deg, ${repeatColorStops}, ${sortedStops[0].color} ${repeatingSize}px)`
      case 'repeating-radial':
        const repeatRadialStops = sortedStops.slice(0, 2).map(s => `${s.color} ${s.position}px`).join(', ')
        return `repeating-radial-gradient(${radialShape} at ${radialPosition}, ${repeatRadialStops}, ${sortedStops[0].color} ${repeatingSize}px)`
      case 'conic':
        return `conic-gradient(from ${angle}deg at ${radialPosition}, ${colorStops})`
      default:
        return ''
    }
  }

  const generateStripes = (): string => {
    const stripesList: string[] = []
    for (let i = 0; i < stops.length; i++) {
      const color = stops[i].color
      const start = i * stripeWidth
      const end = (i + 1) * stripeWidth
      stripesList.push(`${color} ${start}px`)
      stripesList.push(`${color} ${end}px`)
    }
    return `repeating-linear-gradient(${angle}deg, ${stripesList.join(', ')})`
  }

  const background = stripes ? generateStripes() : generateBackground()

  const presetBackgrounds = [
    { name: '深海', type: 'linear' as BackgroundType, stops: [{ color: '#2c3e50', position: 0 }, { color: '#3498db', position: 100 }], angle: 135 },
    { name: '日落', type: 'linear' as BackgroundType, stops: [{ color: '#ff512f', position: 0 }, { color: '#f09819', position: 100 }], angle: 90 },
    { name: '紫罗兰', type: 'linear' as BackgroundType, stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }], angle: 135 },
    { name: '森林', type: 'linear' as BackgroundType, stops: [{ color: '#134e5e', position: 0 }, { color: '#71b280', position: 100 }], angle: 135 },
    { name: '径向渐变', type: 'radial' as BackgroundType, stops: [{ color: '#fff', position: 0 }, { color: '#3498db', position: 100 }] },
    { name: '条纹', type: 'repeating-linear' as BackgroundType, stops: [{ color: '#3498db', position: 0 }, { color: '#fff', position: 10 }], angle: 45, size: 20 }
  ]

  const applyPreset = (preset: typeof presetBackgrounds[0]) => {
    setBgType(preset.type)
    setStops(preset.stops)
    if (preset.angle) setAngle(preset.angle)
    if (preset.size) setRepeatingSize(preset.size)
    setStripes(false)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/css" className="toolbox-back">
        ← 返回 CSS 样式工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🖼️</span>
          <h1>背景生成</h1>
        </div>
        <p className="page-sub">CSS 背景样式生成器</p>
      </div>

      <section className="tool-card">
        {/* 预览 */}
        <div
          style={{
            width: '100%',
            height: '200px',
            borderRadius: '8px',
            background: background,
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />

        {/* 预设 */}
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">预设背景</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
            {presetBackgrounds.map((preset) => {
              const sortedStops = [...preset.stops].sort((a, b) => a.position - b.position)
              const colorStops = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')
              const presetBg = preset.type === 'linear' || preset.type === 'repeating-linear'
                ? `linear-gradient(${preset.angle || 0}deg, ${colorStops})`
                : preset.type === 'radial'
                ? `radial-gradient(circle, ${colorStops})`
                : colorStops
              return (
                <div
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  style={{
                    height: '60px',
                    borderRadius: '4px',
                    background: presetBg,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    padding: '4px',
                    color: '#fff',
                    fontSize: '12px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {preset.name}
                </div>
              )
            })}
          </div>
        </div>

        {/* 类型选择 */}
        <div className="tool-block">
          <div className="tool-block-title">背景类型</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { value: 'solid', label: '纯色' },
              { value: 'linear', label: '线性渐变' },
              { value: 'radial', label: '径向渐变' },
              { value: 'conic', label: '锥形渐变' },
              { value: 'repeating-linear', label: '重复线性' },
              { value: 'repeating-radial', label: '重复径向' }
            ].map((type) => (
              <button
                key={type.value}
                className={`btn ${bgType === type.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBgType(type.value as BackgroundType)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 纯色设置 */}
        {bgType === 'solid' && (
          <div className="tool-block">
            <div className="tool-block-title">颜色</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={solidColor}
                onChange={(e) => setSolidColor(e.target.value)}
                style={{ width: '50px', height: '40px', border: 'none' }}
              />
              <input
                type="text"
                className="tool-input"
                value={solidColor}
                onChange={(e) => setSolidColor(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        )}

        {/* 渐变设置 */}
        {bgType !== 'solid' && (
          <>
            {(bgType === 'linear' || bgType === 'repeating-linear' || bgType === 'conic') && (
              <div className="tool-block">
                <div className="tool-block-title">角度: {angle}deg</div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {(bgType === 'radial' || bgType === 'repeating-radial' || bgType === 'conic') && (
              <div className="tool-block">
                <div className="tool-block-title">径向设置</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                </div>
              </div>
            )}

            {(bgType === 'repeating-linear' || bgType === 'repeating-radial') && (
              <div className="tool-block">
                <div className="tool-block-title">重复尺寸: {repeatingSize}px</div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={repeatingSize}
                  onChange={(e) => setRepeatingSize(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}

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
                      style={{ width: '40px', height: '32px', border: 'none' }}
                    />
                    <input
                      type="text"
                      className="tool-input"
                      value={stop.color}
                      onChange={(e) => updateStop(index, { color: e.target.value })}
                      style={{ width: '100px' }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) => updateStop(index, { position: parseInt(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <span style={{ width: '40px' }}>{stop.position}%</span>
                    {stops.length > 2 && (
                      <button type="button" className="btn btn-secondary" style={{ padding: '2px 8px' }} onClick={() => removeStop(index)}>
                        删除
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CSS 代码 */}
        <div className="tool-block">
          <div className="tool-block-title">CSS 代码</div>
          <pre className="tool-result mono" style={{ fontSize: '13px' }}>
{`background: ${background};`}
          </pre>
          <div className="tool-actions" style={{ marginTop: '12px' }}>
            <button type="button" className="btn btn-primary" onClick={() => onCopy(`background: ${background};`)}>
              复制 CSS
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

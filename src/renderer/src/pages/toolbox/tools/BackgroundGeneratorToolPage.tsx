import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

type BackgroundType = 'solid' | 'linear' | 'radial' | 'repeating-linear' | 'repeating-radial' | 'conic'

interface GradientStop {
  color: string
  position: number
}

export default function BackgroundGeneratorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
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

  const background = generateBackground()

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
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🖼️ 背景生成</h1>
        <p>CSS 背景样式生成器</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>CSS 背景属性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>background-color</h3>
                <p>设置元素的纯色背景，是最基础的背景属性</p>
              </div>
              <div className="feature-card">
                <h3>linear-gradient</h3>
                <p>线性渐变，颜色沿直线方向过渡变化</p>
              </div>
              <div className="feature-card">
                <h3>radial-gradient</h3>
                <p>径向渐变，颜色从中心向外辐射过渡</p>
              </div>
              <div className="feature-card">
                <h3>conic-gradient</h3>
                <p>锥形渐变，颜色围绕中心点旋转过渡</p>
              </div>
            </div>

            <h2>渐变类型图示</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  线性渐变 (linear-gradient)
  ┌─────────────────────────────┐
  │ #667eea                     │
  │        ↘ 135deg             │
  │              #764ba2        │
  └─────────────────────────────┘

  径向渐变 (radial-gradient)
  ┌─────────────────────────────┐
  │          #764ba2            │
  │       ┌───────┐             │
  │       │#fff   │             │
  │       └───────┘             │
  └─────────────────────────────┘

  锥形渐变 (conic-gradient)
  ┌─────────────────────────────┐
  │     ╱│╲    色轮效果         │
  │    ╱ │ ╲   绕中心旋转       │
  │   ╱  │  ╲                   │
  └─────────────────────────────┘
              `}</pre>
            </div>

            <h2>渐变语法</h2>
            <div className="info-box">
              <strong>基本语法</strong>
              <ul>
                <li><code>linear-gradient(angle, color1 pos1, color2 pos2)</code></li>
                <li><code>radial-gradient(shape at position, colors)</code></li>
                <li><code>conic-gradient(from angle at position, colors)</code></li>
              </ul>
            </div>

            <h2>颜色节点 (Color Stops)</h2>
            <div className="info-box warning">
              <strong>颜色节点说明</strong>
              <p>颜色节点定义渐变中的颜色及其位置。位置可以用百分比或像素值表示。节点按顺序渲染，可以添加多个节点实现复杂渐变。</p>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>页面背景</strong> - 全屏渐变背景增加视觉层次</li>
              <li><strong>按钮样式</strong> - 渐变按钮更有质感</li>
              <li><strong>卡片装饰</strong> - 头部渐变背景</li>
              <li><strong>加载动画</strong> - 条纹背景配合动画</li>
              <li><strong>图表配色</strong> - 数据可视化渐变色</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>背景预览</h2>
            <div className="bg-demo">
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '8px',
                  background: background,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>

            <h2>预设背景</h2>
            <div className="preset-grid">
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

            <h2>背景类型</h2>
            <div className="demo-controls">
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
                  onClick={() => setBgType(type.value as BackgroundType)}
                  style={{ background: bgType === type.value ? '#4fc3f7' : '#e0e0e0', color: bgType === type.value ? '#fff' : '#333' }}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {bgType === 'solid' && (
              <div className="config-grid">
                <div className="config-item">
                  <label>颜色</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="color" value={solidColor} onChange={(e) => setSolidColor(e.target.value)} style={{ width: '50px', height: '40px', border: 'none' }} />
                    <input type="text" value={solidColor} onChange={(e) => setSolidColor(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
            )}

            {bgType !== 'solid' && (
              <>
                {(bgType === 'linear' || bgType === 'repeating-linear' || bgType === 'conic') && (
                  <div className="config-grid">
                    <div className="config-item">
                      <label>角度: {angle}deg</label>
                      <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} />
                    </div>
                  </div>
                )}

                {(bgType === 'radial' || bgType === 'repeating-radial' || bgType === 'conic') && (
                  <div className="config-grid">
                    <div className="config-item">
                      <label>形状</label>
                      <select value={radialShape} onChange={(e) => setRadialShape(e.target.value as typeof radialShape)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <option value="circle">圆形</option>
                        <option value="ellipse">椭圆</option>
                      </select>
                    </div>
                    <div className="config-item">
                      <label>位置</label>
                      <select value={radialPosition} onChange={(e) => setRadialPosition(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <option value="center">居中</option>
                        <option value="top left">左上</option>
                        <option value="top right">右上</option>
                        <option value="bottom left">左下</option>
                        <option value="bottom right">右下</option>
                      </select>
                    </div>
                  </div>
                )}

                {(bgType === 'repeating-linear' || bgType === 'repeating-radial') && (
                  <div className="config-grid">
                    <div className="config-item">
                      <label>重复尺寸: {repeatingSize}px</label>
                      <input type="range" min="10" max="100" value={repeatingSize} onChange={(e) => setRepeatingSize(parseInt(e.target.value))} />
                    </div>
                  </div>
                )}

                <h2>颜色节点</h2>
                <div style={{ marginBottom: '12px' }}>
                  <button onClick={addStop} style={{ padding: '6px 12px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    + 添加节点
                  </button>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {stops.map((stop, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                      <input type="color" value={stop.color} onChange={(e) => updateStop(index, { color: e.target.value })} style={{ width: '40px', height: '32px', border: 'none' }} />
                      <input type="text" value={stop.color} onChange={(e) => updateStop(index, { color: e.target.value })} style={{ width: '80px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} />
                      <input type="range" min="0" max="100" value={stop.position} onChange={(e) => updateStop(index, { position: parseInt(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ width: '40px' }}>{stop.position}%</span>
                      {stops.length > 2 && (
                        <button onClick={() => removeStop(index)} style={{ padding: '4px 8px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>删除</button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>生成的 CSS</h2>
            <div className="code-block">
              <pre>{`background: ${background};`}</pre>
            </div>
            <div className="demo-controls">
              <button onClick={() => onCopy(`background: ${background};`)}>复制 CSS</button>
            </div>

            <h2>常用渐变示例</h2>
            <div className="code-block">
              <pre>{`/* 线性渐变 */
.linear {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 径向渐变 */
.radial {
  background: radial-gradient(circle at center, #fff 0%, #3498db 100%);
}

/* 锥形渐变 (饼图效果) */
.conic {
  background: conic-gradient(
    #3498db 0deg 120deg,
    #e74c3c 120deg 240deg,
    #27ae60 240deg 360deg
  );
}

/* 重复渐变 (条纹) */
.stripes {
  background: repeating-linear-gradient(
    45deg,
    #3498db,
    #3498db 10px,
    #fff 10px,
    #fff 20px
  );
}

/* 多层背景 */
.multi-bg {
  background:
    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
    url('background.jpg');
  background-size: cover;
}

/* 渐变文字 */
.gradient-text {
  background: linear-gradient(90deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

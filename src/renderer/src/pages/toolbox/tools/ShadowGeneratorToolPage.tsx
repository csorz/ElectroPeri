import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function ShadowGeneratorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [horizontal, setHorizontal] = useState(5)
  const [vertical, setVertical] = useState(5)
  const [blur, setBlur] = useState(10)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState('#000000')
  const [opacity, setOpacity] = useState(50)
  const [inset, setInset] = useState(false)
  const [layers, setLayers] = useState<{ h: number; v: number; blur: number; spread: number; color: string; inset: boolean }[]>([])

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

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
    setLayers([...layers, { h: horizontal, v: vertical, blur: blur, spread: spread, color: color, inset: inset }])
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
    <div className="tool-page">
      <div className="tool-header">
        <h1>🌫️ 阴影生成</h1>
        <p>CSS box-shadow 阴影效果生成器</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>box-shadow 属性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>水平偏移 (X)</h3>
                <p>阴影在水平方向的偏移量，正值向右，负值向左</p>
              </div>
              <div className="feature-card">
                <h3>垂直偏移 (Y)</h3>
                <p>阴影在垂直方向的偏移量，正值向下，负值向上</p>
              </div>
              <div className="feature-card">
                <h3>模糊半径</h3>
                <p>阴影的模糊程度，值越大越模糊，不能为负值</p>
              </div>
              <div className="feature-card">
                <h3>扩散半径</h3>
                <p>阴影的扩展大小，正值扩大，负值缩小</p>
              </div>
            </div>

            <h2>语法格式</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  box-shadow: [inset] offsetX offsetY blurRadius spreadRadius color;

  参数说明:
  ┌─────────────────────────────────────────────────────────┐
  │ inset        可选，内阴影                                │
  │ offsetX      水平偏移量 (必填)                           │
  │ offsetY      垂直偏移量 (必填)                           │
  │ blurRadius   模糊半径 (可选，默认 0)                     │
  │ spreadRadius 扩散半径 (可选，默认 0)                     │
  │ color        阴影颜色 (可选，默认当前颜色)               │
  └─────────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>多层阴影</h2>
            <div className="info-box">
              <strong>叠加效果</strong>
              <p>box-shadow 支持多层阴影，用逗号分隔。每层阴影按声明顺序从前往后渲染，可实现复杂光影效果。</p>
              <ul>
                <li>立体感：使用多层阴影模拟光源照射</li>
                <li>霓虹效果：多层发光阴影叠加</li>
                <li>边框效果：内阴影模拟细边框</li>
              </ul>
            </div>

            <h2>最佳实践</h2>
            <ul className="scenario-list">
              <li><strong>使用半透明颜色</strong> - rgba() 或 hsla() 让阴影更自然</li>
              <li><strong>避免过大的模糊值</strong> - 影响性能，通常 20px 以内</li>
              <li><strong>考虑性能</strong> - 大面积阴影会增加渲染开销</li>
              <li><strong>一致的光源方向</strong> - 整个应用保持相同的偏移方向</li>
              <li><strong>层次感</strong> - 卡片悬浮时增加阴影强度</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>阴影预览</h2>
            <div className="shadow-demo">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '40px',
                  marginBottom: '20px'
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

              <div className="config-grid">
                <div className="config-item">
                  <label>水平偏移: {horizontal}px</label>
                  <input type="range" min="-100" max="100" value={horizontal} onChange={(e) => setHorizontal(parseInt(e.target.value))} />
                </div>
                <div className="config-item">
                  <label>垂直偏移: {vertical}px</label>
                  <input type="range" min="-100" max="100" value={vertical} onChange={(e) => setVertical(parseInt(e.target.value))} />
                </div>
                <div className="config-item">
                  <label>模糊半径: {blur}px</label>
                  <input type="range" min="0" max="100" value={blur} onChange={(e) => setBlur(parseInt(e.target.value))} />
                </div>
                <div className="config-item">
                  <label>扩散半径: {spread}px</label>
                  <input type="range" min="-50" max="50" value={spread} onChange={(e) => setSpread(parseInt(e.target.value))} />
                </div>
                <div className="config-item">
                  <label>颜色</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '40px', height: '32px', border: 'none' }} />
                    <input type="text" value={color} onChange={(e) => setColor(e.target.value)} style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>
                </div>
                <div className="config-item">
                  <label>透明度: {opacity}%</label>
                  <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} />
                  内阴影 (inset)
                </label>
                <button onClick={addLayer} style={{ padding: '6px 12px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  添加图层
                </button>
              </div>
            </div>

            {layers.length > 0 && (
              <div className="layer-list">
                <h2>阴影图层</h2>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {layers.map((layer, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
                      <code style={{ fontSize: '12px' }}>{layer.inset ? 'inset ' : ''}{layer.h}px {layer.v}px {layer.blur}px {layer.spread}px</code>
                      <button onClick={() => removeLayer(index)} style={{ padding: '2px 8px', fontSize: '12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>删除</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2>预设阴影</h2>
            <div className="preset-grid">
              {presetShadows.map((preset) => (
                <div key={preset.name} onClick={() => applyPreset(preset)} style={{ padding: '16px', background: '#fff', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', boxShadow: preset.css }}>
                  {preset.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>生成的 CSS</h2>
            <div className="code-block">
              <pre>{`.shadow {
  ${css}
}`}</pre>
            </div>
            <div className="demo-controls">
              <button onClick={() => onCopy(css)}>复制 CSS</button>
              <button onClick={() => onCopy(generateShadow())}>复制阴影值</button>
            </div>

            <h2>使用示例</h2>
            <div className="code-block">
              <pre>{`/* 基础阴影 */
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 悬浮效果 */
.card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* 内阴影输入框 */
.input {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 多层阴影 */
.button {
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.12),
    0 2px 2px rgba(0, 0, 0, 0.12),
    0 4px 4px rgba(0, 0, 0, 0.12);
}

/* 发光效果 */
.glow {
  box-shadow: 0 0 20px rgba(79, 195, 247, 0.5);
}

/* 无阴影重置 */
.no-shadow {
  box-shadow: none;
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

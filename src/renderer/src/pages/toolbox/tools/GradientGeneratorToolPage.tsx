import { useState, useCallback } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

interface GradientStop {
  color: string
  position: number
}

export default function GradientGeneratorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
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
    <div className="tool-page">
      <div className="tool-header">
        <h1>渐变生成</h1>
        <p>CSS 渐变代码生成器</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>渐变类型</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>线性渐变 (Linear)</h3>
                <p>颜色沿直线方向平滑过渡，可指定角度或方向关键词，适用于背景、按钮等元素。</p>
              </div>
              <div className="feature-card">
                <h3>径向渐变 (Radial)</h3>
                <p>颜色从中心点向外圆形扩散，可设置形状（圆形/椭圆）和中心位置，适合聚光效果。</p>
              </div>
              <div className="feature-card">
                <h3>锥形渐变 (Conic)</h3>
                <p>颜色围绕中心点旋转过渡，类似色轮效果，适合创建饼图、色环等视觉效果。</p>
              </div>
              <div className="feature-card">
                <h3>重复渐变</h3>
                <p>使用 repeating-linear-gradient 等函数创建重复图案，适合条纹、网格等背景。</p>
              </div>
            </div>

            <h2>渐变语法图解</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    线性渐变 (Linear Gradient)
    ┌────────────────────────────────────┐
    │  to right (90deg)                  │
    │  ┌───────────────────────────┐    │
    │  │█░░░░░░░░░░░░░░░░░░░░░░░░░│    │
    │  │███░░░░░░░░░░░░░░░░░░░░░░░│    │
    │  │█████░░░░░░░░░░░░░░░░░░░░░│    │
    │  │███████░░░░░░░░░░░░░░░░░░░│    │
    │  │█████████░░░░░░░░░░░░░░░░░│    │
    │  └───────────────────────────┘    │
    │  开始色 ─────────────→ 结束色      │
    └────────────────────────────────────┘

    径向渐变 (Radial Gradient)
    ┌────────────────────────────────────┐
    │         ┌─────────────┐            │
    │       ┌─┼─────────────┼─┐          │
    │     ┌───┼─────────────┼───┐        │
    │     │███│░░░░░░░░░░░░░│███│        │
    │     └───┼─────────────┼───┘        │
    │       └─┼─────────────┼─┘          │
    │         └─────────────┘            │
    │         中心色 → 外围色             │
    └────────────────────────────────────┘

    锥形渐变 (Conic Gradient)
    ┌────────────────────────────────────┐
    │           ╭───────╮                │
    │         ╱░░░░░░░░░░█╲              │
    │       ╱░░░░░░░░░░░░░░█╲            │
    │      │░░░░░░░░░░░░░░░░░│           │
    │       ╲█░░░░░░░░░░░░░░╱            │
    │         ╲███████████╱              │
    │           ╰───────╯                │
    │         绕中心旋转过渡              │
    └────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>CSS 语法详解</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>类型</th>
                    <th>语法</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>线性</strong></td>
                    <td><code>linear-gradient(angle, color1 pos1, color2 pos2)</code></td>
                    <td>angle: 0-360deg 或 to top/right/bottom/left</td>
                  </tr>
                  <tr>
                    <td><strong>径向</strong></td>
                    <td><code>radial-gradient(shape at position, colors)</code></td>
                    <td>shape: circle/ellipse; position: center, top left...</td>
                  </tr>
                  <tr>
                    <td><strong>锥形</strong></td>
                    <td><code>conic-gradient(from angle at position, colors)</code></td>
                    <td>from: 起始角度; 颜色按角度分布</td>
                  </tr>
                  <tr>
                    <td><strong>重复</strong></td>
                    <td><code>repeating-linear-gradient(...)</code></td>
                    <td>自动重复渐变图案</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="info-box">
              <strong>颜色节点 (Color Stops)</strong>
              <ul>
                <li><strong>位置值</strong> - 可使用百分比(0-100%)或像素值指定颜色位置</li>
                <li><strong>自动分布</strong> - 省略位置时，浏览器自动均匀分布颜色</li>
                <li><strong>多节点</strong> - 可添加任意数量的颜色节点创建复杂渐变</li>
                <li><strong>透明度</strong> - 使用 rgba() 或 #RRGGBBAA 支持透明渐变</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>网页背景</strong> - 为页面或区块添加渐变背景，增加视觉层次</li>
              <li><strong>按钮样式</strong> - 渐变按钮更有立体感和吸引力</li>
              <li><strong>图片遮罩</strong> - 配合背景图片创建渐变遮罩效果</li>
              <li><strong>文字效果</strong> - 使用 background-clip: text 创建渐变文字</li>
              <li><strong>图表配色</strong> - 为数据可视化元素提供平滑的颜色过渡</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>渐变生成器</h2>
            <div className="gradient-demo">
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

              {/* 渐变类型配置 */}
              <div className="config-grid">
                <div className="config-item">
                  <label>渐变类型</label>
                  <select
                    value={gradientType}
                    onChange={(e) => setGradientType(e.target.value as typeof gradientType)}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  >
                    <option value="linear">线性渐变</option>
                    <option value="radial">径向渐变</option>
                    <option value="conic">锥形渐变</option>
                  </select>
                </div>
                {(gradientType === 'linear' || gradientType === 'conic') && (
                  <div className="config-item">
                    <label>角度: {angle}deg</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(e) => setAngle(parseInt(e.target.value))}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="number"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
                        style={{ width: '80px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                )}
                {gradientType === 'radial' && (
                  <>
                    <div className="config-item">
                      <label>形状</label>
                      <select
                        value={radialShape}
                        onChange={(e) => setRadialShape(e.target.value as typeof radialShape)}
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      >
                        <option value="circle">圆形</option>
                        <option value="ellipse">椭圆</option>
                      </select>
                    </div>
                    <div className="config-item">
                      <label>中心位置</label>
                      <select
                        value={radialPosition}
                        onChange={(e) => setRadialPosition(e.target.value)}
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      >
                        <option value="center">居中</option>
                        <option value="top left">左上</option>
                        <option value="top right">右上</option>
                        <option value="bottom left">左下</option>
                        <option value="bottom right">右下</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* 颜色节点 */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>
                颜色节点
                <button
                  onClick={addStop}
                  style={{ marginLeft: '12px', padding: '4px 12px', fontSize: '12px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  + 添加
                </button>
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {stops.map((stop, index) => (
                  <div key={index} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateStop(index, { color: e.target.value })}
                      style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateStop(index, { color: e.target.value })}
                      style={{ width: '100px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', flexShrink: 0 }}
                    />
                    <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) => updateStop(index, { position: parseInt(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <span style={{ width: '40px', textAlign: 'right', flexShrink: 0, fontSize: '13px' }}>{stop.position}%</span>
                    </div>
                    {stops.length > 2 && (
                      <button
                        onClick={() => removeStop(index)}
                        style={{ padding: '4px 8px', fontSize: '12px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}
                      >
                        删除
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 预设 */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>预设渐变</h3>
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

              {/* CSS 代码 */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>CSS 代码</h3>
              <div className="packet-output" style={{ marginBottom: '12px' }}>
{`background: ${css};
background: -webkit-${css};`}
              </div>
              <div className="demo-controls">
                <button onClick={() => onCopy(`background: ${css};`)}>复制 CSS</button>
                <button onClick={() => onCopy(`background: ${css};\nbackground: -webkit-${css};`)}>复制带前缀</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>CSS 示例</h2>
            <div className="code-block">
              <pre>{`/* 线性渐变 - 基础用法 */
.gradient-linear {
  /* 从上到下 */
  background: linear-gradient(#ff5722, #ffc107);

  /* 从左到右 */
  background: linear-gradient(to right, #ff5722, #ffc107);

  /* 指定角度 */
  background: linear-gradient(45deg, #ff5722, #ff9800, #ffc107);

  /* 多色节点 */
  background: linear-gradient(90deg,
    #ff0000 0%,
    #ffff00 25%,
    #00ff00 50%,
    #00ffff 75%,
    #0000ff 100%
  );
}

/* 径向渐变 */
.gradient-radial {
  /* 圆形渐变 */
  background: radial-gradient(circle, #ff5722, #ffc107);

  /* 椭圆渐变 */
  background: radial-gradient(ellipse, #ff5722, #ffc107);

  /* 指定中心位置 */
  background: radial-gradient(circle at top left, #ff5722, #ffc107);

  /* 指定大小 */
  background: radial-gradient(circle closest-side, #ff5722, #ffc107);
}

/* 锥形渐变 */
.gradient-conic {
  /* 基础锥形 */
  background: conic-gradient(#ff5722, #ffc107, #4caf50, #2196f3, #ff5722);

  /* 指定起始角度 */
  background: conic-gradient(from 45deg, #ff5722, #ffc107, #ff5722);

  /* 指定中心位置 */
  background: conic-gradient(from 0deg at center, #ff5722, #ffc107);
}

/* 重复渐变 */
.gradient-repeating {
  /* 条纹背景 */
  background: repeating-linear-gradient(
    45deg,
    #ff5722,
    #ff5722 10px,
    #ffc107 10px,
    #ffc107 20px
  );

  /* 网格背景 */
  background: repeating-radial-gradient(
    circle,
    #ff5722,
    #ff5722 10px,
    #ffc107 10px,
    #ffc107 20px
  );
}`}</pre>
            </div>

            <h2>JavaScript 动态生成</h2>
            <div className="code-block">
              <pre>{`// 动态生成渐变
function generateLinearGradient(colors: string[], angle: number = 90): string {
  const stops = colors.map((color, i) => {
    const position = (i / (colors.length - 1)) * 100;
    return \`\${color} \${position}%\`;
  });
  return \`linear-gradient(\${angle}deg, \${stops.join(', ')})\`;
}

// 使用示例
const gradient = generateLinearGradient(['#ff5722', '#ff9800', '#ffc107'], 45);
element.style.background = gradient;

// 生成径向渐变
function generateRadialGradient(
  colors: string[],
  shape: 'circle' | 'ellipse' = 'circle',
  position: string = 'center'
): string {
  const stops = colors.map((color, i) => {
    const position = (i / (colors.length - 1)) * 100;
    return \`\${color} \${position}%\`;
  });
  return \`radial-gradient(\${shape} at \${position}, \${stops.join(', ')})\`;
}

// 创建渐变文字效果
function createGradientText(element: HTMLElement, gradient: string) {
  element.style.background = gradient;
  element.style.webkitBackgroundClip = 'text';
  element.style.webkitTextFillColor = 'transparent';
  element.style.backgroundClip = 'text';
}

// 使用示例
const title = document.querySelector('h1');
createGradientText(title, 'linear-gradient(90deg, #ff5722, #ffc107)');`}</pre>
            </div>

            <h2>Python (生成 CSS)</h2>
            <div className="code-block">
              <pre>{`def generate_linear_gradient(colors: list, angle: int = 90) -> str:
    """生成线性渐变 CSS"""
    stops = []
    for i, color in enumerate(colors):
        position = (i / (len(colors) - 1)) * 100 if len(colors) > 1 else 0
        stops.append(f"{color} {position}%")
    return f"linear-gradient({angle}deg, {', '.join(stops)})"

def generate_radial_gradient(colors: list, shape: str = 'circle', position: str = 'center') -> str:
    """生成径向渐变 CSS"""
    stops = []
    for i, color in enumerate(colors):
        pos = (i / (len(colors) - 1)) * 100 if len(colors) > 1 else 0
        stops.append(f"{color} {pos}%")
    return f"radial-gradient({shape} at {position}, {', '.join(stops)})"

def generate_css_gradient(gradient_type: str, colors: list, **kwargs) -> str:
    """通用渐变生成器"""
    if gradient_type == 'linear':
        angle = kwargs.get('angle', 90)
        return generate_linear_gradient(colors, angle)
    elif gradient_type == 'radial':
        shape = kwargs.get('shape', 'circle')
        position = kwargs.get('position', 'center')
        return generate_radial_gradient(colors, shape, position)
    elif gradient_type == 'conic':
        angle = kwargs.get('angle', 0)
        position = kwargs.get('position', 'center')
        stops = [f"{c} {(i/(len(colors)-1))*100}%" for i, c in enumerate(colors)]
        return f"conic-gradient(from {angle}deg at {position}, {', '.join(stops)})"
    return ""

# 使用示例
gradient = generate_linear_gradient(['#ff5722', '#ff9800', '#ffc107'], 45)
print(f"background: {gradient};")

radial = generate_radial_gradient(['#ff5722', '#ffc107'], 'circle', 'top left')
print(f"background: {radial};")`}</pre>
            </div>

            <h2>Go (生成 CSS)</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "strings"
)

// GradientType 渐变类型
type GradientType string

const (
    Linear  GradientType = "linear"
    Radial  GradientType = "radial"
    Conic   GradientType = "conic"
)

// GradientConfig 渐变配置
type GradientConfig struct {
    Type      GradientType
    Colors    []string
    Angle     int
    Shape     string
    Position  string
}

// GenerateGradient 生成渐变 CSS
func GenerateGradient(config GradientConfig) string {
    stops := make([]string, len(config.Colors))
    for i, color := range config.Colors {
        position := 0
        if len(config.Colors) > 1 {
            position = (i * 100) / (len(config.Colors) - 1)
        }
        stops[i] = fmt.Sprintf("%s %d%%", color, position)
    }
    colorStops := strings.Join(stops, ", ")

    switch config.Type {
    case Linear:
        return fmt.Sprintf("linear-gradient(%ddeg, %s)", config.Angle, colorStops)
    case Radial:
        shape := config.Shape
        if shape == "" {
            shape = "circle"
        }
        pos := config.Position
        if pos == "" {
            pos = "center"
        }
        return fmt.Sprintf("radial-gradient(%s at %s, %s)", shape, pos, colorStops)
    case Conic:
        pos := config.Position
        if pos == "" {
            pos = "center"
        }
        return fmt.Sprintf("conic-gradient(from %ddeg at %s, %s)", config.Angle, pos, colorStops)
    }
    return ""
}

func main() {
    // 线性渐变
    linear := GenerateGradient(GradientConfig{
        Type:   Linear,
        Colors: []string{"#ff5722", "#ff9800", "#ffc107"},
        Angle:  45,
    })
    fmt.Println("Linear:", linear)

    // 径向渐变
    radial := GenerateGradient(GradientConfig{
        Type:     Radial,
        Colors:   []string{"#ff5722", "#ffc107"},
        Shape:    "circle",
        Position: "top left",
    })
    fmt.Println("Radial:", radial)
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function FlexGeneratorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  // Flex container properties
  const [direction, setDirection] = useState<'row' | 'row-reverse' | 'column' | 'column-reverse'>('row')
  const [wrap, setWrap] = useState<'nowrap' | 'wrap' | 'wrap-reverse'>('wrap')
  const [justifyContent, setJustifyContent] = useState<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'>('flex-start')
  const [alignItems, setAlignItems] = useState<'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'>('stretch')
  const [alignContent, setAlignContent] = useState<'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around'>('stretch')
  const [gap, setGap] = useState(10)

  // Flex item count
  const [itemCount, setItemCount] = useState(4)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const generateCss = (): string => {
    return `.flex-container {
  display: flex;
  flex-direction: ${direction};
  flex-wrap: ${wrap};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  align-content: ${alignContent};
  gap: ${gap}px;
}

.flex-item {
  /* 子项默认样式 */
}`
  }

  const generateHtml = (): string => {
    const items = Array.from({ length: itemCount }, (_, i) =>
      `  <div class="flex-item">Item ${i + 1}</div>`
    ).join('\n')

    return `<div class="flex-container">
${items}
</div>`
  }

  const presetLayouts = [
    {
      name: '水平居中',
      direction: 'row' as const,
      wrap: 'nowrap' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      alignContent: 'stretch' as const
    },
    {
      name: '两端对齐',
      direction: 'row' as const,
      wrap: 'nowrap' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      alignContent: 'stretch' as const
    },
    {
      name: '垂直居中',
      direction: 'column' as const,
      wrap: 'nowrap' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      alignContent: 'stretch' as const
    },
    {
      name: '平均分布',
      direction: 'row' as const,
      wrap: 'wrap' as const,
      justifyContent: 'space-around' as const,
      alignItems: 'center' as const,
      alignContent: 'space-around' as const
    }
  ]

  const applyPreset = (preset: typeof presetLayouts[0]) => {
    setDirection(preset.direction)
    setWrap(preset.wrap)
    setJustifyContent(preset.justifyContent)
    setAlignItems(preset.alignItems)
    setAlignContent(preset.alignContent)
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📦 Flex 布局</h1>
        <p>CSS Flexbox 布局生成器</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>Flex 布局核心概念</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>主轴 (Main Axis)</h3>
                <p>默认水平方向，由 flex-direction 决定方向</p>
              </div>
              <div className="feature-card">
                <h3>交叉轴 (Cross Axis)</h3>
                <p>垂直于主轴的方向，用于垂直对齐</p>
              </div>
              <div className="feature-card">
                <h3>弹性项目</h3>
                <p>Flex 容器的直接子元素自动成为弹性项目</p>
              </div>
              <div className="feature-card">
                <h3>弹性空间</h3>
                <p>可用空间按 flex-grow 比例分配给项目</p>
              </div>
            </div>

            <h2>布局结构图</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  flex-direction: row (默认)
  justify-content: space-between
  align-items: center

  ┌─────────────────────────────────────────────────┐
  │  Flex Container                                 │
  │                                                 │
  │  ┌─────┐              ┌─────┐              ┌─────┐
  │  │Item1│              │Item2│              │Item3│
  │  └─────┘              └─────┘              └─────┘
  │     ↑                    ↑                    ↑
  │  Main Start          Main Axis            Main End
  │                                                 │
  └─────────────────────────────────────────────────┘
        ↑                                         ↑
     Cross Start                              Cross End
              `}</pre>
            </div>

            <h2>容器属性</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>属性</th>
                    <th>说明</th>
                    <th>常用值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>flex-direction</code></td>
                    <td>主轴方向</td>
                    <td>row, column, row-reverse, column-reverse</td>
                  </tr>
                  <tr>
                    <td><code>flex-wrap</code></td>
                    <td>换行方式</td>
                    <td>nowrap, wrap, wrap-reverse</td>
                  </tr>
                  <tr>
                    <td><code>justify-content</code></td>
                    <td>主轴对齐</td>
                    <td>flex-start, center, space-between, space-around</td>
                  </tr>
                  <tr>
                    <td><code>align-items</code></td>
                    <td>交叉轴对齐</td>
                    <td>flex-start, center, stretch, baseline</td>
                  </tr>
                  <tr>
                    <td><code>align-content</code></td>
                    <td>多行对齐</td>
                    <td>flex-start, center, space-between, stretch</td>
                  </tr>
                  <tr>
                    <td><code>gap</code></td>
                    <td>项目间距</td>
                    <td>px, rem, %</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>项目属性</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>属性</th>
                    <th>说明</th>
                    <th>常用值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>flex-grow</code></td>
                    <td>放大比例</td>
                    <td>0 (默认), 1, 2...</td>
                  </tr>
                  <tr>
                    <td><code>flex-shrink</code></td>
                    <td>缩小比例</td>
                    <td>1 (默认), 0...</td>
                  </tr>
                  <tr>
                    <td><code>flex-basis</code></td>
                    <td>初始大小</td>
                    <td>auto, px, %</td>
                  </tr>
                  <tr>
                    <td><code>flex</code></td>
                    <td>简写属性</td>
                    <td>flex: 1; flex: 0 0 100px;</td>
                  </tr>
                  <tr>
                    <td><code>order</code></td>
                    <td>排列顺序</td>
                    <td>0 (默认), 正负整数</td>
                  </tr>
                  <tr>
                    <td><code>align-self</code></td>
                    <td>单独对齐</td>
                    <td>覆盖 align-items</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>水平垂直居中</strong> - 最常用的居中方案</li>
              <li><strong>导航栏</strong> - 水平排列的菜单项</li>
              <li><strong>卡片列表</strong> - 等高卡片布局</li>
              <li><strong>底部按钮栏</strong> - 固定在底部的按钮组</li>
              <li><strong>响应式布局</strong> - 配合 flex-wrap 自动换行</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>布局预览</h2>
            <div className="grid-demo">
              <div
                style={{
                  display: 'flex',
                  flexDirection: direction,
                  flexWrap: wrap,
                  justifyContent,
                  alignItems,
                  alignContent,
                  gap: `${gap}px`,
                  padding: '20px',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  minHeight: '200px',
                  border: '2px dashed #ccc'
                }}
              >
                {Array.from({ length: itemCount }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px 24px',
                      background: `hsl(${(i * 360) / itemCount}, 70%, 60%)`,
                      borderRadius: '6px',
                      color: '#fff',
                      fontWeight: 500,
                      minWidth: '60px',
                      textAlign: 'center'
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <h2>配置参数</h2>
            <div className="config-grid" style={{ marginTop: 16 }}>
              <div className="config-item">
                <label>主轴方向 (flex-direction)</label>
                <select value={direction} onChange={(e) => setDirection(e.target.value as typeof direction)}>
                  <option value="row">row (水平)</option>
                  <option value="row-reverse">row-reverse (水平反向)</option>
                  <option value="column">column (垂直)</option>
                  <option value="column-reverse">column-reverse (垂直反向)</option>
                </select>
              </div>
              <div className="config-item">
                <label>换行方式 (flex-wrap)</label>
                <select value={wrap} onChange={(e) => setWrap(e.target.value as typeof wrap)}>
                  <option value="nowrap">nowrap (不换行)</option>
                  <option value="wrap">wrap (换行)</option>
                  <option value="wrap-reverse">wrap-reverse (反向换行)</option>
                </select>
              </div>
              <div className="config-item">
                <label>主轴对齐 (justify-content)</label>
                <select value={justifyContent} onChange={(e) => setJustifyContent(e.target.value as typeof justifyContent)}>
                  <option value="flex-start">flex-start</option>
                  <option value="flex-end">flex-end</option>
                  <option value="center">center</option>
                  <option value="space-between">space-between</option>
                  <option value="space-around">space-around</option>
                  <option value="space-evenly">space-evenly</option>
                </select>
              </div>
              <div className="config-item">
                <label>交叉轴对齐 (align-items)</label>
                <select value={alignItems} onChange={(e) => setAlignItems(e.target.value as typeof alignItems)}>
                  <option value="flex-start">flex-start</option>
                  <option value="flex-end">flex-end</option>
                  <option value="center">center</option>
                  <option value="stretch">stretch</option>
                  <option value="baseline">baseline</option>
                </select>
              </div>
              <div className="config-item">
                <label>多行对齐 (align-content)</label>
                <select value={alignContent} onChange={(e) => setAlignContent(e.target.value as typeof alignContent)}>
                  <option value="flex-start">flex-start</option>
                  <option value="flex-end">flex-end</option>
                  <option value="center">center</option>
                  <option value="stretch">stretch</option>
                  <option value="space-between">space-between</option>
                  <option value="space-around">space-around</option>
                </select>
              </div>
              <div className="config-item">
                <label>项目间距 (gap)</label>
                <input type="number" value={gap} onChange={(e) => setGap(parseInt(e.target.value) || 0)} min={0} max={100} />
                <span style={{ marginLeft: 4 }}>px</span>
              </div>
              <div className="config-item">
                <label>项目数量</label>
                <input type="number" value={itemCount} onChange={(e) => setItemCount(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={12} />
              </div>
            </div>

            <h2>预设布局</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {presetLayouts.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  style={{
                    padding: '8px 16px',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <h2>生成的代码</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>CSS</span>
                  <button onClick={() => onCopy(generateCss())} style={{ padding: '4px 8px', fontSize: '12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>复制</button>
                </div>
                <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '12px', borderRadius: '6px', fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                  {generateCss()}
                </pre>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>HTML</span>
                  <button onClick={() => onCopy(generateHtml())} style={{ padding: '4px 8px', fontSize: '12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>复制</button>
                </div>
                <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '12px', borderRadius: '6px', fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                  {generateHtml()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>常用布局示例</h2>
            <div className="code-block">
              <pre>{`/* 水平垂直居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 两端对齐 */
.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 等分空间 */
.equal-space {
  display: flex;
}

.equal-space > * {
  flex: 1;
}

/* 固定侧边栏 + 自适应内容 */
.sidebar-layout {
  display: flex;
}

.sidebar {
  flex: 0 0 250px; /* 不放大 不缩小 固定250px */
}

.main-content {
  flex: 1; /* 占据剩余空间 */
}

/* 响应式换行 */
.wrap-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.wrap-layout > * {
  flex: 1 1 300px; /* 最小300px，可放大可缩小 */
}

/* 底部固定按钮栏 */
.bottom-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}`}</pre>
            </div>

            <h2>React 组件示例</h2>
            <div className="code-block">
              <pre>{`import styled from 'styled-components';

// Flex 容器组件
const FlexContainer = styled.div\`
  display: flex;
  flex-direction: \${props => props.direction || 'row'};
  justify-content: \${props => props.justify || 'flex-start'};
  align-items: \${props => props.align || 'stretch'};
  gap: \${props => props.gap || 0}px;
  flex-wrap: \${props => props.wrap || 'nowrap'};
\`;

// 使用示例
function App() {
  return (
    <FlexContainer justify="center" align="center" gap={16}>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </FlexContainer>
  );
}

// 或者使用 Tailwind CSS
function TailwindExample() {
  return (
    <div className="flex justify-center items-center gap-4">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </div>
  );
}`}</pre>
            </div>

            <h2>常见问题</h2>
            <div className="info-box warning">
              <strong>⚠️ 注意事项</strong>
              <ul>
                <li>flex-wrap: nowrap 时，子项会被压缩，需设置 flex-shrink: 0 防止</li>
                <li>align-content 只在多行时生效（flex-wrap: wrap）</li>
                <li>gap 属性在旧浏览器不支持，可用 margin 替代</li>
                <li>flex: 1 等于 flex: 1 1 0%，flex: auto 等于 flex: 1 1 auto</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

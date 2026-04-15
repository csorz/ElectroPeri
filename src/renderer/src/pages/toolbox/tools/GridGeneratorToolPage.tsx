import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function GridGeneratorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(2)
  const [gap, setGap] = useState(20)
  const [columnGap, setColumnGap] = useState(20)
  const [rowGap, setRowGap] = useState(20)
  const [useSeparateGap, setUseSeparateGap] = useState(false)
  const [autoFlow, setAutoFlow] = useState<'row' | 'column' | 'dense' | 'row dense' | 'column dense'>('row')
  const [justifyItems, setJustifyItems] = useState<'start' | 'end' | 'center' | 'stretch'>('stretch')
  const [alignItems, setAlignItems] = useState<'start' | 'end' | 'center' | 'stretch'>('stretch')
  const [templateColumns, setTemplateColumns] = useState('')
  const [templateRows, setTemplateRows] = useState('')
  const [useCustomTemplate, setUseCustomTemplate] = useState(false)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const generateCss = (): string => {
    const gapValue = useSeparateGap ? `${rowGap}px ${columnGap}px` : `${gap}px`
    const colTemplate = useCustomTemplate ? templateColumns : `repeat(${columns}, 1fr)`
    const rowTemplate = useCustomTemplate ? templateRows : `repeat(${rows}, auto)`

    return `.grid-container {
  display: grid;
  grid-template-columns: ${colTemplate};
  grid-template-rows: ${rowTemplate};
  gap: ${gapValue};
  grid-auto-flow: ${autoFlow};
  justify-items: ${justifyItems};
  align-items: ${alignItems};
}`
  }

  const generateHtml = (): string => {
    const totalItems = columns * rows
    const items = Array.from({ length: Math.max(totalItems, 6) }, (_, i) =>
      `  <div class="grid-item">Item ${i + 1}</div>`
    ).join('\n')

    return `<div class="grid-container">
${items}
</div>`
  }

  const presetLayouts = [
    { name: '等分 3 列', columns: 3, rows: 0, gap: 20 },
    { name: '等分 4 列', columns: 4, rows: 0, gap: 20 },
    { name: '圣杯布局', columns: 0, rows: 0, gap: 20, template: '1fr 200px 200px' },
    { name: '侧边栏布局', columns: 0, rows: 0, gap: 20, template: '250px 1fr' },
    { name: '瀑布流', columns: 0, rows: 0, gap: 15, template: 'repeat(3, 1fr)', autoFlow: 'row dense' }
  ]

  const applyPreset = (preset: typeof presetLayouts[0]) => {
    if (preset.template) {
      setUseCustomTemplate(true)
      setTemplateColumns(preset.template)
    } else {
      setUseCustomTemplate(false)
      setColumns(preset.columns)
    }
    setGap(preset.gap)
    if (preset.autoFlow) {
      setAutoFlow(preset.autoFlow as typeof autoFlow)
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📐 Grid 布局</h1>
        <p>CSS Grid 布局生成器</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>Grid 布局核心概念</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>网格容器 (Container)</h3>
                <p>设置 display: grid 的元素成为网格容器，所有直接子元素成为网格项目</p>
              </div>
              <div className="feature-card">
                <h3>网格轨道 (Track)</h3>
                <p>grid-template-columns 和 grid-template-rows 定义的行和列</p>
              </div>
              <div className="feature-card">
                <h3>网格单元 (Cell)</h3>
                <p>网格中最小的单位，由行和列交叉形成</p>
              </div>
              <div className="feature-card">
                <h3>网格区域 (Area)</h3>
                <p>一个或多个网格单元组成的矩形区域</p>
              </div>
            </div>

            <h2>布局结构图</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto auto;

  ┌─────────────────────────────────────────────────┐
  │  Grid Container                                 │
  │  ┌─────────┬───────────────────┬─────────┐      │
  │  │  1fr    │       2fr         │  1fr    │ Row 1│
  │  │ Cell 1  │      Cell 2       │ Cell 3  │      │
  │  ├─────────┼───────────────────┼─────────┤      │
  │  │  Cell 4 │      Cell 5       │ Cell 6  │ Row 2│
  │  └─────────┴───────────────────┴─────────┘      │
  │     Col 1        Col 2            Col 3         │
  └─────────────────────────────────────────────────┘

  Gap: 网格项之间的间距
              `}</pre>
            </div>

            <h2>核心属性</h2>
            <div className="info-box">
              <strong>容器属性</strong>
              <ul>
                <li><strong>grid-template-columns</strong> - 定义列的宽度和数量</li>
                <li><strong>grid-template-rows</strong> - 定义行的高度</li>
                <li><strong>gap</strong> - 网格项之间的间距</li>
                <li><strong>grid-auto-flow</strong> - 自动放置网格项的方式</li>
                <li><strong>justify-items</strong> - 水平对齐所有网格项</li>
                <li><strong>align-items</strong> - 垂直对齐所有网格项</li>
              </ul>
            </div>

            <h2>单位说明</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>单位</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>fr</code></td>
                    <td>弹性单位，按比例分配剩余空间</td>
                  </tr>
                  <tr>
                    <td><code>px</code></td>
                    <td>固定像素值</td>
                  </tr>
                  <tr>
                    <td><code>%</code></td>
                    <td>相对于容器宽度的百分比</td>
                  </tr>
                  <tr>
                    <td><code>auto</code></td>
                    <td>根据内容自动调整大小</td>
                  </tr>
                  <tr>
                    <td><code>minmax()</code></td>
                    <td>设置最小和最大值范围</td>
                  </tr>
                  <tr>
                    <td><code>repeat()</code></td>
                    <td>重复创建相同大小的轨道</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>页面整体布局</strong> - 页眉、主体、侧边栏、页脚</li>
              <li><strong>卡片列表</strong> - 等宽或不等宽的卡片排列</li>
              <li><strong>表单布局</strong> - 标签和输入框对齐</li>
              <li><strong>图片画廊</strong> - 瀑布流或等分布局</li>
              <li><strong>仪表盘</strong> - 复杂的多区域布局</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>布局预览</h2>
            <div className="grid-demo">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: useCustomTemplate ? templateColumns : `repeat(${columns}, 1fr)`,
                  gridTemplateRows: useCustomTemplate ? templateRows : `repeat(${rows}, auto)`,
                  gap: useSeparateGap ? `${rowGap}px ${columnGap}px` : `${gap}px`,
                  gridAutoFlow: autoFlow,
                  justifyItems: justifyItems,
                  alignItems: alignItems,
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '16px',
                  minHeight: '200px'
                }}
              >
                {Array.from({ length: Math.max(columns * rows, 6) }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#3498db',
                      color: '#fff',
                      padding: '16px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '14px'
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <h2>预设布局</h2>
            <div className="demo-controls">
              {presetLayouts.map((preset) => (
                <button key={preset.name} onClick={() => applyPreset(preset)} style={{ background: '#e0e0e0', color: '#333' }}>
                  {preset.name}
                </button>
              ))}
            </div>

            <h2>网格设置</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={useCustomTemplate} onChange={(e) => setUseCustomTemplate(e.target.checked)} />
                使用自定义模板
              </label>
            </div>

            {!useCustomTemplate ? (
              <div className="config-grid">
                <div className="config-item">
                  <label>列数: {columns}</label>
                  <input type="range" min="1" max="12" value={columns} onChange={(e) => setColumns(parseInt(e.target.value))} />
                </div>
                <div className="config-item">
                  <label>行数: {rows}</label>
                  <input type="range" min="0" max="12" value={rows} onChange={(e) => setRows(parseInt(e.target.value))} />
                </div>
              </div>
            ) : (
              <div className="config-grid">
                <div className="config-item">
                  <label>列模板 (grid-template-columns)</label>
                  <input type="text" value={templateColumns} onChange={(e) => setTemplateColumns(e.target.value)} placeholder="如: repeat(3, 1fr) 或 1fr 200px 200px" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="config-item">
                  <label>行模板 (grid-template-rows)</label>
                  <input type="text" value={templateRows} onChange={(e) => setTemplateRows(e.target.value)} placeholder="如: auto auto 或 100px 200px" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
              </div>
            )}

            <h2>间距设置</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={useSeparateGap} onChange={(e) => setUseSeparateGap(e.target.checked)} />
                分别设置行列间距
              </label>
            </div>

            {!useSeparateGap ? (
              <div className="config-grid">
                <div className="config-item">
                  <label>间距: {gap}px</label>
                  <input type="range" min="0" max="50" value={gap} onChange={(e) => setGap(parseInt(e.target.value))} />
                </div>
              </div>
            ) : (
              <div className="config-grid">
                <div className="config-item">
                  <label>列间距: {columnGap}px</label>
                  <input type="range" min="0" max="50" value={columnGap} onChange={(e) => setColumnGap(parseInt(e.target.value))} />
                </div>
                <div className="config-item">
                  <label>行间距: {rowGap}px</label>
                  <input type="range" min="0" max="50" value={rowGap} onChange={(e) => setRowGap(parseInt(e.target.value))} />
                </div>
              </div>
            )}

            <h2>对齐设置</h2>
            <div className="config-grid">
              <div className="config-item">
                <label>自动流 (grid-auto-flow)</label>
                <select value={autoFlow} onChange={(e) => setAutoFlow(e.target.value as typeof autoFlow)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="row">row</option>
                  <option value="column">column</option>
                  <option value="dense">dense</option>
                  <option value="row dense">row dense</option>
                  <option value="column dense">column dense</option>
                </select>
              </div>
              <div className="config-item">
                <label>水平对齐 (justify-items)</label>
                <select value={justifyItems} onChange={(e) => setJustifyItems(e.target.value as typeof justifyItems)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="start">start</option>
                  <option value="end">end</option>
                  <option value="center">center</option>
                  <option value="stretch">stretch</option>
                </select>
              </div>
              <div className="config-item">
                <label>垂直对齐 (align-items)</label>
                <select value={alignItems} onChange={(e) => setAlignItems(e.target.value as typeof alignItems)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="start">start</option>
                  <option value="end">end</option>
                  <option value="center">center</option>
                  <option value="stretch">stretch</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>生成的 CSS</h2>
            <div className="code-block">
              <pre>{generateCss()}</pre>
            </div>

            <h2>HTML 结构</h2>
            <div className="code-block">
              <pre>{generateHtml()}</pre>
            </div>

            <div className="demo-controls">
              <button onClick={() => onCopy(generateCss())}>复制 CSS</button>
              <button onClick={() => onCopy(generateHtml())} style={{ background: '#e0e0e0', color: '#333' }}>复制 HTML</button>
              <button onClick={() => onCopy(`${generateCss()}\n\n${generateHtml()}`)} style={{ background: '#e0e0e0', color: '#333' }}>复制全部</button>
            </div>

            <h2>常用布局示例</h2>
            <div className="code-block">
              <pre>{`/* 等分三列 */
.grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 圣杯布局 */
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

/* 响应式网格 */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* 瀑布流布局 */
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: masonry;
  gap: 16px;
}

/* 居中内容 */
.center-content {
  display: grid;
  place-items: center;
}

/* 间距分隔 */
.gap-split {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

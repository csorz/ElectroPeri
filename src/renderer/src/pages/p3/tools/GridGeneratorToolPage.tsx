import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function GridGeneratorToolPage() {
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
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/css" className="toolbox-back">
        ← 返回 CSS 样式工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📐</span>
          <h1>Grid 布局</h1>
        </div>
        <p className="page-sub">CSS Grid 布局生成器</p>
      </div>

      <section className="tool-card">
        {/* 预览 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: useCustomTemplate ? templateColumns : `repeat(${columns}, 1fr)`,
            gridTemplateRows: useCustomTemplate ? templateRows : `repeat(${rows}, auto)`,
            gap: useSeparateGap ? `${rowGap}px ${columnGap}px` : `${gap}px`,
            gridAutoFlow: autoFlow,
            justifyItems: justifyItems,
            alignItems: alignItems,
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
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

        {/* 预设布局 */}
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">预设布局</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {presetLayouts.map((preset) => (
              <button
                key={preset.name}
                className="btn btn-secondary"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 列行设置 */}
        <div className="tool-block">
          <div className="tool-block-title">网格设置</div>
          <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              checked={useCustomTemplate}
              onChange={(e) => setUseCustomTemplate(e.target.checked)}
            />
            使用自定义模板
          </label>

          {!useCustomTemplate ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <label className="tool-label">
                列数: {columns}
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={columns}
                  onChange={(e) => setColumns(parseInt(e.target.value))}
                />
              </label>
              <label className="tool-label">
                行数: {rows}
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                />
              </label>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              <label className="tool-label">
                列模板 (grid-template-columns)
                <input
                  type="text"
                  className="tool-input"
                  value={templateColumns}
                  onChange={(e) => setTemplateColumns(e.target.value)}
                  placeholder="如: repeat(3, 1fr) 或 1fr 200px 200px"
                />
              </label>
              <label className="tool-label">
                行模板 (grid-template-rows)
                <input
                  type="text"
                  className="tool-input"
                  value={templateRows}
                  onChange={(e) => setTemplateRows(e.target.value)}
                  placeholder="如: auto auto 或 100px 200px"
                />
              </label>
            </div>
          )}
        </div>

        {/* 间距设置 */}
        <div className="tool-block">
          <div className="tool-block-title">间距</div>
          <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              checked={useSeparateGap}
              onChange={(e) => setUseSeparateGap(e.target.checked)}
            />
            分别设置行列间距
          </label>

          {!useSeparateGap ? (
            <label className="tool-label">
              间距: {gap}px
              <input
                type="range"
                min="0"
                max="50"
                value={gap}
                onChange={(e) => setGap(parseInt(e.target.value))}
              />
            </label>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label className="tool-label">
                列间距: {columnGap}px
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={columnGap}
                  onChange={(e) => setColumnGap(parseInt(e.target.value))}
                />
              </label>
              <label className="tool-label">
                行间距: {rowGap}px
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={rowGap}
                  onChange={(e) => setRowGap(parseInt(e.target.value))}
                />
              </label>
            </div>
          )}
        </div>

        {/* 对齐设置 */}
        <div className="tool-block">
          <div className="tool-block-title">对齐方式</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <label className="tool-label">
              自动流 (grid-auto-flow)
              <select value={autoFlow} onChange={(e) => setAutoFlow(e.target.value as typeof autoFlow)}>
                <option value="row">row</option>
                <option value="column">column</option>
                <option value="dense">dense</option>
                <option value="row dense">row dense</option>
                <option value="column dense">column dense</option>
              </select>
            </label>
            <label className="tool-label">
              水平对齐 (justify-items)
              <select value={justifyItems} onChange={(e) => setJustifyItems(e.target.value as typeof justifyItems)}>
                <option value="start">start</option>
                <option value="end">end</option>
                <option value="center">center</option>
                <option value="stretch">stretch</option>
              </select>
            </label>
            <label className="tool-label">
              垂直对齐 (align-items)
              <select value={alignItems} onChange={(e) => setAlignItems(e.target.value as typeof alignItems)}>
                <option value="start">start</option>
                <option value="end">end</option>
                <option value="center">center</option>
                <option value="stretch">stretch</option>
              </select>
            </label>
          </div>
        </div>

        {/* CSS 代码 */}
        <div className="tool-block">
          <div className="tool-block-title">CSS 代码</div>
          <pre className="tool-result mono" style={{ fontSize: '12px' }}>
            {generateCss()}
          </pre>
        </div>

        {/* HTML 代码 */}
        <div className="tool-block">
          <div className="tool-block-title">HTML 代码</div>
          <pre className="tool-result mono" style={{ fontSize: '12px' }}>
            {generateHtml()}
          </pre>
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={() => onCopy(generateCss())}>
            复制 CSS
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onCopy(generateHtml())}>
            复制 HTML
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onCopy(`${generateCss()}\n\n${generateHtml()}`)}>
            复制全部
          </button>
        </div>
      </section>
    </div>
  )
}

import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function CssFormatToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')
  const [indent, setIndent] = useState(2)
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const formatCss = (css: string, indentSize: number): string => {
    let formatted = css.replace(/\/\*[\s\S]*?\*\//g, '')
    formatted = formatted.replace(/\s+/g, ' ')
    formatted = formatted.replace(/\s*\{\s*/g, ' {\n')
    formatted = formatted.replace(/;\s*/g, ';\n')
    formatted = formatted.replace(/\}\s*/g, '\n}\n')

    const lines = formatted.split('\n').map(line => line.trim()).filter(line => line)

    const indentStr = ' '.repeat(indentSize)
    let result = ''

    for (const line of lines) {
      if (line === '{') {
        result += ' {\n'
      } else if (line === '}') {
        result += '}\n\n'
      } else if (line.endsWith('{')) {
        result += line.slice(0, -1).trim() + ' {\n'
      } else if (line.includes(':')) {
        const parts = line.split(':')
        if (parts.length >= 2) {
          const prop = parts[0].trim()
          const value = parts.slice(1).join(':').trim()
          result += indentStr + prop + ': ' + value + ';\n'
        }
      } else if (line.endsWith(';')) {
        result += indentStr + line + '\n'
      }
    }

    return result.trim()
  }

  const minifyCss = (css: string): string => {
    let minified = css.replace(/\/\*[\s\S]*?\*\//g, '')
    minified = minified.replace(/\s+/g, ' ')
    minified = minified.replace(/\s*\{\s*/g, '{')
    minified = minified.replace(/\s*\}\s*/g, '}')
    minified = minified.replace(/\s*;\s*/g, ';')
    minified = minified.replace(/\s*:\s*/g, ':')
    minified = minified.replace(/;}/g, '}')
    return minified.trim()
  }

  const handleConvert = () => {
    setError(null)
    try {
      if (!input.trim()) {
        setOutput('')
        return
      }

      if (mode === 'format') {
        setOutput(formatCss(input, indent))
      } else {
        setOutput(minifyCss(input))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '处理失败')
      setOutput('')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setMode(mode === 'format' ? 'minify' : 'format')
  }

  const inputStats = {
    chars: input.length,
    lines: input ? input.split('\n').length : 0
  }

  const outputStats = {
    chars: output.length,
    lines: output ? output.split('\n').length : 0,
    saved: input.length > 0 && mode === 'minify' ? Math.round((1 - output.length / input.length) * 100) : 0
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>✨ CSS 格式化</h1>
        <p>CSS 代码格式化与压缩工具</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>CSS 代码规范</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>格式化</h3>
                <p>将压缩或混乱的 CSS 代码整理为规范、易读的格式</p>
              </div>
              <div className="feature-card">
                <h3>压缩</h3>
                <p>移除空白、注释，减小文件体积，提升加载速度</p>
              </div>
              <div className="feature-card">
                <h3>缩进风格</h3>
                <p>支持 2 空格、4 空格或 Tab 缩进</p>
              </div>
              <div className="feature-card">
                <h3>注释处理</h3>
                <p>格式化保留注释，压缩移除注释</p>
              </div>
            </div>

            <h2>格式化前后对比</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  压缩前 (可读性差):
  ┌─────────────────────────────────────────────────────┐
  │ .container{display:flex;justify-content:center;}    │
  └─────────────────────────────────────────────────────┘

  格式化后 (清晰易读):
  ┌─────────────────────────────────────────────────────┐
  │ .container {                                        │
  │   display: flex;                                    │
  │   justify-content: center;                          │
  │ }                                                   │
  └─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>CSS 编写规范</h2>
            <div className="info-box">
              <strong>推荐的代码风格</strong>
              <ul>
                <li>使用一致的缩进（推荐 2 空格）</li>
                <li>选择器与 {'{'} 之间加空格</li>
                <li>属性名后加空格再写值</li>
                <li>每个属性独占一行</li>
                <li>相关属性分组放置</li>
              </ul>
            </div>

            <h2>属性顺序建议</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>分组</th>
                    <th>属性示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>布局定位</td>
                    <td>display, position, float, flex, grid</td>
                  </tr>
                  <tr>
                    <td>盒模型</td>
                    <td>width, height, margin, padding, border</td>
                  </tr>
                  <tr>
                    <td>视觉样式</td>
                    <td>background, color, font, text</td>
                  </tr>
                  <tr>
                    <td>动画过渡</td>
                    <td>transition, animation, transform</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>最佳实践</h2>
            <ul className="scenario-list">
              <li><strong>开发环境</strong> - 使用格式化代码，方便阅读和调试</li>
              <li><strong>生产环境</strong> - 使用压缩代码，减少传输体积</li>
              <li><strong>代码审查</strong> - 统一代码风格，提高可维护性</li>
              <li><strong>版本控制</strong> - 格式化后再提交，便于 diff 比较</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>转换设置</h2>
            <div className="config-grid">
              <div className="config-item">
                <label>模式</label>
                <select value={mode} onChange={(e) => setMode(e.target.value as 'format' | 'minify')} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="format">格式化</option>
                  <option value="minify">压缩</option>
                </select>
              </div>
              {mode === 'format' && (
                <div className="config-item">
                  <label>缩进</label>
                  <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <option value={2}>2 空格</option>
                    <option value={4}>4 空格</option>
                    <option value={1}>1 制表符</option>
                  </select>
                </div>
              )}
            </div>

            {error && (
              <div className="info-box warning" style={{ marginTop: '16px' }}>
                <strong>错误</strong>
                <p>{error}</p>
              </div>
            )}

            <h2>输入 CSS</h2>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
              {inputStats.chars} 字符, {inputStats.lines} 行
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=".container { display: flex; justify-content: center; }"
              rows={10}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '13px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />

            <h2>输出结果</h2>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
              {outputStats.chars} 字符, {outputStats.lines} 行
              {mode === 'minify' && outputStats.saved > 0 && ` (压缩 ${outputStats.saved}%)`}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="输出结果..."
              rows={10}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '13px',
                resize: 'vertical',
                background: '#f8f9fa',
                boxSizing: 'border-box'
              }}
            />

            <div className="demo-controls" style={{ marginTop: '16px' }}>
              <button onClick={handleConvert}>{mode === 'format' ? '格式化' : '压缩'}</button>
              <button onClick={handleSwap} style={{ background: '#e0e0e0', color: '#333' }}>交换输入输出</button>
              {output && (
                <button onClick={() => onCopy(output)} style={{ background: '#e0e0e0', color: '#333' }}>复制结果</button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>格式化示例</h2>
            <div className="code-block">
              <pre>{`/* 格式化前 */
.container{display:flex;justify-content:center;align-items:center;padding:20px}

/* 格式化后 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}`}</pre>
            </div>

            <h2>压缩示例</h2>
            <div className="code-block">
              <pre>{`/* 压缩前 */
.header {
  background: #3498db;
  padding: 20px;
  margin-bottom: 10px;
}

.header .logo {
  font-size: 24px;
  color: white;
}

/* 压缩后 */
.header{background:#3498db;padding:20px;margin-bottom:10px}.header .logo{font-size:24px;color:white}`}</pre>
            </div>

            <h2>CSS 代码风格指南</h2>
            <div className="code-block">
              <pre>{`/* ========================================
   推荐的 CSS 代码风格
   ======================================== */

/* 1. 选择器命名：使用小写，连字符分隔 */
.main-container { }
.user-profile { }

/* 2. 属性顺序：布局 -> 盒模型 -> 视觉 -> 动画 */
.card {
  /* 布局 */
  display: flex;
  position: relative;

  /* 盒模型 */
  width: 300px;
  padding: 16px;
  margin: 10px;
  border-radius: 8px;

  /* 视觉 */
  background: #fff;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* 动画 */
  transition: transform 0.2s;
}

/* 3. 数值为 0 时省略单位 */
.no-unit {
  margin: 0;
  padding: 0;
}

/* 4. 颜色值简写 */
.color-short {
  color: #fff;      /* 而非 #ffffff */
  background: #000; /* 而非 #000000 */
}

/* 5. 相关属性分组 */
.flex-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function CssFormatToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')
  const [indent, setIndent] = useState(2)
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 简单的 CSS 格式化
  const formatCss = (css: string, indentSize: number): string => {
    // 移除注释
    let formatted = css.replace(/\/\*[\s\S]*?\*\//g, '')

    // 移除多余空白
    formatted = formatted.replace(/\s+/g, ' ')

    // 移除选择器和 { 之间的空格
    formatted = formatted.replace(/\s*\{\s*/g, ' {\n')

    // 处理属性
    formatted = formatted.replace(/;\s*/g, ';\n')
    formatted = formatted.replace(/\}\s*/g, '\n}\n')

    // 分割成行
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
        // 格式化属性
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

  // CSS 压缩
  const minifyCss = (css: string): string => {
    // 移除注释
    let minified = css.replace(/\/\*[\s\S]*?\*\//g, '')

    // 移除换行和多余空白
    minified = minified.replace(/\s+/g, ' ')

    // 移除选择器前后的空格
    minified = minified.replace(/\s*\{\s*/g, '{')
    minified = minified.replace(/\s*\}\s*/g, '}')
    minified = minified.replace(/\s*;\s*/g, ';')
    minified = minified.replace(/\s*:\s*/g, ':')

    // 移除最后一个分号（在 } 之前）
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
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/css" className="toolbox-back">
        ← 返回 CSS 样式工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">✨</span>
          <h1>CSS 格式化</h1>
        </div>
        <p className="page-sub">CSS 代码格式化与压缩</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            模式
            <select value={mode} onChange={(e) => setMode(e.target.value as 'format' | 'minify')}>
              <option value="format">格式化</option>
              <option value="minify">压缩</option>
            </select>
          </label>
          {mode === 'format' && (
            <label className="tool-label">
              缩进
              <select value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
                <option value={2}>2 空格</option>
                <option value={4}>4 空格</option>
                <option value={1}>1 制表符</option>
              </select>
            </label>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">
              输入 CSS
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {inputStats.chars} 字符, {inputStats.lines} 行
              </span>
            </div>
            <textarea
              className="tool-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=".container { display: flex; justify-content: center; }"
              rows={12}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">
              输出
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {outputStats.chars} 字符, {outputStats.lines} 行
                {mode === 'minify' && outputStats.saved > 0 && ` (压缩 ${outputStats.saved}%)`}
              </span>
            </div>
            <textarea
              className="tool-textarea"
              value={output}
              readOnly
              placeholder="输出结果..."
              rows={12}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleConvert}>
            {mode === 'format' ? '格式化' : '压缩'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleSwap}>
            交换输入输出
          </button>
          {output && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
              复制结果
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

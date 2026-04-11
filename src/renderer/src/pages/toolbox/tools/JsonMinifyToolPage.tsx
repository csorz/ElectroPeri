import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function JsonMinifyToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ original: number; minified: number; saved: string } | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleMinify = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      const original = input.length
      const minifiedLen = minified.length
      const saved = ((1 - minifiedLen / original) * 100).toFixed(1)
      setStats({ original, minified: minifiedLen, saved: original > minifiedLen ? `${saved}%` : '0%' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON 格式错误')
      setOutput('')
      setStats(null)
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/json" className="toolbox-back">
        ← 返回 JSON 处理
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🗜️</span>
          <h1>JSON 压缩</h1>
        </div>
        <p className="page-sub">JSON 数据压缩，去除空白和换行</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {stats && (
          <div className="tool-stats">
            <span>原始: {stats.original} 字符</span>
            <span>压缩后: {stats.minified} 字符</span>
            <span>节省: {stats.saved}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入 JSON</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='输入 JSON 数据...'
            rows={10}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleMinify}>
            压缩
          </button>
          {output && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
              复制结果
            </button>
          )}
        </div>

        {output && (
          <div className="tool-block">
            <div className="tool-block-title">压缩结果</div>
            <pre className="tool-result mono" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {output}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

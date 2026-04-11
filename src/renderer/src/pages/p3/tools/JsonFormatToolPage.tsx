import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function JsonFormatToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState(2)
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFormat = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON 格式错误')
      setOutput('')
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/json" className="toolbox-back">
        ← 返回 JSON 处理
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">✨</span>
          <h1>JSON 格式化</h1>
        </div>
        <p className="page-sub">JSON 数据格式化美化</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            缩进
            <select value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
              <option value={1}>1 制表符</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入 JSON</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='输入 JSON 数据，如：{"name": "test", "value": 123}'
            rows={10}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleFormat}>
            格式化
          </button>
          {output && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
              复制结果
            </button>
          )}
        </div>

        {output && (
          <div className="tool-block">
            <div className="tool-block-title">格式化结果</div>
            <pre className="tool-result mono" style={{ maxHeight: '400px', overflow: 'auto' }}>
              {output}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

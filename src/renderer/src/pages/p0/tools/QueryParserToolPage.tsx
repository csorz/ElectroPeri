import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function QueryParserToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleParse = () => {
    setError(null)
    if (!input.trim()) {
      setError('请输入要解析的 URL')
      setOutput('')
      return
    }

    try {
      let queryString = input.trim()

      // 如果输入的是完整 URL，提取 query 部分
      if (input.includes('?')) {
        const url = new URL(input)
        queryString = url.search
      } else if (!input.startsWith('?')) {
        queryString = '?' + input
      }

      const params = new URLSearchParams(queryString)
      const result: Record<string, string | string[]> = {}

      params.forEach((value, key) => {
        const existing = result[key]
        if (existing) {
          if (Array.isArray(existing)) {
            existing.push(value)
          } else {
            result[key] = [existing, value]
          }
        } else {
          result[key] = value
        }
      })

      setOutput(JSON.stringify(result, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失败')
      setOutput('')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/url" className="toolbox-back">
        ← 返回 URL 与参数
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔍</span>
          <h1>Query 参数解析</h1>
        </div>
        <p className="page-sub">将 URL Query 参数解析为 JSON 对象</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入 URL 或 Query 字符串</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入完整 URL 或 Query 字符串，如：https://example.com?name=test&age=18 或 name=test&age=18"
            rows={4}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleParse}>
            解析参数
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClear}>
            清空
          </button>
          {output && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
              复制结果
            </button>
          )}
        </div>

        {output && (
          <div className="tool-block">
            <div className="tool-block-title">解析结果 (JSON)</div>
            <pre className="tool-result mono" style={{ maxHeight: '400px', overflow: 'auto' }}>
              {output}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

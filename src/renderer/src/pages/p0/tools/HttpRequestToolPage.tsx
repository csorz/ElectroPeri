import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function HttpRequestToolPage() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET')
  const [headers, setHeaders] = useState('')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleSend = async () => {
    setError(null)
    setResponse('')
    setStatusCode(null)

    if (!url.trim()) {
      setError('请输入 URL')
      return
    }

    try {
      // 验证 URL
      new URL(url)
    } catch {
      setError('请输入有效的 URL')
      return
    }

    setLoading(true)

    try {
      const requestHeaders: Record<string, string> = {}
      if (headers.trim()) {
        try {
          Object.assign(requestHeaders, JSON.parse(headers))
        } catch {
          setError('请求头格式错误，请使用 JSON 格式')
          setLoading(false)
          return
        }
      }

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      }

      if (method !== 'GET' && body.trim()) {
        options.body = body
      }

      const res = await fetch(url, options)
      setStatusCode(res.status)

      const contentType = res.headers.get('content-type') || ''
      let data: string

      if (contentType.includes('application/json')) {
        const json = await res.json()
        data = JSON.stringify(json, null, 2)
      } else {
        data = await res.text()
      }

      setResponse(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/http" className="toolbox-back">
        ← 返回请求调试
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📤</span>
          <h1>HTTP 请求</h1>
        </div>
        <p className="page-sub">发送 HTTP/HTTPS 请求测试 API</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            方法
            <select value={method} onChange={(e) => setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </label>
        </div>

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">URL</div>
          <input
            type="text"
            className="tool-textarea"
            style={{ height: 'auto', padding: '12px' }}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="输入请求 URL，如：https://api.example.com/data"
          />
        </div>

        {method !== 'GET' && (
          <div className="tool-block">
            <div className="tool-block-title">请求头 (JSON 格式)</div>
            <textarea
              className="tool-textarea mono"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
              rows={3}
            />
          </div>
        )}

        {method !== 'GET' && (
          <div className="tool-block">
            <div className="tool-block-title">请求体</div>
            <textarea
              className="tool-textarea mono"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="输入请求体内容..."
              rows={5}
            />
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleSend} disabled={loading}>
            {loading ? '请求中...' : '发送请求'}
          </button>
          {response && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(response)}>
              复制响应
            </button>
          )}
        </div>

        {statusCode !== null && (
          <div className="tool-block">
            <div className="tool-block-title">
              响应 (状态码: {statusCode})
            </div>
            <pre className="tool-result mono" style={{ maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {response}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

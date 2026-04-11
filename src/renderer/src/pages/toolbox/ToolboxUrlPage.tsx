import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import CryptoJS from 'crypto-js'
import { copyToClipboard } from './clipboard'
import './toolbox.css'

export default function ToolboxUrlPage() {
  const [urlInput, setUrlInput] = useState('')
  const [urlOutput, setUrlOutput] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)

  const [b64Input, setB64Input] = useState('')
  const [b64Output, setB64Output] = useState('')
  const [b64Error, setB64Error] = useState<string | null>(null)

  const [queryInput, setQueryInput] = useState('')
  const [queryOutput, setQueryOutput] = useState('')
  const [queryError, setQueryError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleUrlEncodeComponent = () => {
    setUrlError(null)
    try {
      setUrlOutput(encodeURIComponent(urlInput))
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : '编码失败')
    }
  }

  const handleUrlDecodeComponent = () => {
    setUrlError(null)
    try {
      setUrlOutput(decodeURIComponent(urlInput))
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : '解码失败')
    }
  }

  const handleUrlEncodeUri = () => {
    setUrlError(null)
    try {
      setUrlOutput(encodeURI(urlInput))
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : '编码失败')
    }
  }

  const handleUrlDecodeUri = () => {
    setUrlError(null)
    try {
      setUrlOutput(decodeURI(urlInput))
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : '解码失败')
    }
  }

  const handleBase64Encode = () => {
    setB64Error(null)
    try {
      setB64Output(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(b64Input)))
    } catch (e) {
      setB64Error(e instanceof Error ? e.message : 'Base64 编码失败')
    }
  }

  const handleBase64Decode = () => {
    setB64Error(null)
    try {
      const parsed = CryptoJS.enc.Base64.parse(b64Input.trim())
      setB64Output(CryptoJS.enc.Utf8.stringify(parsed))
    } catch (e) {
      setB64Error(e instanceof Error ? e.message : 'Base64 解码失败')
    }
  }

  const handleParseQuery = () => {
    setQueryError(null)
    try {
      let search = queryInput.trim()
      const q = search.indexOf('?')
      if (q >= 0) search = search.slice(q + 1)
      const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      const obj: Record<string, string> = {}
      sp.forEach((v, k) => {
        obj[k] = v
      })
      setQueryOutput(JSON.stringify(obj, null, 2))
    } catch (e) {
      setQueryError(e instanceof Error ? e.message : '解析失败')
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox" className="toolbox-back">
        ← 返回工具箱概览
      </Link>
      <div className="page-header">
        <h1>3. URL 与参数处理</h1>
        <p className="page-sub">URL 编码解码、Base64、Query 字符串解析为 JSON 对象</p>
      </div>

      <div className="toolbox-grid">
        <section className="tool-card">
          <h2>URL 编码 / 解码</h2>
          <p className="tool-desc">
            组件级：<code>encodeURIComponent</code> / <code>decodeURIComponent</code>；URI 级：
            <code>encodeURI</code> / <code>decodeURI</code>
          </p>
          {urlError && (
            <div className="error-message">
              <span>❌ {urlError}</span>
            </div>
          )}
          <textarea
            className="tool-textarea"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="粘贴 URL 或片段..."
            rows={5}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleUrlEncodeComponent}>
              编码（组件）
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleUrlDecodeComponent}>
              解码（组件）
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleUrlEncodeUri}>
              编码（URI）
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleUrlDecodeUri}>
              解码（URI）
            </button>
            {urlOutput && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(urlOutput)}>
                复制输出
              </button>
            )}
          </div>
          {urlOutput && <textarea className="tool-textarea tool-output" readOnly value={urlOutput} rows={5} />}
        </section>

        <section className="tool-card">
          <h2>Base64</h2>
          <p className="tool-desc">UTF-8 文本与 Base64 互转</p>
          {b64Error && (
            <div className="error-message">
              <span>❌ {b64Error}</span>
            </div>
          )}
          <textarea
            className="tool-textarea"
            value={b64Input}
            onChange={(e) => setB64Input(e.target.value)}
            placeholder="明文或 Base64..."
            rows={5}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleBase64Encode}>
              编码
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleBase64Decode}>
              解码
            </button>
            {b64Output && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(b64Output)}>
                复制输出
              </button>
            )}
          </div>
          {b64Output && <textarea className="tool-textarea tool-output" readOnly value={b64Output} rows={6} />}
        </section>

        <section className="tool-card" style={{ gridColumn: '1 / -1' }}>
          <h2>Query 解析</h2>
          <p className="tool-desc">粘贴完整 URL（含 ?）或仅 query 段，解析为键值对象（JSON）</p>
          {queryError && (
            <div className="error-message">
              <span>❌ {queryError}</span>
            </div>
          )}
          <textarea
            className="tool-textarea"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="例如 https://a.com?x=1&y=2 或 x=1&y=2"
            rows={3}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleParseQuery}>
              解析为 JSON
            </button>
            {queryOutput && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(queryOutput)}>
                复制输出
              </button>
            )}
          </div>
          {queryOutput && <textarea className="tool-textarea tool-output" readOnly value={queryOutput} rows={10} />}
        </section>
      </div>
    </div>
  )
}

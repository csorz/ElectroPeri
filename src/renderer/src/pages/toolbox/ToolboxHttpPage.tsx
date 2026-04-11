import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from './clipboard'
import './toolbox.css'

function parseHeaders(block: string): HeadersInit {
  const h = new Headers()
  const lines = block.split(/\r?\n/)
  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    const i = t.indexOf(':')
    if (i <= 0) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim()
    if (k) h.append(k, v)
  }
  return h
}

export default function ToolboxHttpPage() {
  const abortRef = useRef<AbortController | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const [method, setMethod] = useState('GET')
  const [httpUrl, setHttpUrl] = useState('https://httpbin.org/get')
  const [httpHeaders, setHttpHeaders] = useState('Accept: application/json')
  const [httpBody, setHttpBody] = useState('')
  const [httpOut, setHttpOut] = useState('')
  const [httpBusy, setHttpBusy] = useState(false)
  const [httpError, setHttpError] = useState<string | null>(null)

  const [wsUrl, setWsUrl] = useState('wss://echo.websocket.events/')
  const [wsMsg, setWsMsg] = useState('hello')
  const [wsLog, setWsLog] = useState('')
  const [wsConnected, setWsConnected] = useState(false)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const appendWs = useCallback((line: string) => {
    setWsLog((p) => `${p}${line}\n`)
  }, [])

  const handleFetch = async () => {
    setHttpError(null)
    setHttpOut('')
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setHttpBusy(true)
    try {
      const headers = parseHeaders(httpHeaders)
      const init: RequestInit = { method, headers, signal: ac.signal }
      if (method !== 'GET' && method !== 'HEAD' && httpBody.length > 0) {
        init.body = httpBody
      }
      const res = await fetch(httpUrl, init)
      const text = await res.text()
      const headerLines: string[] = []
      res.headers.forEach((v, k) => headerLines.push(`${k}: ${v}`))
      setHttpOut(
        [`HTTP ${res.status} ${res.statusText}`, '', '--- Response headers ---', ...headerLines, '', '--- Body ---', text].join(
          '\n'
        )
      )
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        setHttpError('请求已取消')
      } else {
        setHttpError(e instanceof Error ? e.message : '请求失败')
      }
    } finally {
      setHttpBusy(false)
    }
  }

  const handleAbort = () => {
    abortRef.current?.abort()
  }

  const handleWsConnect = () => {
    setHttpError(null)
    wsRef.current?.close()
    appendWs(`[连接] ${wsUrl}`)
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      ws.onopen = () => {
        setWsConnected(true)
        appendWs('[已连接]')
      }
      ws.onmessage = (ev) => {
        appendWs(`[收] ${typeof ev.data === 'string' ? ev.data : '[binary]'}`)
      }
      ws.onerror = () => {
        appendWs('[错误]')
      }
      ws.onclose = () => {
        setWsConnected(false)
        appendWs('[已断开]')
      }
    } catch (e) {
      appendWs(`[异常] ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const handleWsDisconnect = () => {
    wsRef.current?.close()
    wsRef.current = null
    setWsConnected(false)
  }

  const handleWsSend = () => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(wsMsg)
    appendWs(`[发] ${wsMsg}`)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox" className="toolbox-back">
        ← 返回工具箱概览
      </Link>
      <div className="page-header">
        <h1>5. 请求调试与接口联调</h1>
        <p className="page-sub">HTTP（fetch）与 WebSocket 简易调试；跨域行为与浏览器一致</p>
      </div>

      {httpError && (
        <div className="error-message" style={{ marginBottom: 16 }}>
          <span>❌ {httpError}</span>
        </div>
      )}

      <div className="toolbox-grid">
        <section className="tool-card">
          <h2>HTTP</h2>
          <div className="tool-row tool-inline">
            <label className="tool-label">
              方法
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
              </select>
            </label>
          </div>
          <label className="tool-label">
            URL
            <input
              type="text"
              value={httpUrl}
              onChange={(e) => setHttpUrl(e.target.value)}
              style={{ maxWidth: '100%', width: '100%' }}
            />
          </label>
          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 12 }}>
            <div className="tool-block-title">请求头（每行 Key: Value）</div>
            <textarea
              className="tool-textarea"
              value={httpHeaders}
              onChange={(e) => setHttpHeaders(e.target.value)}
              rows={4}
            />
          </div>
          <div className="tool-block">
            <div className="tool-block-title">请求体（GET/HEAD 忽略）</div>
            <textarea
              className="tool-textarea"
              value={httpBody}
              onChange={(e) => setHttpBody(e.target.value)}
              placeholder='例如 {"a":1}'
              rows={5}
            />
          </div>
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleFetch} disabled={httpBusy}>
              {httpBusy ? '请求中...' : '发送'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleAbort} disabled={!httpBusy}>
              取消
            </button>
            {httpOut && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(httpOut)}>
                复制响应
              </button>
            )}
          </div>
          {httpOut && <textarea className="tool-textarea tool-output" readOnly value={httpOut} rows={16} />}
        </section>

        <section className="tool-card">
          <h2>WebSocket</h2>
          <p className="tool-desc">示例地址为公开 echo 服务，可按需替换</p>
          <label className="tool-label">
            WS URL
            <input type="text" value={wsUrl} onChange={(e) => setWsUrl(e.target.value)} style={{ maxWidth: '100%' }} />
          </label>
          <div className="tool-actions" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-primary" onClick={handleWsConnect} disabled={wsConnected}>
              连接
            </button>
            <button type="button" className="btn btn-danger" onClick={handleWsDisconnect} disabled={!wsConnected}>
              断开
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(wsLog)} disabled={!wsLog}>
              复制日志
            </button>
          </div>
          <div className="tool-block">
            <div className="tool-block-title">发送内容</div>
            <textarea className="tool-textarea" value={wsMsg} onChange={(e) => setWsMsg(e.target.value)} rows={3} />
            <div className="tool-actions">
              <button type="button" className="btn btn-primary" onClick={handleWsSend} disabled={!wsConnected}>
                发送
              </button>
            </div>
          </div>
          <textarea className="tool-textarea tool-output" readOnly value={wsLog} rows={14} placeholder="日志..." />
        </section>
      </div>
    </div>
  )
}

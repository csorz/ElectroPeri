import { useCallback, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function WebSocketToolPage() {
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${log}`])
  }

  const handleConnect = () => {
    setError(null)

    if (!url.trim()) {
      setError('请输入 WebSocket URL')
      return
    }

    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      setError('URL 必须以 ws:// 或 wss:// 开头')
      return
    }

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        addLog('✅ 连接成功')
      }

      ws.onmessage = (event) => {
        addLog(`📨 收到消息: ${event.data}`)
      }

      ws.onclose = (event) => {
        setConnected(false)
        addLog(`🔌 连接关闭 (code: ${event.code}, reason: ${event.reason || 'N/A'})`)
        wsRef.current = null
      }

      ws.onerror = () => {
        addLog('❌ 连接错误')
        setConnected(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '连接失败')
    }
  }

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
    addLog('🔌 主动断开连接')
  }

  const handleSend = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket 未连接')
      return
    }

    if (!message.trim()) {
      setError('请输入要发送的消息')
      return
    }

    wsRef.current.send(message)
    addLog(`📤 发送消息: ${message}`)
    setMessage('')
  }

  const handleClear = () => {
    setLogs([])
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/http" className="toolbox-back">
        ← 返回请求调试
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔌</span>
          <h1>WebSocket 测试</h1>
        </div>
        <p className="page-sub">WebSocket 连接测试与消息收发</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">WebSocket URL</div>
          <input
            type="text"
            className="tool-textarea"
            style={{ height: 'auto', padding: '12px' }}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="输入 WebSocket URL，如：wss://echo.websocket.org"
            disabled={connected}
          />
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-actions">
          {!connected ? (
            <button type="button" className="btn btn-primary" onClick={handleConnect}>
              连接
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={handleDisconnect}>
              断开连接
            </button>
          )}
        </div>

        {connected && (
          <>
            <div className="tool-block">
              <div className="tool-block-title">发送消息</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="tool-textarea"
                  style={{ flex: 1, height: 'auto', padding: '12px' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="输入要发送的消息..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button type="button" className="btn btn-primary" onClick={handleSend}>
                  发送
                </button>
              </div>
            </div>
          </>
        )}

        <div className="tool-block">
          <div className="tool-block-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>日志</span>
            <span style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 8px' }}
                onClick={() => onCopy(logs.join('\n'))}
              >
                复制日志
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 8px' }}
                onClick={handleClear}
              >
                清空
              </button>
            </span>
          </div>
          <div
            className="tool-result mono"
            style={{
              minHeight: '150px',
              maxHeight: '300px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              fontSize: '13px',
            }}
          >
            {logs.length === 0 ? (
              <span style={{ color: '#888' }}>暂无日志</span>
            ) : (
              logs.join('\n')
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

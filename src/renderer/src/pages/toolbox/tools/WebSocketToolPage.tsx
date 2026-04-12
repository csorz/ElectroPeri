import { useCallback, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

type LogType = 'send' | 'receive' | 'system' | 'error'

interface LogEntry {
  id: number
  timestamp: string
  type: LogType
  message: string
  isBinary?: boolean
}

export default function WebSocketToolPage() {
  // Connection config
  const [url, setUrl] = useState('')
  const [protocols, setProtocols] = useState('')
  const [autoReconnect, setAutoReconnect] = useState(false)
  const [reconnectInterval, setReconnectInterval] = useState(3000)
  const [heartbeat, setHeartbeat] = useState(false)
  const [heartbeatInterval, setHeartbeatInterval] = useState(30000)
  const [heartbeatMessage, setHeartbeatMessage] = useState('ping')

  // Connection state
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Message
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'text' | 'json'>('text')

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logFilter, setLogFilter] = useState('')
  const logIdRef = useRef(0)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Statistics
  const [sentCount, setSentCount] = useState(0)
  const [receivedCount, setReceivedCount] = useState(0)
  const [duration, setDuration] = useState(0)

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const intentionalCloseRef = useRef(false)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const addLog = useCallback((type: LogType, message: string, isBinary: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString()
    logIdRef.current += 1
    setLogs((prev) => [...prev, { id: logIdRef.current, timestamp, type, message, isBinary }])
  }, [])

  // Auto-scroll to latest log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const formatJson = (str: string): { formatted: string; isJson: boolean } => {
    try {
      const parsed = JSON.parse(str)
      return { formatted: JSON.stringify(parsed, null, 2), isJson: true }
    } catch {
      return { formatted: str, isJson: false }
    }
  }

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
  }, [])

  const startHeartbeat = useCallback(() => {
    if (!heartbeat || !heartbeatInterval || !heartbeatMessage.trim()) return

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(heartbeatMessage)
        addLog('send', `[心跳] ${heartbeatMessage}`)
        setSentCount((prev) => prev + 1)
      }
    }, heartbeatInterval)
  }, [heartbeat, heartbeatInterval, heartbeatMessage, addLog])

  const startDurationTimer = useCallback(() => {
    durationIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)
  }, [])

  const handleConnect = async () => {
    setError(null)
    intentionalCloseRef.current = false

    if (!url.trim()) {
      setError('请输入 WebSocket URL')
      return
    }

    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      setError('URL 必须以 ws:// 或 wss:// 开头')
      return
    }

    setConnecting(true)
    addLog('system', `正在连接 ${url}...`)

    try {
      const protocolList = protocols
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

      const ws = protocolList.length > 0 ? new WebSocket(url, protocolList) : new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setConnecting(false)
        setSentCount(0)
        setReceivedCount(0)
        setDuration(0)
        addLog('system', '连接成功')
        startHeartbeat()
        startDurationTimer()
      }

      ws.onmessage = (event) => {
        const isBinary = event.data instanceof ArrayBuffer || event.data instanceof Blob

        if (isBinary) {
          addLog('receive', '[二进制数据]', true)
        } else {
          const { formatted, isJson } = formatJson(event.data)
          addLog('receive', isJson ? formatted : event.data)
        }
        setReceivedCount((prev) => prev + 1)
      }

      ws.onclose = (event) => {
        setConnected(false)
        setConnecting(false)
        addLog('system', `连接关闭 (code: ${event.code}${event.reason ? `, ${event.reason}` : ''})`)
        wsRef.current = null
        clearTimers()

        if (autoReconnect && !intentionalCloseRef.current && reconnectInterval > 0) {
          addLog('system', `将在 ${reconnectInterval / 1000} 秒后自动重连...`)
          reconnectTimeoutRef.current = setTimeout(() => {
            handleConnect()
          }, reconnectInterval)
        }
      }

      ws.onerror = () => {
        addLog('error', '连接错误')
        setConnected(false)
        setConnecting(false)
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : '连接失败'
      setError(errMsg)
      addLog('error', errMsg)
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    intentionalCloseRef.current = true
    clearTimers()

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
    addLog('system', '已断开连接')
  }

  const handleSend = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket 未连接')
      return
    }

    if (!message.trim()) {
      setError('请输入要发送的消息')
      return
    }

    try {
      wsRef.current.send(message)
      const { formatted, isJson } = formatJson(message)
      addLog('send', isJson ? formatted : message)
      setSentCount((prev) => prev + 1)
      setMessage('')
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : '发送失败'
      setError(errMsg)
      addLog('error', `发送失败: ${errMsg}`)
    }
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  const handleCopyLogs = () => {
    const text = logs
      .map((log) => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`)
      .join('\n')
    onCopy(text)
  }

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const filteredLogs = logFilter.trim()
    ? logs.filter((log) => log.message.includes(logFilter))
    : logs

  const getLogTypeColor = (type: LogType): string => {
    switch (type) {
      case 'send':
        return '#81c784'
      case 'receive':
        return '#ffb74d'
      case 'system':
        return '#4fc3f7'
      case 'error':
        return '#e57373'
      default:
        return '#fff'
    }
  }

  const getLogTypeBg = (type: LogType): string => {
    switch (type) {
      case 'send':
        return '#e8f5e9'
      case 'receive':
        return '#fff8e1'
      case 'system':
        return '#e3f2fd'
      case 'error':
        return '#ffebee'
      default:
        return '#fff'
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [clearTimers])

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/http" className="toolbox-back">
        返回请求调试
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔌</span>
          <h1>WebSocket 测试</h1>
        </div>
        <p className="page-sub">WebSocket 连接测试与消息收发</p>
      </div>

      <section className="tool-card">
        {/* Connection Status Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: connected ? '#e8f5e9' : connecting ? '#fff8e1' : '#ffebee',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: connected ? '#4caf50' : connecting ? '#ff9800' : '#f44336',
              boxShadow: connected ? '0 0 8px #4caf50' : 'none',
            }}
          />
          <span style={{ fontWeight: 500, color: connected ? '#2e7d32' : connecting ? '#f57c00' : '#c62828' }}>
            {connected ? '已连接' : connecting ? '连接中...' : '未连接'}
          </span>
          {connected && (
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#666' }}>
              发送: {sentCount} | 接收: {receivedCount} | 持续: {formatDuration(duration)}
            </span>
          )}
        </div>

        {/* Connection Config Section */}
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">连接配置</div>

          <div className="tool-row">
            <label className="tool-label">
              WebSocket URL
              <input
                type="text"
                className="tool-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="例如: wss://echo.websocket.org"
                disabled={connected || connecting}
              />
            </label>
          </div>

          <div className="tool-inline">
            <label className="tool-label">
              子协议 (可选)
              <input
                type="text"
                className="tool-input"
                value={protocols}
                onChange={(e) => setProtocols(e.target.value)}
                placeholder="逗号分隔，如: chat, superchat"
                disabled={connected || connecting}
              />
            </label>
          </div>

          <div className="tool-inline">
            <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={autoReconnect}
                onChange={(e) => setAutoReconnect(e.target.checked)}
                disabled={connected || connecting}
              />
              自动重连
            </label>

            {autoReconnect && (
              <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                重连间隔
                <input
                  type="number"
                  className="tool-input"
                  style={{ width: 80 }}
                  value={reconnectInterval}
                  onChange={(e) => setReconnectInterval(parseInt(e.target.value) || 3000)}
                  min={1000}
                  step={1000}
                  disabled={connected || connecting}
                />
                ms
              </label>
            )}
          </div>

          <div className="tool-inline">
            <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={heartbeat}
                onChange={(e) => setHeartbeat(e.target.checked)}
                disabled={connected || connecting}
              />
              心跳检测
            </label>

            {heartbeat && (
              <>
                <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  间隔
                  <input
                    type="number"
                    className="tool-input"
                    style={{ width: 80 }}
                    value={heartbeatInterval}
                    onChange={(e) => setHeartbeatInterval(parseInt(e.target.value) || 30000)}
                    min={1000}
                    step={1000}
                    disabled={connected || connecting}
                  />
                  ms
                </label>
                <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  消息
                  <input
                    type="text"
                    className="tool-input"
                    style={{ width: 120 }}
                    value={heartbeatMessage}
                    onChange={(e) => setHeartbeatMessage(e.target.value)}
                    placeholder="ping"
                    disabled={connected || connecting}
                  />
                </label>
              </>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <div className="tool-actions">
            {!connected ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConnect}
                disabled={connecting}
              >
                {connecting ? '连接中...' : '连接'}
              </button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={handleDisconnect}>
                断开连接
              </button>
            )}
          </div>
        </div>

        {/* Send Message Section (visible when connected) */}
        {connected && (
          <div className="tool-block">
            <div className="tool-block-title">发送消息</div>

            <div className="tool-inline" style={{ marginBottom: 8 }}>
              <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                消息类型
                <select
                  className="tool-input"
                  style={{ width: 100 }}
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as 'text' | 'json')}
                >
                  <option value="text">文本</option>
                  <option value="json">JSON</option>
                </select>
              </label>
            </div>

            <div className="tool-row">
              <textarea
                className="tool-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={messageType === 'json' ? '输入 JSON 格式消息...' : '输入要发送的消息...'}
                rows={4}
                style={{ fontFamily: messageType === 'json' ? 'monospace' : 'inherit' }}
              />
            </div>

            <div className="tool-actions">
              <button type="button" className="btn btn-primary" onClick={handleSend}>
                发送
              </button>
              {messageType === 'json' && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    try {
                      const formatted = JSON.stringify(JSON.parse(message), null, 2)
                      setMessage(formatted)
                    } catch {
                      setError('JSON 格式错误')
                    }
                  }}
                >
                  格式化 JSON
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Log Section */}
        <div className="tool-block">
          <div
            className="tool-block-title"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>消息日志</span>
            <span style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyLogs}
              >
                复制
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClearLogs}
              >
                清空
              </button>
            </span>
          </div>

          <div className="tool-row">
            <input
              type="text"
              className="tool-input"
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              placeholder="按消息内容过滤..."
            />
          </div>

          <div
            ref={logContainerRef}
            className="tool-result mono"
            style={{
              minHeight: '200px',
              maxHeight: '400px',
              overflow: 'auto',
              fontSize: '12px',
              lineHeight: 1.6
            }}
          >
            {filteredLogs.length === 0 ? (
              <span style={{ color: '#888' }}>暂无日志</span>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #eee',
                    background: getLogTypeBg(log.type),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: '#888', fontSize: '11px' }}>[{log.timestamp}]</span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: getLogTypeColor(log.type),
                        color: '#fff',
                        textTransform: 'uppercase'
                      }}
                    >
                      {log.type === 'send' ? '发送' : log.type === 'receive' ? '接收' : log.type === 'system' ? '系统' : '错误'}
                    </span>
                    {log.isBinary && (
                      <span
                        style={{
                          fontSize: '10px',
                          background: '#9c27b0',
                          color: '#fff',
                          padding: '1px 6px',
                          borderRadius: '3px',
                        }}
                      >
                        二进制
                      </span>
                    )}
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'inherit',
                      color: log.type === 'error' ? '#c62828' : '#333',
                    }}
                  >
                    {log.message}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <div className="tool-notice">
        <p>💡 提示：可以使用 wss://echo.websocket.org 测试 WebSocket 连接，该服务会原样返回发送的消息。</p>
      </div>
    </div>
  )
}

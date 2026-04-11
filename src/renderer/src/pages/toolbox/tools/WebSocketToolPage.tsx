import { useCallback, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface LogEntry {
  id: number
  timestamp: string
  type: 'sent' | 'received' | 'system' | 'error'
  message: string
  isBinary?: boolean
  rawMessage?: string | ArrayBuffer | Blob
}

interface ConnectionStats {
  sentCount: number
  receivedCount: number
  connectedAt: Date | null
}

export default function WebSocketToolPage() {
  // Basic state
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Advanced options state
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [protocols, setProtocols] = useState('')
  const [autoReconnect, setAutoReconnect] = useState(false)
  const [reconnectInterval, setReconnectInterval] = useState(3000)
  const [heartbeat, setHeartbeat] = useState(false)
  const [heartbeatInterval, setHeartbeatInterval] = useState(30000)
  const [heartbeatMessage, setHeartbeatMessage] = useState('ping')

  // Statistics
  const [stats, setStats] = useState<ConnectionStats>({
    sentCount: 0,
    receivedCount: 0,
    connectedAt: null
  })
  const [duration, setDuration] = useState(0)

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const logIdRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const intentionalCloseRef = useRef(false)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const addLog = useCallback((
    type: LogEntry['type'],
    message: string,
    isBinary: boolean = false,
    rawMessage?: string | ArrayBuffer | Blob
  ) => {
    const timestamp = new Date().toLocaleTimeString()
    const id = ++logIdRef.current
    setLogs((prev) => [...prev, { id, timestamp, type, message, isBinary, rawMessage }])
  }, [])

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
        addLog('sent', `[Heartbeat] ${heartbeatMessage}`)
        setStats((prev) => ({ ...prev, sentCount: prev.sentCount + 1 }))
      }
    }, heartbeatInterval)
  }, [heartbeat, heartbeatInterval, heartbeatMessage, addLog])

  const startDurationTimer = useCallback(() => {
    durationIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)
  }, [])

  const handleConnect = useCallback(() => {
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

    try {
      // Parse protocols
      const protocolList = protocols
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

      const ws = protocolList.length > 0 ? new WebSocket(url, protocolList) : new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setStats({ sentCount: 0, receivedCount: 0, connectedAt: new Date() })
        setDuration(0)
        addLog('system', '连接成功')
        startHeartbeat()
        startDurationTimer()
      }

      ws.onmessage = (event) => {
        const isBinary = event.data instanceof ArrayBuffer || event.data instanceof Blob

        if (isBinary) {
          addLog('received', '[Binary Data]', true, event.data)
        } else {
          const { formatted, isJson } = formatJson(event.data)
          if (isJson) {
            addLog('received', formatted, false, event.data)
          } else {
            addLog('received', event.data, false, event.data)
          }
        }
        setStats((prev) => ({ ...prev, receivedCount: prev.receivedCount + 1 }))
      }

      ws.onclose = (event) => {
        setConnected(false)
        addLog('system', `连接关闭 (code: ${event.code}, reason: ${event.reason || 'N/A'})`)
        wsRef.current = null
        clearTimers()

        // Auto reconnect if enabled and not intentional close
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
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '连接失败')
    }
  }, [url, protocols, autoReconnect, reconnectInterval, addLog, clearTimers, startHeartbeat, startDurationTimer])

  const handleDisconnect = useCallback(() => {
    intentionalCloseRef.current = true
    clearTimers()

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
    addLog('system', '主动断开连接')
  }, [addLog, clearTimers])

  const handleSend = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket 未连接')
      return
    }

    if (!message.trim()) {
      setError('请输入要发送的消息')
      return
    }

    wsRef.current.send(message)
    const { formatted, isJson } = formatJson(message)
    addLog('sent', isJson ? formatted : message, false, message)
    setStats((prev) => ({ ...prev, sentCount: prev.sentCount + 1 }))
    setMessage('')
  }, [message, addLog])

  const handleClear = useCallback(() => {
    setLogs([])
  }, [])

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const getLogTypeIcon = (type: LogEntry['type']): string => {
    switch (type) {
      case 'sent':
        return '📤'
      case 'received':
        return '📨'
      case 'system':
        return 'ℹ️'
      case 'error':
        return '❌'
    }
  }

  const getLogTypeClass = (type: LogEntry['type']): string => {
    switch (type) {
      case 'sent':
        return 'log-sent'
      case 'received':
        return 'log-received'
      case 'system':
        return 'log-system'
      case 'error':
        return 'log-error'
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
        {/* Connection Status Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: connected ? '#e8f5e9' : '#ffebee',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: connected ? '#4caf50' : '#f44336',
              boxShadow: connected ? '0 0 8px #4caf50' : 'none',
            }}
          />
          <span style={{ fontWeight: 500, color: connected ? '#2e7d32' : '#c62828' }}>
            {connected ? '已连接' : '未连接'}
          </span>
          {connected && (
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#666' }}>
              已发送: {stats.sentCount} | 已接收: {stats.receivedCount} | 持续时间: {formatDuration(duration)}
            </span>
          )}
        </div>

        {/* URL Input */}
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

        {/* Advanced Options Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼ 隐藏高级选项' : '▶ 显示高级选项'}
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div
            style={{
              background: '#f5f5f5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Protocols */}
            <div className="tool-row" style={{ marginBottom: '12px' }}>
              <label className="tool-label" style={{ minWidth: '120px' }}>
                子协议
              </label>
              <input
                type="text"
                className="tool-input"
                style={{ flex: 1 }}
                value={protocols}
                onChange={(e) => setProtocols(e.target.value)}
                placeholder="逗号分隔的子协议，如：chat, superchat"
                disabled={connected}
              />
            </div>

            {/* Auto Reconnect */}
            <div className="tool-row" style={{ marginBottom: '12px', alignItems: 'center' }}>
              <label className="tool-label" style={{ minWidth: '120px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={autoReconnect}
                  onChange={(e) => setAutoReconnect(e.target.checked)}
                  disabled={connected}
                />
                自动重连
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '13px', color: '#666' }}>间隔:</span>
                <input
                  type="number"
                  className="tool-input"
                  style={{ width: '100px' }}
                  value={reconnectInterval}
                  onChange={(e) => setReconnectInterval(Number(e.target.value) || 3000)}
                  min={1000}
                  step={1000}
                  disabled={connected}
                />
                <span style={{ fontSize: '13px', color: '#666' }}>ms</span>
              </div>
            </div>

            {/* Heartbeat */}
            <div className="tool-row" style={{ alignItems: 'flex-start' }}>
              <label className="tool-label" style={{ minWidth: '120px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={heartbeat}
                  onChange={(e) => setHeartbeat(e.target.checked)}
                  disabled={connected}
                />
                心跳检测
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>间隔:</span>
                  <input
                    type="number"
                    className="tool-input"
                    style={{ width: '100px' }}
                    value={heartbeatInterval}
                    onChange={(e) => setHeartbeatInterval(Number(e.target.value) || 30000)}
                    min={1000}
                    step={1000}
                    disabled={connected}
                  />
                  <span style={{ fontSize: '13px', color: '#666' }}>ms</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>消息:</span>
                  <input
                    type="text"
                    className="tool-input"
                    style={{ flex: 1 }}
                    value={heartbeatMessage}
                    onChange={(e) => setHeartbeatMessage(e.target.value)}
                    placeholder="心跳消息，如：ping"
                    disabled={connected}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
                  placeholder="输入要发送的消息... (支持 JSON 格式)"
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
                onClick={() => onCopy(logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n'))}
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
              maxHeight: '400px',
              overflow: 'auto',
              fontSize: '13px',
            }}
          >
            {logs.length === 0 ? (
              <span style={{ color: '#888' }}>暂无日志</span>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={getLogTypeClass(log.type)}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <span style={{ flexShrink: 0 }}>{getLogTypeIcon(log.type)}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#888', fontSize: '12px' }}>[{log.timestamp}]</span>
                    {log.isBinary && (
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '11px',
                          background: '#9c27b0',
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Binary
                      </span>
                    )}
                    <pre
                      style={{
                        margin: '4px 0 0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'inherit',
                        color: log.type === 'sent' ? '#1565c0' : log.type === 'error' ? '#c62828' : 'inherit',
                      }}
                    >
                      {log.message}
                    </pre>
                  </div>
                  {log.rawMessage && !log.isBinary && typeof log.rawMessage === 'string' && (
                    <button
                      type="button"
                      onClick={() => onCopy(log.rawMessage as string)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 0.5,
                        fontSize: '12px',
                      }}
                      title="复制原始消息"
                    >
                      📋
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Inline styles for log types */}
      <style>{`
        .log-sent {
          background: #e3f2fd;
        }
        .log-received {
          background: #f1f8e9;
        }
        .log-system {
          background: #fff8e1;
        }
        .log-error {
          background: #ffebee;
        }
      `}</style>
    </div>
  )
}

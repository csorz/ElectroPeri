import { useState, useRef, useEffect, useCallback } from 'react'
import './ToolPage.css'

type LogType = 'send' | 'receive' | 'system' | 'error'

interface LogEntry {
  id: number
  timestamp: string
  type: LogType
  message: string
  isBinary?: boolean
}

export default function WebSocketToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

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

  const addLog = useCallback((type: LogType, message: string, isBinary: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString()
    logIdRef.current += 1
    setLogs((prev) => [...prev, { id: logIdRef.current, timestamp, type, message, isBinary }])
  }, [])

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
    navigator.clipboard.writeText(text)
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

  useEffect(() => {
    return () => {
      clearTimers()
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [clearTimers])

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>WebSocket 协议</h1>
        <p>WebSocket Protocol - 全双工通信协议</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>全双工通信</h3>
                <p>客户端和服务器可以同时发送数据，无需等待对方响应</p>
              </div>
              <div className="feature-card">
                <h3>低延迟</h3>
                <p>建立连接后无需重复握手，数据帧头部开销小，传输效率高</p>
              </div>
              <div className="feature-card">
                <h3>基于 TCP</h3>
                <p>在 TCP 之上运行，通过 HTTP Upgrade 握手升级协议</p>
              </div>
              <div className="feature-card">
                <h3>保持连接</h3>
                <p>连接保持打开状态，适合实时通信场景</p>
              </div>
            </div>

            <h2>握手过程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  客户端                                      服务器
     |                                           |
     |  ──────── HTTP Upgrade Request ────────>  |
     |  GET /chat HTTP/1.1                       |
     |  Upgrade: websocket                       |
     |  Connection: Upgrade                      |
     |  Sec-WebSocket-Key: dGhlIHNhbXBsZQ==     |
     |                                           |
     |  <─────── HTTP 101 Switching ───────────  |
     |  HTTP/1.1 101 Switching Protocols         |
     |  Upgrade: websocket                       |
     |  Sec-WebSocket-Accept: s3pPLMBi...       |
     |                                           |
     |  <═══════ WebSocket 连接建立 ═════════>   |
              `}</pre>
            </div>

            <h2>数据帧结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-------+-+-------------+-------------------------------+
 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 | |1|2|3|       |K|             |                               |
 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 |     Extended payload length continued, if payload len == 127  |
 + - - - - - - - - - - - - - - - +-------------------------------+
 |                               | Masking-key, if MASK set to 1 |
 +-------------------------------+-------------------------------+
 | Masking-key (continued)       |          Payload Data         |
 +-------------------------------- - - - - - - - - - - - - - - - +
              `}</pre>
            </div>

            <div className="info-box">
              <strong>Opcode 类型</strong>
              <ul>
                <li><code>0x0</code> - Continuation: 继续帧</li>
                <li><code>0x1</code> - Text: 文本帧</li>
                <li><code>0x2</code> - Binary: 二进制帧</li>
                <li><code>0x8</code> - Close: 关闭连接</li>
                <li><code>0x9</code> - Ping: 心跳检测</li>
                <li><code>0xA</code> - Pong: 心跳响应</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>即时通讯</strong> - 聊天应用、在线客服</li>
              <li><strong>实时数据</strong> - 股票行情、体育比分、IoT 数据</li>
              <li><strong>在线协作</strong> - 协同编辑、白板绘图</li>
              <li><strong>在线游戏</strong> - 多人游戏实时同步</li>
              <li><strong>推送通知</strong> - 消息推送、系统告警</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>WebSocket 连接测试</h2>
            <div className="connection-demo">
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

              {error && (
                <div className="info-box warning" style={{ marginBottom: '16px' }}>
                  <strong>错误</strong>
                  <p>{error}</p>
                </div>
              )}

              {/* Connection Config */}
              <div className="config-grid" style={{ marginBottom: '16px' }}>
                <div className="config-item">
                  <label>WebSocket URL</label>
                  <input
                    type="text"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="wss://echo.websocket.org"
                    disabled={connected || connecting}
                  />
                </div>
                <div className="config-item">
                  <label>子协议 (可选)</label>
                  <input
                    type="text"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    value={protocols}
                    onChange={(e) => setProtocols(e.target.value)}
                    placeholder="逗号分隔"
                    disabled={connected || connecting}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px' }}>
                  <input type="checkbox" checked={autoReconnect} onChange={(e) => setAutoReconnect(e.target.checked)} disabled={connected || connecting} />
                  自动重连
                </label>
                {autoReconnect && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px' }}>
                    重连间隔
                    <input
                      type="number"
                      style={{ width: 80, padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      value={reconnectInterval}
                      onChange={(e) => setReconnectInterval(parseInt(e.target.value) || 3000)}
                      min={1000}
                      step={1000}
                      disabled={connected || connecting}
                    />
                    ms
                  </label>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px' }}>
                  <input type="checkbox" checked={heartbeat} onChange={(e) => setHeartbeat(e.target.checked)} disabled={connected || connecting} />
                  心跳检测
                </label>
                {heartbeat && (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px' }}>
                      间隔
                      <input
                        type="number"
                        style={{ width: 80, padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        value={heartbeatInterval}
                        onChange={(e) => setHeartbeatInterval(parseInt(e.target.value) || 30000)}
                        min={1000}
                        step={1000}
                        disabled={connected || connecting}
                      />
                      ms
                    </label>
                    <input
                      type="text"
                      style={{ width: 100, padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      value={heartbeatMessage}
                      onChange={(e) => setHeartbeatMessage(e.target.value)}
                      placeholder="ping"
                      disabled={connected || connecting}
                    />
                  </>
                )}
              </div>

              <div className="demo-controls" style={{ marginBottom: '16px' }}>
                {!connected ? (
                  <button onClick={handleConnect} disabled={connecting}>
                    {connecting ? '连接中...' : '连接'}
                  </button>
                ) : (
                  <button onClick={handleDisconnect} style={{ background: '#f44336', color: '#fff' }}>
                    断开连接
                  </button>
                )}
              </div>

              {/* Send Message */}
              {connected && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <select
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value as 'text' | 'json')}
                    >
                      <option value="text">文本</option>
                      <option value="json">JSON</option>
                    </select>
                    <button onClick={handleSend}>发送</button>
                  </div>
                  <textarea
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '80px',
                      fontFamily: messageType === 'json' ? 'Consolas, Monaco, monospace' : 'inherit'
                    }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="输入要发送的消息..."
                  />
                </div>
              )}

              {/* Message Log */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>消息日志</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleCopyLogs} style={{ padding: '4px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>复制</button>
                    <button onClick={handleClearLogs} style={{ padding: '4px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>清空</button>
                  </div>
                </div>
                <input
                  type="text"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', marginBottom: 8 }}
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  placeholder="按消息内容过滤..."
                />
                <div
                  ref={logContainerRef}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    minHeight: '200px',
                    maxHeight: '400px',
                    overflow: 'auto',
                    fontSize: '12px',
                  }}
                >
                  {filteredLogs.length === 0 ? (
                    <div style={{ padding: '16px', color: '#888' }}>暂无日志</div>
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
                            }}
                          >
                            {log.type === 'send' ? '发送' : log.type === 'receive' ? '接收' : log.type === 'system' ? '系统' : '错误'}
                          </span>
                        </div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', color: log.type === 'error' ? '#c62828' : '#333' }}>
                          {log.message}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 创建 WebSocket 连接
const ws = new WebSocket('wss://echo.websocket.org');

// 连接打开
ws.onopen = (event) => {
  console.log('WebSocket 已连接');
  ws.send('Hello Server!');
};

// 接收消息
ws.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

// 连接关闭
ws.onclose = (event) => {
  console.log('WebSocket 已关闭', event.code, event.reason);
};

// 错误处理
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};

// 发送消息
function sendMessage(msg) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(msg);
  }
}

// 发送 JSON
ws.send(JSON.stringify({ type: 'chat', content: 'Hello' }));

// 发送二进制数据
const buffer = new ArrayBuffer(4);
ws.send(buffer);`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import asyncio
import websockets
import json

async def websocket_client():
    uri = "wss://echo.websocket.org"

    async with websockets.connect(uri) as ws:
        print("已连接")

        # 发送消息
        await ws.send("Hello Server!")

        # 接收消息
        response = await ws.recv()
        print(f"收到: {response}")

        # 发送 JSON
        await ws.send(json.dumps({"type": "chat", "message": "你好"}))

        # 持续接收消息
        while True:
            try:
                msg = await ws.recv()
                print(f"收到: {msg}")
            except websockets.exceptions.ConnectionClosed:
                print("连接已关闭")
                break

# 运行客户端
asyncio.run(websocket_client())`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "log"
    "golang.org/x/net/websocket"
)

func main() {
    // 连接 WebSocket
    ws, err := websocket.Dial("wss://echo.websocket.org", "", "http://localhost")
    if err != nil {
        log.Fatal(err)
    }
    defer ws.Close()

    // 发送消息
    msg := "Hello Server!"
    if err := websocket.Message.Send(ws, msg); err != nil {
        log.Fatal(err)
    }
    fmt.Println("发送:", msg)

    // 接收消息
    var reply string
    if err := websocket.Message.Receive(ws, &reply); err != nil {
        log.Fatal(err)
    }
    fmt.Println("收到:", reply)
}`}</pre>
            </div>

            <h2>Node.js 服务端示例</h2>
            <div className="code-block">
              <pre>{`const WebSocket = require('ws');

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
  console.log('客户端已连接');

  // 接收消息
  ws.on('message', (message) => {
    console.log('收到:', message);

    // 回显消息
    ws.send(\`Echo: \${message}\`);
  });

  // 连接关闭
  ws.on('close', () => {
    console.log('客户端已断开');
  });

  // 发送欢迎消息
  ws.send('欢迎连接 WebSocket 服务器');
});

// 广播消息给所有客户端
function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

console.log('WebSocket 服务器运行在 ws://localhost:8080');`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

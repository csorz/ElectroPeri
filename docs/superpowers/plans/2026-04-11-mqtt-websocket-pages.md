# MQTT & WebSocket Connection Test Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create MQTT connection test page and enhance WebSocket page with advanced features.

**Architecture:** MQTT requires Node.js environment, so main process handler with IPC communication. WebSocket enhancement is frontend-only with browser WebSocket API. Both pages follow existing toolbox patterns.

**Tech Stack:** React, TypeScript, mqtt (MQTT.js), WebSocket API, Electron IPC

---

## File Structure

| File | Purpose |
|------|---------|
| `package.json` | Add mqtt dependency |
| `src/main/handlers/mqtt.ts` | MQTT main process handler |
| `src/main/index.ts` | Register MQTT handler |
| `src/preload/index.ts` | Add MQTT API bridge |
| `src/preload/index.d.ts` | Add MQTT type definitions |
| `src/renderer/src/pages/toolbox/tools/MqttToolPage.tsx` | MQTT page component |
| `src/renderer/src/pages/toolbox/tools/WebSocketToolPage.tsx` | Enhanced WebSocket page |

---

## Task 1: Install MQTT Dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install mqtt package**

```bash
cd /Users/sc/code/Github-dz/ElectroPeri
pnpm add mqtt
```

- [ ] **Step 2: Verify installation**

```bash
grep "mqtt" package.json
```

Expected: mqtt listed in dependencies

---

## Task 2: Create MQTT Main Process Handler

**Files:**
- Create: `src/main/handlers/mqtt.ts`

- [ ] **Step 1: Create MQTT handler**

```typescript
// src/main/handlers/mqtt.ts
import { BrowserWindow, ipcMain } from 'electron'
import mqtt, { MqttClient } from 'mqtt'

let client: MqttClient | null = null

export function setupMqttHandlers(): void {
  // Connect to MQTT broker
  ipcMain.handle('mqtt:connect', async (_event, options: {
    url: string
    port?: number
    username?: string
    password?: string
    clientId?: string
    clean?: boolean
    keepalive?: number
  }) => {
    try {
      if (client) {
        client.end()
        client = null
      }

      const connectOptions: mqtt.IClientOptions = {
        port: options.port,
        username: options.username,
        password: options.password,
        clientId: options.clientId || `mqtt_${Math.random().toString(16).slice(2, 10)}`,
        clean: options.clean !== false,
        keepalive: options.keepalive || 60,
        reconnectPeriod: 0 // Disable auto-reconnect, handle manually
      }

      client = mqtt.connect(options.url, connectOptions)

      return new Promise((resolve) => {
        client!.on('connect', () => {
          const win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('mqtt:connected')
          }
          resolve({ success: true })
        })

        client!.on('error', (err) => {
          const win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('mqtt:error', err.message)
          }
          resolve({ success: false, error: err.message })
        })

        client!.on('message', (topic: string, message: Buffer) => {
          const win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('mqtt:message', { topic, message: message.toString() })
          }
        })

        client!.on('close', () => {
          const win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('mqtt:disconnected')
          }
        })

        // Timeout after 10 seconds
        setTimeout(() => {
          if (client && !client.connected) {
            resolve({ success: false, error: 'Connection timeout' })
          }
        }, 10000)
      })
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Connection failed' }
    }
  })

  // Disconnect from MQTT broker
  ipcMain.handle('mqtt:disconnect', async () => {
    if (client) {
      client.end()
      client = null
    }
    return { success: true }
  })

  // Subscribe to topic
  ipcMain.handle('mqtt:subscribe', async (_event, topic: string, qos: 0 | 1 | 2 = 0) => {
    if (!client || !client.connected) {
      return { success: false, error: 'Not connected' }
    }

    return new Promise((resolve) => {
      client!.subscribe(topic, { qos }, (err) => {
        if (err) {
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true })
        }
      })
    })
  })

  // Unsubscribe from topic
  ipcMain.handle('mqtt:unsubscribe', async (_event, topic: string) => {
    if (!client || !client.connected) {
      return { success: false, error: 'Not connected' }
    }

    return new Promise((resolve) => {
      client!.unsubscribe(topic, (err) => {
        if (err) {
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true })
        }
      })
    })
  })

  // Publish message
  ipcMain.handle('mqtt:publish', async (_event, topic: string, message: string, qos: 0 | 1 | 2 = 0, retain: boolean = false) => {
    if (!client || !client.connected) {
      return { success: false, error: 'Not connected' }
    }

    return new Promise((resolve) => {
      client!.publish(topic, message, { qos, retain }, (err) => {
        if (err) {
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true })
        }
      })
    })
  })
}
```

- [ ] **Step 2: Register handler in main index**

Add import and call to `src/main/index.ts`:

```typescript
import { setupMqttHandlers } from './handlers/mqtt'

// In the app.whenReady() section, add:
setupMqttHandlers()
```

---

## Task 3: Add MQTT Preload API

**Files:**
- Modify: `src/preload/index.ts`
- Modify: `src/preload/index.d.ts`

- [ ] **Step 1: Add MQTT API to preload/index.ts**

Add after the existing APIs:

```typescript
// MQTT API
const mqttApi = {
  connect: (options: {
    url: string
    port?: number
    username?: string
    password?: string
    clientId?: string
    clean?: boolean
    keepalive?: number
  }) => ipcRenderer.invoke('mqtt:connect', options),

  disconnect: () => ipcRenderer.invoke('mqtt:disconnect'),

  subscribe: (topic: string, qos?: 0 | 1 | 2) => ipcRenderer.invoke('mqtt:subscribe', topic, qos),

  unsubscribe: (topic: string) => ipcRenderer.invoke('mqtt:unsubscribe', topic),

  publish: (topic: string, message: string, qos?: 0 | 1 | 2, retain?: boolean) => 
    ipcRenderer.invoke('mqtt:publish', topic, message, qos, retain),

  onMessage: (callback: (topic: string, message: string) => void) => {
    ipcRenderer.on('mqtt:message', (_event, data) => callback(data.topic, data.message))
  },

  onConnect: (callback: () => void) => {
    ipcRenderer.on('mqtt:connected', () => callback())
  },

  onDisconnect: (callback: () => void) => {
    ipcRenderer.on('mqtt:disconnected', () => callback())
  },

  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('mqtt:error', (_event, error) => callback(error))
  }
}
```

Add `mqtt: mqttApi` to the `api` object.

- [ ] **Step 2: Add MQTT types to preload/index.d.ts**

```typescript
interface MqttApi {
  connect: (options: {
    url: string
    port?: number
    username?: string
    password?: string
    clientId?: string
    clean?: boolean
    keepalive?: number
  }) => Promise<{ success: boolean; error?: string }>

  disconnect: () => Promise<{ success: boolean }>

  subscribe: (topic: string, qos?: 0 | 1 | 2) => Promise<{ success: boolean; error?: string }>

  unsubscribe: (topic: string) => Promise<{ success: boolean }>

  publish: (topic: string, message: string, qos?: 0 | 1 | 2, retain?: boolean) => Promise<{ success: boolean; error?: string }>

  onMessage: (callback: (topic: string, message: string) => void) => void
  onConnect: (callback: () => void) => void
  onDisconnect: (callback: () => void) => void
  onError: (callback: (error: string) => void) => void
}
```

Add `mqtt: MqttApi` to the `Api` interface.

---

## Task 4: Create MQTT Tool Page

**Files:**
- Create: `src/renderer/src/pages/toolbox/tools/MqttToolPage.tsx`

- [ ] **Step 1: Create MQTT page component**

```typescript
// src/renderer/src/pages/toolbox/tools/MqttToolPage.tsx
import { useCallback, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface Subscription {
  topic: string
  qos: 0 | 1 | 2
}

interface LogEntry {
  timestamp: string
  type: 'send' | 'receive' | 'system' | 'error'
  message: string
  topic?: string
}

export default function MqttToolPage() {
  // Connection config
  const [url, setUrl] = useState('')
  const [port, setPort] = useState(1883)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [clientId, setClientId] = useState('')
  const [cleanSession, setCleanSession] = useState(true)
  const [keepAlive, setKeepAlive] = useState(60)

  // Connection state
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [newTopic, setNewTopic] = useState('')
  const [newQos, setNewQos] = useState<0 | 1 | 2>(0)

  // Publish
  const [pubTopic, setPubTopic] = useState('')
  const [pubMessage, setPubMessage] = useState('')
  const [pubQos, setPubQos] = useState<0 | 1 | 2>(0)
  const [pubRetain, setPubRetain] = useState(false)

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filterTopic, setFilterTopic] = useState('')
  const logsEndRef = useRef<HTMLDivElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const addLog = (type: LogEntry['type'], message: string, topic?: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, type, message, topic }])
  }

  // Setup event listeners
  useEffect(() => {
    window.api.mqtt.onMessage((topic, message) => {
      addLog('receive', message, topic)
    })

    window.api.mqtt.onConnect(() => {
      setConnected(true)
      setConnecting(false)
      addLog('system', '✅ 连接成功 / Connected')
    })

    window.api.mqtt.onDisconnect(() => {
      setConnected(false)
      setConnecting(false)
      addLog('system', '🔌 连接断开 / Disconnected')
    })

    window.api.mqtt.onError((err) => {
      setConnecting(false)
      addLog('error', `❌ 错误: ${err}`)
    })
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleConnect = async () => {
    setError(null)

    if (!url.trim()) {
      setError('请输入 Broker URL / Please enter Broker URL')
      return
    }

    setConnecting(true)
    addLog('system', '🔄 正在连接... / Connecting...')

    const result = await window.api.mqtt.connect({
      url: url.trim(),
      port,
      username: username || undefined,
      password: password || undefined,
      clientId: clientId || undefined,
      clean: cleanSession,
      keepalive: keepAlive
    })

    if (!result.success) {
      setConnecting(false)
      setError(result.error || '连接失败 / Connection failed')
      addLog('error', `❌ 连接失败: ${result.error}`)
    }
  }

  const handleDisconnect = async () => {
    await window.api.mqtt.disconnect()
    setConnected(false)
    setSubscriptions([])
    addLog('system', '🔌 已断开连接 / Disconnected')
  }

  const handleSubscribe = async () => {
    if (!newTopic.trim()) return

    const result = await window.api.mqtt.subscribe(newTopic.trim(), newQos)
    if (result.success) {
      setSubscriptions(prev => [...prev, { topic: newTopic.trim(), qos: newQos }])
      addLog('system', `📥 订阅主题: ${newTopic}`)
      setNewTopic('')
    } else {
      addLog('error', `❌ 订阅失败: ${result.error}`)
    }
  }

  const handleUnsubscribe = async (topic: string) => {
    const result = await window.api.mqtt.unsubscribe(topic)
    if (result.success) {
      setSubscriptions(prev => prev.filter(s => s.topic !== topic))
      addLog('system', `📤 取消订阅: ${topic}`)
    }
  }

  const handlePublish = async () => {
    if (!pubTopic.trim() || !pubMessage.trim()) return

    const result = await window.api.mqtt.publish(pubTopic.trim(), pubMessage, pubQos, pubRetain)
    if (result.success) {
      addLog('send', pubMessage, pubTopic)
      setPubMessage('')
    } else {
      addLog('error', `❌ 发布失败: ${result.error}`)
    }
  }

  const filteredLogs = filterTopic
    ? logs.filter(log => !log.topic || log.topic.includes(filterTopic))
    : logs

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'send': return '#2196f3'
      case 'receive': return '#4caf50'
      case 'error': return '#f44336'
      default: return '#666'
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/http" className="toolbox-back">
        ← 返回请求调试
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📡</span>
          <h1>MQTT 测试</h1>
        </div>
        <p className="page-sub">MQTT 连接测试与消息收发</p>
      </div>

      <section className="tool-card">
        {/* Connection Config */}
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">连接配置 / Connection Config</div>
          
          <div className="tool-row">
            <label className="tool-label" style={{ flex: 2 }}>
              Broker URL
              <input
                type="text"
                className="tool-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="mqtt://broker.example.com"
                disabled={connected}
              />
            </label>
            <label className="tool-label" style={{ width: 100 }}>
              Port
              <input
                type="number"
                className="tool-input"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value) || 1883)}
                disabled={connected}
              />
            </label>
          </div>

          <div className="tool-row">
            <label className="tool-label">
              Username
              <input
                type="text"
                className="tool-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="可选"
                disabled={connected}
              />
            </label>
            <label className="tool-label">
              Password
              <input
                type="password"
                className="tool-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="可选"
                disabled={connected}
              />
            </label>
          </div>

          <div className="tool-row">
            <label className="tool-label">
              Client ID
              <input
                type="text"
                className="tool-input"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="自动生成"
                disabled={connected}
              />
            </label>
            <label className="tool-label" style={{ width: 100 }}>
              Keep Alive
              <input
                type="number"
                className="tool-input"
                value={keepAlive}
                onChange={(e) => setKeepAlive(parseInt(e.target.value) || 60)}
                disabled={connected}
              />
            </label>
            <label className="tool-label" style={{ width: 120 }}>
              <input
                type="checkbox"
                checked={cleanSession}
                onChange={(e) => setCleanSession(e.target.checked)}
                disabled={connected}
                style={{ marginRight: 8 }}
              />
              Clean Session
            </label>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
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
              {connecting ? '连接中... / Connecting...' : '连接 / Connect'}
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={handleDisconnect}>
              断开连接 / Disconnect
            </button>
          )}
        </div>

        {/* Subscribe Section */}
        {connected && (
          <div className="tool-block">
            <div className="tool-block-title">订阅主题 / Subscribe</div>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                className="tool-input"
                style={{ flex: 1 }}
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="主题 Topic，如: test/#"
              />
              <select
                value={newQos}
                onChange={(e) => setNewQos(parseInt(e.target.value) as 0 | 1 | 2)}
                style={{ width: 80 }}
              >
                <option value={0}>QoS 0</option>
                <option value={1}>QoS 1</option>
                <option value={2}>QoS 2</option>
              </select>
              <button type="button" className="btn btn-primary" onClick={handleSubscribe}>
                订阅
              </button>
            </div>

            {subscriptions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {subscriptions.map((sub) => (
                  <div
                    key={sub.topic}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      background: '#e3f2fd',
                      borderRadius: 4,
                      fontSize: 13
                    }}
                  >
                    <span>{sub.topic}</span>
                    <span style={{ color: '#666', fontSize: 11 }}>Q{sub.qos}</span>
                    <button
                      type="button"
                      onClick={() => handleUnsubscribe(sub.topic)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Publish Section */}
        {connected && (
          <div className="tool-block">
            <div className="tool-block-title">发布消息 / Publish</div>
            
            <div className="tool-row">
              <label className="tool-label" style={{ flex: 1 }}>
                Topic
                <input
                  type="text"
                  className="tool-input"
                  value={pubTopic}
                  onChange={(e) => setPubTopic(e.target.value)}
                  placeholder="发布主题"
                />
              </label>
              <label className="tool-label" style={{ width: 80 }}>
                QoS
                <select
                  value={pubQos}
                  onChange={(e) => setPubQos(parseInt(e.target.value) as 0 | 1 | 2)}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </label>
              <label className="tool-label" style={{ width: 80 }}>
                <input
                  type="checkbox"
                  checked={pubRetain}
                  onChange={(e) => setPubRetain(e.target.checked)}
                  style={{ marginRight: 4 }}
                />
                Retain
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                className="tool-textarea"
                style={{ flex: 1, minHeight: 60 }}
                value={pubMessage}
                onChange={(e) => setPubMessage(e.target.value)}
                placeholder="消息内容 / Message content"
              />
              <button type="button" className="btn btn-primary" onClick={handlePublish}>
                发布 / Publish
              </button>
            </div>
          </div>
        )}

        {/* Logs Section */}
        <div className="tool-block">
          <div className="tool-block-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>消息日志 / Message Log</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="tool-input"
                style={{ width: 150, fontSize: 12 }}
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                placeholder="过滤主题..."
              />
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '4px 8px' }}
                onClick={() => onCopy(logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.topic ? `[${l.topic}] ` : ''}${l.message}`).join('\n'))}
              >
                复制
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '4px 8px' }}
                onClick={() => setLogs([])}
              >
                清空
              </button>
            </div>
          </div>
          
          <div
            className="tool-result mono"
            style={{
              minHeight: 200,
              maxHeight: 400,
              overflow: 'auto',
              fontSize: 12
            }}
          >
            {filteredLogs.length === 0 ? (
              <span style={{ color: '#888' }}>暂无消息 / No messages</span>
            ) : (
              filteredLogs.map((log, i) => (
                <div key={i} style={{ marginBottom: 4, color: getLogColor(log.type) }}>
                  <span style={{ color: '#999' }}>[{log.timestamp}]</span>
                  {' '}
                  <span style={{ fontWeight: 'bold' }}>[{log.type.toUpperCase()}]</span>
                  {log.topic && <span style={{ color: '#666' }}> [{log.topic}]</span>}
                  {' '}
                  {log.message}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </section>
    </div>
  )
}
```

---

## Task 5: Enhance WebSocket Page

**Files:**
- Modify: `src/renderer/src/pages/toolbox/tools/WebSocketToolPage.tsx`

- [ ] **Step 1: Rewrite WebSocket page with enhanced features**

```typescript
// src/renderer/src/pages/toolbox/tools/WebSocketToolPage.tsx
import { useCallback, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

interface LogEntry {
  timestamp: string
  type: 'send' | 'receive' | 'system' | 'error'
  message: string
  isBinary?: boolean
}

export default function WebSocketToolPage() {
  // Connection config
  const [url, setUrl] = useState('')
  const [protocols, setProtocols] = useState('')
  
  // Advanced options
  const [autoReconnect, setAutoReconnect] = useState(false)
  const [reconnectInterval, setReconnectInterval] = useState(5)
  const [heartbeat, setHeartbeat] = useState(false)
  const [heartbeatInterval, setHeartbeatInterval] = useState(30)
  const [heartbeatMessage, setHeartbeatMessage] = useState('ping')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Connection state
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Message
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'text' | 'json'>('text')

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Stats
  const [sentCount, setSentCount] = useState(0)
  const [receivedCount, setReceivedCount] = useState(0)
  const [connectedAt, setConnectedAt] = useState<Date | null>(null)
  const [duration, setDuration] = useState(0)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const addLog = (type: LogEntry['type'], message: string, isBinary: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, type, message, isBinary }])
  }

  // Update duration
  useEffect(() => {
    if (connected && connectedAt) {
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - connectedAt.getTime()) / 1000))
      }, 1000)
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      setDuration(0)
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [connected, connectedAt])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(heartbeatMessage)
        addLog('send', heartbeatMessage)
      }
    }, heartbeatInterval * 1000)
  }

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }

  const handleConnect = () => {
    setError(null)

    if (!url.trim()) {
      setError('请输入 WebSocket URL / Please enter WebSocket URL')
      return
    }

    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      setError('URL 必须以 ws:// 或 wss:// 开头 / URL must start with ws:// or wss://')
      return
    }

    setConnecting(true)
    addLog('system', '🔄 正在连接... / Connecting...')

    try {
      const protocolList = protocols.trim() 
        ? protocols.split(',').map(p => p.trim()).filter(Boolean)
        : undefined

      const ws = new WebSocket(url.trim(), protocolList)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setConnecting(false)
        setConnectedAt(new Date())
        addLog('system', '✅ 连接成功 / Connected')
        
        if (heartbeat) {
          startHeartbeat()
        }
      }

      ws.onmessage = (event) => {
        setReceivedCount(prev => prev + 1)
        
        if (event.data instanceof Blob) {
          addLog('receive', `[Binary Blob: ${event.data.size} bytes]`, true)
        } else if (event.data instanceof ArrayBuffer) {
          addLog('receive', `[Binary ArrayBuffer: ${event.data.byteLength} bytes]`, true)
        } else {
          addLog('receive', event.data)
        }
      }

      ws.onclose = (event) => {
        setConnected(false)
        setConnecting(false)
        stopHeartbeat()
        addLog('system', `🔌 连接关闭 / Disconnected (code: ${event.code}${event.reason ? `, reason: ${event.reason}` : ''})`)
        wsRef.current = null

        // Auto-reconnect
        if (autoReconnect && !event.wasClean) {
          addLog('system', `🔄 ${reconnectInterval}秒后重连... / Reconnecting in ${reconnectInterval}s...`)
          reconnectTimeoutRef.current = setTimeout(() => {
            handleConnect()
          }, reconnectInterval * 1000)
        }
      }

      ws.onerror = () => {
        addLog('error', '❌ 连接错误 / Connection error')
        setConnected(false)
        setConnecting(false)
      }
    } catch (e) {
      setConnecting(false)
      setError(e instanceof Error ? e.message : '连接失败 / Connection failed')
      addLog('error', `❌ 连接失败: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  const handleDisconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    stopHeartbeat()
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
    setConnectedAt(null)
    addLog('system', '🔌 主动断开连接 / Disconnected')
  }

  const handleSend = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket 未连接 / WebSocket not connected')
      return
    }

    if (!message.trim()) {
      setError('请输入要发送的消息 / Please enter message')
      return
    }

    wsRef.current.send(message)
    addLog('send', message)
    setSentCount(prev => prev + 1)
    setMessage('')
  }

  const handleClear = () => {
    setLogs([])
    setSentCount(0)
    setReceivedCount(0)
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'send': return '#2196f3'
      case 'receive': return '#4caf50'
      case 'error': return '#f44336'
      default: return '#666'
    }
  }

  const formatMessage = (msg: string, isBinary: boolean) => {
    if (isBinary) return msg
    try {
      const json = JSON.parse(msg)
      return JSON.stringify(json, null, 2)
    } catch {
      return msg
    }
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
        {/* Connection Config */}
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">连接配置 / Connection Config</div>
          
          <div className="tool-row">
            <input
              type="text"
              className="tool-input"
              style={{ flex: 1 }}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="WebSocket URL，如: wss://echo.websocket.org"
              disabled={connected}
            />
          </div>

          <div className="tool-row">
            <label className="tool-label" style={{ flex: 1 }}>
              Protocols (子协议，逗号分隔)
              <input
                type="text"
                className="tool-input"
                value={protocols}
                onChange={(e) => setProtocols(e.target.value)}
                placeholder="可选，如: chat, superchat"
                disabled={connected}
              />
            </label>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '4px 8px' }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
          </button>

          {showAdvanced && (
            <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <div className="tool-row">
                <label className="tool-label">
                  <input
                    type="checkbox"
                    checked={autoReconnect}
                    onChange={(e) => setAutoReconnect(e.target.checked)}
                    disabled={connected}
                    style={{ marginRight: 8 }}
                  />
                  自动重连
                </label>
                {autoReconnect && (
                  <label className="tool-label" style={{ width: 100 }}>
                    间隔(秒)
                    <input
                      type="number"
                      className="tool-input"
                      value={reconnectInterval}
                      onChange={(e) => setReconnectInterval(parseInt(e.target.value) || 5)}
                      min={1}
                      disabled={connected}
                    />
                  </label>
                )}
              </div>

              <div className="tool-row">
                <label className="tool-label">
                  <input
                    type="checkbox"
                    checked={heartbeat}
                    onChange={(e) => setHeartbeat(e.target.checked)}
                    disabled={connected}
                    style={{ marginRight: 8 }}
                  />
                  心跳检测
                </label>
                {heartbeat && (
                  <>
                    <label className="tool-label" style={{ width: 80 }}>
                      间隔(秒)
                      <input
                        type="number"
                        className="tool-input"
                        value={heartbeatInterval}
                        onChange={(e) => setHeartbeatInterval(parseInt(e.target.value) || 30)}
                        min={1}
                        disabled={connected}
                      />
                    </label>
                    <label className="tool-label" style={{ flex: 1 }}>
                      心跳消息
                      <input
                        type="text"
                        className="tool-input"
                        value={heartbeatMessage}
                        onChange={(e) => setHeartbeatMessage(e.target.value)}
                        disabled={connected}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
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
              {connecting ? '连接中... / Connecting...' : '连接 / Connect'}
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={handleDisconnect}>
              断开连接 / Disconnect
            </button>
          )}
        </div>

        {/* Stats */}
        {connected && (
          <div className="tool-block" style={{ background: '#e3f2fd', padding: 12, borderRadius: 4 }}>
            <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
              <span>📤 发送: <strong>{sentCount}</strong></span>
              <span>📥 接收: <strong>{receivedCount}</strong></span>
              <span>⏱️ 时长: <strong>{formatDuration(duration)}</strong></span>
              <span style={{ color: '#4caf50' }}>● 已连接</span>
            </div>
          </div>
        )}

        {/* Send Message */}
        {connected && (
          <div className="tool-block">
            <div className="tool-block-title">发送消息 / Send Message</div>
            
            <div style={{ marginBottom: 8 }}>
              <label className="tool-label" style={{ fontSize: 12 }}>
                <input
                  type="radio"
                  checked={messageType === 'text'}
                  onChange={() => setMessageType('text')}
                  style={{ marginRight: 4 }}
                />
                Text
              </label>
              <label className="tool-label" style={{ fontSize: 12, marginLeft: 16 }}>
                <input
                  type="radio"
                  checked={messageType === 'json'}
                  onChange={() => setMessageType('json')}
                  style={{ marginRight: 4 }}
                />
                JSON
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                className="tool-textarea"
                style={{ flex: 1, minHeight: 80, fontFamily: messageType === 'json' ? 'monospace' : 'inherit' }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={messageType === 'json' ? '{"key": "value"}' : '输入要发送的消息...'}
              />
              <button type="button" className="btn btn-primary" onClick={handleSend}>
                发送 / Send
              </button>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="tool-block">
          <div className="tool-block-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>消息日志 / Message Log</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '4px 8px' }}
                onClick={() => onCopy(logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n'))}
              >
                复制日志
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '4px 8px' }}
                onClick={handleClear}
              >
                清空
              </button>
            </div>
          </div>
          
          <div
            className="tool-result mono"
            style={{
              minHeight: 200,
              maxHeight: 400,
              overflow: 'auto',
              fontSize: 12
            }}
          >
            {logs.length === 0 ? (
              <span style={{ color: '#888' }}>暂无日志 / No logs</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} style={{ marginBottom: 4, color: getLogColor(log.type) }}>
                  <span style={{ color: '#999' }}>[{log.timestamp}]</span>
                  {' '}
                  <span style={{ fontWeight: 'bold' }}>[{log.type.toUpperCase()}]</span>
                  {' '}
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {formatMessage(log.message, log.isBinary)}
                  </pre>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </section>
    </div>
  )
}
```

---

## Task 6: Build and Test

**Files:**
- None (verification only)

- [ ] **Step 1: Run the build**

```bash
cd /Users/sc/code/Github-dz/ElectroPeri
pnpm run build
```

Expected: Build succeeds

---

## Task 7: Commit Changes

**Files:**
- All modified files

- [ ] **Step 1: Stage and commit**

```bash
cd /Users/sc/code/Github-dz/ElectroPeri
git add package.json pnpm-lock.yaml src/main/handlers/mqtt.ts src/main/index.ts src/preload/index.ts src/preload/index.d.ts src/renderer/src/pages/toolbox/tools/MqttToolPage.tsx src/renderer/src/pages/toolbox/tools/WebSocketToolPage.tsx docs/superpowers/
git commit -m "feat(mqtt-websocket): add MQTT test page and enhance WebSocket page

- Add MQTT connection test page with full config options
- Add MQTT subscribe/publish functionality
- Enhance WebSocket page with auto-reconnect, heartbeat, stats
- Add binary message support and JSON formatting
- Add message logs with timestamps and filtering

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

Expected: Commit succeeds

import { useState, useRef, useEffect, useCallback } from 'react'
import './ToolPage.css'

type LogType = 'send' | 'receive' | 'system' | 'error'

interface LogEntry {
  id: number
  timestamp: string
  type: LogType
  topic?: string
  message: string
}

interface Subscription {
  topic: string
  qos: 0 | 1 | 2
}

const generateClientId = (): string => {
  return `mqtt_${Math.random().toString(16).slice(2, 10)}_${Date.now()}`
}

// Check if running in Electron
const isElectron = (): boolean => typeof window !== 'undefined' && !!window.api?.mqtt

export default function MqttToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  // Connection config
  const [protocol, setProtocol] = useState<'mqtt' | 'ws' | 'wss'>('wss')
  const [brokerUrl, setBrokerUrl] = useState('')
  const [port, setPort] = useState(8083)
  const [path, setPath] = useState('/mqtt')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [clientId, setClientId] = useState('')
  const [keepAlive, setKeepAlive] = useState(60)
  const [cleanSession, setCleanSession] = useState(true)

  // Connection state
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Subscribe section
  const [subTopic, setSubTopic] = useState('')
  const [subQos, setSubQos] = useState<0 | 1 | 2>(0)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  // Publish section
  const [pubTopic, setPubTopic] = useState('')
  const [pubMessage, setPubMessage] = useState('')
  const [pubQos, setPubQos] = useState<0 | 1 | 2>(0)
  const [pubRetain, setPubRetain] = useState(false)

  // Message log
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logFilter, setLogFilter] = useState('')
  const logIdRef = useRef(0)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // MQTT client ref for browser mode
  const mqttClientRef = useRef<any>(null)

  const addLog = useCallback((type: LogType, message: string, topic?: string) => {
    const timestamp = new Date().toLocaleTimeString()
    logIdRef.current += 1
    setLogs((prev) => [...prev, { id: logIdRef.current, timestamp, type, topic, message }])
  }, [])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  // Set up event listeners for Electron mode
  useEffect(() => {
    if (!isElectron()) return

    const handleMessage = (topic: string, message: string) => {
      addLog('receive', message, topic)
    }

    const handleDisconnectEvent = () => {
      setConnected(false)
      setConnecting(false)
      setSubscriptions([])
      addLog('system', '已断开连接')
    }

    const handleError = (err: string) => {
      setError(err)
      addLog('error', err)
      setConnecting(false)
    }

    window.api.mqtt.onMessage(handleMessage)
    window.api.mqtt.onDisconnect(handleDisconnectEvent)
    window.api.mqtt.onError(handleError)

    return () => {
      // Note: The API doesn't provide a way to remove listeners
    }
  }, [addLog])

  // Update port based on protocol
  useEffect(() => {
    if (protocol === 'mqtt') setPort(1883)
    else if (protocol === 'ws') setPort(8083)
    else setPort(8084)
  }, [protocol])

  const getConnectionString = (): string => {
    if (protocol === 'mqtt') {
      return `${brokerUrl}:${port}`
    }
    return `${protocol}://${brokerUrl}:${port}${path}`
  }

  const handleConnect = async () => {
    setError(null)

    if (!brokerUrl.trim()) {
      setError('请输入服务器地址')
      return
    }

    setConnecting(true)
    addLog('system', `正在连接 ${getConnectionString()}...`)

    try {
      if (isElectron()) {
        // Electron mode - use native MQTT
        const result = await window.api.mqtt.connect({
          url: brokerUrl,
          port,
          username: username || undefined,
          password: password || undefined,
          clientId: clientId || generateClientId(),
          clean: cleanSession,
          keepalive: keepAlive
        })

        if (result.success) {
          setConnected(true)
          addLog('system', '连接成功')
        } else {
          setError(result.error || '连接失败')
          addLog('error', result.error || '连接失败')
        }
      } else {
        // Browser mode - use MQTT.js over WebSocket
        const mqtt = await import('mqtt')

        const connectUrl = protocol === 'mqtt'
          ? `ws://${brokerUrl}:${port}/mqtt`
          : `${protocol}://${brokerUrl}:${port}${path}`

        const client = mqtt.connect(connectUrl, {
          username: username || undefined,
          password: password || undefined,
          clientId: clientId || generateClientId(),
          clean: cleanSession,
          keepalive: keepAlive,
          reconnectPeriod: 0 // Disable auto reconnect
        })

        mqttClientRef.current = client

        client.on('connect', () => {
          setConnected(true)
          setConnecting(false)
          addLog('system', '连接成功')
        })

        client.on('message', (topic: string, message: Buffer) => {
          addLog('receive', message.toString(), topic)
        })

        client.on('error', (err: Error) => {
          setError(err.message)
          addLog('error', err.message)
          setConnecting(false)
          setConnected(false)
        })

        client.on('close', () => {
          setConnected(false)
          setSubscriptions([])
          addLog('system', '已断开连接')
        })
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : '连接失败'
      setError(errMsg)
      addLog('error', errMsg)
    } finally {
      if (isElectron()) {
        setConnecting(false)
      }
    }
  }

  const handleDisconnect = async () => {
    addLog('system', '正在断开连接...')

    if (isElectron()) {
      await window.api.mqtt.disconnect()
    } else if (mqttClientRef.current) {
      mqttClientRef.current.end()
      mqttClientRef.current = null
    }

    setConnected(false)
    setSubscriptions([])
    addLog('system', '已断开')
  }

  const handleSubscribe = async () => {
    if (!subTopic.trim()) {
      setError('请输入订阅主题')
      return
    }

    try {
      if (isElectron()) {
        const result = await window.api.mqtt.subscribe(subTopic, subQos)
        if (result.success) {
          addLog('system', `已订阅 ${subTopic} (QoS ${subQos})`)
          setSubscriptions((prev) => {
            const exists = prev.find((s) => s.topic === subTopic)
            if (exists) {
              return prev.map((s) => (s.topic === subTopic ? { topic: subTopic, qos: subQos } : s))
            }
            return [...prev, { topic: subTopic, qos: subQos }]
          })
          setSubTopic('')
        } else {
          setError(result.error || '订阅失败')
          addLog('error', `订阅失败: ${result.error}`)
        }
      } else if (mqttClientRef.current) {
        mqttClientRef.current.subscribe(subTopic, { qos: subQos }, (err: Error | null) => {
          if (err) {
            setError(err.message)
            addLog('error', `订阅失败: ${err.message}`)
          } else {
            addLog('system', `已订阅 ${subTopic} (QoS ${subQos})`)
            setSubscriptions((prev) => {
              const exists = prev.find((s) => s.topic === subTopic)
              if (exists) {
                return prev.map((s) => (s.topic === subTopic ? { topic: subTopic, qos: subQos } : s))
              }
              return [...prev, { topic: subTopic, qos: subQos }]
            })
            setSubTopic('')
          }
        })
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : '订阅失败'
      setError(errMsg)
      addLog('error', errMsg)
    }
  }

  const handleUnsubscribe = async (topic: string) => {
    try {
      if (isElectron()) {
        const result = await window.api.mqtt.unsubscribe(topic)
        if (result.success) {
          addLog('system', `已取消订阅 ${topic}`)
          setSubscriptions((prev) => prev.filter((s) => s.topic !== topic))
        } else {
          addLog('error', `取消订阅失败: ${topic}`)
        }
      } else if (mqttClientRef.current) {
        mqttClientRef.current.unsubscribe(topic, (err: Error | null) => {
          if (err) {
            addLog('error', `取消订阅失败: ${topic}`)
          } else {
            addLog('system', `已取消订阅 ${topic}`)
            setSubscriptions((prev) => prev.filter((s) => s.topic !== topic))
          }
        })
      }
    } catch (e) {
      addLog('error', `取消订阅失败: ${topic}`)
    }
  }

  const handlePublish = async () => {
    if (!pubTopic.trim()) {
      setError('请输入发布主题')
      return
    }

    if (!pubMessage.trim()) {
      setError('请输入发布消息')
      return
    }

    try {
      if (isElectron()) {
        const result = await window.api.mqtt.publish(pubTopic, pubMessage, pubQos, pubRetain)
        if (result.success) {
          addLog('send', pubMessage, pubTopic)
          setPubMessage('')
        } else {
          setError(result.error || '发布失败')
          addLog('error', `发布失败: ${result.error}`)
        }
      } else if (mqttClientRef.current) {
        mqttClientRef.current.publish(pubTopic, pubMessage, { qos: pubQos, retain: pubRetain }, (err: Error | null) => {
          if (err) {
            setError(err.message)
            addLog('error', `发布失败: ${err.message}`)
          } else {
            addLog('send', pubMessage, pubTopic)
            setPubMessage('')
          }
        })
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : '发布失败'
      setError(errMsg)
      addLog('error', errMsg)
    }
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  const handleCopyLogs = () => {
    const text = logs
      .map((log) => {
        const prefix = log.topic ? `[${log.timestamp}] [${log.type.toUpperCase()}] [${log.topic}] ${log.message}` : `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`
        return prefix
      })
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  const filteredLogs = logFilter.trim()
    ? logs.filter((log) => log.topic?.includes(logFilter) || log.message.includes(logFilter))
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

  // Public test brokers
  const testBrokers = [
    { name: 'Eclipse Mosquitto', url: 'test.mosquitto.org', port: 8080, protocol: 'ws' as const },
    { name: 'HiveMQ Public', url: 'broker.hivemq.com', port: 8000, protocol: 'ws' as const },
    { name: 'EMQX Public', url: 'broker.emqx.io', port: 8083, protocol: 'ws' as const }
  ]

  const applyTestBroker = (broker: typeof testBrokers[0]) => {
    setBrokerUrl(broker.url)
    setPort(broker.port)
    setProtocol(broker.protocol)
    setPath('/mqtt')
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>MQTT 协议</h1>
        <p>Message Queuing Telemetry Transport - 轻量级消息传输协议</p>
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
                <h3>轻量级</h3>
                <p>协议头部最小 2 字节，适合网络带宽有限的物联网场景</p>
              </div>
              <div className="feature-card">
                <h3>发布/订阅</h3>
                <p>通过 Broker 中转消息，发布者和订阅者解耦，支持一对多通信</p>
              </div>
              <div className="feature-card">
                <h3>QoS 服务质量</h3>
                <p>三级服务质量：最多一次、至少一次、恰好一次</p>
              </div>
              <div className="feature-card">
                <h3>多种传输</h3>
                <p>支持 TCP 和 WebSocket 传输，浏览器也可通过 WebSocket 连接</p>
              </div>
            </div>

            <h2>通信模型</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
     发布者                    Broker                    订阅者
       │                        │                        │
       │ ──── Publish ────────> │                        │
       │     Topic: sensor/temp │                        │
       │     Payload: 25.5      │                        │
       │                        │ ──── Forward ────────> │
       │                        │     Topic: sensor/temp │
       │                        │     Payload: 25.5      │
       │                        │                        │

  Topic 层级结构:
  home/livingroom/temperature   -> 精确匹配
  home/+/temperature            -> + 匹配单层
  home/#                        -> # 匹配多层
              `}</pre>
            </div>

            <h2>传输协议</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>协议</th>
                    <th>默认端口</th>
                    <th>说明</th>
                    <th>适用场景</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>mqtt://</code></td>
                    <td>1883</td>
                    <td>TCP 连接</td>
                    <td>后端服务、桌面应用</td>
                  </tr>
                  <tr>
                    <td><code>mqtts://</code></td>
                    <td>8883</td>
                    <td>TCP + TLS 加密</td>
                    <td>安全连接</td>
                  </tr>
                  <tr>
                    <td><code>ws://</code></td>
                    <td>8083</td>
                    <td>WebSocket</td>
                    <td>浏览器、Web 应用</td>
                  </tr>
                  <tr>
                    <td><code>wss://</code></td>
                    <td>8084</td>
                    <td>WebSocket + TLS</td>
                    <td>浏览器安全连接</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>QoS 服务质量</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>级别</th>
                    <th>名称</th>
                    <th>保证</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>QoS 0</code></td>
                    <td>At most once</td>
                    <td>最多一次</td>
                    <td>消息可能丢失或重复，效率最高</td>
                  </tr>
                  <tr>
                    <td><code>QoS 1</code></td>
                    <td>At least once</td>
                    <td>至少一次</td>
                    <td>消息不会丢失，可能重复</td>
                  </tr>
                  <tr>
                    <td><code>QoS 2</code></td>
                    <td>Exactly once</td>
                    <td>恰好一次</td>
                    <td>消息不丢失不重复，效率最低</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>物联网</strong> - 传感器数据上报、设备控制指令下发</li>
              <li><strong>即时通讯</strong> - 聊天消息推送、在线状态同步</li>
              <li><strong>智能家居</strong> - 设备状态同步、场景联动控制</li>
              <li><strong>车联网</strong> - 车辆位置上报、远程诊断</li>
              <li><strong>工业监控</strong> - 设备状态监测、告警推送</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>MQTT 连接测试</h2>
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
                {!isElectron() && (
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666', background: '#e3f2fd', padding: '2px 8px', borderRadius: '4px' }}>
                    浏览器模式 (WebSocket)
                  </span>
                )}
              </div>

              {error && (
                <div className="info-box warning" style={{ marginBottom: '16px' }}>
                  <strong>错误</strong>
                  <p>{error}</p>
                </div>
              )}

              {/* Test Brokers */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#666' }}>公共测试服务器</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {testBrokers.map((broker) => (
                    <button
                      key={broker.name}
                      onClick={() => applyTestBroker(broker)}
                      disabled={connected}
                      style={{
                        padding: '6px 12px',
                        background: brokerUrl === broker.url ? '#e3f2fd' : '#f5f5f5',
                        border: brokerUrl === broker.url ? '1px solid #2196f3' : '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: connected ? 'not-allowed' : 'pointer',
                        color: connected ? '#999' : '#333'
                      }}
                    >
                      {broker.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Connection Config */}
              <div className="config-grid" style={{ marginBottom: '16px' }}>
                <div className="config-item">
                  <label>协议</label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value as 'mqtt' | 'ws' | 'wss')}
                    disabled={connected}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  >
                    <option value="wss">wss:// (WebSocket TLS)</option>
                    <option value="ws">ws:// (WebSocket)</option>
                    {isElectron() && <option value="mqtt">mqtt:// (TCP)</option>}
                  </select>
                </div>
                <div className="config-item">
                  <label>服务器地址</label>
                  <input
                    type="text"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    value={brokerUrl}
                    onChange={(e) => setBrokerUrl(e.target.value)}
                    placeholder="broker.example.com"
                    disabled={connected}
                  />
                </div>
                <div className="config-item">
                  <label>端口</label>
                  <input
                    type="number"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', width: 100 }}
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value) || 1883)}
                    disabled={connected}
                  />
                </div>
                {protocol !== 'mqtt' && (
                  <div className="config-item">
                    <label>路径</label>
                    <input
                      type="text"
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      placeholder="/mqtt"
                      disabled={connected}
                    />
                  </div>
                )}
              </div>

              <div className="config-grid" style={{ marginBottom: '16px' }}>
                <div className="config-item">
                  <label>用户名 (可选)</label>
                  <input
                    type="text"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={connected}
                  />
                </div>
                <div className="config-item">
                  <label>密码 (可选)</label>
                  <input
                    type="password"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={connected}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div className="config-item" style={{ minWidth: 120 }}>
                  <label>心跳间隔</label>
                  <input
                    type="number"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', width: 80 }}
                    value={keepAlive}
                    onChange={(e) => setKeepAlive(parseInt(e.target.value) || 60)}
                    disabled={connected}
                  />
                  <span style={{ fontSize: '12px', color: '#666', marginLeft: 4 }}>秒</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px' }}>
                  <input type="checkbox" checked={cleanSession} onChange={(e) => setCleanSession(e.target.checked)} disabled={connected} />
                  清除会话
                </label>
                <div className="config-item" style={{ minWidth: 200 }}>
                  <label>客户端 ID (可选)</label>
                  <input
                    type="text"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="自动生成"
                    disabled={connected}
                  />
                </div>
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

              {/* Subscribe Section */}
              {connected && (
                <div style={{ marginBottom: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>订阅主题</h4>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      style={{ flex: 1, minWidth: 200, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      value={subTopic}
                      onChange={(e) => setSubTopic(e.target.value)}
                      placeholder="主题，如: sensor/temperature"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    />
                    <select
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      value={subQos}
                      onChange={(e) => setSubQos(parseInt(e.target.value) as 0 | 1 | 2)}
                    >
                      <option value={0}>QoS 0</option>
                      <option value={1}>QoS 1</option>
                      <option value={2}>QoS 2</option>
                    </select>
                    <button onClick={handleSubscribe}>订阅</button>
                  </div>
                  {subscriptions.length > 0 && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>已订阅:</div>
                      {subscriptions.map((sub) => (
                        <div key={sub.topic} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                          <span style={{ fontSize: '13px', fontFamily: 'Consolas, Monaco, monospace' }}>{sub.topic} <span style={{ color: '#888' }}>(QoS {sub.qos})</span></span>
                          <button onClick={() => handleUnsubscribe(sub.topic)} style={{ fontSize: '12px', padding: '2px 8px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>取消</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Publish Section */}
              {connected && (
                <div style={{ marginBottom: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>发布消息</h4>
                  <div style={{ marginBottom: 8 }}>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      value={pubTopic}
                      onChange={(e) => setPubTopic(e.target.value)}
                      placeholder="主题，如: sensor/temperature"
                    />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <textarea
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minHeight: '80px' }}
                      value={pubMessage}
                      onChange={(e) => setPubMessage(e.target.value)}
                      placeholder="消息内容..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      value={pubQos}
                      onChange={(e) => setPubQos(parseInt(e.target.value) as 0 | 1 | 2)}
                    >
                      <option value={0}>QoS 0</option>
                      <option value={1}>QoS 1</option>
                      <option value={2}>QoS 2</option>
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '13px' }}>
                      <input type="checkbox" checked={pubRetain} onChange={(e) => setPubRetain(e.target.checked)} />
                      保留消息
                    </label>
                    <button onClick={handlePublish}>发布</button>
                  </div>
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
                  placeholder="按主题或消息过滤..."
                />
                <div
                  ref={logContainerRef}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    minHeight: '150px',
                    maxHeight: '400px',
                    overflow: 'auto',
                    fontSize: '12px',
                  }}
                >
                  {filteredLogs.length === 0 ? (
                    <div style={{ padding: '16px', color: '#888' }}>暂无日志</div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log.id} style={{ padding: '8px 12px', borderBottom: '1px solid #eee', color: getLogTypeColor(log.type) }}>
                        <span style={{ color: '#888' }}>[{log.timestamp}]</span>{' '}
                        <span style={{ fontWeight: 600 }}>[{log.type.toUpperCase()}]</span>{' '}
                        {log.topic && <span style={{ color: '#b39ddb' }}>[{log.topic}]</span>}{' '}
                        {log.message}
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
            <h2>JavaScript (mqtt.js) 示例</h2>
            <div className="code-block">
              <pre>{`const mqtt = require('mqtt');

// WebSocket 连接 (浏览器可用)
const client = mqtt.connect('wss://broker.example.com:8084/mqtt', {
  clientId: 'client_' + Math.random().toString(16).slice(2, 10),
  username: 'user',
  password: 'pass',
  clean: true,
  keepalive: 60
});

// TCP 连接 (Node.js)
// const client = mqtt.connect('mqtt://broker.example.com:1883');

// 连接成功
client.on('connect', () => {
  console.log('已连接');

  // 订阅主题
  client.subscribe('sensor/temperature', { qos: 1 });

  // 发布消息
  client.publish('sensor/temperature', JSON.stringify({ value: 25.5 }), {
    qos: 1,
    retain: false
  });
});

// 接收消息
client.on('message', (topic, message) => {
  console.log(\`收到消息 [\${topic}]: \${message.toString()}\`);
});

// 错误处理
client.on('error', (err) => {
  console.error('连接错误:', err);
});

// 断开连接
client.on('close', () => {
  console.log('已断开连接');
});`}</pre>
            </div>

            <h2>浏览器中使用 (CDN)</h2>
            <div className="code-block">
              <pre>{`<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
</head>
<body>
  <script>
    // 连接 MQTT Broker (WebSocket)
    const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
      clientId: 'browser_' + Date.now()
    });

    client.on('connect', () => {
      console.log('已连接');
      client.subscribe('test/topic');
      client.publish('test/topic', 'Hello from browser!');
    });

    client.on('message', (topic, message) => {
      console.log('收到:', message.toString());
    });
  </script>
</body>
</html>`}</pre>
            </div>

            <h2>Python (paho-mqtt) 示例</h2>
            <div className="code-block">
              <pre>{`import paho.mqtt.client as mqtt
import json

# 回调函数
def on_connect(client, userdata, flags, rc):
    print(f"已连接，返回码: {rc}")
    # 订阅主题
    client.subscribe("sensor/#", qos=1)

def on_message(client, userdata, msg):
    print(f"收到消息 [{msg.topic}]: {msg.payload.decode()}")

def on_disconnect(client, userdata, rc):
    print(f"已断开，返回码: {rc}")

# 创建客户端
client = mqtt.Client(client_id="python_client")
client.username_pw_set("user", "pass")

# 设置回调
client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect

# 连接 Broker
client.connect("broker.example.com", 1883, 60)

# 发布消息
client.publish("sensor/temperature",
               json.dumps({"value": 25.5}),
               qos=1)

# 开始循环
client.loop_forever()

# 或使用非阻塞方式
# client.loop_start()
# # 做其他事情...
# client.loop_stop()`}</pre>
            </div>

            <h2>Go (paho.mqtt.golang) 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "log"
    "time"

    mqtt "github.com/eclipse/paho.mqtt.golang"
)

func main() {
    // 配置选项
    opts := mqtt.NewClientOptions()
    opts.AddBroker("tcp://broker.example.com:1883")
    opts.SetClientID("go_client")
    opts.SetUsername("user")
    opts.SetPassword("pass")

    // 设置回调
    opts.OnConnect = func(c mqtt.Client) {
        fmt.Println("已连接")
        // 订阅主题
        c.Subscribe("sensor/#", 1, nil)
    }

    // 创建客户端
    client := mqtt.NewClient(opts)
    if token := client.Connect(); token.Wait() && token.Error() != nil {
        log.Fatal(token.Error())
    }

    // 发布消息
    token := client.Publish("sensor/temperature", 1, false,
        \`{"value": 25.5}\`)
    token.Wait()

    // 订阅消息
    client.Subscribe("sensor/temperature", 1,
        func(c mqtt.Client, m mqtt.Message) {
            fmt.Printf("收到 [%s]: %s\\n", m.Topic(), m.Payload())
        })

    // 保持运行
    time.Sleep(10 * time.Second)
    client.Disconnect(250)
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

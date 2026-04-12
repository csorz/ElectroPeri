import { useCallback, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

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

export default function MqttToolPage() {
  // Connection config
  const [brokerUrl, setBrokerUrl] = useState('')
  const [port, setPort] = useState(1883)
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

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const addLog = useCallback((type: LogType, message: string, topic?: string) => {
    const timestamp = new Date().toLocaleTimeString()
    logIdRef.current += 1
    setLogs((prev) => [...prev, { id: logIdRef.current, timestamp, type, topic, message }])
  }, [])

  // Auto-scroll to latest log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  // Set up event listeners
  useEffect(() => {
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

  const handleConnect = async () => {
    setError(null)

    if (!brokerUrl.trim()) {
      setError('请输入服务器地址')
      return
    }

    setConnecting(true)
    addLog('system', `Connecting to ${brokerUrl}:${port}...`)

    try {
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
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : '连接失败'
      setError(errMsg)
      addLog('error', errMsg)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    addLog('system', '正在断开连接...')
    await window.api.mqtt.disconnect()
    setConnected(false)
    setSubscriptions([])
    addLog('system', '已断开')
  }

  const handleSubscribe = async () => {
    if (!subTopic.trim()) {
      setError('请输入订阅主题')
      return
    }

    const result = await window.api.mqtt.subscribe(subTopic, subQos)
    if (result.success) {
      addLog('system', `Subscribed to ${subTopic} (QoS ${subQos})`)
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
  }

  const handleUnsubscribe = async (topic: string) => {
    const result = await window.api.mqtt.unsubscribe(topic)
    if (result.success) {
      addLog('system', `Unsubscribed from ${topic}`)
      setSubscriptions((prev) => prev.filter((s) => s.topic !== topic))
    } else {
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

    const result = await window.api.mqtt.publish(pubTopic, pubMessage, pubQos, pubRetain)
    if (result.success) {
      addLog('send', pubMessage, pubTopic)
      setPubMessage('')
    } else {
      setError(result.error || '发布失败')
      addLog('error', `发布失败: ${result.error}`)
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
    onCopy(text)
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

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/http" className="toolbox-back">
        Return to Utilities
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📡</span>
          <h1>MQTT Tool</h1>
        </div>
        <p className="page-sub">MQTT connection test, subscribe and publish messages</p>
      </div>

      <section className="tool-card">
        {/* Connection Config Section */}
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">连接配置</div>

          <div className="tool-row">
            <label className="tool-label">
              服务器地址
              <input
                type="text"
                className="tool-input"
                value={brokerUrl}
                onChange={(e) => setBrokerUrl(e.target.value)}
                placeholder="例如: mqtt://broker.example.com"
                disabled={connected}
              />
            </label>
          </div>

          <div className="tool-inline">
            <label className="tool-label">
              端口
              <input
                type="number"
                className="tool-input"
                style={{ width: 100 }}
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value) || 1883)}
                disabled={connected}
              />
            </label>

            <label className="tool-label">
              心跳间隔
              <input
                type="number"
                className="tool-input"
                style={{ width: 100 }}
                value={keepAlive}
                onChange={(e) => setKeepAlive(parseInt(e.target.value) || 60)}
                disabled={connected}
              />
            </label>

            <label className="tool-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={cleanSession}
                onChange={(e) => setCleanSession(e.target.checked)}
                disabled={connected}
              />
              清除会话
            </label>
          </div>

          <div className="tool-inline">
            <label className="tool-label">
              用户名 (可选)
              <input
                type="text"
                className="tool-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名"
                disabled={connected}
              />
            </label>

            <label className="tool-label">
              密码 (可选)
              <input
                type="password"
                className="tool-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                disabled={connected}
              />
            </label>
          </div>

          <div className="tool-row">
            <label className="tool-label">
              客户端 ID (可选，留空自动生成)
              <input
                type="text"
                className="tool-input"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="自动生成"
                disabled={connected}
              />
            </label>
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

        {/* Subscribe Section (visible when connected) */}
        {connected && (
          <div className="tool-block">
            <div className="tool-block-title">订阅主题</div>

            <div className="tool-inline">
              <input
                type="text"
                className="tool-input"
                style={{ flex: 1 }}
                value={subTopic}
                onChange={(e) => setSubTopic(e.target.value)}
                placeholder="主题，例如: sensor/temperature"
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              />
              <select
                className="tool-input"
                style={{ width: 80 }}
                value={subQos}
                onChange={(e) => setSubQos(parseInt(e.target.value) as 0 | 1 | 2)}
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
              <div className="tool-result" style={{ background: '#f5f5f5', color: '#333' }}>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>已订阅主题:</div>
                {subscriptions.map((sub) => (
                  <div
                    key={sub.topic}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    <span className="mono" style={{ fontSize: 12 }}>
                      {sub.topic} <span style={{ color: '#888' }}>(QoS {sub.qos})</span>
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleUnsubscribe(sub.topic)}
                    >
                      取消订阅
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Publish Section (visible when connected) */}
        {connected && (
          <div className="tool-block">
            <div className="tool-block-title">发布消息</div>

            <div className="tool-row">
              <input
                type="text"
                className="tool-input"
                value={pubTopic}
                onChange={(e) => setPubTopic(e.target.value)}
                placeholder="主题，例如: sensor/temperature"
              />
            </div>

            <div className="tool-row">
              <textarea
                className="tool-textarea"
                value={pubMessage}
                onChange={(e) => setPubMessage(e.target.value)}
                placeholder="消息内容..."
                rows={3}
              />
            </div>

            <div className="tool-inline">
              <select
                className="tool-input"
                style={{ width: 80 }}
                value={pubQos}
                onChange={(e) => setPubQos(parseInt(e.target.value) as 0 | 1 | 2)}
              >
                <option value={0}>QoS 0</option>
                <option value={1}>QoS 1</option>
                <option value={2}>QoS 2</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="checkbox"
                  checked={pubRetain}
                  onChange={(e) => setPubRetain(e.target.checked)}
                />
                保留消息
              </label>

              <button type="button" className="btn btn-primary" onClick={handlePublish}>
                发布
              </button>
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
              placeholder="按主题或消息过滤..."
            />
          </div>

          <div
            ref={logContainerRef}
            className="tool-result mono"
            style={{
              minHeight: '150px',
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
                <div key={log.id} style={{ color: getLogTypeColor(log.type) }}>
                  <span style={{ color: '#888' }}>[{log.timestamp}]</span>{' '}
                  <span style={{ fontWeight: 600 }}>[{log.type.toUpperCase()}]</span>{' '}
                  {log.topic && <span style={{ color: '#b39ddb' }}>[{log.topic}]</span>}{' '}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

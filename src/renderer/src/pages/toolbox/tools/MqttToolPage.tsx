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

export default function MqttToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

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
    addLog('system', `正在连接 ${brokerUrl}:${port}...`)

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
  }

  const handleUnsubscribe = async (topic: string) => {
    const result = await window.api.mqtt.unsubscribe(topic)
    if (result.success) {
      addLog('system', `已取消订阅 ${topic}`)
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
                <h3>保持连接</h3>
                <p>心跳机制保持长连接，支持遗嘱消息和保留消息</p>
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

            <h2>消息类型</h2>
            <div className="info-box">
              <strong>控制报文类型</strong>
              <ul>
                <li><code>CONNECT</code> (1) - 客户端请求连接</li>
                <li><code>CONNACK</code> (2) - 连接确认</li>
                <li><code>PUBLISH</code> (3) - 发布消息</li>
                <li><code>PUBACK</code> (4) - 发布确认 (QoS 1)</li>
                <li><code>SUBSCRIBE</code> (8) - 订阅请求</li>
                <li><code>SUBACK</code> (9) - 订阅确认</li>
                <li><code>PINGREQ</code> (12) - 心跳请求</li>
                <li><code>PINGRESP</code> (13) - 心跳响应</li>
                <li><code>DISCONNECT</code> (14) - 断开连接</li>
              </ul>
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
                  <label>服务器地址</label>
                  <input
                    type="text"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    value={brokerUrl}
                    onChange={(e) => setBrokerUrl(e.target.value)}
                    placeholder="mqtt://broker.example.com"
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

// 连接 Broker
const client = mqtt.connect('mqtt://broker.example.com', {
  clientId: 'client_' + Math.random().toString(16).slice(2, 10),
  username: 'user',
  password: 'pass',
  clean: true,
  keepalive: 60
});

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

            <h2>Java (Eclipse Paho) 示例</h2>
            <div className="code-block">
              <pre>{`import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

public class MqttExample {
    public static void main(String[] args) throws Exception {
        String broker = "tcp://broker.example.com:1883";
        String clientId = "java_client";

        MqttClient client = new MqttClient(broker, clientId, new MemoryPersistence());

        // 配置选项
        MqttConnectOptions options = new MqttConnectOptions();
        options.setUserName("user");
        options.setPassword("pass".toCharArray());
        options.setCleanSession(true);

        // 设置回调
        client.setCallback(new MqttCallback() {
            public void connectionLost(Throwable cause) {
                System.out.println("连接丢失");
            }

            public void messageArrived(String topic, MqttMessage message) {
                System.out.println("收到 [" + topic + "]: " + new String(message.getPayload()));
            }

            public void deliveryComplete(IMqttDeliveryToken token) {}
        });

        // 连接
        client.connect(options);
        System.out.println("已连接");

        // 订阅
        client.subscribe("sensor/#", 1);

        // 发布
        MqttMessage message = new MqttMessage();
        message.setPayload("{\"value\": 25.5}".getBytes());
        client.publish("sensor/temperature", message);

        // 保持运行
        Thread.sleep(10000);
        client.disconnect();
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

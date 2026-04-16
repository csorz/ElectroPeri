import { useEffect, useMemo, useRef, useState } from 'react'
import '../toolbox/tools/ToolPage.css'

const baudRateOptions = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]

interface SerialConfig {
  baudRate: number
}

interface WebSerialConnection {
  id: string
  label: string
  config: SerialConfig
  data: string
  sendFormat: 'text' | 'hex'
  appendNewline: boolean
  port: SerialPort
}

const defaultConfig: SerialConfig = {
  baudRate: 9600
}

// 16进制快捷示例
const hexExamples = [
  { label: 'AT', value: '4154' },
  { label: 'AT+RST', value: '41542B525354' },
  { label: '01 02 03', value: '010203' },
  { label: 'FF FE', value: 'FFFE' }
]

export default function WebSerialPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔌 Web Serial API</h1>
        <p>浏览器原生串口访问接口</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>
          交互演示
        </button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>
          概念详解
        </button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>
          代码示例
        </button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && <ConceptSection />}
        {activeTab === 'demo' && <WebSerialDemo />}
        {activeTab === 'code' && <CodeSection />}
      </div>
    </div>
  )
}

function ConceptSection() {
  return (
    <div className="concept-section">
      <h2>核心特性</h2>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>浏览器原生</h3>
          <p>无需安装驱动或插件，浏览器直接访问本地串口设备</p>
        </div>
        <div className="feature-card">
          <h3>安全上下文</h3>
          <p>仅在 HTTPS 或 localhost 环境下可用，需要用户授权</p>
        </div>
        <div className="feature-card">
          <h3>流式 API</h3>
          <p>使用 ReadableStream/WritableStream 进行异步数据读写</p>
        </div>
        <div className="feature-card">
          <h3>跨平台</h3>
          <p>在支持的浏览器中跨平台运行，无需修改代码</p>
        </div>
      </div>

      <h2>浏览器支持</h2>
      <table className="comparison-table">
        <thead>
          <tr>
            <th>浏览器</th>
            <th>最低版本</th>
            <th>支持状态</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chrome</td>
            <td>89+</td>
            <td>完全支持</td>
          </tr>
          <tr>
            <td>Edge</td>
            <td>89+</td>
            <td>完全支持</td>
          </tr>
          <tr>
            <td>Opera</td>
            <td>75+</td>
            <td>完全支持</td>
          </tr>
          <tr>
            <td>Firefox</td>
            <td>-</td>
            <td>不支持</td>
          </tr>
          <tr>
            <td>Safari</td>
            <td>-</td>
            <td>不支持</td>
          </tr>
        </tbody>
      </table>

      <h2>API 核心方法</h2>
      <div className="config-table">
        <table>
          <thead>
            <tr>
              <th>方法</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>navigator.serial.requestPort()</code>
              </td>
              <td>请求用户选择并授权串口</td>
            </tr>
            <tr>
              <td>
                <code>navigator.serial.getPorts()</code>
              </td>
              <td>获取已授权的串口列表</td>
            </tr>
            <tr>
              <td>
                <code>port.open(options)</code>
              </td>
              <td>以指定参数打开串口</td>
            </tr>
            <tr>
              <td>
                <code>port.readable.getReader()</code>
              </td>
              <td>获取读取流</td>
            </tr>
            <tr>
              <td>
                <code>port.writable.getWriter()</code>
              </td>
              <td>获取写入流</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="info-box warning">
        <strong>安全要求</strong>
        <ul>
          <li>必须在安全上下文中运行（HTTPS 或 localhost）</li>
          <li>首次访问需要用户手动授权</li>
          <li>授权后页面刷新仍可访问已授权设备</li>
        </ul>
      </div>

      <h2>应用场景</h2>
      <ul className="scenario-list">
        <li>
          <strong>Web IDE</strong> - 在线 Arduino/ESP32 编程、固件上传
        </li>
        <li>
          <strong>串口调试</strong> - 网页端串口调试工具，无需安装软件
        </li>
        <li>
          <strong>数据采集</strong> - 直接从传感器读取数据并可视化
        </li>
        <li>
          <strong>设备配置</strong> - 通过串口配置嵌入式设备参数
        </li>
        <li>
          <strong>教育场景</strong> - 学生无需安装驱动即可进行硬件交互
        </li>
      </ul>
    </div>
  )
}

function CodeSection() {
  return (
    <div className="code-section">
      <h2>JavaScript 示例</h2>
      <div className="code-block">
        <pre>{`// Web Serial API 基本使用
async function connectSerial() {
  // 检查浏览器支持
  if (!('serial' in navigator)) {
    console.error('浏览器不支持 Web Serial API')
    return
  }

  try {
    // 请求用户选择串口
    const port = await navigator.serial.requestPort()

    // 打开串口
    await port.open({ baudRate: 115200 })

    // 设置文本编解码器
    const textEncoder = new TextEncoderStream()
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable)
    const writer = textEncoder.writable.getWriter()

    const textDecoder = new TextDecoderStream()
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable)
    const reader = textDecoder.readable.getReader()

    // 发送数据
    await writer.write('Hello Serial\\n')

    // 读取数据
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      console.log('收到:', value)
    }

    // 关闭连接
    writer.close()
    reader.cancel()
    await port.close()
  } catch (err) {
    console.error('串口错误:', err)
  }
}`}</pre>
      </div>

      <h2>TypeScript 示例</h2>
      <div className="code-block">
        <pre>{`// Web Serial API TypeScript 示例
interface SerialOptions {
  baudRate: number
  dataBits?: 7 | 8
  stopBits?: 1 | 2
  parity?: 'none' | 'even' | 'odd'
  bufferSize?: number
}

async function openSerialPort(options: SerialOptions): Promise<SerialPort> {
  const ports = await navigator.serial.getPorts()

  if (ports.length === 0) {
    const port = await navigator.serial.requestPort()
    await port.open(options)
    return port
  }

  const port = ports[0]
  if (!port.readable) {
    await port.open(options)
  }
  return port
}

async function readFromPort(port: SerialPort): Promise<void> {
  if (!port.readable) return

  const reader = port.readable.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      console.log(decoder.decode(value))
    }
  } finally {
    reader.releaseLock()
  }
}

async function writeToPort(port: SerialPort, data: string): Promise<void> {
  if (!port.writable) return

  const writer = port.writable.getWriter()
  const encoder = new TextEncoder()

  try {
    await writer.write(encoder.encode(data))
  } finally {
    writer.releaseLock()
  }
}`}</pre>
      </div>
    </div>
  )
}

function WebSerialDemo() {
  const [error, setError] = useState<string | null>(null)
  const [authorizedPorts, setAuthorizedPorts] = useState<SerialPort[]>([])
  const [connections, setConnections] = useState<WebSerialConnection[]>([])
  const [portConfigs, setPortConfigs] = useState<Record<number, SerialConfig>>({})

  const isMountedRef = useRef(true)

  const supported = typeof navigator !== 'undefined' && 'serial' in navigator
  const textEncoder = useMemo(() => new TextEncoder(), [])
  const textDecoder = useMemo(() => new TextDecoder(), [])

  // 获取端口标签
  const getPortLabel = (port: SerialPort, index: number): string => {
    const info = port.getInfo()
    const vid = info.usbVendorId ? `VID: 0x${info.usbVendorId.toString(16).toUpperCase()}` : ''
    const pid = info.usbProductId ? `PID: 0x${info.usbProductId.toString(16).toUpperCase()}` : ''
    const meta = [vid, pid].filter(Boolean).join(' / ')
    return meta ? `端口 ${index + 1} (${meta})` : `端口 ${index + 1}`
  }

  // 刷新已授权端口列表
  const refreshPorts = async () => {
    if (!supported) return
    try {
      const ports = await navigator.serial.getPorts()
      setAuthorizedPorts(ports)

      // 为每个端口初始化默认配置
      const newConfigs: Record<number, SerialConfig> = {}
      ports.forEach((_, index) => {
        newConfigs[index] = portConfigs[index] || { ...defaultConfig }
      })
      setPortConfigs(newConfigs)

      console.log('[Web Serial] 已授权端口:', ports.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取端口失败')
    }
  }

  // 请求授权新端口
  const handleRequestPort = async () => {
    if (!supported) return
    setError(null)
    try {
      await navigator.serial.requestPort()
      await refreshPorts()
      console.log('[Web Serial] 已授权新端口')
    } catch (err) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        console.log('[Web Serial] 用户取消了授权')
        return
      }
      setError(err instanceof Error ? err.message : '授权失败')
    }
  }

  // 连接串口
  const handleConnect = async (portIndex: number) => {
    if (!supported) return

    const port = authorizedPorts[portIndex]
    if (!port) return

    const config = portConfigs[portIndex] || defaultConfig
    setError(null)

    try {
      // 检查端口是否已被连接
      if (connections.some(c => c.port === port)) {
        setError('该端口已连接')
        return
      }

      // 检查端口是否已打开
      if (port.readable || port.writable) {
        setError('端口已被占用')
        return
      }

      await port.open({ baudRate: config.baudRate })

      const connectionId = `port-${portIndex}-${Date.now()}`
      const newConnection: WebSerialConnection = {
        id: connectionId,
        label: getPortLabel(port, portIndex),
        config,
        data: '',
        sendFormat: 'text',
        appendNewline: false,
        port
      }

      setConnections(prev => [...prev, newConnection])

      // 启动读取循环
      startReadLoop(newConnection)

      console.log(`[Web Serial] 已连接: ${newConnection.label} @ ${config.baudRate}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    }
  }

  // 启动读取循环
  const startReadLoop = async (connection: WebSerialConnection) => {
    const port = connection.port
    if (!port?.readable) return

    const reader = port.readable.getReader()

    while (isMountedRef.current) {
      try {
        const { value, done } = await reader.read()
        if (done) break
        if (value) {
          const text = textDecoder.decode(value)
          setConnections(prev =>
            prev.map(c => c.id === connection.id ? { ...c, data: c.data + text + '\n' } : c)
          )
          console.log(`[Web Serial RX]: "${text}"`)
        }
      } catch (err) {
        console.error('[Web Serial] 读取错误:', err)
        break
      }
    }

    try {
      reader.releaseLock()
    } catch {
      // ignore
    }
  }

  // 断开连接
  const handleDisconnect = async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId)
    if (!connection) return

    try {
      const port = connection.port
      if (port.readable) {
        const reader = port.readable.getReader()
        await reader.cancel()
        reader.releaseLock()
      }
      if (port.writable) {
        const writer = port.writable.getWriter()
        writer.close()
        writer.releaseLock()
      }
      await port.close()
    } catch (err) {
      console.error('[Web Serial] 断开连接错误:', err)
    }

    setConnections(prev => prev.filter(c => c.id !== connectionId))
    console.log(`[Web Serial] 已断开: ${connection.label}`)
  }

  // 发送数据
  const handleSend = async (connectionId: string, message: string, sendFormat: 'text' | 'hex', appendNewline: boolean) => {
    const connection = connections.find(c => c.id === connectionId)
    if (!connection || !connection.port.writable) return

    let dataToSend = message

    // 16进制格式转换
    if (sendFormat === 'hex') {
      const hexStr = message.replace(/[\s,]/g, '')
      if (!/^[0-9a-fA-F]*$/.test(hexStr) || hexStr.length % 2 !== 0) {
        alert('16进制格式错误，请输入偶数个十六进制字符')
        return
      }
      const bytes: number[] = []
      for (let i = 0; i < hexStr.length; i += 2) {
        bytes.push(parseInt(hexStr.substring(i, i + 2), 16))
      }
      dataToSend = String.fromCharCode(...bytes)
    }

    if (appendNewline) {
      dataToSend += '\n'
    }

    try {
      const writer = connection.port.writable.getWriter()
      await writer.write(textEncoder.encode(dataToSend))
      writer.releaseLock()
      console.log(`[Web Serial TX]: "${message}"`)
    } catch (err) {
      console.error('[Web Serial] 发送失败:', err)
    }
  }

  // 更新端口配置
  const updatePortConfig = (portIndex: number, baudRate: number) => {
    setPortConfigs(prev => ({
      ...prev,
      [portIndex]: { baudRate }
    }))
  }

  // 更新连接配置
  const updateConnection = (connectionId: string, updates: Partial<WebSerialConnection>) => {
    setConnections(prev =>
      prev.map(c => c.id === connectionId ? { ...c, ...updates } : c)
    )
  }

  // 初始化
  useEffect(() => {
    isMountedRef.current = true
    refreshPorts()
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return (
    <div className="connection-demo">
      <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
        <div style={{ marginBottom: 4 }}>
          <strong>浏览器支持:</strong> Chrome 89+ | Edge 89+ | Opera 75+
        </div>
        <div style={{ color: '#666' }}>
          <strong>要求:</strong> HTTPS 或 localhost 安全上下文
        </div>
      </div>

      {!supported && (
        <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, marginBottom: 16, color: '#c62828' }}>
          当前环境不支持 Web Serial API，请使用 Chrome/Edge 浏览器
        </div>
      )}

      {error && (
        <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, marginBottom: 16, color: '#c62828' }}>
          {error}
        </div>
      )}

      {/* 操作区域 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={refreshPorts}
          disabled={!supported}
          style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          刷新列表
        </button>
        <button
          onClick={handleRequestPort}
          disabled={!supported}
          style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          请求授权
        </button>
        <span style={{ fontSize: 13, color: '#666' }}>
          已授权端口: {authorizedPorts.length} | 已连接: {connections.length}
        </span>
      </div>

      {/* 已授权端口列表 */}
      {authorizedPorts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>已授权端口</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {authorizedPorts.map((port, index) => {
              const isConnected = connections.some((c) => c.port === port)
              const config = portConfigs[index] || defaultConfig

              return (
                <div
                  key={index}
                  style={{
                    background: isConnected ? '#e8f5e9' : '#fff',
                    borderRadius: 8,
                    border: isConnected ? '1px solid #a5d6a7' : '1px solid #e0e0e0',
                    padding: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    {/* 端口信息 */}
                    <div style={{ minWidth: 150 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{getPortLabel(port, index)}</div>
                    </div>

                    {/* 配置选项 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      {/* 波特率 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <label style={{ fontSize: 11, color: '#666' }}>波特率</label>
                        <select
                          value={config.baudRate}
                          onChange={(e) => updatePortConfig(index, Number(e.target.value))}
                          disabled={isConnected}
                          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                        >
                          {baudRateOptions.map((rate) => (
                            <option key={rate} value={rate}>{rate}</option>
                          ))}
                        </select>
                      </div>

                      {/* 连接按钮 */}
                      <button
                        onClick={() => handleConnect(index)}
                        disabled={!supported || isConnected}
                        style={{
                          padding: '6px 16px',
                          background: isConnected ? '#ccc' : '#4caf50',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          cursor: isConnected ? 'not-allowed' : 'pointer',
                          fontSize: 12
                        }}
                      >
                        {isConnected ? '已连接' : '连接'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 已连接的串口卡片 */}
      {connections.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>已连接 ({connections.length})</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: 16 }}>
            {connections.map((conn) => (
              <SerialCard
                key={conn.id}
                connection={conn}
                onDisconnect={handleDisconnect}
                onSend={handleSend}
                onUpdateConnection={(updates) => updateConnection(conn.id, updates)}
              />
            ))}
          </div>
        </div>
      )}

      {authorizedPorts.length === 0 && (
        <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 40 }}>
          点击"请求授权"选择并授权串口设备
        </div>
      )}
    </div>
  )
}

// 串口卡片组件
function SerialCard({
  connection,
  onDisconnect,
  onSend,
  onUpdateConnection
}: {
  connection: WebSerialConnection
  onDisconnect: (connectionId: string) => void
  onSend: (connectionId: string, message: string, sendFormat: 'text' | 'hex', appendNewline: boolean) => void
  onUpdateConnection: (updates: Partial<WebSerialConnection>) => void
}) {
  const [message, setMessage] = useState('')
  const dataRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (dataRef.current) {
      dataRef.current.scrollTop = dataRef.current.scrollHeight
    }
  }, [connection.data])

  // 发送数据
  const handleSend = () => {
    if (!message.trim()) return
    onSend(connection.id, message, connection.sendFormat, connection.appendNewline)
    setMessage('')
  }

  // 清空数据
  const handleClear = () => {
    onUpdateConnection({ data: '' })
  }

  // 格式化显示数据
  const formatDisplayData = (rawData: string): string => {
    const lines = rawData.split('\n')
    const result: string[] = []

    lines.forEach((line, index) => {
      if (line === '' && index === lines.length - 1) return

      let formattedLine = ''
      for (let i = 0; i < line.length; i++) {
        const code = line.charCodeAt(i)
        if (code >= 32 && code <= 126) {
          formattedLine += line[i]
        } else if (code === 13) {
          formattedLine += '↵'
        } else if (code === 9) {
          formattedLine += '→'
        } else {
          formattedLine += `[${code.toString(16).padStart(2, '0').toUpperCase()}]`
        }
      }
      result.push(formattedLine)
    })

    return result.join('\n')
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      {/* 卡片头部 */}
      <div
        style={{
          padding: '10px 14px',
          background: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <span style={{ fontWeight: 500, fontSize: 13 }}>{connection.label}</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: '#666' }}>
            {connection.config.baudRate} baud
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50' }} />
          <button
            onClick={() => onDisconnect(connection.id)}
            style={{
              padding: '4px 10px',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            断开
          </button>
        </div>
      </div>

      {/* 数据区域 */}
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#666' }}>接收数据</span>
          <button
            onClick={handleClear}
            style={{
              padding: '2px 8px',
              background: '#e0e0e0',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11
            }}
          >
            清空
          </button>
        </div>

        <div
          ref={dataRef}
          style={{
            background: '#1e1e1e',
            color: '#4fc3f7',
            padding: 10,
            borderRadius: 6,
            height: 150,
            overflowY: 'auto',
            fontFamily: 'Consolas, monospace',
            fontSize: 12,
            marginBottom: 12
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {connection.data ? formatDisplayData(connection.data) : '暂无数据'}
          </pre>
        </div>

        {/* 发送选项 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          {/* 发送格式 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#666' }}>发送格式</label>
            <select
              value={connection.sendFormat}
              onChange={(e) => onUpdateConnection({ sendFormat: e.target.value as 'text' | 'hex' })}
              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
            >
              <option value="text">文本</option>
              <option value="hex">16进制</option>
            </select>
          </div>

          {/* 16进制快捷示例 */}
          {connection.sendFormat === 'hex' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#999' }}>示例:</span>
              {hexExamples.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setMessage(ex.value)}
                  style={{
                    padding: '2px 6px',
                    background: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: 10
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}

          {/* 追加换行 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={connection.appendNewline}
              onChange={(e) => onUpdateConnection({ appendNewline: e.target.checked })}
            />
            追加换行
          </label>
        </div>

        {/* 发送输入框 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={connection.sendFormat === 'hex' ? '输入16进制数据，如: 01 02 03' : '输入要发送的数据...'}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #ddd',
              fontFamily: connection.sendFormat === 'hex' ? 'Consolas, monospace' : 'inherit',
              fontSize: 12
            }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            style={{
              padding: '8px 16px',
              background: message.trim() ? '#4fc3f7' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              fontSize: 12
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

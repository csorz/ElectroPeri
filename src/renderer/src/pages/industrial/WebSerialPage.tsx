import { useEffect, useMemo, useRef, useState } from 'react'
import '../toolbox/tools/ToolPage.css'

type DeviceStatus = 'idle' | 'scanning' | 'connected' | 'error'

const baudRateOptions = [9600, 19200, 38400, 57600, 115200]

export default function WebSerialPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔌 Web Serial API</h1>
        <p>浏览器原生串口访问接口</p>
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
                    <td><code>navigator.serial.requestPort()</code></td>
                    <td>请求用户选择并授权串口</td>
                  </tr>
                  <tr>
                    <td><code>navigator.serial.getPorts()</code></td>
                    <td>获取已授权的串口列表</td>
                  </tr>
                  <tr>
                    <td><code>port.open(options)</code></td>
                    <td>以指定参数打开串口</td>
                  </tr>
                  <tr>
                    <td><code>port.readable.getReader()</code></td>
                    <td>获取读取流</td>
                  </tr>
                  <tr>
                    <td><code>port.writable.getWriter()</code></td>
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
              <li><strong>Web IDE</strong> - 在线 Arduino/ESP32 编程、固件上传</li>
              <li><strong>串口调试</strong> - 网页端串口调试工具，无需安装软件</li>
              <li><strong>数据采集</strong> - 直接从传感器读取数据并可视化</li>
              <li><strong>设备配置</strong> - 通过串口配置嵌入式设备参数</li>
              <li><strong>教育场景</strong> - 学生无需安装驱动即可进行硬件交互</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <WebSerialDemo />
          </div>
        )}

        {activeTab === 'code' && (
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

            <h2>React Hook 示例</h2>
            <div className="code-block">
              <pre>{`// 自定义 React Hook 用于串口操作
import { useState, useEffect, useRef } from 'react'

function useSerial() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const portRef = useRef<SerialPort | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null)

  const connect = async (baudRate: number = 115200) => {
    try {
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate })
      portRef.current = port
      setIsConnected(true)
      setError(null)
      return port
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
      return null
    }
  }

  const disconnect = async () => {
    if (portRef.current) {
      await readerRef.current?.cancel()
      await portRef.current.close()
      portRef.current = null
      setIsConnected(false)
    }
  }

  const write = async (data: string) => {
    if (!portRef.current?.writable) return
    const writer = portRef.current.writable.getWriter()
    await writer.write(new TextEncoder().encode(data))
    writer.releaseLock()
  }

  return { isConnected, error, connect, disconnect, write }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Web Serial 演示组件
function WebSerialDemo() {
  const [status, setStatus] = useState<DeviceStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [ports, setPorts] = useState<SerialPort[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [baudRate, setBaudRate] = useState(9600)
  const [message, setMessage] = useState('')
  const [log, setLog] = useState('')

  const activePortRef = useRef<SerialPort | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null)
  const isMountedRef = useRef(true)

  const supported = typeof navigator !== 'undefined' && 'serial' in navigator
  const textEncoder = useMemo(() => new TextEncoder(), [])
  const textDecoder = useMemo(() => new TextDecoder(), [])

  const appendLog = (line: string) => {
    setLog((prev) => `${prev}${line}\n`)
  }

  const portLabel = (port: SerialPort, index: number) => {
    const info = port.getInfo()
    const vid = info.usbVendorId ? `VID: 0x${info.usbVendorId.toString(16).toUpperCase()}` : ''
    const pid = info.usbProductId ? `PID: 0x${info.usbProductId.toString(16).toUpperCase()}` : ''
    const meta = [vid, pid].filter(Boolean).join(' / ')
    return meta ? `端口 ${index + 1} (${meta})` : `端口 ${index + 1}`
  }

  const refreshGrantedPorts = async () => {
    if (!supported) return
    setStatus('scanning')
    setError(null)
    try {
      const granted = await navigator.serial.getPorts()
      setPorts(granted)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取已授权端口失败')
      setStatus('error')
    }
  }

  const handleRequestPort = async () => {
    if (!supported) return
    setStatus('scanning')
    setError(null)
    try {
      await navigator.serial.requestPort()
      await refreshGrantedPorts()
      appendLog('[SYS] 已完成一次端口授权')
    } catch (err) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        setStatus('idle')
        appendLog('[SYS] 用户取消了授权')
        return
      }
      setError(err instanceof Error ? err.message : '授权端口失败')
      setStatus('error')
    }
  }

  const closeCurrentPort = async () => {
    try {
      await readerRef.current?.cancel()
    } catch {
      // ignore cancel errors
    }
    try {
      readerRef.current?.releaseLock()
      writerRef.current?.releaseLock()
      readerRef.current = null
      writerRef.current = null
    } catch {
      // ignore lock release errors
    }
    try {
      await activePortRef.current?.close()
    } catch {
      // ignore close errors
    } finally {
      activePortRef.current = null
      if (isMountedRef.current) setStatus('idle')
    }
  }

  const startReadLoop = async () => {
    const port = activePortRef.current
    if (!port?.readable) return
    readerRef.current = port.readable.getReader()
    while (isMountedRef.current && readerRef.current) {
      try {
        const { value, done } = await readerRef.current.read()
        if (done) break
        if (value) {
          appendLog(`[RX] ${textDecoder.decode(value)}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '读取数据失败')
        setStatus('error')
        break
      }
    }
  }

  const handleConnect = async (index: number) => {
    if (!supported) return
    const port = ports[index]
    if (!port) return

    // If already connected to a different port, disconnect first
    if (status === 'connected' && selectedIndex !== index) {
      appendLog(`[SYS] 正在切换到端口 ${index + 1}...`)
      await closeCurrentPort()
    }

    setStatus('scanning')
    setError(null)
    try {
      await port.open({ baudRate })
      activePortRef.current = port
      writerRef.current = port.writable?.getWriter() ?? null
      setSelectedIndex(index)
      setStatus('connected')
      appendLog(`[SYS] 已连接 ${portLabel(port, index)} @ ${baudRate}`)
      void startReadLoop()
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
      setStatus('error')
    }
  }

  const handleDisconnect = async () => {
    await closeCurrentPort()
    setSelectedIndex(null)
    appendLog('[SYS] 端口已断开')
  }

  const handleSend = async () => {
    if (status !== 'connected' || !message.trim()) return
    try {
      await writerRef.current?.write(textEncoder.encode(message))
      appendLog(`[TX] ${message}`)
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
      setStatus('error')
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    void refreshGrantedPorts()
    return () => {
      isMountedRef.current = false
      void closeCurrentPort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          当前环境不支持 Web Serial API
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, color: '#666' }}>波特率:</label>
        <select
          value={baudRate}
          onChange={(e) => setBaudRate(Number(e.target.value))}
          disabled={status === 'connected'}
          style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
        >
          {baudRateOptions.map((rate) => (
            <option key={rate} value={rate}>{rate}</option>
          ))}
        </select>
        <button
          onClick={refreshGrantedPorts}
          disabled={!supported}
          style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          刷新已授权
        </button>
        <button
          onClick={handleRequestPort}
          disabled={!supported}
          style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          请求授权
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, marginBottom: 16, color: '#c62828' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>已授权端口 ({ports.length})</h4>
          {ports.length === 0 ? (
            <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
              点击"请求授权"，选择一个串口设备
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 180, overflowY: 'auto' }}>
              {ports.map((port, index) => (
                <li
                  key={index}
                  style={{
                    padding: '10px 12px',
                    background: selectedIndex === index ? '#e3f8ff' : '#fff',
                    borderRadius: 6,
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{portLabel(port, index)}</div>
                    {selectedIndex === index && status === 'connected' && (
                      <span style={{ color: '#4caf50', fontSize: 11 }}>已连接</span>
                    )}
                  </div>
                  {selectedIndex === index && status === 'connected' ? (
                    <button
                      onClick={handleDisconnect}
                      style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    >
                      断开
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(index)}
                      disabled={!supported || status === 'connected'}
                      style={{ padding: '6px 12px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    >
                      连接
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14 }}>数据收发</h4>
            <button
              onClick={() => setLog('')}
              style={{ padding: '4px 10px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              清空
            </button>
          </div>

          <div style={{
            background: '#1e1e1e',
            color: '#4fc3f7',
            padding: 12,
            borderRadius: 6,
            minHeight: 100,
            maxHeight: 150,
            overflowY: 'auto',
            fontFamily: 'Consolas, monospace',
            fontSize: 12,
            marginBottom: 12
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{log || '暂无数据'}</pre>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={status !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
            />
            <button
              onClick={handleSend}
              disabled={status !== 'connected' || !message.trim()}
              style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: status === 'connected' ? '#4caf50' : status === 'error' ? '#f44336' : '#ccc'
        }} />
        <span>
          状态: {status === 'idle' && '未连接'}
          {status === 'scanning' && '处理中'}
          {status === 'connected' && `已连接 - ${selectedIndex !== null ? `端口 ${selectedIndex + 1}` : ''}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}

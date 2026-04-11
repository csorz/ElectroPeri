import { useEffect, useMemo, useRef, useState } from 'react'
import './WebSerialPage.css'

type DeviceStatus = 'idle' | 'scanning' | 'connected' | 'error'

const baudRateOptions = [9600, 19200, 38400, 57600, 115200]

export default function WebSerialPage() {
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
    setStatus('scanning')
    setError(null)
    try {
      await closeCurrentPort()
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
    <div className="web-serial-page">
      <div className="page-header">
        <h1>Web 串口（Web Serial API）</h1>
        <div className="header-actions">
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            disabled={status === 'connected'}
          >
            {baudRateOptions.map((rate) => (
              <option key={rate} value={rate}>
                {rate}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={refreshGrantedPorts} disabled={!supported}>
            刷新已授权
          </button>
          <button className="btn btn-primary" onClick={handleRequestPort} disabled={!supported}>
            请求授权
          </button>
        </div>
      </div>

      {!supported && (
        <div className="error-message">
          <span>❌ 当前环境不支持 Web Serial API，请确认 Chromium 内核与安全上下文配置。</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>已授权端口 ({ports.length})</h3>
          {ports.length === 0 ? (
            <div className="empty-state">
              <p>点击“请求授权”，选择一个串口设备。</p>
            </div>
          ) : (
            <ul className="port-list">
              {ports.map((port, index) => (
                <li key={index} className={`port-item ${selectedIndex === index ? 'selected' : ''}`}>
                  <div className="port-info">
                    <span className="port-path">{portLabel(port, index)}</span>
                  </div>
                  <div className="port-actions">
                    {selectedIndex === index && status === 'connected' ? (
                      <button className="btn btn-danger" onClick={handleDisconnect}>
                        断开
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => handleConnect(index)}
                        disabled={!supported || status === 'connected'}
                      >
                        连接
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="data-panel">
          <div className="panel-header">
            <h3>数据收发</h3>
            <button className="btn btn-secondary" onClick={() => setLog('')}>
              清空
            </button>
          </div>

          <div className="data-display">
            <pre>{log || '暂无数据'}</pre>
          </div>

          <div className="send-panel">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={status !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={status !== 'connected' || !message.trim()}
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-indicator ${status}`} />
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

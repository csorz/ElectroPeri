import { useEffect, useRef, useState } from 'react'
import './WebSerialPage.css'

type DeviceStatus = 'idle' | 'scanning' | 'connected' | 'error'

export default function WebHidPage() {
  const [status, setStatus] = useState<DeviceStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<HIDDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<HIDDevice | null>(null)
  const [reportData, setReportData] = useState('')
  const [log, setLog] = useState('')

  const isMountedRef = useRef(true)

  const supported = typeof navigator !== 'undefined' && 'hid' in navigator

  const appendLog = (line: string) => {
    setLog((prev) => `${prev}${line}\n`)
  }

  const deviceLabel = (device: HIDDevice) => {
    const vendor = device.vendorId ? `VID: 0x${device.vendorId.toString(16).toUpperCase()}` : ''
    const product = device.productId ? `PID: 0x${device.productId.toString(16).toUpperCase()}` : ''
    const name = device.productName || 'HID Device'
    const meta = [vendor, product].filter(Boolean).join(' / ')
    return `${name}${meta ? ` (${meta})` : ''}`
  }

  const refreshDevices = async () => {
    if (!supported || !navigator.hid) return
    setStatus('scanning')
    setError(null)
    try {
      const granted = await navigator.hid.getDevices()
      setDevices(granted)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取设备列表失败')
      setStatus('error')
    }
  }

  const handleRequestDevice = async () => {
    if (!supported || !navigator.hid) return
    setStatus('scanning')
    setError(null)
    try {
      const device = await navigator.hid.requestDevice({
        filters: []
      })
      if (device) {
        appendLog(`[SYS] 已授权设备: ${deviceLabel(device)}`)
        await refreshDevices()
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        setStatus('idle')
        appendLog('[SYS] 用户取消了授权')
        return
      }
      setError(err instanceof Error ? err.message : '授权设备失败')
      setStatus('error')
    }
  }

  const handleConnect = async (device: HIDDevice) => {
    setError(null)
    try {
      await device.open()
      setSelectedDevice(device)
      setStatus('connected')
      appendLog(`[SYS] 已连接: ${deviceLabel(device)}`)

      device.oninputreport = (event) => {
        const { data, reportId } = event
        const hex = Array.from(new Uint8Array(data.buffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ')
        appendLog(`[RX] Report ${reportId}: ${hex}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
      setStatus('error')
    }
  }

  const handleDisconnect = async () => {
    if (selectedDevice) {
      try {
        await selectedDevice.close()
        appendLog('[SYS] 已断开连接')
      } catch (err) {
        // ignore
      }
    }
    setSelectedDevice(null)
    setStatus('idle')
  }

  const handleSendReport = async () => {
    if (!selectedDevice || !reportData.trim()) return

    try {
      // Parse hex string to bytes
      const bytes = reportData.trim().split(/\s+/).map(h => parseInt(h, 16))

      // Get output report ID from first byte or default to 0
      const reportId = bytes[0] || 0
      const reportDataBytes = bytes.slice(1)

      await selectedDevice.sendReport(reportId, new Uint8Array(reportDataBytes))
      appendLog(`[TX] Report ${reportId}: ${reportDataBytes.map(b => b.toString(16).padStart(2, '0')).join(' ')}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    void refreshDevices()
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return (
    <div className="web-serial-page">
      <div className="page-header">
        <h1>WebHID（HID 设备 API）</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={refreshDevices} disabled={!supported}>
            刷新设备
          </button>
          <button className="btn btn-primary" onClick={handleRequestDevice} disabled={!supported}>
            请求授权
          </button>
        </div>
      </div>

      {/* Browser Support Info */}
      <div className="browser-support-info" style={{
        background: '#e3f2fd',
        padding: '12px 16px',
        borderRadius: 4,
        marginBottom: 16,
        fontSize: 13
      }}>
        <div style={{ marginBottom: 4 }}>
          <strong>📋 浏览器支持:</strong> Chrome 89+ | Edge 89+ | Opera 75+
        </div>
        <div style={{ color: '#666' }}>
          <strong>⚠️ 需要:</strong> HTTPS 或 localhost 安全上下文
        </div>
      </div>

      {!supported && (
        <div className="error-message">
          <span>❌ 当前环境不支持 WebHID API，请使用 Chrome 89+ 并确保 HTTPS 环境。</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>已授权设备 ({devices.length})</h3>
          {devices.length === 0 ? (
            <div className="empty-state">
              <p>点击"请求授权"，选择一个 HID 设备。</p>
            </div>
          ) : (
            <ul className="port-list">
              {devices.map((device, index) => (
                <li key={index} className={`port-item ${selectedDevice === device ? 'selected' : ''}`}>
                  <div className="port-info">
                    <span className="port-path">{deviceLabel(device)}</span>
                    {device.collections && device.collections.length > 0 && (
                      <span style={{ fontSize: 11, color: '#666', display: 'block' }}>
                        {device.collections.length} collection(s)
                      </span>
                    )}
                  </div>
                  <div className="port-actions">
                    {selectedDevice === device && status === 'connected' ? (
                      <button className="btn btn-danger" onClick={handleDisconnect}>
                        断开
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => handleConnect(device)}
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
              value={reportData}
              onChange={(e) => setReportData(e.target.value)}
              placeholder="输入报告数据 (hex): reportId byte1 byte2..."
              disabled={status !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReport()}
              style={{ fontFamily: 'monospace' }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSendReport}
              disabled={status !== 'connected' || !reportData.trim()}
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
          {status === 'connected' && `已连接 - ${selectedDevice ? deviceLabel(selectedDevice) : ''}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}

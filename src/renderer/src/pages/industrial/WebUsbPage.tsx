import { useEffect, useRef, useState } from 'react'
import './WebSerialPage.css'

type DeviceStatus = 'idle' | 'scanning' | 'connected' | 'error'

export default function WebUsbPage() {
  const [status, setStatus] = useState<DeviceStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<USBDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<USBDevice | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0)
  const [transferData, setTransferData] = useState('')
  const [transferType, setTransferType] = useState<'bulk' | 'interrupt'>('bulk')
  const [direction, setDirection] = useState<'out' | 'in'>('out')
  const [log, setLog] = useState('')

  const isMountedRef = useRef(true)

  const supported = typeof navigator !== 'undefined' && 'usb' in navigator

  const appendLog = (line: string) => {
    setLog((prev) => `${prev}${line}\n`)
  }

  const deviceLabel = (device: USBDevice): string => {
    const vendor = device.vendorId ? `VID: 0x${device.vendorId.toString(16).toUpperCase().padStart(4, '0')}` : ''
    const product = device.productId ? `PID: 0x${device.productId.toString(16).toUpperCase().padStart(4, '0')}` : ''
    const name = device.productName || 'USB Device'
    const manufacturer = device.manufacturerName || ''
    const meta = [vendor, product].filter(Boolean).join(' / ')
    return `${manufacturer ? manufacturer + ' - ' : ''}${name}${meta ? ` (${meta})` : ''}`
  }

  const refreshDevices = async () => {
    if (!supported) return
    setStatus('scanning')
    setError(null)
    try {
      const granted = await navigator.usb.getDevices()
      setDevices(granted)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取设备列表失败')
      setStatus('error')
    }
  }

  const handleRequestDevice = async () => {
    if (!supported) return
    setStatus('scanning')
    setError(null)
    try {
      const device = await navigator.usb.requestDevice({
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

  const handleConnect = async (device: USBDevice) => {
    setError(null)
    try {
      await device.open()

      // Claim first interface if available
      if (device.configuration === null) {
        await device.selectConfiguration(1)
      }

      const interfaces = device.configuration?.interfaces || []
      if (interfaces.length > 0) {
        await device.claimInterface(0)
      }

      setSelectedDevice(device)
      setStatus('connected')
      appendLog(`[SYS] 已连接: ${deviceLabel(device)}`)

      if (device.configuration) {
        appendLog(`[SYS] 配置: ${device.configuration.configurationValue}`)
        device.configuration.interfaces.forEach((intf, i) => {
          appendLog(`[SYS] 接口 ${i}: ${intf.alternate.interfaceClass}`)
        })
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

  const handleTransfer = async () => {
    if (!selectedDevice || !transferData.trim()) return

    try {
      const bytes = transferData.trim().split(/\s+/).map(h => parseInt(h, 16))
      const data = new Uint8Array(bytes)

      if (direction === 'out') {
        if (transferType === 'bulk') {
          await selectedDevice.transferOut(selectedEndpoint, data)
          appendLog(`[TX] Bulk OUT EP${selectedEndpoint}: ${bytes.map(b => b.toString(16).padStart(2, '0')).join(' ')}`)
        } else {
          await selectedDevice.transferOut(selectedEndpoint, data)
          appendLog(`[TX] Interrupt OUT EP${selectedEndpoint}: ${bytes.map(b => b.toString(16).padStart(2, '0')).join(' ')}`)
        }
      } else {
        const result = transferType === 'bulk'
          ? await selectedDevice.transferIn(selectedEndpoint, 64)
          : await selectedDevice.transferIn(selectedEndpoint, 64)

        if (result.status === 'ok' && result.data) {
          const received = Array.from(new Uint8Array(result.data.buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ')
          appendLog(`[RX] ${transferType === 'bulk' ? 'Bulk' : 'Interrupt'} IN EP${selectedEndpoint}: ${received}`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '传输失败')
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
        <h1>WebUSB（USB 设备 API）</h1>
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
          <strong>📋 浏览器支持:</strong> Chrome 61+ | Edge 79+ | Opera 48+
        </div>
        <div style={{ color: '#666' }}>
          <strong>⚠️ 需要:</strong> HTTPS 或 localhost 安全上下文
        </div>
      </div>

      {!supported && (
        <div className="error-message">
          <span>❌ 当前环境不支持 WebUSB API，请使用 Chrome 61+ 并确保 HTTPS 环境。</span>
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
              <p>点击"请求授权"，选择一个 USB 设备。</p>
            </div>
          ) : (
            <ul className="port-list">
              {devices.map((device, index) => (
                <li key={index} className={`port-item ${selectedDevice === device ? 'selected' : ''}`}>
                  <div className="port-info">
                    <span className="port-path">{deviceLabel(device)}</span>
                    {device.serialNumber && (
                      <span style={{ fontSize: 11, color: '#666', display: 'block' }}>
                        SN: {device.serialNumber}
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
            <h3>数据传输</h3>
            <button className="btn btn-secondary" onClick={() => setLog('')}>
              清空
            </button>
          </div>

          <div className="data-display">
            <pre>{log || '暂无数据'}</pre>
          </div>

          {status === 'connected' && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value as 'bulk' | 'interrupt')}
                style={{ padding: '8px 12px' }}
              >
                <option value="bulk">Bulk</option>
                <option value="interrupt">Interrupt</option>
              </select>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'out' | 'in')}
                style={{ padding: '8px 12px' }}
              >
                <option value="out">OUT (发送)</option>
                <option value="in">IN (接收)</option>
              </select>
              <input
                type="number"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(parseInt(e.target.value) || 0)}
                placeholder="Endpoint"
                style={{ width: 100, padding: '8px 12px' }}
                min={0}
              />
            </div>
          )}

          <div className="send-panel">
            <input
              type="text"
              value={transferData}
              onChange={(e) => setTransferData(e.target.value)}
              placeholder="输入数据 (hex): 01 02 03..."
              disabled={status !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleTransfer()}
              style={{ fontFamily: 'monospace' }}
            />
            <button
              className="btn btn-primary"
              onClick={handleTransfer}
              disabled={status !== 'connected' || !transferData.trim()}
            >
              传输
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

import { useEffect, useState } from 'react'
import './HidPage.css'

type HidDeviceInfo = {
  product?: string
  manufacturer?: string
  vendorId: number
  productId: number
  serialNumber?: string
}

export default function HidPage() {
  const [devices, setDevices] = useState<HidDeviceInfo[]>([])
  const [selected, setSelected] = useState<HidDeviceInfo | null>(null)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState('')
  const [message, setMessage] = useState('')
  const [reportId, setReportId] = useState(0)

  const appendLog = (line: string) => setLog((prev) => prev + line + '\n')

  useEffect(() => {
    window.api.hid.onData((data: string) => appendLog(`RX: ${data}`))
    window.api.hid.onError((err: string) => setError(err))
    window.api.hid.onClosed(() => {
      appendLog('设备已关闭')
      setSelected(null)
      setStatus('idle')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatId = (id: number) => `0x${id.toString(16).toUpperCase().padStart(4, '0')}`

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const list = await window.api.hid.list()
      setDevices(list as HidDeviceInfo[])
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : '扫描失败')
      setStatus('error')
    }
  }

  const handleConnect = async (device: HidDeviceInfo) => {
    setError(null)
    setStatus('scanning')
    try {
      await window.api.hid.open(device.vendorId, device.productId)
      setSelected(device)
      setStatus('connected')
      appendLog(
        `已连接: ${device.product || 'HID 设备'} (${formatId(device.vendorId)}/${formatId(device.productId)})`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
      setStatus('error')
    }
  }

  const handleDisconnect = async () => {
    if (!selected) return
    try {
      await window.api.hid.close()
      appendLog('已断开连接')
    } catch (err) {
      setError(err instanceof Error ? err.message : '断开失败')
    } finally {
      setSelected(null)
      setStatus('idle')
    }
  }

  const handleSend = async () => {
    if (!selected || !message.trim()) return

    try {
      await window.api.hid.send(reportId, message)
      appendLog(`TX [${reportId}]: ${message}`)
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
    }
  }

  return (
    <div className="hid-page">
      <div className="page-header">
        <h1>HID 设备采集</h1>
        <button
          className="btn btn-primary"
          onClick={handleScan}
          disabled={status === 'scanning'}
        >
          {status === 'scanning' ? '扫描中...' : '扫描设备'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>设备列表 ({devices.length})</h3>
          {devices.length === 0 ? (
            <div className="empty-state">
              <p>点击“扫描设备”查找可用 HID 设备</p>
            </div>
          ) : (
            <ul className="device-list-items">
              {devices.map((device, idx) => {
                const selectedFlag =
                  selected?.productId === device.productId && selected?.vendorId === device.vendorId
                return (
                  <li
                    key={`${device.vendorId}-${device.productId}-${idx}`}
                    className={`device-item ${selectedFlag ? 'selected' : ''}`}
                  >
                    <div className="device-info">
                      <span className="device-name">{device.product || 'HID 设备'}</span>
                      <span className="device-ids">
                        VID: {formatId(device.vendorId)} | PID: {formatId(device.productId)}
                      </span>
                      {device.manufacturer && (
                        <span className="device-ids">厂商: {device.manufacturer}</span>
                      )}
                      {device.serialNumber && (
                        <span className="device-ids">SN: {device.serialNumber}</span>
                      )}
                    </div>
                    <div className="device-actions">
                      {selectedFlag ? (
                        <button className="btn btn-danger" onClick={handleDisconnect}>
                          断开
                        </button>
                      ) : (
                        <button
                          className="btn btn-success"
                          onClick={() => handleConnect(device)}
                          disabled={status === 'connected'}
                        >
                          连接
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="data-panel">
          <div className="panel-header">
            <h3>数据通信（Node 层）</h3>
            <button className="btn btn-secondary" onClick={() => setLog('')}>
              清空
            </button>
          </div>

          <div className="config-panel">
            <label>
              Report ID:
              <input
                type="number"
                min={0}
                max={255}
                value={reportId}
                onChange={(e) => setReportId(Number(e.target.value))}
                disabled={status !== 'connected'}
              />
            </label>
          </div>

          <div className="data-display">
            <pre>{log || '暂无数据'}</pre>
          </div>

          <div className="send-panel">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的文本，将作为 report 数据发送"
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
          {status === 'connected' && `已连接 - ${selected?.product || ''}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}


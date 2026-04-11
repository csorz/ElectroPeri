import { useState } from 'react'
import { useDeviceStore } from '../../store/deviceStore'
import type { UsbDevice } from '../../store/deviceStore'
import './UsbPage.css'

export default function UsbPage() {
  const {
    usbDevices,
    usbStatus,
    usbError,
    usbData,
    setUsbDevices,
    setUsbStatus,
    setUsbError,
    setUsbData
  } = useDeviceStore()

  const [selectedDevice, setSelectedDevice] = useState<UsbDevice | null>(null)
  const [endpoint, setEndpoint] = useState(1)
  const [message, setMessage] = useState('')

  // 扫描USB设备
  const handleScan = async () => {
    setUsbStatus('scanning')
    setUsbError(null)
    try {
      const devices = await window.api.usb.list()
      setUsbDevices(devices as UsbDevice[])
      setUsbStatus('idle')
    } catch (err) {
      setUsbError(err instanceof Error ? err.message : '扫描失败')
      setUsbStatus('error')
    }
  }

  // 连接USB设备
  const handleConnect = async (device: UsbDevice) => {
    setUsbStatus('scanning')
    setUsbError(null)
    try {
      await window.api.usb.open(device.vendorId, device.productId)
      setSelectedDevice(device)
      setUsbStatus('connected')

      // 监听数据
      window.api.usb.onData((data: string) => {
        setUsbData(data)
      })
    } catch (err) {
      setUsbError(err instanceof Error ? err.message : '连接失败')
      setUsbStatus('error')
    }
  }

  // 断开连接
  const handleDisconnect = async () => {
    try {
      await window.api.usb.close()
      setSelectedDevice(null)
      setUsbStatus('idle')
    } catch (err) {
      setUsbError(err instanceof Error ? err.message : '断开失败')
    }
  }

  // 发送数据
  const handleSend = async () => {
    if (!message.trim()) return
    try {
      await window.api.usb.write(endpoint, message)
      setMessage('')
    } catch (err) {
      setUsbError(err instanceof Error ? err.message : '发送失败')
    }
  }

  // 读取数据
  const handleRead = async () => {
    try {
      const data = await window.api.usb.read(endpoint)
      setUsbData(data)
    } catch (err) {
      setUsbError(err instanceof Error ? err.message : '读取失败')
    }
  }

  // 格式化VID/PID
  const formatId = (id: number) => {
    return `0x${id.toString(16).toUpperCase().padStart(4, '0')}`
  }

  return (
    <div className="usb-page">
      <div className="page-header">
        <h1>USB设备采集</h1>
        <button
          className="btn btn-primary"
          onClick={handleScan}
          disabled={usbStatus === 'scanning'}
        >
          {usbStatus === 'scanning' ? '扫描中...' : '扫描设备'}
        </button>
      </div>

      {usbError && (
        <div className="error-message">
          <span>❌ {usbError}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>设备列表 ({usbDevices.length})</h3>
          {usbDevices.length === 0 ? (
            <div className="empty-state">
              <p>点击"扫描设备"查找可用USB设备</p>
            </div>
          ) : (
            <ul className="device-list-items">
              {usbDevices.map((device, index) => (
                <li
                  key={`${device.vendorId}-${device.productId}-${index}`}
                  className={`device-item ${selectedDevice?.deviceAddress === device.deviceAddress ? 'selected' : ''}`}
                >
                  <div className="device-info">
                    <span className="device-name">
                      {device.product || '未知设备'}
                    </span>
                    <span className="device-ids">
                      VID: {formatId(device.vendorId)} | PID: {formatId(device.productId)}
                    </span>
                    {device.manufacturer && (
                      <span className="device-manufacturer">{device.manufacturer}</span>
                    )}
                    {device.serialNumber && (
                      <span className="device-serial">SN: {device.serialNumber}</span>
                    )}
                    <span className="device-address">地址: {device.deviceAddress}</span>
                  </div>
                  <div className="device-actions">
                    {selectedDevice?.deviceAddress === device.deviceAddress ? (
                      <button className="btn btn-danger" onClick={handleDisconnect}>
                        断开
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => handleConnect(device)}
                        disabled={usbStatus === 'connected'}
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
            <h3>数据通信</h3>
          </div>

          <div className="config-panel">
            <label>
              端点号:
              <input
                type="number"
                value={endpoint}
                onChange={(e) => setEndpoint(Number(e.target.value))}
                min={1}
                max={255}
                disabled={usbStatus !== 'connected'}
              />
            </label>
          </div>

          <div className="data-display">
            <pre>{usbData || '暂无数据'}</pre>
          </div>

          <div className="send-panel">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={usbStatus !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={usbStatus !== 'connected' || !message.trim()}
            >
              发送
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleRead}
              disabled={usbStatus !== 'connected'}
            >
              读取
            </button>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-indicator ${usbStatus}`} />
        <span>
          状态: {usbStatus === 'idle' && '未连接'}
          {usbStatus === 'scanning' && '扫描中'}
          {usbStatus === 'connected' && `已连接 - ${selectedDevice?.product || 'USB设备'}`}
          {usbStatus === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}

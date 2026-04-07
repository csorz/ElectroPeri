import { useState } from 'react'
import { useDeviceStore } from '../store/deviceStore'
import type { BluetoothDevice } from '../store/deviceStore'
import './BluetoothPage.css'

export default function BluetoothPage() {
  const {
    bluetoothDevices,
    bluetoothStatus,
    bluetoothError,
    bluetoothData,
    setBluetoothDevices,
    setBluetoothStatus,
    setBluetoothError,
    setBluetoothData
  } = useDeviceStore()

  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [message, setMessage] = useState('')
  const [serviceUuid, setServiceUuid] = useState('')

  // 扫描蓝牙设备
  const handleScan = async () => {
    setBluetoothStatus('scanning')
    setBluetoothError(null)
    try {
      const devices = await window.api.bluetooth.scan()
      setBluetoothDevices(devices as BluetoothDevice[])
      setBluetoothStatus('idle')
    } catch (err) {
      setBluetoothError(err instanceof Error ? err.message : '扫描失败')
      setBluetoothStatus('error')
    }
  }

  // 停止扫描
  const handleStopScan = async () => {
    try {
      await window.api.bluetooth.stopScan()
      setBluetoothStatus('idle')
    } catch (err) {
      setBluetoothError(err instanceof Error ? err.message : '停止扫描失败')
    }
  }

  // 连接蓝牙设备
  const handleConnect = async (device: BluetoothDevice) => {
    setBluetoothStatus('scanning')
    setBluetoothError(null)
    try {
      await window.api.bluetooth.connect(device.id)
      setSelectedDevice(device)
      setBluetoothStatus('connected')

      // 监听数据
      window.api.bluetooth.onData((data: string) => {
        setBluetoothData(data)
      })
    } catch (err) {
      setBluetoothError(err instanceof Error ? err.message : '连接失败')
      setBluetoothStatus('error')
    }
  }

  // 断开连接
  const handleDisconnect = async () => {
    try {
      await window.api.bluetooth.disconnect()
      setSelectedDevice(null)
      setBluetoothStatus('idle')
    } catch (err) {
      setBluetoothError(err instanceof Error ? err.message : '断开失败')
    }
  }

  // 发送数据
  const handleSend = async () => {
    if (!message.trim()) return
    try {
      await window.api.bluetooth.write(message)
      setMessage('')
    } catch (err) {
      setBluetoothError(err instanceof Error ? err.message : '发送失败')
    }
  }

  // 发现服务
  const handleDiscoverServices = async () => {
    if (!serviceUuid.trim()) return
    try {
      const services = await window.api.bluetooth.discoverServices(serviceUuid)
      console.log('Discovered services:', services)
    } catch (err) {
      setBluetoothError(err instanceof Error ? err.message : '发现服务失败')
    }
  }

  // 格式化RSSI
  const getRssiLevel = (rssi?: number) => {
    if (!rssi) return '未知'
    if (rssi >= -50) return '极好'
    if (rssi >= -60) return '很好'
    if (rssi >= -70) return '良好'
    if (rssi >= -80) return '一般'
    return '较弱'
  }

  const getRssiColor = (rssi?: number) => {
    if (!rssi) return '#999'
    if (rssi >= -50) return '#4caf50'
    if (rssi >= -60) return '#8bc34a'
    if (rssi >= -70) return '#ffeb3b'
    if (rssi >= -80) return '#ff9800'
    return '#f44336'
  }

  return (
    <div className="bluetooth-page">
      <div className="page-header">
        <h1>蓝牙设备采集</h1>
        <div className="header-actions">
          {bluetoothStatus === 'scanning' ? (
            <button className="btn btn-danger" onClick={handleStopScan}>
              停止扫描
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleScan}
              disabled={bluetoothStatus === 'connected'}
            >
              扫描设备
            </button>
          )}
        </div>
      </div>

      {bluetoothError && (
        <div className="error-message">
          <span>❌ {bluetoothError}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>设备列表 ({bluetoothDevices.length})</h3>
          {bluetoothDevices.length === 0 ? (
            <div className="empty-state">
              <p>点击"扫描设备"查找附近蓝牙设备</p>
            </div>
          ) : (
            <ul className="device-list-items">
              {bluetoothDevices.map((device) => (
                <li
                  key={device.id}
                  className={`device-item ${selectedDevice?.id === device.id ? 'selected' : ''}`}
                >
                  <div className="device-info">
                    <span className="device-name">
                      {device.name || '未知设备'}
                    </span>
                    <span className="device-address">{device.address}</span>
                    {device.rssi && (
                      <span
                        className="device-rssi"
                        style={{ color: getRssiColor(device.rssi) }}
                      >
                        信号: {getRssiLevel(device.rssi)} ({device.rssi} dBm)
                      </span>
                    )}
                    {device.connected && (
                      <span className="device-connected">已配对</span>
                    )}
                  </div>
                  <div className="device-actions">
                    {selectedDevice?.id === device.id ? (
                      <button className="btn btn-danger" onClick={handleDisconnect}>
                        断开
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => handleConnect(device)}
                        disabled={bluetoothStatus === 'connected'}
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
              服务UUID:
              <input
                type="text"
                value={serviceUuid}
                onChange={(e) => setServiceUuid(e.target.value)}
                placeholder="可选，留空使用默认"
                disabled={bluetoothStatus !== 'connected'}
              />
            </label>
            <button
              className="btn btn-secondary"
              onClick={handleDiscoverServices}
              disabled={bluetoothStatus !== 'connected' || !serviceUuid.trim()}
            >
              发现服务
            </button>
          </div>

          <div className="data-display">
            <pre>{bluetoothData || '暂无数据'}</pre>
          </div>

          <div className="send-panel">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={bluetoothStatus !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={bluetoothStatus !== 'connected' || !message.trim()}
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-indicator ${bluetoothStatus}`} />
        <span>
          状态: {bluetoothStatus === 'idle' && '未连接'}
          {bluetoothStatus === 'scanning' && '扫描中'}
          {bluetoothStatus === 'connected' && `已连接 - ${selectedDevice?.name || '蓝牙设备'}`}
          {bluetoothStatus === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}

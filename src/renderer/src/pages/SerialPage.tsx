import { useState } from 'react'
import { useDeviceStore } from '../store/deviceStore'
import type { SerialPortDevice } from '../store/deviceStore'
import './SerialPage.css'

export default function SerialPage() {
  const {
    serialPorts,
    serialStatus,
    serialError,
    serialData,
    setSerialPorts,
    setSerialStatus,
    setSerialError,
    appendSerialData,
    clearSerialData
  } = useDeviceStore()

  const [selectedPort, setSelectedPort] = useState<string | null>(null)
  const [baudRate, setBaudRate] = useState(9600)
  const [message, setMessage] = useState('')

  // 扫描串口设备
  const handleScan = async () => {
    setSerialStatus('scanning')
    setSerialError(null)
    try {
      const ports = await window.api.serial.list()
      setSerialPorts(ports as SerialPortDevice[])
      setSerialStatus('idle')
    } catch (err) {
      setSerialError(err instanceof Error ? err.message : '扫描失败')
      setSerialStatus('error')
    }
  }

  // 连接串口
  const handleConnect = async (path: string) => {
    setSerialStatus('scanning')
    setSerialError(null)
    try {
      await window.api.serial.open(path, baudRate)
      setSelectedPort(path)
      setSerialStatus('connected')

      // 监听数据
      window.api.serial.onData((data: string) => {
        appendSerialData(data)
      })
    } catch (err) {
      setSerialError(err instanceof Error ? err.message : '连接失败')
      setSerialStatus('error')
    }
  }

  // 断开连接
  const handleDisconnect = async () => {
    try {
      await window.api.serial.close()
      setSelectedPort(null)
      setSerialStatus('idle')
    } catch (err) {
      setSerialError(err instanceof Error ? err.message : '断开失败')
    }
  }

  // 发送数据
  const handleSend = async () => {
    if (!message.trim()) return
    try {
      await window.api.serial.write(message)
      setMessage('')
    } catch (err) {
      setSerialError(err instanceof Error ? err.message : '发送失败')
    }
  }

  // 清空数据
  const handleClear = () => {
    clearSerialData()
  }

  return (
    <div className="serial-page">
      <div className="page-header">
        <h1>串口设备采集</h1>
        <div className="header-actions">
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            disabled={serialStatus === 'connected'}
          >
            <option value={9600}>9600</option>
            <option value={19200}>19200</option>
            <option value={38400}>38400</option>
            <option value={57600}>57600</option>
            <option value={115200}>115200</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={handleScan}
            disabled={serialStatus === 'scanning'}
          >
            {serialStatus === 'scanning' ? '扫描中...' : '扫描设备'}
          </button>
        </div>
      </div>

      {serialError && (
        <div className="error-message">
          <span>❌ {serialError}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>设备列表 ({serialPorts.length})</h3>
          {serialPorts.length === 0 ? (
            <div className="empty-state">
              <p>点击"扫描设备"查找可用串口</p>
            </div>
          ) : (
            <ul className="port-list">
              {serialPorts.map((port) => (
                <li
                  key={port.path}
                  className={`port-item ${selectedPort === port.path ? 'selected' : ''}`}
                >
                  <div className="port-info">
                    <span className="port-path">{port.path}</span>
                    {port.manufacturer && (
                      <span className="port-manufacturer">{port.manufacturer}</span>
                    )}
                    {port.serialNumber && (
                      <span className="port-serial">SN: {port.serialNumber}</span>
                    )}
                  </div>
                  <div className="port-actions">
                    {selectedPort === port.path ? (
                      <button className="btn btn-danger" onClick={handleDisconnect}>
                        断开
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => handleConnect(port.path)}
                        disabled={serialStatus === 'connected'}
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
            <button className="btn btn-secondary" onClick={handleClear}>
              清空
            </button>
          </div>

          <div className="data-display">
            <pre>{serialData || '暂无数据'}</pre>
          </div>

          <div className="send-panel">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={serialStatus !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={serialStatus !== 'connected' || !message.trim()}
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-indicator ${serialStatus}`} />
        <span>
          状态: {serialStatus === 'idle' && '未连接'}
          {serialStatus === 'scanning' && '扫描中'}
          {serialStatus === 'connected' && `已连接 - ${selectedPort}`}
          {serialStatus === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import './WebSerialPage.css'

type DeviceStatus = 'idle' | 'scanning' | 'connected' | 'error'

interface BLEService {
  uuid: string
  characteristics: BluetoothRemoteGATTCharacteristic[]
}

export default function WebBluetoothPage() {
  const [status, setStatus] = useState<DeviceStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [device, setDevice] = useState<BluetoothDevice | null>(null)
  const [services, setServices] = useState<BLEService[]>([])
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<string>('')
  const [writeData, setWriteData] = useState('')
  const [log, setLog] = useState('')

  const isMountedRef = useRef(true)
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)

  const supported = typeof navigator !== 'undefined' && 'bluetooth' in navigator

  const appendLog = (line: string) => {
    setLog((prev) => `${prev}${line}\n`)
  }

  const formatUUID = (uuid: string): string => {
    if (uuid.length === 36) return uuid
    // Try to look up known UUIDs
    const knownUUIDs: Record<string, string> = {
      '0000180d-0000-1000-8000-00805f9b34fb': 'Heart Rate',
      '0000180a-0000-1000-8000-00805f9b34fb': 'Device Information',
      '00001800-0000-1000-8000-00805f9b34fb': 'Generic Access',
      '00001801-0000-1000-8000-00805f9b34fb': 'Generic Attribute',
      '0000180f-0000-1000-8000-00805f9b34fb': 'Battery Service',
      '00002a37-0000-1000-8000-00805f9b34fb': 'Heart Rate Measurement',
      '00002a29-0000-1000-8000-00805f9b34fb': 'Manufacturer Name',
      '00002a19-0000-1000-8000-00805f9b34fb': 'Battery Level',
    }
    return knownUUIDs[uuid] || uuid
  }

  const handleScan = async () => {
    if (!supported) return
    setStatus('scanning')
    setError(null)
    setServices([])

    try {
      const selectedDevice = await navigator.bluetooth!.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access', 'device_information', 'battery_service', 'heart_rate']
      })

      setDevice(selectedDevice)
      appendLog(`[SYS] 已选择设备: ${selectedDevice.name || 'Unknown Device'}`)

      // Auto connect
      await handleConnect(selectedDevice)
    } catch (err) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        setStatus('idle')
        appendLog('[SYS] 用户取消了扫描')
        return
      }
      setError(err instanceof Error ? err.message : '扫描设备失败')
      setStatus('error')
    }
  }

  const handleConnect = async (targetDevice?: BluetoothDevice) => {
    const d = targetDevice || device
    if (!d) return

    setStatus('scanning')
    setError(null)

    try {
      const gattServer = await d.gatt?.connect()
      if (!gattServer) {
        throw new Error('无法获取 GATT 服务器')
      }

      setStatus('connected')
      appendLog(`[SYS] 已连接到 GATT 服务器`)

      // Discover services
      const discoveredServices = await gattServer.getPrimaryServices()
      const serviceList: BLEService[] = []

      for (const service of discoveredServices) {
        appendLog(`[SYS] 发现服务: ${formatUUID(service.uuid)}`)
        const characteristics = await service.getCharacteristics()
        for (const char of characteristics) {
          appendLog(`[SYS]   特征: ${formatUUID(char.uuid)} [${char.properties.read ? 'R' : ''}${char.properties.write ? 'W' : ''}${char.properties.notify ? 'N' : ''}]`)
        }
        serviceList.push({
          uuid: service.uuid,
          characteristics: Array.from(characteristics)
        })
      }

      setServices(serviceList)
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
      setStatus('error')
    }
  }

  const handleDisconnect = async () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect()
      appendLog('[SYS] 已断开连接')
    }
    setServices([])
    setStatus('idle')
    characteristicRef.current = null
  }

  const handleSelectCharacteristic = (_serviceUuid: string, charUuid: string) => {
    setSelectedCharacteristic(charUuid)

    const service = services.find(s => s.uuid === _serviceUuid)
    const char = service?.characteristics.find(c => c.uuid === charUuid)
    characteristicRef.current = char || null

    if (char) {
      appendLog(`[SYS] 已选择特征: ${formatUUID(charUuid)}`)
    }
  }

  const handleRead = async () => {
    if (!characteristicRef.current) {
      setError('请先选择一个特征')
      return
    }

    try {
      const value = await characteristicRef.current.readValue()
      const data = Array.from(new Uint8Array(value.buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ')
      appendLog(`[RX] ${formatUUID(characteristicRef.current.uuid)}: ${data}`)

      // Try to decode as text if printable
      const text = new TextDecoder().decode(value)
      if (/^[\x20-\x7E]+$/.test(text)) {
        appendLog(`[RX] 文本: "${text}"`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取失败')
    }
  }

  const handleWrite = async () => {
    if (!characteristicRef.current || !writeData.trim()) return

    try {
      const bytes = writeData.trim().split(/\s+/).map(h => parseInt(h, 16))
      const data = new Uint8Array(bytes)

      await characteristicRef.current.writeValue(data)
      appendLog(`[TX] ${formatUUID(characteristicRef.current.uuid)}: ${bytes.map(b => b.toString(16).padStart(2, '0')).join(' ')}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '写入失败')
    }
  }

  const handleSubscribe = async () => {
    if (!characteristicRef.current) {
      setError('请先选择一个特征')
      return
    }

    try {
      await characteristicRef.current.startNotifications()
      characteristicRef.current.addEventListener('characteristicvaluechanged', (event) => {
        const target = event.target as unknown as BluetoothRemoteGATTCharacteristic
        const value = target.value
        if (value) {
          const data = Array.from(new Uint8Array(value.buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ')
          appendLog(`[NOTIFY] ${formatUUID(target.uuid)}: ${data}`)
        }
      })
      appendLog(`[SYS] 已订阅通知: ${formatUUID(characteristicRef.current.uuid)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '订阅失败')
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return (
    <div className="web-serial-page">
      <div className="page-header">
        <h1>Web Bluetooth（蓝牙 BLE API）</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleScan} disabled={!supported}>
            扫描设备
          </button>
          {status === 'connected' && (
            <button className="btn btn-secondary" onClick={handleDisconnect}>
              断开连接
            </button>
          )}
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
          <strong>📋 浏览器支持:</strong> Chrome 56+ | Edge 79+ | Opera 43+
        </div>
        <div style={{ color: '#666' }}>
          <strong>⚠️ 需要:</strong> HTTPS 或 localhost 安全上下文
        </div>
      </div>

      {!supported && (
        <div className="error-message">
          <span>❌ 当前环境不支持 Web Bluetooth API，请使用 Chrome 56+ 并确保 HTTPS 环境。</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>设备信息</h3>
          {device ? (
            <div style={{ padding: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>名称:</strong> {device.name || 'Unknown'}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>ID:</strong> {device.id}
              </div>

              {services.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ marginBottom: 8 }}>服务与特征</h4>
                  {services.map((service) => (
                    <div key={service.uuid} style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {formatUUID(service.uuid)}
                      </div>
                      {service.characteristics.map((char) => (
                        <div
                          key={char.uuid}
                          onClick={() => handleSelectCharacteristic(service.uuid, char.uuid)}
                          style={{
                            padding: '6px 12px',
                            marginLeft: 12,
                            cursor: 'pointer',
                            background: selectedCharacteristic === char.uuid ? '#e3f2fd' : 'transparent',
                            borderRadius: 4,
                            fontSize: 13
                          }}
                        >
                          {formatUUID(char.uuid)}
                          <span style={{ marginLeft: 8, color: '#666', fontSize: 11 }}>
                            [{char.properties.read ? 'R' : ''}{char.properties.write ? 'W' : ''}{char.properties.notify ? 'N' : ''}]
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>点击"扫描设备"搜索附近的 BLE 设备。</p>
            </div>
          )}
        </div>

        <div className="data-panel">
          <div className="panel-header">
            <h3>数据操作</h3>
            <button className="btn btn-secondary" onClick={() => setLog('')}>
              清空
            </button>
          </div>

          <div className="data-display">
            <pre>{log || '暂无数据'}</pre>
          </div>

          {status === 'connected' && selectedCharacteristic && (
            <>
              <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={handleRead}>
                  读取
                </button>
                <button className="btn btn-secondary" onClick={handleSubscribe}>
                  订阅通知
                </button>
              </div>

              <div className="send-panel">
                <input
                  type="text"
                  value={writeData}
                  onChange={(e) => setWriteData(e.target.value)}
                  placeholder="输入数据 (hex): 01 02 03..."
                  style={{ fontFamily: 'monospace' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleWrite()}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleWrite}
                  disabled={!writeData.trim()}
                >
                  写入
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-indicator ${status}`} />
        <span>
          状态: {status === 'idle' && '未连接'}
          {status === 'scanning' && '扫描中'}
          {status === 'connected' && `已连接 - ${device?.name || 'Unknown'}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}

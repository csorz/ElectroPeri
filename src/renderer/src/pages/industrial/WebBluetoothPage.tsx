import { useEffect, useRef, useState } from 'react'
import '../toolbox/tools/ToolPage.css'

type DeviceStatus = 'idle' | 'scanning' | 'connected' | 'error'

interface BLEService {
  uuid: string
  characteristics: BluetoothRemoteGATTCharacteristic[]
}

export default function WebBluetoothPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📶 Web Bluetooth API</h1>
        <p>浏览器原生蓝牙 BLE 通信接口</p>
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
                <h3>BLE 通信</h3>
                <p>支持蓝牙低功耗 (BLE) 设备的发现、连接和数据交换</p>
              </div>
              <div className="feature-card">
                <h3>GATT 协议</h3>
                <p>通过 GATT 协议访问设备服务、特征和描述符</p>
              </div>
              <div className="feature-card">
                <h3>通知订阅</h3>
                <p>支持特征值变化通知，实时接收传感器数据</p>
              </div>
              <div className="feature-card">
                <h3>设备过滤</h3>
                <p>按服务 UUID 或设备名称过滤，快速找到目标设备</p>
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
                  <td>56+</td>
                  <td>完全支持</td>
                </tr>
                <tr>
                  <td>Edge</td>
                  <td>79+</td>
                  <td>完全支持</td>
                </tr>
                <tr>
                  <td>Opera</td>
                  <td>43+</td>
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
                    <td><code>navigator.bluetooth.requestDevice()</code></td>
                    <td>请求用户选择 BLE 设备</td>
                  </tr>
                  <tr>
                    <td><code>device.gatt.connect()</code></td>
                    <td>连接到设备的 GATT 服务器</td>
                  </tr>
                  <tr>
                    <td><code>gatt.getPrimaryServices()</code></td>
                    <td>获取所有主服务</td>
                  </tr>
                  <tr>
                    <td><code>service.getCharacteristics()</code></td>
                    <td>获取服务的所有特征</td>
                  </tr>
                  <tr>
                    <td><code>characteristic.readValue()</code></td>
                    <td>读取特征值</td>
                  </tr>
                  <tr>
                    <td><code>characteristic.writeValue()</code></td>
                    <td>写入特征值</td>
                  </tr>
                  <tr>
                    <td><code>characteristic.startNotifications()</code></td>
                    <td>订阅特征值变化通知</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>GATT 协议结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────────────────────────────────────────────┐
    │                    GATT Server                      │
    │  ┌───────────────────────────────────────────────┐  │
    │  │  Heart Rate Service (UUID: 0x180D)             │  │
    │  │  ┌───────────────────────────────────────────┐ │  │
    │  │  │  Heart Rate Measurement (0x2A37) [Notify] │ │  │
    │  │  └───────────────────────────────────────────┘ │  │
    │  │  ┌───────────────────────────────────────────┐ │  │
    │  │  │  Body Sensor Location (0x2A38) [Read]     │ │  │
    │  │  └───────────────────────────────────────────┘ │  │
    │  └───────────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <div className="info-box">
              <strong>常用标准服务 UUID</strong>
              <ul>
                <li><strong>0x1800</strong> - Generic Access</li>
                <li><strong>0x1801</strong> - Generic Attribute</li>
                <li><strong>0x180D</strong> - Heart Rate</li>
                <li><strong>0x180F</strong> - Battery Service</li>
                <li><strong>0x180A</strong> - Device Information</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>健康监测</strong> - 心率带、血氧仪、体重秤等设备数据读取</li>
              <li><strong>智能家居</strong> - 智能灯泡、门锁、传感器控制</li>
              <li><strong>运动设备</strong> - 跑步机、健身器材数据采集</li>
              <li><strong>工业传感器</strong> - 温湿度、压力等环境监测</li>
              <li><strong>POS 设备</strong> - 蓝牙打印机、支付终端</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <WebBluetoothDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// Web Bluetooth API 基本使用
async function connectBleDevice() {
  // 检查浏览器支持
  if (!('bluetooth' in navigator)) {
    console.error('浏览器不支持 Web Bluetooth API')
    return
  }

  try {
    // 请求设备
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['heart_rate'] }
      ],
      optionalServices: ['battery_service', 'device_information']
    })

    console.log('设备名称:', device.name)

    // 连接 GATT 服务器
    const server = await device.gatt.connect()
    console.log('已连接到 GATT 服务器')

    // 获取心率服务
    const heartRateService = await server.getPrimaryService('heart_rate')

    // 获取心率测量特征
    const heartRateChar = await heartRateService
      .getCharacteristic('heart_rate_measurement')

    // 订阅通知
    heartRateChar.addEventListener('characteristicvaluechanged', (event) => {
      const value = event.target.value
      const heartRate = value.getUint8(1)
      console.log('心率:', heartRate, 'bpm')
    })

    await heartRateChar.startNotifications()

    // 读取电池电量
    const batteryService = await server.getPrimaryService('battery_service')
    const batteryChar = await batteryService.getCharacteristic('battery_level')
    const batteryValue = await batteryChar.readValue()
    console.log('电池电量:', batteryValue.getUint8(0), '%')

    // 断开连接
    // device.gatt.disconnect()
  } catch (err) {
    console.error('BLE 错误:', err)
  }
}`}</pre>
            </div>

            <h2>TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// Web Bluetooth TypeScript 完整示例
interface BleDeviceOptions {
  filters?: BluetoothRequestDeviceFilter[]
  optionalServices?: BluetoothServiceUUID[]
}

class BleDeviceManager {
  private device: BluetoothDevice | null = null
  private server: BluetoothRemoteGATTServer | null = null

  async connect(options: BleDeviceOptions): Promise<BluetoothDevice> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth 不支持')
    }

    this.device = await navigator.bluetooth.requestDevice(options)
    this.device.addEventListener('gattserverdisconnected', () => {
      console.log('设备已断开')
      this.server = null
    })

    this.server = await this.device.gatt.connect()
    return this.device
  }

  async readCharacteristic(
    serviceUuid: BluetoothServiceUUID,
    charUuid: BluetoothCharacteristicUUID
  ): Promise<DataView> {
    if (!this.server) throw new Error('未连接设备')

    const service = await this.server.getPrimaryService(serviceUuid)
    const char = await service.getCharacteristic(charUuid)
    return await char.readValue()
  }

  async writeCharacteristic(
    serviceUuid: BluetoothServiceUUID,
    charUuid: BluetoothCharacteristicUUID,
    value: Uint8Array
  ): Promise<void> {
    if (!this.server) throw new Error('未连接设备')

    const service = await this.server.getPrimaryService(serviceUuid)
    const char = await service.getCharacteristic(charUuid)
    await char.writeValue(value)
  }

  async subscribeNotifications(
    serviceUuid: BluetoothServiceUUID,
    charUuid: BluetoothCharacteristicUUID,
    callback: (value: DataView) => void
  ): Promise<void> {
    if (!this.server) throw new Error('未连接设备')

    const service = await this.server.getPrimaryService(serviceUuid)
    const char = await service.getCharacteristic(charUuid)

    char.addEventListener('characteristicvaluechanged', (event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic
      if (target.value) callback(target.value)
    })

    await char.startNotifications()
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect()
    }
    this.server = null
    this.device = null
  }
}`}</pre>
            </div>

            <h2>React Hook 示例</h2>
            <div className="code-block">
              <pre>{`// Web Bluetooth React Hook
import { useState, useCallback } from 'react'

function useBleDevice() {
  const [device, setDevice] = useState<BluetoothDevice | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestDevice = useCallback(async (
    filters: BluetoothRequestDeviceFilter[] = [],
    optionalServices: BluetoothServiceUUID[] = []
  ) => {
    try {
      const dev = await navigator.bluetooth.requestDevice({
        filters,
        optionalServices
      })
      setDevice(dev)
      setError(null)
      return dev
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求设备失败')
      return null
    }
  }, [])

  const connect = useCallback(async () => {
    if (!device) return false
    try {
      const server = await device.gatt.connect()
      setIsConnected(true)
      return server
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
      return false
    }
  }, [device])

  const disconnect = useCallback(() => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect()
      setIsConnected(false)
    }
  }, [device])

  return {
    device,
    isConnected,
    error,
    requestDevice,
    connect,
    disconnect
  }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Web Bluetooth 演示组件
function WebBluetoothDemo() {
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
    <div className="connection-demo">
      <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
        <div style={{ marginBottom: 4 }}>
          <strong>浏览器支持:</strong> Chrome 56+ | Edge 79+ | Opera 43+
        </div>
        <div style={{ color: '#666' }}>
          <strong>要求:</strong> HTTPS 或 localhost 安全上下文
        </div>
      </div>

      {!supported && (
        <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, marginBottom: 16, color: '#c62828' }}>
          当前环境不支持 Web Bluetooth API
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={handleScan}
          disabled={!supported}
          style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          扫描设备
        </button>
        {status === 'connected' && (
          <button
            onClick={handleDisconnect}
            style={{ padding: '8px 16px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            断开连接
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, marginBottom: 16, color: '#c62828' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>设备信息</h4>
          {device ? (
            <div>
              <div style={{ marginBottom: 8, fontSize: 13 }}>
                <strong>名称:</strong> {device.name || 'Unknown'}
              </div>
              <div style={{ marginBottom: 8, fontSize: 13 }}>
                <strong>ID:</strong> {device.id}
              </div>

              {services.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h5 style={{ marginBottom: 8, fontSize: 13 }}>服务与特征</h5>
                  <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                    {services.map((service) => (
                      <div key={service.uuid} style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 500, color: '#1976d2', fontSize: 12 }}>
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
                              background: selectedCharacteristic === char.uuid ? '#e3f8ff' : 'transparent',
                              borderRadius: 4,
                              fontSize: 12
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
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
              点击"扫描设备"搜索附近的 BLE 设备
            </div>
          )}
        </div>

        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14 }}>数据操作</h4>
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

          {status === 'connected' && selectedCharacteristic && (
            <>
              <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={handleRead}
                  style={{ padding: '6px 12px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                >
                  读取
                </button>
                <button
                  onClick={handleSubscribe}
                  style={{ padding: '6px 12px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                >
                  订阅通知
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={writeData}
                  onChange={(e) => setWriteData(e.target.value)}
                  placeholder="输入数据 (hex): 01 02 03..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', fontFamily: 'Consolas, monospace', fontSize: 12 }}
                  onKeyDown={(e) => e.key === 'Enter' && handleWrite()}
                />
                <button
                  onClick={handleWrite}
                  disabled={!writeData.trim()}
                  style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                  写入
                </button>
              </div>
            </>
          )}
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
          {status === 'scanning' && '扫描中'}
          {status === 'connected' && `已连接 - ${device?.name || 'Unknown'}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}

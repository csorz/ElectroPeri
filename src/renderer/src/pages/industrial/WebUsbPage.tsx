import { useEffect, useRef, useState } from 'react'
import '../toolbox/tools/ToolPage.css'

type DeviceStatus = 'idle' | 'scanning' | 'connected' | 'error'

export default function WebUsbPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔌 WebUSB API</h1>
        <p>浏览器原生 USB 设备访问接口</p>
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
                <h3>直接访问</h3>
                <p>无需驱动，浏览器直接与 USB 设备通信</p>
              </div>
              <div className="feature-card">
                <h3>设备过滤</h3>
                <p>支持按 VID/PID 或设备类型过滤，快速找到目标设备</p>
              </div>
              <div className="feature-card">
                <h3>原始传输</h3>
                <p>支持 Control、Bulk、Interrupt 传输，灵活操作设备</p>
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
                  <td>61+</td>
                  <td>完全支持</td>
                </tr>
                <tr>
                  <td>Edge</td>
                  <td>79+</td>
                  <td>完全支持</td>
                </tr>
                <tr>
                  <td>Opera</td>
                  <td>48+</td>
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
                    <td><code>navigator.usb.requestDevice(filters)</code></td>
                    <td>请求用户选择 USB 设备</td>
                  </tr>
                  <tr>
                    <td><code>navigator.usb.getDevices()</code></td>
                    <td>获取已授权的设备列表</td>
                  </tr>
                  <tr>
                    <td><code>device.open()</code></td>
                    <td>打开设备</td>
                  </tr>
                  <tr>
                    <td><code>device.claimInterface(num)</code></td>
                    <td>声明接口</td>
                  </tr>
                  <tr>
                    <td><code>device.transferIn/Out()</code></td>
                    <td>Bulk 传输</td>
                  </tr>
                  <tr>
                    <td><code>device.controlTransferIn/Out()</code></td>
                    <td>控制传输</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="info-box warning">
              <strong>注意事项</strong>
              <ul>
                <li>必须在安全上下文中运行（HTTPS 或 localhost）</li>
                <li>首次访问需要用户手动授权</li>
                <li>某些设备可能被操作系统独占，无法访问</li>
                <li>不支持 Isochronous 传输模式</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>Arduino 编程</strong> - Web 端直接给 Arduino 上传固件</li>
              <li><strong>调试工具</strong> - 网页版 USB 调试工具</li>
              <li><strong>数据采集</strong> - 从 USB 设备读取数据并可视化</li>
              <li><strong>设备配置</strong> - 配置 USB 设备参数</li>
              <li><strong>加密设备</strong> - 与 USB Key、硬件钱包交互</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <WebUsbDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// WebUSB API 基本使用
async function connectUsbDevice() {
  // 检查浏览器支持
  if (!('usb' in navigator)) {
    console.error('浏览器不支持 WebUSB API')
    return
  }

  try {
    // 请求设备（可选过滤条件）
    const device = await navigator.usb.requestDevice({
      filters: [
        { vendorId: 0x2341 }  // Arduino
      ]
    })

    console.log('设备名称:', device.productName)
    console.log('厂商:', device.manufacturerName)
    console.log('VID:', device.vendorId.toString(16))
    console.log('PID:', device.productId.toString(16))

    // 打开设备
    await device.open()

    // 选择配置（如果需要）
    if (device.configuration === null) {
      await device.selectConfiguration(1)
    }

    // 声明接口
    await device.claimInterface(0)

    // 控制传输 - 获取设备描述符
    const result = await device.controlTransferIn({
      requestType: 'standard',
      recipient: 'device',
      request: 0x06,  // GET_DESCRIPTOR
      value: 0x0100,  // Device Descriptor
      index: 0
    }, 18)

    console.log('设备描述符:', result.data)

    // Bulk 传输 - 发送数据
    const dataOut = new Uint8Array([0x01, 0x02, 0x03])
    await device.transferOut(1, dataOut)

    // Bulk 传输 - 接收数据
    const resultIn = await device.transferIn(2, 64)
    console.log('接收数据:', resultIn.data)

    // 关闭设备
    await device.close()
  } catch (err) {
    console.error('USB 错误:', err)
  }
}`}</pre>
            </div>

            <h2>TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// WebUSB TypeScript 完整示例
interface UsbDeviceFilter {
  vendorId?: number
  productId?: number
  classCode?: number
  subclassCode?: number
  protocolCode?: number
  serialNumber?: string
}

class UsbDeviceManager {
  private device: USBDevice | null = null

  async connect(filters: UsbDeviceFilter[] = []): Promise<USBDevice> {
    if (!navigator.usb) {
      throw new Error('WebUSB 不支持')
    }

    this.device = await navigator.usb.requestDevice({ filters })
    return this.device
  }

  async open(): Promise<void> {
    if (!this.device) throw new Error('未连接设备')

    await this.device.open()

    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1)
    }
  }

  async claimInterface(interfaceNumber: number = 0): Promise<void> {
    if (!this.device) throw new Error('未连接设备')
    await this.device.claimInterface(interfaceNumber)
  }

  async bulkTransferOut(
    endpointNumber: number,
    data: Uint8Array
  ): Promise<USBOutTransferResult> {
    if (!this.device) throw new Error('未连接设备')
    return await this.device.transferOut(endpointNumber, data)
  }

  async bulkTransferIn(
    endpointNumber: number,
    length: number
  ): Promise<USBInTransferResult> {
    if (!this.device) throw new Error('未连接设备')
    return await this.device.transferIn(endpointNumber, length)
  }

  async close(): Promise<void> {
    if (this.device) {
      await this.device.close()
      this.device = null
    }
  }
}`}</pre>
            </div>

            <h2>React Hook 示例</h2>
            <div className="code-block">
              <pre>{`// WebUSB React Hook
import { useState, useCallback } from 'react'

function useWebUsb() {
  const [device, setDevice] = useState<USBDevice | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestDevice = useCallback(async (filters: USBDeviceFilter[] = []) => {
    try {
      const dev = await navigator.usb.requestDevice({ filters })
      setDevice(dev)
      setError(null)
      return dev
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求设备失败')
      return null
    }
  }, [])

  const openDevice = useCallback(async () => {
    if (!device) return false
    try {
      await device.open()
      if (device.configuration === null) {
        await device.selectConfiguration(1)
      }
      await device.claimInterface(0)
      setIsConnected(true)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '打开设备失败')
      return false
    }
  }, [device])

  const closeDevice = useCallback(async () => {
    if (device) {
      try {
        await device.close()
      } catch (err) {
        // ignore
      }
      setIsConnected(false)
    }
  }, [device])

  return {
    device,
    isConnected,
    error,
    requestDevice,
    openDevice,
    closeDevice
  }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// WebUSB 演示组件
function WebUsbDemo() {
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
    <div className="connection-demo">
      <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
        <div style={{ marginBottom: 4 }}>
          <strong>浏览器支持:</strong> Chrome 61+ | Edge 79+ | Opera 48+
        </div>
        <div style={{ color: '#666' }}>
          <strong>要求:</strong> HTTPS 或 localhost 安全上下文
        </div>
      </div>

      {!supported && (
        <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, marginBottom: 16, color: '#c62828' }}>
          当前环境不支持 WebUSB API
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={refreshDevices}
          disabled={!supported}
          style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          刷新设备
        </button>
        <button
          onClick={handleRequestDevice}
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
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>已授权设备 ({devices.length})</h4>
          {devices.length === 0 ? (
            <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
              点击"请求授权"，选择一个 USB 设备
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 180, overflowY: 'auto' }}>
              {devices.map((device, index) => (
                <li
                  key={index}
                  style={{
                    padding: '10px 12px',
                    background: selectedDevice === device ? '#e3f8ff' : '#fff',
                    borderRadius: 6,
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{deviceLabel(device)}</div>
                    {device.serialNumber && (
                      <div style={{ fontSize: 11, color: '#666' }}>SN: {device.serialNumber}</div>
                    )}
                  </div>
                  {selectedDevice === device && status === 'connected' ? (
                    <button
                      onClick={handleDisconnect}
                      style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    >
                      断开
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(device)}
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
            <h4 style={{ margin: 0, fontSize: 14 }}>数据传输</h4>
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
            minHeight: 80,
            maxHeight: 120,
            overflowY: 'auto',
            fontFamily: 'Consolas, monospace',
            fontSize: 12,
            marginBottom: 12
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{log || '暂无数据'}</pre>
          </div>

          {status === 'connected' && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value as 'bulk' | 'interrupt')}
                style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
              >
                <option value="bulk">Bulk</option>
                <option value="interrupt">Interrupt</option>
              </select>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'out' | 'in')}
                style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
              >
                <option value="out">OUT (发送)</option>
                <option value="in">IN (接收)</option>
              </select>
              <input
                type="number"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(parseInt(e.target.value) || 0)}
                placeholder="Endpoint"
                style={{ width: 80, padding: '6px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                min={0}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={transferData}
              onChange={(e) => setTransferData(e.target.value)}
              placeholder="输入数据 (hex): 01 02 03..."
              disabled={status !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleTransfer()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', fontFamily: 'Consolas, monospace', fontSize: 12 }}
            />
            <button
              onClick={handleTransfer}
              disabled={status !== 'connected' || !transferData.trim()}
              style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              传输
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
          {status === 'connected' && `已连接 - ${selectedDevice ? deviceLabel(selectedDevice) : ''}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}

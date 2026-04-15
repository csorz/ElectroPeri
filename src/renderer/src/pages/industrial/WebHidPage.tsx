import { useEffect, useRef, useState } from 'react'
import '../toolbox/tools/ToolPage.css'

type DeviceStatus = 'idle' | 'scanning' | 'connected' | 'error'

export default function WebHidPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>⌨️ WebHID API</h1>
        <p>浏览器原生 HID 设备访问接口</p>
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
                <h3>浏览器原生</h3>
                <p>无需驱动程序，浏览器直接访问 HID 设备</p>
              </div>
              <div className="feature-card">
                <h3>报告通信</h3>
                <p>通过 Input/Output/Feature Report 与设备交换数据</p>
              </div>
              <div className="feature-card">
                <h3>设备过滤</h3>
                <p>按 VID/PID 或 Usage Page 过滤目标设备</p>
              </div>
              <div className="feature-card">
                <h3>低延迟</h3>
                <p>适合游戏手柄、专业输入设备等实时交互场景</p>
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
                  <td>89+</td>
                  <td>完全支持</td>
                </tr>
                <tr>
                  <td>Edge</td>
                  <td>89+</td>
                  <td>完全支持</td>
                </tr>
                <tr>
                  <td>Opera</td>
                  <td>75+</td>
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
                    <td><code>navigator.hid.requestDevice()</code></td>
                    <td>请求用户选择 HID 设备</td>
                  </tr>
                  <tr>
                    <td><code>navigator.hid.getDevices()</code></td>
                    <td>获取已授权的设备列表</td>
                  </tr>
                  <tr>
                    <td><code>device.open()</code></td>
                    <td>打开设备</td>
                  </tr>
                  <tr>
                    <td><code>device.sendReport(reportId, data)</code></td>
                    <td>发送输出报告</td>
                  </tr>
                  <tr>
                    <td><code>device.oninputreport</code></td>
                    <td>接收输入报告回调</td>
                  </tr>
                  <tr>
                    <td><code>device.sendFeatureReport()</code></td>
                    <td>发送特征报告</td>
                  </tr>
                  <tr>
                    <td><code>device.receiveFeatureReport()</code></td>
                    <td>接收特征报告</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>报告类型</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌──────────────────────────────────────────────────────┐
    │                    HID 设备                           │
    │                                                      │
    │  ┌──────────────┐   ┌──────────────┐                │
    │  │ Input Report │   │ Output Report│                │
    │  │    (读取)    │   │    (写入)    │                │
    │  │   设备→主机   │   │   主机→设备   │                │
    │  └──────────────┘   └──────────────┘                │
    │                                                      │
    │  ┌──────────────────────────────────────────────┐   │
    │  │              Feature Report                  │   │
    │  │                (配置/状态)                    │   │
    │  │                双向通信                       │   │
    │  └──────────────────────────────────────────────┘   │
    └──────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <div className="info-box">
              <strong>常用 Usage Page</strong>
              <ul>
                <li><strong>0x01</strong> - Generic Desktop (鼠标、键盘、游戏手柄)</li>
                <li><strong>0x0C</strong> - Consumer (多媒体键、遥控器)</li>
                <li><strong>0xFF00-0xFFFF</strong> - Vendor Defined (厂商自定义)</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>游戏设备</strong> - 游戏手柄、方向盘、飞行摇杆</li>
              <li><strong>专业输入设备</strong> - 绘图板、3D 鼠标、CAD 控制器</li>
              <li><strong>条码扫描器</strong> - 一维/二维码扫描枪</li>
              <li><strong>医疗设备</strong> - 医疗键盘、脚踏开关</li>
              <li><strong>工业设备</strong> - 操作面板、工业键盘</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <WebHidDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// WebHID API 基本使用
async function connectHidDevice() {
  // 检查浏览器支持
  if (!('hid' in navigator)) {
    console.error('浏览器不支持 WebHID API')
    return
  }

  try {
    // 请求设备
    const devices = await navigator.hid.requestDevice({
      filters: [
        { vendorId: 0x045E }  // Microsoft
      ]
    })

    if (devices.length === 0) return

    const device = devices[0]
    console.log('设备名称:', device.productName)
    console.log('VID:', device.vendorId.toString(16))
    console.log('PID:', device.productId.toString(16))

    // 打开设备
    await device.open()

    // 监听输入报告
    device.addEventListener('inputreport', (event) => {
      const { data, reportId, device } = event
      console.log('收到报告 ID=' + reportId + ', 长度=' + data.byteLength)

      // 解析报告数据
      const view = new DataView(data.buffer)
      // 根据设备报告描述符解析具体数据
    })

    // 发送输出报告
    const outputData = new Uint8Array([0x01, 0x02, 0x03])
    await device.sendReport(0x01, outputData)

    // 发送特征报告
    const featureData = new Uint8Array([0x00])
    await device.sendFeatureReport(0x02, featureData)

    // 接收特征报告
    const featureReport = await device.receiveFeatureReport(0x02)

    // 关闭设备
    await device.close()
  } catch (err) {
    console.error('HID 错误:', err)
  }
}`}</pre>
            </div>

            <h2>TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// WebHID TypeScript 完整示例
interface HidDeviceFilter {
  vendorId?: number
  productId?: number
  usagePage?: number
  usage?: number
}

class HidDeviceManager {
  private device: HIDDevice | null = null

  async requestDevice(filters: HidDeviceFilter[] = []): Promise<HIDDevice> {
    if (!navigator.hid) {
      throw new Error('WebHID 不支持')
    }

    const devices = await navigator.hid.requestDevice({ filters })
    if (devices.length === 0) {
      throw new Error('未选择设备')
    }

    this.device = devices[0]
    return this.device
  }

  async open(): Promise<void> {
    if (!this.device) throw new Error('未连接设备')
    await this.device.open()
  }

  async sendOutputReport(reportId: number, data: Uint8Array): Promise<void> {
    if (!this.device) throw new Error('未连接设备')
    await this.device.sendReport(reportId, data)
  }

  onInputReport(callback: (event: HIDInputReportEvent) => void): void {
    if (!this.device) throw new Error('未连接设备')
    this.device.addEventListener('inputreport', callback as EventListener)
  }

  async sendFeatureReport(reportId: number, data: Uint8Array): Promise<void> {
    if (!this.device) throw new Error('未连接设备')
    await this.device.sendFeatureReport(reportId, data)
  }

  async receiveFeatureReport(reportId: number): Promise<DataView> {
    if (!this.device) throw new Error('未连接设备')
    return await this.device.receiveFeatureReport(reportId)
  }

  async close(): Promise<void> {
    if (this.device) {
      await this.device.close()
      this.device = null
    }
  }
}

// 使用示例
async function main() {
  const hid = new HidDeviceManager()

  // 连接设备
  const device = await hid.requestDevice([
    { vendorId: 0x1234, productId: 0x5678 }
  ])

  await hid.open()

  // 监听输入
  hid.onInputReport((event) => {
    const data = new Uint8Array(event.data.buffer)
    console.log('Input Report:', event.reportId, data)
  })

  // 发送数据
  await hid.sendOutputReport(0, new Uint8Array([0x01, 0x02]))

  await hid.close()
}`}</pre>
            </div>

            <h2>React Hook 示例</h2>
            <div className="code-block">
              <pre>{`// WebHID React Hook
import { useState, useCallback, useEffect } from 'react'

function useWebHid() {
  const [device, setDevice] = useState<HIDDevice | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastReport, setLastReport] = useState<DataView | null>(null)

  const requestDevice = useCallback(async (filters: HIDDeviceFilter[] = []) => {
    try {
      const devices = await navigator.hid.requestDevice({ filters })
      if (devices.length > 0) {
        setDevice(devices[0])
        setError(null)
        return devices[0]
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求设备失败')
      return null
    }
  }, [])

  const openDevice = useCallback(async () => {
    if (!device) return false
    try {
      await device.open()
      setIsConnected(true)

      device.addEventListener('inputreport', (event) => {
        setLastReport(event.data)
      })

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

  const sendReport = useCallback(async (reportId: number, data: Uint8Array) => {
    if (!device || !isConnected) return false
    try {
      await device.sendReport(reportId, data)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
      return false
    }
  }, [device, isConnected])

  return {
    device,
    isConnected,
    error,
    lastReport,
    requestDevice,
    openDevice,
    closeDevice,
    sendReport
  }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// WebHID 演示组件
function WebHidDemo() {
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
    <div className="connection-demo">
      <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
        <div style={{ marginBottom: 4 }}>
          <strong>浏览器支持:</strong> Chrome 89+ | Edge 89+ | Opera 75+
        </div>
        <div style={{ color: '#666' }}>
          <strong>要求:</strong> HTTPS 或 localhost 安全上下文
        </div>
      </div>

      {!supported && (
        <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, marginBottom: 16, color: '#c62828' }}>
          当前环境不支持 WebHID API
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
              点击"请求授权"，选择一个 HID 设备
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
                    {device.collections && device.collections.length > 0 && (
                      <div style={{ fontSize: 11, color: '#666' }}>{device.collections.length} collection(s)</div>
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
            <h4 style={{ margin: 0, fontSize: 14 }}>数据收发</h4>
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

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={reportData}
              onChange={(e) => setReportData(e.target.value)}
              placeholder="输入报告数据 (hex): reportId byte1 byte2..."
              disabled={status !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReport()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', fontFamily: 'Consolas, monospace', fontSize: 12 }}
            />
            <button
              onClick={handleSendReport}
              disabled={status !== 'connected' || !reportData.trim()}
              style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              发送
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

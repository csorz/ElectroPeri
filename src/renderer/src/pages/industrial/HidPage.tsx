import { useEffect, useState } from 'react'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

type HidDeviceInfo = {
  product?: string
  manufacturer?: string
  vendorId: number
  productId: number
  serialNumber?: string
}

export default function HidPage() {
  return (
    <ElectronOnly>
      <HidPageContent />
    </ElectronOnly>
  )
}

function HidPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>⌨️ HID 设备</h1>
        <p>Human Interface Device - 人机接口设备</p>
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
                <h3>标准化接口</h3>
                <p>HID 设备使用标准化的报告描述符，操作系统自带驱动，无需安装</p>
              </div>
              <div className="feature-card">
                <h3>低延迟输入</h3>
                <p>采用中断传输模式，保证低延迟的实时数据输入</p>
              </div>
              <div className="feature-card">
                <h3>报告协议</h3>
                <p>通过 Report ID 和 Report Data 进行数据交换，支持输入/输出/特征报告</p>
              </div>
              <div className="feature-card">
                <h3>广泛兼容</h3>
                <p>键盘、鼠标、游戏手柄、触摸屏等都是 HID 设备</p>
              </div>
            </div>

            <h2>报告类型</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>类型</th>
                    <th>方向</th>
                    <th>用途</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Input Report</code></td>
                    <td>设备 → 主机</td>
                    <td>键盘按键、鼠标移动、手柄摇杆</td>
                  </tr>
                  <tr>
                    <td><code>Output Report</code></td>
                    <td>主机 → 设备</td>
                    <td>键盘 LED、手柄震动</td>
                  </tr>
                  <tr>
                    <td><code>Feature Report</code></td>
                    <td>双向</td>
                    <td>设备配置、固件升级</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>报告描述符结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────────────────────────────────────────────┐
    │                  HID Report Descriptor               │
    │  ┌───────────────────────────────────────────────┐  │
    │  │  Usage Page (Generic Desktop)                  │  │
    │  │  Usage (Keyboard)                              │  │
    │  │  Collection (Application)                      │  │
    │  │    Usage Page (Keyboard)                       │  │
    │  │    Usage Minimum (224)                         │  │
    │  │    Usage Maximum (231)                         │  │
    │  │    Logical Minimum (0)                         │  │
    │  │    Logical Maximum (1)                         │  │
    │  │    Report Size (1)                             │  │
    │  │    Report Count (8)                            │  │
    │  │    Input (Data, Variable, Absolute)            │  │
    │  │    ...                                         │  │
    │  │  End Collection                                │  │
    │  └───────────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────────┘
              `}</pre>
            </div>
            <div className="info-box">
              <strong>报告描述符关键项</strong>
              <ul>
                <li><strong>Usage Page</strong> - 定义设备用途类别（如 Generic Desktop, Keyboard）</li>
                <li><strong>Usage</strong> - 具体用途（如 Mouse, Keyboard, Gamepad）</li>
                <li><strong>Report Size</strong> - 每个报告字段的大小（位）</li>
                <li><strong>Report Count</strong> - 报告字段的数量</li>
                <li><strong>Collection</strong> - 将相关数据分组的容器</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>输入设备</strong> - 键盘、鼠标、触控板、绘图板</li>
              <li><strong>游戏设备</strong> - 游戏手柄、方向盘、摇杆、VR 控制器</li>
              <li><strong>专业设备</strong> - 条码扫描器、RFID 读卡器、磁条卡阅读器</li>
              <li><strong>工业控制</strong> - 操作面板、脚踩开关、工业键盘</li>
              <li><strong>医疗设备</strong> - 医疗键盘、脚踏开关、体征监测设备</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <HidDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`// HID 设备操作 (github.com/karalabe/hid)
package main

import (
    "fmt"
    "github.com/karalabe/hid"
)

func main() {
    // 列出所有 HID 设备
    devices := hid.Enumerate(0x0, 0x0)
    for _, dev := range devices {
        fmt.Printf("VID: %04x, PID: %04x, %s\\n",
            dev.VendorID, dev.ProductID, dev.Product)
    }

    // 打开指定设备
    device, err := hid.Open(0x1234, 0x5678, "")
    if err != nil {
        panic(err)
    }
    defer device.Close()

    // 读取输入报告
    buf := make([]byte, 64)
    for {
        n, err := device.Read(buf)
        if err != nil {
            break
        }
        fmt.Printf("输入报告: %x\\n", buf[:n])
    }

    // 发送输出报告
    output := []byte{0x01, 0x02, 0x03}
    device.Write(output)
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# HID 设备操作 (hid library)
import hid

# 列出所有 HID 设备
devices = hid.enumerate()
for dev in devices:
    print(f"VID: {dev['vendor_id']:04x}, PID: {dev['product_id']:04x}, {dev['product_string']}")

# 打开指定设备
device = hid.device()
device.open(0x1234, 0x5678)

# 设置非阻塞模式
device.set_nonblocking(True)

# 读取输入报告 (非阻塞)
data = device.read(64, timeout_ms=100)
if data:
    print(f"输入报告: {bytes(data).hex()}")

# 发送输出报告
device.write([0x01, 0x02, 0x03])  # 第一个字节是 Report ID

# 发送特征报告
feature = device.get_feature_report(0x01, 64)
device.send_feature_report([0x01, 0x02, 0x03])

device.close()`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`// HID 设备操作 (purejavahidapi)
import purejavahidapi.*;

public class HidExample {
    public static void main(String[] args) throws Exception {
        // 列出所有 HID 设备
        for (HidDeviceInfo info : PureJavaHidApi.listDevices()) {
            System.out.printf("VID: %04x, PID: %04x, %s%n",
                info.getVendorId(), info.getProductId(), info.getProductString());
        }

        // 打开指定设备
        HidDevice device = PureJavaHidApi.openDevice(0x1234, 0x5678);

        // 设置输入报告监听器
        device.setInputReportListener((source, reportId, data, length) -> {
            System.out.printf("输入报告 ID=%d: ", reportId);
            for (int i = 0; i < length; i++) {
                System.out.printf("%02x ", data[i]);
            }
            System.out.println();
        });

        // 发送输出报告
        byte[] output = {0x01, 0x02, 0x03};
        device.setOutputReport((byte) 0x01, output, output.length);

        // 保持运行以接收输入报告
        Thread.sleep(10000);

        device.close();
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// HID 演示组件
function HidDemo() {
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
    <div className="connection-demo">
      <h3>设备连接</h3>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={handleScan}
          disabled={status === 'scanning'}
          style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          {status === 'scanning' ? '扫描中...' : '扫描设备'}
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, marginBottom: 16, color: '#c62828' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>设备列表 ({devices.length})</h4>
          {devices.length === 0 ? (
            <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
              点击"扫描设备"查找可用 HID 设备
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
              {devices.map((device, idx) => {
                const selectedFlag =
                  selected?.productId === device.productId && selected?.vendorId === device.vendorId
                return (
                  <li
                    key={`${device.vendorId}-${device.productId}-${idx}`}
                    style={{
                      padding: '10px 12px',
                      background: selectedFlag ? '#e3f8ff' : '#fff',
                      borderRadius: 6,
                      marginBottom: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{device.product || 'HID 设备'}</div>
                      <div style={{ fontSize: 11, color: '#666' }}>VID: {formatId(device.vendorId)} | PID: {formatId(device.productId)}</div>
                    </div>
                    {selectedFlag ? (
                      <button
                        onClick={handleDisconnect}
                        style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                      >
                        断开
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(device)}
                        disabled={status === 'connected'}
                        style={{ padding: '6px 12px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                      >
                        连接
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14 }}>数据通信</h4>
            <button
              onClick={() => setLog('')}
              style={{ padding: '4px 10px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              清空
            </button>
          </div>

          <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: '#666' }}>Report ID:</label>
            <input
              type="number"
              min={0}
              max={255}
              value={reportId}
              onChange={(e) => setReportId(Number(e.target.value))}
              disabled={status !== 'connected'}
              style={{ width: 60, padding: '6px 8px', borderRadius: 4, border: '1px solid #ddd' }}
            />
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

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={status !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
            />
            <button
              onClick={handleSend}
              disabled={status !== 'connected' || !message.trim()}
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
          {status === 'connected' && `已连接 - ${selected?.product || 'HID 设备'}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}

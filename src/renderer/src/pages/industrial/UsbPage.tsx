import { useState } from 'react'
import { useDeviceStore } from '../../store/deviceStore'
import type { UsbDevice } from '../../store/deviceStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

export default function UsbPage() {
  return (
    <ElectronOnly>
      <UsbPageContent />
    </ElectronOnly>
  )
}

function UsbPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔌 USB 设备</h1>
        <p>Universal Serial Bus - 通用串行总线</p>
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
                <h3>即插即用</h3>
                <p>USB 设备支持热插拔，系统自动识别并加载驱动，无需重启计算机</p>
              </div>
              <div className="feature-card">
                <h3>多种传输模式</h3>
                <p>支持控制传输、批量传输、中断传输和同步传输四种模式</p>
              </div>
              <div className="feature-card">
                <h3>高速传输</h3>
                <p>USB 3.0 理论带宽 5Gbps，USB 3.2 Gen 2x2 可达 20Gbps</p>
              </div>
              <div className="feature-card">
                <h3>设备标识</h3>
                <p>每个 USB 设备有唯一的 Vendor ID (VID) 和 Product ID (PID)</p>
              </div>
            </div>

            <h2>USB 版本对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>版本</th>
                  <th>速率</th>
                  <th>带宽</th>
                  <th>发布年份</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>USB 1.1</td>
                  <td>Full Speed</td>
                  <td>12 Mbps</td>
                  <td>1998</td>
                </tr>
                <tr>
                  <td>USB 2.0</td>
                  <td>High Speed</td>
                  <td>480 Mbps</td>
                  <td>2000</td>
                </tr>
                <tr>
                  <td>USB 3.0</td>
                  <td>Super Speed</td>
                  <td>5 Gbps</td>
                  <td>2008</td>
                </tr>
                <tr>
                  <td>USB 3.1</td>
                  <td>Super Speed+</td>
                  <td>10 Gbps</td>
                  <td>2013</td>
                </tr>
                <tr>
                  <td>USB 3.2</td>
                  <td>Super Speed++</td>
                  <td>20 Gbps</td>
                  <td>2017</td>
                </tr>
              </tbody>
            </table>

            <h2>传输类型</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>类型</th>
                    <th>特点</th>
                    <th>典型应用</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Control</code></td>
                    <td>双向、可靠、配置设备</td>
                    <td>枚举、配置、状态查询</td>
                  </tr>
                  <tr>
                    <td><code>Bulk</code></td>
                    <td>单向、可靠、错误重传</td>
                    <td>大容量存储、打印机</td>
                  </tr>
                  <tr>
                    <td><code>Interrupt</code></td>
                    <td>单向、低延迟、轮询</td>
                    <td>键盘、鼠标、游戏手柄</td>
                  </tr>
                  <tr>
                    <td><code>Isochronous</code></td>
                    <td>单向、定时、无重传</td>
                    <td>音频、视频流</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>外设连接</strong> - 键盘、鼠标、打印机、扫描仪等</li>
              <li><strong>存储设备</strong> - U 盘、移动硬盘、SD 卡读卡器</li>
              <li><strong>嵌入式调试</strong> - CMSIS-DAP 调试器、J-Link、ST-Link</li>
              <li><strong>串口转换</strong> - USB-UART 桥接芯片 (CP2102, CH340)</li>
              <li><strong>数据采集</strong> - USB 示波器、逻辑分析仪、数据采集卡</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <UsbDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`// USB 设备操作 (github.com/google/gousb)
package main

import (
    "fmt"
    "github.com/google/gousb"
)

func main() {
    ctx := gousb.NewContext()
    defer ctx.Close()

    // 列出所有 USB 设备
    devs, _ := ctx.ListDevices(func(desc *gousb.DeviceDesc) bool {
        fmt.Printf("%03d.%03d %s:%s\\n",
            desc.Bus, desc.Address,
            desc.Vendor, desc.Product)
        return false
    })
    defer func() {
        for _, d := range devs {
            d.Close()
        }
    }()

    // 打开指定设备
    vid, pid := gousb.ID(0x1234), gousb.ID(0x5678)
    dev, _ := ctx.OpenDeviceWithVIDPID(vid, pid)
    if dev != nil {
        defer dev.Close()

        // 获取配置
        cfg, _ := dev.Config(1)
        defer cfg.Close()

        // Claim 接口
        intf, _ := cfg.Interface(0, 0)
        defer intf.Close()

        // 获取端点
        epOut, _ := intf.OutEndpoint(1)
        epIn, _ := intf.InEndpoint(2)

        // 发送数据
        epOut.Write([]byte("Hello USB"))

        // 读取数据
        buf := make([]byte, 64)
        epIn.Read(buf)
    }
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# USB 设备操作 (pyusb)
import usb.core
import usb.util

# 查找设备
dev = usb.core.find(idVendor=0x1234, idProduct=0x5678)
if dev is None:
    raise ValueError("设备未找到")

# 设置配置
dev.set_configuration()

# 获取端点
cfg = dev.get_active_configuration()
intf = cfg[(0, 0)]

ep_out = usb.util.find_descriptor(
    intf,
    custom_match=lambda e: (
        usb.util.endpoint_direction(e.bEndpointAddress) ==
        usb.util.ENDPOINT_OUT
    )
)

ep_in = usb.util.find_descriptor(
    intf,
    custom_match=lambda e: (
        usb.util.endpoint_direction(e.bEndpointAddress) ==
        usb.util.ENDPOINT_IN
    )
)

# 发送数据
ep_out.write(b'Hello USB')

# 读取数据
data = ep_in.read(64)
print(f"接收: {data}")`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`// USB 设备操作 (usb4java)
import org.usb4java.*;

public class UsbExample {
    public static void main(String[] args) {
        // 初始化 LibUSB
        Context context = new Context();
        LibUsb.init(context);

        // 查找设备
        DeviceList list = new DeviceList();
        LibUsb.getDeviceList(context, list);

        for (Device device : list) {
            DeviceDescriptor descriptor = new DeviceDescriptor();
            LibUsb.getDeviceDescriptor(device, descriptor);

            System.out.printf("VID: %04x, PID: %04x%n",
                descriptor.idVendor(),
                descriptor.idProduct());
        }

        LibUsb.freeDeviceList(list, true);
        LibUsb.exit(context);
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UsbDemo() {
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
    <div className="connection-demo">
      <h3>设备连接</h3>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={handleScan}
          disabled={usbStatus === 'scanning'}
          style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          {usbStatus === 'scanning' ? '扫描中...' : '扫描设备'}
        </button>
      </div>

      {usbError && (
        <div style={{ marginBottom: 16, padding: 16, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcdd2' }}>
          <div style={{ fontWeight: 500, color: '#c62828' }}>⚠️ {usbError.split('。')[0]}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>设备列表 ({usbDevices.length})</h4>
          {usbDevices.length === 0 ? (
            <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
              点击"扫描设备"查找可用USB设备
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
              {usbDevices.map((device, index) => (
                <li
                  key={`${device.vendorId}-${device.productId}-${index}`}
                  style={{
                    padding: '10px 12px',
                    background: selectedDevice?.deviceAddress === device.deviceAddress ? '#e3f8ff' : '#fff',
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
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{device.product || 'USB 设备'}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>VID: {formatId(device.vendorId)} | PID: {formatId(device.productId)}</div>
                  </div>
                  {selectedDevice?.deviceAddress === device.deviceAddress ? (
                    <button
                      onClick={handleDisconnect}
                      style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    >
                      断开
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(device)}
                      disabled={usbStatus === 'connected'}
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
            <h4 style={{ margin: 0, fontSize: 14 }}>数据通信</h4>
          </div>

          <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: '#666' }}>端点号:</label>
            <input
              type="number"
              value={endpoint}
              onChange={(e) => setEndpoint(Number(e.target.value))}
              min={1}
              max={255}
              disabled={usbStatus !== 'connected'}
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
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{usbData || '暂无数据'}</pre>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={usbStatus !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
            />
            <button
              onClick={handleSend}
              disabled={usbStatus !== 'connected' || !message.trim()}
              style={{ padding: '8px 12px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              发送
            </button>
            <button
              onClick={handleRead}
              disabled={usbStatus !== 'connected'}
              style={{ padding: '8px 12px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              读取
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: usbStatus === 'connected' ? '#4caf50' : usbStatus === 'error' ? '#f44336' : '#ccc'
        }} />
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

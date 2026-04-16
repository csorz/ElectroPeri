import { useEffect, useState } from 'react'
import { useDeviceStore } from '../../store/deviceStore'
import type { BluetoothDevice } from '../../store/deviceStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

export default function BluetoothPage() {
  return (
    <ElectronOnly>
      <BluetoothPageContent />
    </ElectronOnly>
  )
}

function BluetoothPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📶 蓝牙通信</h1>
        <p>Bluetooth - 短距离无线通信技术</p>
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
                <h3>短距离无线</h3>
                <p>工作在 2.4GHz ISM 频段，典型传输距离 10-100 米</p>
              </div>
              <div className="feature-card">
                <h3>低功耗</h3>
                <p>BLE (Bluetooth Low Energy) 功耗极低，适合电池供电设备</p>
              </div>
              <div className="feature-card">
                <h3>设备发现</h3>
                <p>支持设备扫描、配对、连接，自动发现服务与特征</p>
              </div>
              <div className="feature-card">
                <h3>数据传输</h3>
                <p>通过 GATT 协议读写特征值，支持通知订阅模式</p>
              </div>
            </div>

            <h2>蓝牙版本演进</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>版本</th>
                  <th>速率</th>
                  <th>特点</th>
                  <th>发布年份</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bluetooth 4.0</td>
                  <td>1 Mbps</td>
                  <td>引入 BLE 低功耗模式</td>
                  <td>2010</td>
                </tr>
                <tr>
                  <td>Bluetooth 4.2</td>
                  <td>1 Mbps</td>
                  <td>增强隐私、IPSP</td>
                  <td>2014</td>
                </tr>
                <tr>
                  <td>Bluetooth 5.0</td>
                  <td>2 Mbps</td>
                  <td>4倍距离、8倍广播数据</td>
                  <td>2016</td>
                </tr>
                <tr>
                  <td>Bluetooth 5.2</td>
                  <td>2 Mbps</td>
                  <td>LE Audio、LC3 编码</td>
                  <td>2020</td>
                </tr>
                <tr>
                  <td>Bluetooth 5.3</td>
                  <td>2 Mbps</td>
                  <td>连接子速率优化</td>
                  <td>2021</td>
                </tr>
              </tbody>
            </table>

            <h2>GATT 协议架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────────────────────────────────────────┐
    │                   GATT Server                   │
    │  ┌───────────────────────────────────────────┐  │
    │  │             Service (服务)                 │  │
    │  │  ┌─────────────────────────────────────┐  │  │
    │  │  │       Characteristic (特征)         │  │  │
    │  │  │  ┌─────────────────────────────┐    │  │  │
    │  │  │  │     Descriptor (描述符)     │    │  │  │
    │  │  │  └─────────────────────────────┘    │  │  │
    │  │  └─────────────────────────────────────┘  │  │
    │  └───────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────┘
              `}</pre>
            </div>
            <div className="info-box">
              <strong>GATT 核心概念</strong>
              <ul>
                <li><strong>Service</strong> - 服务，包含一组相关的特征</li>
                <li><strong>Characteristic</strong> - 特征，可读/写/通知的数据单元</li>
                <li><strong>Descriptor</strong> - 描述符，描述特征的属性</li>
                <li><strong>UUID</strong> - 通用唯一标识符，用于识别服务和特征</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>可穿戴设备</strong> - 智能手表、手环、耳机</li>
              <li><strong>健康监测</strong> - 心率带、血氧仪、血糖仪、体重秤</li>
              <li><strong>智能家居</strong> - 智能门锁、灯泡、传感器</li>
              <li><strong>工业物联网</strong> - 无线传感器网络、设备监控</li>
              <li><strong>位置服务</strong> - Beacon 室内定位、资产追踪</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <BluetoothDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例 (BLE)</h2>
            <div className="code-block">
              <pre>{`// BLE 设备操作 (github.com/go-ble/ble)
package main

import (
    "context"
    "fmt"
    "github.com/go-ble/ble"
    "github.com/go-ble/ble/linux"
)

func main() {
    // 初始化 BLE 设备
    device, _ := linux.NewDevice()
    ble.SetDefaultDevice(device)

    // 扫描设备
    ctx := context.Background()
    ble.Scan(ctx, false, func(a ble.Advertisement) {
        fmt.Printf("发现设备: %s (%s)\\n", a.LocalName(), a.Addr())
    }, nil)

    // 连接设备
    client, _ := ble.Connect(ctx, ble.NewAddr("AA:BB:CC:DD:EE:FF"))
    defer client.CancelConnection()

    // 发现服务
    services, _ := client.DiscoverServices(nil)
    for _, s := range services {
        fmt.Printf("服务: %s\\n", s.UUID)

        // 发现特征
        chars, _ := client.DiscoverCharacteristics(nil, s)
        for _, c := range chars {
            fmt.Printf("  特征: %s\\n", c.UUID)

            // 读取特征值
            if c.PropertyRead&ble.CharPropertyRead != 0 {
                data, _ := client.ReadCharacteristic(c)
                fmt.Printf("    值: %x\\n", data)
            }
        }
    }
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# BLE 设备操作 (bleak)
import asyncio
from bleak import BleakClient, BleakScanner

async def main():
    # 扫描设备
    devices = await BleakScanner.discover()
    for device in devices:
        print(f"发现设备: {device.name} ({device.address})")

    # 连接设备
    async with BleakClient("AA:BB:CC:DD:EE:FF") as client:
        # 获取服务列表
        services = await client.get_services()
        for service in services:
            print(f"服务: {service.uuid}")
            for char in service.characteristics:
                print(f"  特征: {char.uuid}")

                # 读取特征值
                if "read" in char.properties:
                    value = await client.read_gatt_char(char.uuid)
                    print(f"    值: {value.hex()}")

                # 订阅通知
                if "notify" in char.properties:
                    await client.start_notify(
                        char.uuid,
                        lambda _, data: print(f"通知: {data.hex()}")
                    )

asyncio.run(main())`}</pre>
            </div>

            <h2>Java 示例 (Android)</h2>
            <div className="code-block">
              <pre>{`// Android BLE 操作
BluetoothManager manager = (BluetoothManager)
    getSystemService(Context.BLUETOOTH_SERVICE);
BluetoothAdapter adapter = manager.getAdapter();

// 扫描设备
adapter.startLeScan(new BluetoothAdapter.LeScanCallback() {
    @Override
    public void onLeScan(BluetoothDevice device, int rssi, byte[] scanRecord) {
        System.out.println("发现设备: " + device.getName());
    }
});

// 连接设备
BluetoothDevice device = adapter.getRemoteDevice("AA:BB:CC:DD:EE:FF");
BluetoothGatt gatt = device.connectGatt(this, false, new BluetoothGattCallback() {
    @Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
        if (newState == BluetoothProfile.STATE_CONNECTED) {
            gatt.discoverServices();
        }
    }

    @Override
    public void onServicesDiscovered(BluetoothGatt gatt, int status) {
        for (BluetoothGattService service : gatt.getServices()) {
            for (BluetoothGattCharacteristic char : service.getCharacteristics()) {
                // 读取特征值
                gatt.readCharacteristic(char);
            }
        }
    }

    @Override
    public void onCharacteristicRead(BluetoothGatt gatt,
            BluetoothGattCharacteristic char, int status) {
        System.out.println("读取: " + Arrays.toString(char.getValue()));
    }
});`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BluetoothDemo() {
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
  const [moduleAvailable, setModuleAvailable] = useState<boolean | null>(null)
  const [moduleError, setModuleError] = useState<string | null>(null)
  const [dataCleanup, setDataCleanup] = useState<(() => void) | null>(null)

  // 检查蓝牙模块是否可用
  useEffect(() => {
    const checkModule = async () => {
      try {
        const result = await window.api.bluetooth.check()
        setModuleAvailable(result.available)
        if (!result.available && result.error) {
          setModuleError(result.error)
        }
      } catch {
        setModuleAvailable(false)
        setModuleError('无法检查蓝牙模块状态')
      }
    }
    checkModule()
  }, [])

  // 扫描蓝牙设备
  const handleScan = async () => {
    if (!moduleAvailable) {
      setBluetoothError(moduleError || '蓝牙模块不可用')
      return
    }
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
      const cleanup = window.api.bluetooth.onData((data: string) => {
        setBluetoothData(data)
      })
      setDataCleanup(() => cleanup)
    } catch (err) {
      setBluetoothError(err instanceof Error ? err.message : '连接失败')
      setBluetoothStatus('error')
    }
  }

  // 断开连接
  const handleDisconnect = async () => {
    try {
      dataCleanup?.()
      setDataCleanup(null)
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
    <div className="connection-demo">
      <h3>设备连接</h3>

      {/* 模块不可用警告 */}
      {moduleAvailable === false && (
        <div style={{ marginBottom: 16, padding: 16, background: '#fff3e0', borderRadius: 8, border: '1px solid #ffcc80' }}>
          <div style={{ fontWeight: 500, color: '#e65100', marginBottom: 8 }}>⚠️ 蓝牙模块不可用</div>
          <div style={{ fontSize: 13, color: '#666' }}>{moduleError}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
            请使用 Web Bluetooth 页面，或安装 Visual Studio Build Tools 后运行: pnpm rebuild @abandonware/noble
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        {bluetoothStatus === 'scanning' ? (
          <button
            onClick={handleStopScan}
            style={{ padding: '8px 16px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            停止扫描
          </button>
        ) : (
          <button
            onClick={handleScan}
            disabled={bluetoothStatus === 'connected' || moduleAvailable === false}
            style={{ padding: '8px 16px', background: moduleAvailable === false ? '#ccc' : '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: moduleAvailable === false ? 'not-allowed' : 'pointer' }}
          >
            扫描设备
          </button>
        )}
      </div>

      {bluetoothError && (
        <div style={{ marginBottom: 16, padding: 16, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcdd2' }}>
          <div style={{ fontWeight: 500, color: '#c62828' }}>⚠️ {bluetoothError.split('。')[0]}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>设备列表 ({bluetoothDevices.length})</h4>
          {bluetoothDevices.length === 0 ? (
            <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
              点击"扫描设备"查找附近蓝牙设备
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
              {bluetoothDevices.map((device) => (
                <li
                  key={device.id}
                  style={{
                    padding: '10px 12px',
                    background: selectedDevice?.id === device.id ? '#e3f8ff' : '#fff',
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
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{device.name || '未知设备'}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{device.address}</div>
                    {device.rssi && (
                      <div style={{ fontSize: 11, color: getRssiColor(device.rssi) }}>
                        信号: {getRssiLevel(device.rssi)} ({device.rssi} dBm)
                      </div>
                    )}
                  </div>
                  {selectedDevice?.id === device.id ? (
                    <button
                      onClick={handleDisconnect}
                      style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    >
                      断开
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(device)}
                      disabled={bluetoothStatus === 'connected'}
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
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>数据通信</h4>

          <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: '#666' }}>服务UUID:</label>
            <input
              type="text"
              value={serviceUuid}
              onChange={(e) => setServiceUuid(e.target.value)}
              placeholder="可选"
              disabled={bluetoothStatus !== 'connected'}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
            />
            <button
              onClick={handleDiscoverServices}
              disabled={bluetoothStatus !== 'connected' || !serviceUuid.trim()}
              style={{ padding: '6px 12px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              发现服务
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
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{bluetoothData || '暂无数据'}</pre>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={bluetoothStatus !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
            />
            <button
              onClick={handleSend}
              disabled={bluetoothStatus !== 'connected' || !message.trim()}
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
          background: bluetoothStatus === 'connected' ? '#4caf50' : bluetoothStatus === 'error' ? '#f44336' : '#ccc'
        }} />
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

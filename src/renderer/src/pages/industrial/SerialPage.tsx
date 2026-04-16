import { useState } from 'react'
import { useDeviceStore } from '../../store/deviceStore'
import type { SerialPortDevice } from '../../store/deviceStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

const baudRateOptions = [9600, 19200, 38400, 57600, 115200]

export default function SerialPage() {
  return (
    <ElectronOnly>
      <SerialPageContent />
    </ElectronOnly>
  )
}

function SerialPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔌 串口通信</h1>
        <p>Serial Port - RS-232/RS-485 串行通信接口</p>
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
                <h3>点对点通信</h3>
                <p>串口是一种简单可靠的点对点通信方式，广泛用于嵌入式设备、传感器和工业控制</p>
              </div>
              <div className="feature-card">
                <h3>可配置波特率</h3>
                <p>支持多种波特率: 9600、19200、38400、57600、115200 等，波特率越高传输速度越快</p>
              </div>
              <div className="feature-card">
                <h3>全双工/半双工</h3>
                <p>RS-232 为全双工通信，RS-485 为半双工通信但支持多点通信和更长距离</p>
              </div>
              <div className="feature-card">
                <h3>简单协议</h3>
                <p>数据帧格式: 起始位 + 数据位 + 校验位 + 停止位，配置灵活简单</p>
              </div>
            </div>

            <h2>通信参数</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>参数</th>
                    <th>说明</th>
                    <th>常用值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Baud Rate</code></td>
                    <td>波特率，每秒传输的位数</td>
                    <td>9600, 115200</td>
                  </tr>
                  <tr>
                    <td><code>Data Bits</code></td>
                    <td>数据位长度</td>
                    <td>8, 7</td>
                  </tr>
                  <tr>
                    <td><code>Stop Bits</code></td>
                    <td>停止位数量</td>
                    <td>1, 2</td>
                  </tr>
                  <tr>
                    <td><code>Parity</code></td>
                    <td>校验方式</td>
                    <td>None, Even, Odd</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>数据帧结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌────────┬─────────────────┬─────────┬──────────┐
    │ Start  │    Data Bits    │ Parity  │  Stop    │
    │  1 bit │    8 bits       │ 0-1 bit │ 1-2 bits │
    └────────┴─────────────────┴─────────┴──────────┘
         ↓          ↓            ↓          ↓
       空闲→      数据传输      校验检测   帧结束
       跳变
              `}</pre>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>嵌入式调试</strong> - 通过串口打印调试信息、下载固件</li>
              <li><strong>传感器采集</strong> - 温湿度、压力、GPS 等传感器数据读取</li>
              <li><strong>工业控制</strong> - PLC、变频器、伺服驱动器通信</li>
              <li><strong>物联网设备</strong> - MCU 与模块间的数据交互</li>
              <li><strong>传统设备</strong> - 电子秤、扫码枪、打印机等外设</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <SerialDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`// 串口通信示例 (go.bug.st/serial)
package main

import (
    "fmt"
    "go.bug.st/serial"
)

func main() {
    // 获取可用端口列表
    ports, _ := serial.GetPortsList()
    fmt.Println("可用端口:", ports)

    // 打开串口
    mode := &serial.Mode{
        BaudRate: 115200,
    }
    port, err := serial.Open("/dev/ttyUSB0", mode)
    if err != nil {
        panic(err)
    }
    defer port.Close()

    // 发送数据
    n, _ := port.Write([]byte("Hello Serial\\n"))
    fmt.Printf("发送 %d 字节\\n", n)

    // 读取数据
    buf := make([]byte, 128)
    n, _ = port.Read(buf)
    fmt.Printf("接收: %s", buf[:n])
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# 串口通信示例 (pyserial)
import serial
import serial.tools.list_ports

# 列出可用端口
ports = serial.tools.list_ports.comports()
for port in ports:
    print(f"端口: {port.device}, 描述: {port.description}")

# 打开串口
ser = serial.Serial(
    port='/dev/ttyUSB0',
    baudrate=115200,
    bytesize=serial.EIGHTBITS,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    timeout=1
)

# 发送数据
ser.write(b'Hello Serial\\n')

# 读取数据
data = ser.readline()
print(f"接收: {data.decode()}")

ser.close()`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`// 串口通信示例 (jssc)
import jssc.SerialPort;
import jssc.SerialPortList;

public class SerialExample {
    public static void main(String[] args) throws Exception {
        // 列出可用端口
        String[] ports = SerialPortList.getPortNames();
        for (String port : ports) {
            System.out.println("端口: " + port);
        }

        // 打开串口
        SerialPort serialPort = new SerialPort("/dev/ttyUSB0");
        serialPort.openPort();
        serialPort.setParams(115200, 8, 1, 0);

        // 发送数据
        serialPort.writeString("Hello Serial\\n");

        // 读取数据
        String data = serialPort.readString();
        System.out.println("接收: " + data);

        serialPort.closePort();
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SerialDemo() {
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
    <div className="connection-demo">
      <h3>设备连接</h3>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, color: '#666' }}>波特率:</label>
        <select
          value={baudRate}
          onChange={(e) => setBaudRate(Number(e.target.value))}
          disabled={serialStatus === 'connected'}
          style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
        >
          {baudRateOptions.map(rate => (
            <option key={rate} value={rate}>{rate}</option>
          ))}
        </select>
        <button
          onClick={handleScan}
          disabled={serialStatus === 'scanning'}
          style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          {serialStatus === 'scanning' ? '扫描中...' : '扫描设备'}
        </button>
      </div>

      {serialError && (
        <div style={{ marginBottom: 16, padding: 16, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcdd2' }}>
          <div style={{ fontWeight: 500, color: '#c62828' }}>⚠️ {serialError.split('。')[0]}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>设备列表 ({serialPorts.length})</h4>
          {serialPorts.length === 0 ? (
            <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
              点击"扫描设备"查找可用串口
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
              {serialPorts.map((port) => (
                <li
                  key={port.path}
                  style={{
                    padding: '10px 12px',
                    background: selectedPort === port.path ? '#e3f8ff' : '#fff',
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
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{port.path}</div>
                    {port.manufacturer && <div style={{ fontSize: 11, color: '#666' }}>{port.manufacturer}</div>}
                  </div>
                  {selectedPort === port.path ? (
                    <button
                      onClick={handleDisconnect}
                      style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    >
                      断开
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(port.path)}
                      disabled={serialStatus === 'connected'}
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
              onClick={handleClear}
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
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{serialData || '暂无数据'}</pre>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={serialStatus !== 'connected'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
            />
            <button
              onClick={handleSend}
              disabled={serialStatus !== 'connected' || !message.trim()}
              style={{ padding: '8px 16px', background: serialStatus === 'connected' ? '#4fc3f7' : '#ccc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
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
          background: serialStatus === 'connected' ? '#4caf50' : serialStatus === 'error' ? '#f44336' : '#ccc'
        }} />
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

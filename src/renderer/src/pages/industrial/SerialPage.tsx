import { useEffect, useRef, useState } from 'react'
import { useDeviceStore } from '../../store/deviceStore'
import type { SerialPortDevice } from '../../store/deviceStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

// 串口配置选项
const baudRateOptions = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]
const dataBitsOptions = [5, 6, 7, 8]
const stopBitsOptions = [1, 2]
const parityOptions = [
  { value: 'none', label: '无' },
  { value: 'even', label: '偶校验' },
  { value: 'odd', label: '奇校验' }
]

// 串口配置
interface SerialConfig {
  baudRate: number
  dataBits: number
  stopBits: number
  parity: string
}

// 已连接的串口连接信息
interface SerialConnection {
  path: string
  config: SerialConfig
  data: string
  sendFormat: 'text' | 'hex'
  appendNewline: boolean
  showTimestamp: boolean
}

// 16进制快捷示例
const hexExamples = [
  { label: 'AT', value: '4154' },
  { label: 'AT+RST', value: '41542B525354' },
  { label: '01 02 03', value: '010203' },
  { label: 'FF FE', value: 'FFFE' }
]

// 默认配置
const defaultConfig: SerialConfig = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
}

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

            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`// 串口通信示例 (serialport)
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

async function main() {
  // 列出可用端口
  const ports = await SerialPort.list()
  console.log('可用端口:', ports.map(p => p.path))

  // 打开串口
  const port = new SerialPort({
    path: 'COM3', // Windows: 'COM3', Linux: '/dev/ttyUSB0'
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
  })

  // 使用换行解析器
  const parser = port.pipe(new ReadlineParser({ delimiter: '\\n' }))

  // 监听数据
  parser.on('data', (line) => {
    console.log('接收:', line)
  })

  // 错误处理
  port.on('error', (err) => {
    console.error('错误:', err.message)
  })

  // 发送数据
  port.write('Hello Serial\\n', (err) => {
    if (err) console.error('发送失败:', err)
    else console.log('发送成功')
  })

  // 关闭串口
  // port.close()
}

main()`}</pre>
            </div>

            <h2>C/C++ 示例 (Windows)</h2>
            <div className="code-block">
              <pre>{`// 串口通信示例 (Windows API)
#include <windows.h>
#include <stdio.h>

int main() {
    // 打开串口
    HANDLE hSerial = CreateFile(
        "COM3",
        GENERIC_READ | GENERIC_WRITE,
        0,
        NULL,
        OPEN_EXISTING,
        FILE_ATTRIBUTE_NORMAL,
        NULL
    );

    if (hSerial == INVALID_HANDLE_VALUE) {
        printf("无法打开串口\\n");
        return 1;
    }

    // 配置串口参数
    DCB dcb = {0};
    dcb.DCBlength = sizeof(dcb);
    GetCommState(hSerial, &dcb);
    dcb.BaudRate = CBR_115200;
    dcb.ByteSize = 8;
    dcb.StopBits = ONESTOPBIT;
    dcb.Parity = NOPARITY;
    SetCommState(hSerial, &dcb);

    // 发送数据
    char data[] = "Hello Serial\\n";
    DWORD bytesWritten;
    WriteFile(hSerial, data, strlen(data), &bytesWritten, NULL);
    printf("发送 %d 字节\\n", bytesWritten);

    // 读取数据
    char buffer[128];
    DWORD bytesRead;
    ReadFile(hSerial, buffer, sizeof(buffer), &bytesRead, NULL);
    buffer[bytesRead] = '\\0';
    printf("接收: %s\\n", buffer);

    CloseHandle(hSerial);
    return 0;
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SerialDemo() {
  const { serialPorts, setSerialPorts } = useDeviceStore()
  const [connections, setConnections] = useState<SerialConnection[]>([])
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 每个端口的配置（未连接时）
  const [portConfigs, setPortConfigs] = useState<Record<string, SerialConfig>>({})

  // 扫描串口设备
  const handleScan = async () => {
    setScanning(true)
    setError(null)
    try {
      const ports = await window.api.serial.list()
      setSerialPorts(ports as SerialPortDevice[])
      // 为每个端口初始化默认配置
      const newConfigs: Record<string, SerialConfig> = {}
      ;(ports as SerialPortDevice[]).forEach((p) => {
        newConfigs[p.path] = portConfigs[p.path] || { ...defaultConfig }
      })
      setPortConfigs(newConfigs)
    } catch (err) {
      setError(err instanceof Error ? err.message : '扫描失败')
    } finally {
      setScanning(false)
    }
  }

  // 连接串口
  const handleConnect = async (path: string) => {
    const config = portConfigs[path] || defaultConfig
    setError(null)
    try {
      await window.api.serial.open(path, config.baudRate, config.dataBits, config.stopBits, config.parity)
      setConnections((prev) => [
        ...prev,
        { path, config, data: '', sendFormat: 'text', appendNewline: false, showTimestamp: true }
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    }
  }

  // 断开连接
  const handleDisconnect = async (path: string) => {
    try {
      await window.api.serial.close(path)
      setConnections((prev) => prev.filter((c) => c.path !== path))
    } catch (err) {
      setError(err instanceof Error ? err.message : '断开失败')
    }
  }

  // 监听数据
  useEffect(() => {
    const unsubData = window.api.serial.onData((path: string, data: string) => {
      setConnections((prev) =>
        prev.map((c) => (c.path === path ? { ...c, data: c.data + data + '\n' } : c))
      )
    })
    const unsubError = window.api.serial.onError((_path: string, err: string) => {
      setError(err)
    })
    const unsubClosed = window.api.serial.onClosed((path: string) => {
      setConnections((prev) => prev.filter((c) => c.path !== path))
    })

    return () => {
      unsubData()
      unsubError()
      unsubClosed()
    }
  }, [])

  // 更新端口配置
  const updatePortConfig = (path: string, key: keyof SerialConfig, value: number | string) => {
    setPortConfigs((prev) => ({
      ...prev,
      [path]: { ...prev[path], [key]: value }
    }))
  }

  return (
    <div className="connection-demo">
      <h3>设备连接</h3>

      {error && (
        <div style={{ marginBottom: 16, padding: 16, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcdd2' }}>
          <div style={{ fontWeight: 500, color: '#c62828' }}>⚠️ {error.split('。')[0]}</div>
        </div>
      )}

      {/* 扫描区域 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleScan}
          disabled={scanning}
          style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          {scanning ? '扫描中...' : '扫描设备'}
        </button>
        <span style={{ fontSize: 13, color: '#666' }}>发现 {serialPorts.length} 个端口</span>
      </div>

      {/* 设备列表 - 每个端口独立配置 */}
      {serialPorts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>可用端口</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {serialPorts.map((port) => {
              const isConnected = connections.some((c) => c.path === port.path)
              const config = portConfigs[port.path] || defaultConfig

              return (
                <div
                  key={port.path}
                  style={{
                    background: isConnected ? '#e8f5e9' : '#fff',
                    borderRadius: 8,
                    border: isConnected ? '1px solid #a5d6a7' : '1px solid #e0e0e0',
                    padding: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    {/* 端口信息 */}
                    <div style={{ minWidth: 150 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{port.path}</div>
                      {port.manufacturer && <div style={{ fontSize: 12, color: '#666' }}>{port.manufacturer}</div>}
                    </div>

                    {/* 配置选项 */}
                    {!isConnected && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        {/* 波特率 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <label style={{ fontSize: 11, color: '#666' }}>波特率</label>
                          <select
                            value={config.baudRate}
                            onChange={(e) => updatePortConfig(port.path, 'baudRate', Number(e.target.value))}
                            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                          >
                            {baudRateOptions.map((rate) => (
                              <option key={rate} value={rate}>{rate}</option>
                            ))}
                          </select>
                        </div>

                        {/* 数据位 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <label style={{ fontSize: 11, color: '#666' }}>数据位</label>
                          <select
                            value={config.dataBits}
                            onChange={(e) => updatePortConfig(port.path, 'dataBits', Number(e.target.value))}
                            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                          >
                            {dataBitsOptions.map((bits) => (
                              <option key={bits} value={bits}>{bits}</option>
                            ))}
                          </select>
                        </div>

                        {/* 停止位 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <label style={{ fontSize: 11, color: '#666' }}>停止位</label>
                          <select
                            value={config.stopBits}
                            onChange={(e) => updatePortConfig(port.path, 'stopBits', Number(e.target.value))}
                            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                          >
                            {stopBitsOptions.map((bits) => (
                              <option key={bits} value={bits}>{bits}</option>
                            ))}
                          </select>
                        </div>

                        {/* 校验 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <label style={{ fontSize: 11, color: '#666' }}>校验</label>
                          <select
                            value={config.parity}
                            onChange={(e) => updatePortConfig(port.path, 'parity', e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
                          >
                            {parityOptions.map((p) => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* 连接按钮 */}
                        <button
                          onClick={() => handleConnect(port.path)}
                          style={{ padding: '6px 16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                        >
                          连接
                        </button>
                      </div>
                    )}

                    {/* 已连接状态 */}
                    {isConnected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#4caf50', fontWeight: 500 }}>已连接</span>
                        <span style={{ fontSize: 11, color: '#666' }}>
                          {config.baudRate} | {config.dataBits}-{config.stopBits} | {config.parity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 已连接的串口卡片 */}
      {connections.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>已连接 ({connections.length})</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: 16 }}>
            {connections.map((conn) => (
              <SerialCard
                key={conn.path}
                connection={conn}
                onDisconnect={handleDisconnect}
                onUpdateConnection={(updates) => {
                  setConnections((prev) =>
                    prev.map((c) => (c.path === conn.path ? { ...c, ...updates } : c))
                  )
                }}
              />
            ))}
          </div>
        </div>
      )}

      {serialPorts.length === 0 && !scanning && (
        <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 40 }}>
          点击"扫描设备"查找可用串口
        </div>
      )}
    </div>
  )
}

// 串口卡片组件
function SerialCard({
  connection,
  onDisconnect,
  onUpdateConnection
}: {
  connection: SerialConnection
  onDisconnect: (path: string) => void
  onUpdateConnection: (updates: Partial<SerialConnection>) => void
}) {
  const [message, setMessage] = useState('')
  const dataRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (dataRef.current) {
      dataRef.current.scrollTop = dataRef.current.scrollHeight
    }
  }, [connection.data])

  // 发送数据
  const handleSend = async () => {
    if (!message.trim()) return

    let dataToSend = message

    // 16进制格式转换
    if (connection.sendFormat === 'hex') {
      // 移除空格和常见分隔符，然后转换为 Buffer
      const hexStr = message.replace(/[\s,]/g, '')
      if (!/^[0-9a-fA-F]*$/.test(hexStr) || hexStr.length % 2 !== 0) {
        alert('16进制格式错误，请输入偶数个十六进制字符')
        return
      }
      const bytes: number[] = []
      for (let i = 0; i < hexStr.length; i += 2) {
        bytes.push(parseInt(hexStr.substring(i, i + 2), 16))
      }
      dataToSend = String.fromCharCode(...bytes)
    }

    // 添加换行
    if (connection.appendNewline) {
      dataToSend += '\n'
    }

    try {
      await window.api.serial.write(connection.path, dataToSend)
      setMessage('')
    } catch (err) {
      console.error('发送失败:', err)
    }
  }

  // 清空数据
  const handleClear = () => {
    onUpdateConnection({ data: '' })
  }

  // 格式化显示数据 - 每次接收新数据换行显示
  const formatDisplayData = (rawData: string): string => {
    const lines = rawData.split('\n')
    const result: string[] = []

    lines.forEach((line, index) => {
      if (line === '' && index === lines.length - 1) return // 忽略最后的空行

      let formattedLine = ''
      for (let i = 0; i < line.length; i++) {
        const code = line.charCodeAt(i)
        if (code >= 32 && code <= 126) {
          formattedLine += line[i]
        } else if (code === 13) {
          formattedLine += '↵'
        } else if (code === 9) {
          formattedLine += '→'
        } else {
          formattedLine += `[${code.toString(16).padStart(2, '0').toUpperCase()}]`
        }
      }
      result.push(formattedLine)
    })

    return result.join('\n')
  }

  // 快捷示例点击
  const handleExampleClick = (hexValue: string): void => {
    setMessage(hexValue)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      {/* 卡片头部 */}
      <div
        style={{
          padding: '10px 14px',
          background: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <span style={{ fontWeight: 500, fontSize: 13 }}>{connection.path}</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: '#666' }}>
            {connection.config.baudRate} baud | {connection.config.dataBits}-{connection.config.stopBits} | {connection.config.parity}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50' }} />
          <button
            onClick={() => onDisconnect(connection.path)}
            style={{
              padding: '4px 10px',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            断开
          </button>
        </div>
      </div>

      {/* 数据区域 */}
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#666' }}>接收数据</span>
          <button
            onClick={handleClear}
            style={{
              padding: '2px 8px',
              background: '#e0e0e0',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11
            }}
          >
            清空
          </button>
        </div>

        <div
          ref={dataRef}
          style={{
            background: '#1e1e1e',
            color: '#4fc3f7',
            padding: 10,
            borderRadius: 6,
            height: 150,
            overflowY: 'auto',
            fontFamily: 'Consolas, monospace',
            fontSize: 12,
            marginBottom: 12
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {connection.data ? formatDisplayData(connection.data) : '暂无数据'}
          </pre>
        </div>

        {/* 发送选项 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          {/* 发送格式 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#666' }}>发送格式</label>
            <select
              value={connection.sendFormat}
              onChange={(e) => onUpdateConnection({ sendFormat: e.target.value as 'text' | 'hex' })}
              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
            >
              <option value="text">文本</option>
              <option value="hex">16进制</option>
            </select>
          </div>

          {/* 16进制快捷示例 */}
          {connection.sendFormat === 'hex' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#999' }}>示例:</span>
              {hexExamples.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => handleExampleClick(ex.value)}
                  style={{
                    padding: '2px 6px',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    border: '1px solid #90caf9',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: 'Consolas, monospace'
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}

          {/* 追加换行 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={connection.appendNewline}
              onChange={(e) => onUpdateConnection({ appendNewline: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            追加换行
          </label>
        </div>

        {/* 发送输入框 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={connection.sendFormat === 'hex' ? '输入16进制数据，如: 01 02 03 或 010203' : '输入要发送的数据...'}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid #ddd',
              fontSize: 12,
              fontFamily: connection.sendFormat === 'hex' ? 'Consolas, monospace' : 'inherit'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            style={{
              padding: '6px 14px',
              background: message.trim() ? '#4fc3f7' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              fontSize: 12
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

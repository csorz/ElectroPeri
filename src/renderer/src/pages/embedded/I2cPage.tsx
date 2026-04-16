import { useState } from 'react'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

export default function I2cPage() {
  return (
    <ElectronOnly
      featureName="I2C 通信"
      supportedDevices="树莓派、Arduino、ESP32、STM32 等支持 I2C 总线的嵌入式设备"
    >
      <I2cPageContent />
    </ElectronOnly>
  )
}

function I2cPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [bus, setBus] = useState(1)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<number[]>([])
  const [addr, setAddr] = useState(0x23)
  const [hex, setHex] = useState('01 02 03')
  const [readLen, setReadLen] = useState(8)
  const [log, setLog] = useState('')

  const appendLog = (line: string) => setLog((p) => p + line + '\n')
  const formatAddr = (a: number) => `0x${a.toString(16).toUpperCase().padStart(2, '0')}`

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const found = await window.api.i2c.scan(bus)
      setAddresses(found as number[])
      setStatus('idle')
      appendLog(`scan bus ${bus}: ${found.map(formatAddr).join(', ')}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '扫描失败')
      setStatus('error')
    }
  }

  const handleOpen = async () => {
    setStatus('scanning')
    setError(null)
    try {
      await window.api.i2c.open(bus)
      setStatus('connected')
      appendLog(`i2c open bus ${bus}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '打开失败')
      setStatus('error')
    }
  }

  const handleClose = async () => {
    setError(null)
    try {
      await window.api.i2c.close()
      setStatus('idle')
      appendLog('i2c closed')
    } catch (err) {
      setError(err instanceof Error ? err.message : '关闭失败')
    }
  }

  const handleWrite = async () => {
    setError(null)
    try {
      await window.api.i2c.write(addr, hex)
      appendLog(`TX ${formatAddr(addr)}: ${hex}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '写入失败')
    }
  }

  const handleRead = async () => {
    setError(null)
    try {
      const data = await window.api.i2c.read(addr, readLen)
      appendLog(`RX ${formatAddr(addr)}: ${data}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取失败')
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>I2C 总线</h1>
        <p>Inter-Integrated Circuit - 两线制串行总线</p>
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
                <h3>两线制</h3>
                <p>仅需 SDA(数据线) 和 SCL(时钟线) 两根线，即可实现多设备通信</p>
              </div>
              <div className="feature-card">
                <h3>主从模式</h3>
                <p>一个主机可控制多个从机(最多127个)，通过设备地址区分不同设备</p>
              </div>
              <div className="feature-card">
                <h3>同步通信</h3>
                <p>主机提供时钟信号，从机按节拍传输数据，无需约定波特率</p>
              </div>
              <div className="feature-card">
                <h3>半双工</h3>
                <p>数据双向传输但不能同时进行，通过 SDA 线分时复用</p>
              </div>
            </div>

            <h2>总线拓扑</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
                    VCC
                     │
    ┌────────────────┼────────────────┐
    │                │                │
   ┌─┴─┐            ┌─┴─┐            ┌─┴─┐
   │   │            │   │            │   │
   │主机│            │从机│            │从机│
   │   │            │0x23│            │0x48│
   │   │            │   │            │   │
   └─┬─┘            └─┬─┘            └─┬─┘
     │                │                │
  ───┼────────────────┼────────────────┼─── SDA (数据线)
     │                │                │
  ───┼────────────────┼────────────────┼─── SCL (时钟线)
     │                │                │
    Rp              Rp                Rp  (上拉电阻)

    I2C 总线需要上拉电阻 (通常 4.7kΩ)，空闲时线路为高电平
              `}</pre>
            </div>

            <h2>通信时序</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    起始条件          数据传输              停止条件
    (S)                                      (P)

    SDA ─┐     ┌───┬───┬───┬───┬───┬───┬───┐     ───
         │     │D7 │D6 │D5 │D4 │D3 │D2 │D1 │D0 │ACK│
         │     │   │   │   │   │   │   │   │   │   │
    ─────┘     └───┴───┴───┴───┴───┴───┴───┘     ┌───

    SCL ─────┐   ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐
             │   │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
    ─────────┘───┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘

    起始: SCL 高时 SDA 下降沿
    停止: SCL 高时 SDA 上升沿
    数据: SCL 高时采样，SCL 低时变化
    ACK:  每字节后从机拉低 SDA 确认
              `}</pre>
            </div>

            <h2>地址格式</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>位</th>
                    <th>7</th>
                    <th>6</th>
                    <th>5</th>
                    <th>4</th>
                    <th>3</th>
                    <th>2</th>
                    <th>1</th>
                    <th>0</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>含义</td>
                    <td colSpan={4}>设备地址 (高4位)</td>
                    <td colSpan={3}>设备地址 (低3位)</td>
                    <td>R/W</td>
                  </tr>
                  <tr>
                    <td>示例</td>
                    <td>0</td>
                    <td>1</td>
                    <td>0</td>
                    <td>0</td>
                    <td>1</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="info-box">
              <strong>7位地址 vs 8位地址</strong>
              <p>I2C 使用 7 位地址(0x00-0x7F)，但传输时需附加读写位组成 8 位。地址 0x23 写操作发送 0x46，读操作发送 0x47。</p>
            </div>

            <h2>常见设备地址</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>地址</th>
                    <th>设备类型</th>
                    <th>典型器件</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>0x23</code></td>
                    <td>光照传感器</td>
                    <td>BH1750</td>
                  </tr>
                  <tr>
                    <td><code>0x48</code></td>
                    <td>温湿度传感器</td>
                    <td>AHT10/AHT20</td>
                  </tr>
                  <tr>
                    <td><code>0x68</code></td>
                    <td>实时时钟</td>
                    <td>DS3231</td>
                  </tr>
                  <tr>
                    <td><code>0x76</code></td>
                    <td>气压传感器</td>
                    <td>BMP280</td>
                  </tr>
                  <tr>
                    <td><code>0x3C</code></td>
                    <td>OLED 显示</td>
                    <td>SSD1306</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>传感器采集</strong> - 温湿度、光照、气压等环境传感器</li>
              <li><strong>OLED 显示</strong> - 小尺寸显示屏驱动</li>
              <li><strong>EEPROM 存储</strong> - 小容量数据存储</li>
              <li><strong>实时时钟</strong> - RTC 模块时间管理</li>
              <li><strong>IO 扩展</strong> - GPIO 扩展芯片如 PCF8574</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>I2C 设备操作</h2>

            {error && (
              <div className="info-box warning" style={{ marginBottom: '16px' }}>
                <strong>错误</strong>
                <p>{error}</p>
              </div>
            )}

            <div className="gpio-demo" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              <div className="config-grid">
                <div className="config-item">
                  <label>I2C Bus</label>
                  <input type="number" value={bus} min={0} max={10} onChange={(e) => setBus(Number(e.target.value))} />
                </div>
              </div>

              <div className="demo-controls" style={{ marginTop: '16px' }}>
                <button onClick={handleScan} disabled={status === 'scanning'}>
                  {status === 'scanning' ? '扫描中...' : '扫描设备'}
                </button>
                {status === 'connected' ? (
                  <button onClick={handleClose} style={{ background: '#f44336', color: '#fff' }}>关闭</button>
                ) : (
                  <button onClick={handleOpen} disabled={status === 'scanning'} style={{ background: '#4caf50', color: '#fff' }}>打开总线</button>
                )}
              </div>
            </div>

            {addresses.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3>发现的设备 ({addresses.length})</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {addresses.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAddr(a)}
                      style={{
                        padding: '8px 16px',
                        background: a === addr ? '#4fc3f7' : '#fff',
                        border: a === addr ? '2px solid #4fc3f7' : '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                      }}
                    >
                      {formatAddr(a)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>读写操作</h3>
              <div className="config-grid">
                <div className="config-item">
                  <label>目标地址</label>
                  <input type="number" value={addr} min={0} max={127} onChange={(e) => setAddr(Number(e.target.value))} disabled={status !== 'connected'} />
                </div>
                <div className="config-item">
                  <label>写入数据 (Hex)</label>
                  <input type="text" value={hex} onChange={(e) => setHex(e.target.value)} disabled={status !== 'connected'} />
                </div>
                <div className="config-item">
                  <label>读取长度</label>
                  <input type="number" value={readLen} min={1} max={256} onChange={(e) => setReadLen(Number(e.target.value))} disabled={status !== 'connected'} />
                </div>
              </div>
              <div className="demo-controls" style={{ marginTop: '16px' }}>
                <button onClick={handleWrite} disabled={status !== 'connected'}>写入</button>
                <button onClick={handleRead} disabled={status !== 'connected'} style={{ background: '#e0e0e0', color: '#333' }}>读取</button>
              </div>
            </div>

            <h2>操作日志</h2>
            <div className="code-block">
              <pre>{log || '暂无操作记录'}</pre>
            </div>

            <div className="info-box" style={{ marginTop: '16px' }}>
              <strong>状态</strong>
              <p>
                {status === 'idle' && '就绪'}
                {status === 'scanning' && '处理中...'}
                {status === 'connected' && `已打开 - Bus ${bus}`}
                {status === 'error' && '发生错误'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>C 语言示例 (wiringPi)</h2>
            <div className="code-block">
              <pre>{`// I2C 通信 - wiringPi 库
#include <wiringPiI2C.h>
#include <stdio.h>

#define BH1750_ADDR 0x23

int main(void) {
    int fd = wiringPiI2CSetup(BH1750_ADDR);
    if (fd < 0) {
        printf("I2C 初始化失败\\n");
        return 1;
    }

    // 发送测量命令
    wiringPiI2CWrite(fd, 0x10);  // 连续高分辨率模式

    // 读取数据
    delay(180);  // 等待测量完成
    int high = wiringPiI2CRead(fd);
    int low = wiringPiI2CRead(fd);

    float lux = (high << 8 | low) / 1.2;
    printf("光照强度: %.1f lux\\n", lux);

    return 0;
}

// 编译: gcc -o i2c_demo i2c_demo.c -lwiringPi`}</pre>
            </div>

            <h2>Python 示例 (smbus2)</h2>
            <div className="code-block">
              <pre>{`# I2C 通信 - smbus2 库
from smbus2 import SMBus, i2c_msg

# 打开 I2C 总线
bus = SMBus(1)  # 树莓派通常使用 bus 1

BH1750_ADDR = 0x23

# 写入单个字节
bus.write_byte(BH1750_ADDR, 0x10)  # 启动测量

# 读取多个字节
data = bus.read_i2c_block_data(BH1750_ADDR, 0x00, 2)
lux = (data[0] << 8 | data[1]) / 1.2
print(f"光照强度: {lux:.1f} lux")

# 使用 i2c_msg 进行更灵活的通信
write_msg = i2c_msg.write(BH1750_ADDR, [0x10])
read_msg = i2c_msg.read(BH1750_ADDR, 2)
bus.i2c_rdwr(write_msg, read_msg)

# 扫描设备
def scan_i2c(bus):
    devices = []
    for addr in range(0x03, 0x78):
        try:
            bus.write_quick(addr)
            devices.append(addr)
        except:
            pass
    return devices

print("发现设备:", [hex(a) for a in scan_i2c(bus)])
bus.close()`}</pre>
            </div>

            <h2>Go 语言示例 (periph)</h2>
            <div className="code-block">
              <pre>{`// I2C 通信 - periph 库
package main

import (
    "fmt"
    "log"
    "time"

    "periph.io/x/conn/v3/i2c"
    "periph.io/x/conn/v3/i2c/i2creg"
    "periph.io/x/host/v3"
)

func main() {
    // 初始化
    if _, err := host.Init(); err != nil {
        log.Fatal(err)
    }

    // 打开 I2C 总线
    bus, err := i2creg.Open("1")
    if err != nil {
        log.Fatal(err)
    }
    defer bus.Close()

    // BH1750 光照传感器
    dev := &i2c.Dev{Addr: 0x23, Bus: bus}

    // 发送测量命令
    if err := dev.Tx([]byte{0x10}, nil); err != nil {
        log.Fatal(err)
    }

    time.Sleep(180 * time.Millisecond)

    // 读取数据
    data := make([]byte, 2)
    if err := dev.Tx(nil, data); err != nil {
        log.Fatal(err)
    }

    lux := float64(uint16(data[0])<<8|uint16(data[1])) / 1.2
    fmt.Printf("光照强度: %.1f lux\\n", lux)
}`}</pre>
            </div>

            <h2>C++ 示例 (pigpio)</h2>
            <div className="code-block">
              <pre>{`// I2C 通信 - pigpio 库
#include <pigpio.h>
#include <iostream>
#include <unistd.h>

const int BH1750_ADDR = 0x23;

int main() {
    if (gpioInitialise() < 0) {
        std::cerr << "pigpio 初始化失败" << std::endl;
        return 1;
    }

    // 打开 I2C 设备
    int handle = i2cOpen(1, BH1750_ADDR, 0);
    if (handle < 0) {
        std::cerr << "I2C 打开失败" << std::endl;
        gpioTerminate();
        return 1;
    }

    // 写入命令
    i2cWriteByte(handle, 0x10);  // 连续高分辨率模式
    usleep(180000);  // 等待 180ms

    // 读取数据
    char data[2];
    i2cReadDevice(handle, data, 2);

    int lux_raw = (data[0] << 8) | data[1];
    float lux = lux_raw / 1.2;
    std::cout << "光照强度: " << lux << " lux" << std::endl;

    i2cClose(handle);
    gpioTerminate();
    return 0;
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

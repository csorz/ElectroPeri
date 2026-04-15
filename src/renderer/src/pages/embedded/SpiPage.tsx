import { useState } from 'react'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

export default function SpiPage() {
  return (
    <ElectronOnly>
      <SpiPageContent />
    </ElectronOnly>
  )
}

function SpiPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [bus, setBus] = useState(0)
  const [cs, setCs] = useState(0)
  const [speedHz, setSpeedHz] = useState(1_000_000)
  const [mode, setMode] = useState<0 | 1 | 2 | 3>(0)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [hexTx, setHexTx] = useState('AA 55 00 01')
  const [rxLength, setRxLength] = useState(4)
  const [log, setLog] = useState('')

  const appendLog = (line: string) => setLog((p) => p + line + '\n')

  const handleOpen = async () => {
    setStatus('scanning')
    setError(null)
    try {
      await window.api.spi.open(bus, cs)
      setStatus('connected')
      appendLog(`spi opened: bus=${bus}, cs=${cs}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '打开失败')
      setStatus('error')
    }
  }

  const handleClose = async () => {
    setError(null)
    try {
      await window.api.spi.close()
      setStatus('idle')
      appendLog('spi closed')
    } catch (err) {
      setError(err instanceof Error ? err.message : '关闭失败')
    }
  }

  const handleTransfer = async () => {
    setError(null)
    try {
      const rx = await window.api.spi.transfer(hexTx, rxLength, speedHz, mode)
      appendLog(`TX: ${hexTx}`)
      appendLog(`RX: ${rx}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '传输失败')
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>SPI 总线</h1>
        <p>Serial Peripheral Interface - 四线制串行外设接口</p>
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
                <h3>全双工通信</h3>
                <p>同时发送和接收数据，MOSI 和 MISO 线独立工作，效率高于 I2C</p>
              </div>
              <div className="feature-card">
                <h3>高速传输</h3>
                <p>时钟频率可达数 MHz 甚至数十 MHz，适合高速数据采集</p>
              </div>
              <div className="feature-card">
                <h3>主从模式</h3>
                <p>一个主机可控制多个从机，通过片选信号(SS/CS)选择目标设备</p>
              </div>
              <div className="feature-card">
                <h3>灵活时序</h3>
                <p>四种工作模式(CPOL/CPHA组合)，适配不同设备时序要求</p>
              </div>
            </div>

            <h2>信号线定义</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>信号</th>
                    <th>方向</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>SCLK</code></td>
                    <td>主机→从机</td>
                    <td>时钟信号，由主机产生</td>
                  </tr>
                  <tr>
                    <td><code>MOSI</code></td>
                    <td>主机→从机</td>
                    <td>主机输出从机输入数据线</td>
                  </tr>
                  <tr>
                    <td><code>MISO</code></td>
                    <td>从机→主机</td>
                    <td>主机输入从机输出数据线</td>
                  </tr>
                  <tr>
                    <td><code>CS/SS</code></td>
                    <td>主机→从机</td>
                    <td>片选信号，低电平有效</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>总线拓扑</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
                              ┌─────────┐
                              │  主机   │
                              │ (MCU)   │
                              └────┬────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
      SCLK─────────────────────SCLK─────────────────────SCLK
         │                         │                         │
      MOSI─────────────────────MOSI─────────────────────MOSI
         │                         │                         │
      MISO─────────────────────MISO─────────────────────MISO
         │                         │                         │
      ┌──┴──┐                   ┌──┴──┐                   ┌──┴──┐
      │从机1│                   │从机2│                   │从机3│
      └──┬──┘                   └──┬──┘                   └──┬──┘
         │                         │                         │
      CS1──┘                      CS2──┘                      CS3──┘

    每个从机需要独立的片选信号，同一时刻只能选中一个从机
              `}</pre>
            </div>

            <h2>时钟极性与相位</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    Mode 0 (CPOL=0, CPHA=0): 空闲低电平，第一个边沿采样
    Mode 1 (CPOL=0, CPHA=1): 空闲低电平，第二个边沿采样
    Mode 2 (CPOL=1, CPHA=0): 空闲高电平，第一个边沿采样
    Mode 3 (CPOL=1, CPHA=1): 空闲高电平，第二个边沿采样

              Mode 0                    Mode 1
    SCLK ───┐   ┌─┐ ┌─┐ ┌─┐        ───┐   ┌─┐ ┌─┐ ┌─┐
             │   │ │ │ │ │ │            │   │ │ │ │ │ │
         ────┘───┘ └─┘ └─┘ └────    ────┘───┘ └─┘ └─┘ └────
              ↑   ↑   ↑   ↑               ↑   ↑   ↑   ↑
            采样 采样 采样 采样           采样 采样 采样 采样

              Mode 2                    Mode 3
    SCLK ──────┐   ┌─┐ ┌─┐ ┌─┐ ┌────  ─────┐   ┌─┐ ┌─┐ ┌─┐ ┌──
               │   │ │ │ │ │ │            │   │ │ │ │ │ │
         ──────┘───┘ └─┘ └─┘ └────    ────┘───┘ └─┘ └─┘ └────
              `}</pre>
            </div>
            <div className="info-box">
              <strong>如何选择工作模式？</strong>
              <p>工作模式由从机设备决定，需查阅设备数据手册。常见设备：SD卡(Mode 0/3)、NRF24L01(Mode 0)、W25Q16(Mode 0/3)。</p>
            </div>

            <h2>传输过程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    1. 主机拉低 CS 选中从机
    2. 主机产生时钟信号
    3. 同时发送(MOSI)和接收(MISO)数据
    4. 传输完成后拉高 CS 释放从机

    CS   ─────┐                 ┌─────
              │                 │
         ─────┘─────────────────┘─────

    SCLK ────┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌───
             │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
         ────┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └───

    MOSI ════<D7><D6><D5><D4><D3><D2><D1><D0>══════

    MISO ══════════════════════════════════════════
              `}</pre>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>Flash 存储</strong> - SPI Flash 芯片如 W25Q16、W25Q128</li>
              <li><strong>显示驱动</strong> - TFT LCD、OLED 屏幕</li>
              <li><strong>无线模块</strong> - NRF24L01、LoRa 模块</li>
              <li><strong>ADC/DAC</strong> - 高速模数/数模转换器</li>
              <li><strong>SD 卡</strong> - SD 卡 SPI 模式读写</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>SPI 设备操作</h2>

            {error && (
              <div className="info-box warning" style={{ marginBottom: '16px' }}>
                <strong>错误</strong>
                <p>{error}</p>
              </div>
            )}

            <div className="gpio-demo" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              <div className="config-grid">
                <div className="config-item">
                  <label>Bus</label>
                  <input type="number" value={bus} min={0} max={10} onChange={(e) => setBus(Number(e.target.value))} disabled={status === 'connected'} />
                </div>
                <div className="config-item">
                  <label>CS (片选)</label>
                  <input type="number" value={cs} min={0} max={10} onChange={(e) => setCs(Number(e.target.value))} disabled={status === 'connected'} />
                </div>
                <div className="config-item">
                  <label>时钟频率 (Hz)</label>
                  <input type="number" value={speedHz} min={1} onChange={(e) => setSpeedHz(Number(e.target.value))} disabled={status !== 'connected'} />
                </div>
                <div className="config-item">
                  <label>工作模式</label>
                  <select value={mode} onChange={(e) => setMode(Number(e.target.value) as 0 | 1 | 2 | 3)} disabled={status !== 'connected'}>
                    <option value={0}>Mode 0 (CPOL=0, CPHA=0)</option>
                    <option value={1}>Mode 1 (CPOL=0, CPHA=1)</option>
                    <option value={2}>Mode 2 (CPOL=1, CPHA=0)</option>
                    <option value={3}>Mode 3 (CPOL=1, CPHA=1)</option>
                  </select>
                </div>
              </div>

              <div className="demo-controls" style={{ marginTop: '16px' }}>
                {status === 'connected' ? (
                  <button onClick={handleClose} style={{ background: '#f44336', color: '#fff' }}>关闭</button>
                ) : (
                  <button onClick={handleOpen} disabled={status === 'scanning'} style={{ background: '#4caf50', color: '#fff' }}>打开</button>
                )}
              </div>
            </div>

            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>数据传输</h3>
              <div className="config-grid">
                <div className="config-item">
                  <label>发送数据 (Hex)</label>
                  <input type="text" value={hexTx} onChange={(e) => setHexTx(e.target.value)} disabled={status !== 'connected'} />
                </div>
                <div className="config-item">
                  <label>接收长度</label>
                  <input type="number" value={rxLength} min={0} max={4096} onChange={(e) => setRxLength(Number(e.target.value))} disabled={status !== 'connected'} />
                </div>
              </div>
              <div className="demo-controls" style={{ marginTop: '16px' }}>
                <button onClick={handleTransfer} disabled={status !== 'connected'}>传输 (Transfer)</button>
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
                {status === 'connected' && `已打开 - Bus ${bus}, CS ${cs}, ${speedHz} Hz, Mode ${mode}`}
                {status === 'error' && '发生错误'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>C 语言示例 (wiringPi)</h2>
            <div className="code-block">
              <pre>{`// SPI 通信 - wiringPi 库
#include <wiringPiSPI.h>
#include <stdio.h>
#include <string.h>

#define SPI_CHANNEL 0
#define SPI_SPEED   1000000  // 1 MHz

int main(void) {
    int fd = wiringPiSPISetup(SPI_CHANNEL, SPI_SPEED);
    if (fd < 0) {
        printf("SPI 初始化失败\\n");
        return 1;
    }

    // 发送并接收数据
    unsigned char data[4] = {0xAA, 0x55, 0x00, 0x01};

    // SPI 是全双工，发送的同时接收
    wiringPiSPIDataRW(SPI_CHANNEL, data, 4);

    printf("接收数据: ");
    for (int i = 0; i < 4; i++) {
        printf("0x%02X ", data[i]);
    }
    printf("\\n");

    return 0;
}

// 编译: gcc -o spi_demo spi_demo.c -lwiringPi`}</pre>
            </div>

            <h2>Python 示例 (spidev)</h2>
            <div className="code-block">
              <pre>{`# SPI 通信 - spidev 库
import spidev

# 创建 SPI 实例
spi = spidev.SpiDev()
spi.open(0, 0)  # bus 0, device 0 (CE0)

# 配置 SPI
spi.max_speed_hz = 1000000  # 1 MHz
spi.mode = 0                # Mode 0

# 发送并接收数据 (全双工)
tx_data = [0xAA, 0x55, 0x00, 0x01]
rx_data = spi.xfer2(tx_data)

print(f"发送: {[hex(x) for x in tx_data]}")
print(f"接收: {[hex(x) for x in rx_data]}")

# 写入数据 (不关心接收)
spi.writebytes([0x06])  # 写使能命令

# 读取数据
rx = spi.readbytes(4)

# 设置位顺序
spi.lsbfirst = False  # MSB first (默认)

# 设置每个字的位数
spi.bits_per_word = 8

spi.close()`}</pre>
            </div>

            <h2>Go 语言示例 (periph)</h2>
            <div className="code-block">
              <pre>{`// SPI 通信 - periph 库
package main

import (
    "fmt"
    "log"

    "periph.io/x/conn/v3/spi"
    "periph.io/x/conn/v3/spi/spireg"
    "periph.io/x/host/v3"
)

func main() {
    // 初始化
    if _, err := host.Init(); err != nil {
        log.Fatal(err)
    }

    // 打开 SPI 设备
    dev, err := spireg.Open("SPI0.0")  // CE0
    if err != nil {
        log.Fatal(err)
    }
    defer dev.Close()

    // 配置 SPI
    conn, err := dev.Connect(1000000, spi.Mode0, 8)
    if err != nil {
        log.Fatal(err)
    }

    // 传输数据
    tx := []byte{0xAA, 0x55, 0x00, 0x01}
    rx := make([]byte, len(tx))

    if err := conn.Tx(tx, rx); err != nil {
        log.Fatal(err)
    }

    fmt.Printf("发送: % X\\n", tx)
    fmt.Printf("接收: % X\\n", rx)
}`}</pre>
            </div>

            <h2>C++ 示例 (pigpio)</h2>
            <div className="code-block">
              <pre>{`// SPI 通信 - pigpio 库
#include <pigpio.h>
#include <iostream>
#include <vector>

int main() {
    if (gpioInitialise() < 0) {
        std::cerr << "pigpio 初始化失败" << std::endl;
        return 1;
    }

    // 打开 SPI 设备
    int handle = spiOpen(0, 1000000, 0);  // channel 0, 1MHz, mode 0
    if (handle < 0) {
        std::cerr << "SPI 打开失败" << std::endl;
        gpioTerminate();
        return 1;
    }

    // 发送数据
    char tx_data[] = {0xAA, 0x55, 0x00, 0x01};
    char rx_data[4];

    spiXfer(handle, tx_data, rx_data, 4);

    std::cout << "接收: ";
    for (int i = 0; i < 4; i++) {
        printf("0x%02X ", (unsigned char)rx_data[i]);
    }
    std::cout << std::endl;

    spiClose(handle);
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

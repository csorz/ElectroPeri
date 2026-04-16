import { useState } from 'react'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

export default function OnewirePage() {
  return (
    <ElectronOnly
      featureName="1-Wire 通信"
      supportedDevices="树莓派、Arduino 等支持 1-Wire 协议的设备，常用于 DS18B20 温度传感器"
    >
      <OnewirePageContent />
    </ElectronOnly>
  )
}

function OnewirePageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [sensors, setSensors] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [log, setLog] = useState('')

  const appendLog = (line: string) => setLog((p) => p + line + '\n')

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const list = await window.api.onewire.list()
      setSensors(list as string[])
      setStatus('idle')
      appendLog(`sensors: ${(list as string[]).join(', ')}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '扫描失败')
      setStatus('error')
    }
  }

  const handleRead = async () => {
    if (!selected) return
    setError(null)
    try {
      const c = await window.api.onewire.read(selected)
      appendLog(`${selected}: ${c} C`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取失败')
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>1-Wire 总线</h1>
        <p>单线制串行通信协议 - Dallas/Maxim 专有</p>
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
                <h3>单线通信</h3>
                <p>仅需一根数据线(DQ)和地线(GND)，数据线和电源可复用(寄生供电)</p>
              </div>
              <div className="feature-card">
                <h3>唯一ID</h3>
                <p>每个设备出厂时烧录全球唯一的 64 位 ROM ID，支持多设备挂载</p>
              </div>
              <div className="feature-card">
                <h3>主从架构</h3>
                <p>主机发起所有通信，从机被动响应，严格的时序控制</p>
              </div>
              <div className="feature-card">
                <h3>CRC校验</h3>
                <p>数据传输包含 CRC 校验，保证数据完整性</p>
              </div>
            </div>

            <h2>总线拓扑</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
                    主机 (MCU)
                      │
                      │ DQ (数据线)
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
   ┌─┴─┐             ┌─┴─┐             ┌─┴─┐
   │   │             │   │             │   │
   │DS │             │DS │             │DS │
   │18B│             │18B│             │18B│
   │20 │             │20 │             │20 │
   │   │             │   │             │   │
   └─┬─┘             └─┬─┘             └─┬─┘
     │                 │                 │
    GND──────────────GND──────────────GND

    所有设备共享数据线，通过 ROM ID 区分
              `}</pre>
            </div>

            <h2>ROM ID 结构</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>字节</th>
                    <th>0</th>
                    <th>1-6</th>
                    <th>7</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>含义</td>
                    <td>家族代码</td>
                    <td>序列号</td>
                    <td>CRC 校验</td>
                  </tr>
                  <tr>
                    <td>示例</td>
                    <td><code>0x28</code></td>
                    <td><code>FF 56 3B 04 00 00</code></td>
                    <td><code>0x4E</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="info-box">
              <strong>家族代码识别</strong>
              <p>家族代码用于识别设备类型：0x10=DS18S20、0x28=DS18B20、0x22=DS1822、0x26=DS26S323。同一总线上可挂载不同类型设备。</p>
            </div>

            <h2>通信时序</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    复位脉冲 (Reset Pulse)
    主机拉低总线 480-960μs，从机响应存在脉冲

    DQ ───────┐                       ┌──────────
              │         存在脉冲      │
              │  ┌───────────┐       │
              │  │           │       │
         ─────┘  └───────────┘───────┘─────────
              ←─ 480-960μs ─→← 60-240μs →


    写时隙 (Write Time Slot)
    写 1: 拉低 1-15μs 后释放
    写 0: 拉低 60-120μs 后释放

    写1:  ──┐   ┌────────────────────────────
              │
         ─────┘

    写0:  ──┐                               ┌──
              │                             │
         ─────┘─────────────────────────────┘


    读时隙 (Read Time Slot)
    主机拉低 1-15μs，从机在 15μs 内拉低表示 0

    读1:  ──┐   ┌────────────────────────────
              │
         ─────┘

    读0:  ──┐   ┌───────────┐
              │             │
         ─────┘             └────────────────
              `}</pre>
            </div>

            <h2>DS18B20 温度传感器</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>测量范围</h3>
                <p>-55°C ~ +125°C，分辨率可编程设置 9-12 位</p>
              </div>
              <div className="feature-card">
                <h3>精度</h3>
                <p>±0.5°C (典型值)，温度以 16 位二进制补码输出</p>
              </div>
              <div className="feature-card">
                <h3>转换时间</h3>
                <p>12 位分辨率约 750ms，可通过配置降低分辨率加速</p>
              </div>
              <div className="feature-card">
                <h3>供电方式</h3>
                <p>外部供电(3-5.5V)或寄生供电(从数据线取电)</p>
              </div>
            </div>

            <h2>温度数据格式</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>温度</th>
                    <th>二进制输出</th>
                    <th>十六进制</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>+125°C</td>
                    <td>0000 0111 1101 0000</td>
                    <td><code>0x07D0</code></td>
                  </tr>
                  <tr>
                    <td>+25.0625°C</td>
                    <td>0000 0001 1001 0001</td>
                    <td><code>0x0191</code></td>
                  </tr>
                  <tr>
                    <td>0°C</td>
                    <td>0000 0000 0000 0000</td>
                    <td><code>0x0000</code></td>
                  </tr>
                  <tr>
                    <td>-10.125°C</td>
                    <td>1111 1111 0101 1110</td>
                    <td><code>0xFF5E</code></td>
                  </tr>
                  <tr>
                    <td>-55°C</td>
                    <td>1111 1100 1001 0000</td>
                    <td><code>0xFC90</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="info-box">
              <strong>温度计算</strong>
              <p>温度 = 原始值 / 16。负温度使用二进制补码表示，如 0xFF5E = -26，-26/16 = -1.625°C... 实际应为 -10.125°C。</p>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>环境监测</strong> - 室内/室外温度测量，多点温度监控</li>
              <li><strong>设备测温</strong> - CPU、GPU、电机等设备温度监测</li>
              <li><strong>冷链物流</strong> - 运输过程温度记录，超限报警</li>
              <li><strong>智能家居</strong> - 智能温控、暖通空调系统</li>
              <li><strong>工业控制</strong> - 工厂环境温度监控，设备保护</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>1-Wire 设备操作</h2>

            {error && (
              <div className="info-box warning" style={{ marginBottom: '16px' }}>
                <strong>错误</strong>
                <p>{error}</p>
              </div>
            )}

            <div className="gpio-demo" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              <div className="demo-controls">
                <button onClick={handleScan} disabled={status === 'scanning'}>
                  {status === 'scanning' ? '扫描中...' : '扫描传感器'}
                </button>
              </div>
            </div>

            {sensors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3>发现的传感器 ({sensors.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {sensors.map((id) => (
                    <button
                      key={id}
                      onClick={() => setSelected(id)}
                      style={{
                        padding: '12px 16px',
                        background: id === selected ? '#4fc3f7' : '#fff',
                        border: id === selected ? '2px solid #4fc3f7' : '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        textAlign: 'left'
                      }}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selected && (
              <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0' }}>读取温度</h3>
                <div className="info-box" style={{ marginBottom: '16px' }}>
                  <strong>当前选择</strong>
                  <p style={{ fontFamily: 'monospace' }}>{selected}</p>
                </div>
                <div className="demo-controls">
                  <button onClick={handleRead}>读取温度</button>
                </div>
              </div>
            )}

            <h2>操作日志</h2>
            <div className="code-block">
              <pre>{log || '暂无操作记录'}</pre>
            </div>

            <div className="info-box" style={{ marginTop: '16px' }}>
              <strong>状态</strong>
              <p>
                {status === 'idle' && '就绪'}
                {status === 'scanning' && '处理中...'}
                {status === 'connected' && '已连接'}
                {status === 'error' && '发生错误'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>C 语言示例 (wiringPi)</h2>
            <div className="code-block">
              <pre>{`// DS18B20 温度读取 - wiringPi 库
#include <wiringPi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <fcntl.h>
#include <unistd.h>

#define W1_PATH "/sys/bus/w1/devices/"

float read_temp(const char *device_id) {
    char path[256];
    sprintf(path, "%s%s/w1_slave", W1_PATH, device_id);

    int fd = open(path, O_RDONLY);
    if (fd < 0) return -1000;

    char buf[256];
    read(fd, buf, sizeof(buf));
    close(fd);

    // 检查 CRC
    if (strstr(buf, "YES") == NULL) return -1000;

    // 解析温度
    char *temp_pos = strstr(buf, "t=");
    if (temp_pos == NULL) return -1000;

    int temp_raw = atoi(temp_pos + 2);
    return temp_raw / 1000.0;
}

int main(void) {
    DIR *dir = opendir(W1_PATH);
    struct dirent *entry;

    while ((entry = readdir(dir)) != NULL) {
        if (entry->d_type == DT_DIR &&
            strncmp(entry->d_name, "28-", 3) == 0) {
            float temp = read_temp(entry->d_name);
            printf("%s: %.2f°C\\n", entry->d_name, temp);
        }
    }

    closedir(dir);
    return 0;
}`}</pre>
            </div>

            <h2>Python 示例 (w1thermsensor)</h2>
            <div className="code-block">
              <pre>{`# DS18B20 温度读取 - w1thermsensor 库
from w1thermsensor import W1ThermSensor

# 获取所有传感器
sensors = W1ThermSensor.get_available_sensors()
print(f"发现 {len(sensors)} 个传感器")

for sensor in sensors:
    print(f"ID: {sensor.id}")
    print(f"类型: {sensor.type_name}")
    print(f"温度: {sensor.get_temperature():.2f}°C")

# 单个传感器
sensor = W1ThermSensor(W1ThermSensor.THERM_SENSOR_DS18B20, "00000588806a")
temp = sensor.get_temperature()
print(f"温度: {temp:.2f}°C")

# 设置分辨率 (9-12位)
sensor.set_resolution(12)

# 连续读取
import time
while True:
    temp = sensor.get_temperature()
    print(f"温度: {temp:.2f}°C")
    time.sleep(1)`}</pre>
            </div>

            <h2>Python 示例 (直接读取 sysfs)</h2>
            <div className="code-block">
              <pre>{`# DS18B20 温度读取 - 直接读取 sysfs
import os
import glob

W1_BASE_DIR = '/sys/bus/w1/devices/'

def find_sensors():
    """查找所有 DS18B20 传感器"""
    devices = glob.glob(W1_BASE_DIR + '28-*')
    return [os.path.basename(d) for d in devices]

def read_temp(device_id):
    """读取温度"""
    path = f"{W1_BASE_DIR}{device_id}/w1_slave"

    with open(path, 'r') as f:
        lines = f.readlines()

    # 检查 CRC
    if 'YES' not in lines[0]:
        return None

    # 解析温度
    temp_pos = lines[1].find('t=')
    if temp_pos == -1:
        return None

    temp_raw = int(lines[1][temp_pos + 2:])
    return temp_raw / 1000.0

# 使用示例
sensors = find_sensors()
print(f"发现传感器: {sensors}")

for sensor_id in sensors:
    temp = read_temp(sensor_id)
    print(f"{sensor_id}: {temp:.2f}°C" if temp else "读取失败")`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`// DS18B20 温度读取 - Go
package main

import (
    "fmt"
    "io/ioutil"
    "os"
    "path/filepath"
    "strconv"
    "strings"
)

const w1Path = "/sys/bus/w1/devices/"

func findSensors() ([]string, error) {
    var sensors []string

    entries, err := ioutil.ReadDir(w1Path)
    if err != nil {
        return nil, err
    }

    for _, entry := range entries {
        if strings.HasPrefix(entry.Name(), "28-") {
            sensors = append(sensors, entry.Name())
        }
    }

    return sensors, nil
}

func readTemp(deviceID string) (float64, error) {
    path := filepath.Join(w1Path, deviceID, "w1_slave")

    data, err := ioutil.ReadFile(path)
    if err != nil {
        return 0, err
    }

    lines := strings.Split(string(data), "\\n")
    if !strings.Contains(lines[0], "YES") {
        return 0, fmt.Errorf("CRC error")
    }

    tempPos := strings.Index(lines[1], "t=")
    if tempPos == -1 {
        return 0, fmt.Errorf("invalid format")
    }

    tempRaw, _ := strconv.Atoi(lines[1][tempPos+2:])
    return float64(tempRaw) / 1000, nil
}

func main() {
    sensors, _ := findSensors()
    fmt.Printf("发现 %d 个传感器\\n", len(sensors))

    for _, id := range sensors {
        temp, err := readTemp(id)
        if err != nil {
            fmt.Printf("%s: 错误 %v\\n", id, err)
        } else {
            fmt.Printf("%s: %.2f°C\\n", id, temp)
        }
    }
}`}</pre>
            </div>

            <h2>C++ 示例 (pigpio)</h2>
            <div className="code-block">
              <pre>{`// DS18B20 温度读取 - pigpio 库 (bit-banging)
#include <pigpio.h>
#include <iostream>
#include <vector>
#include <cstring>

const int ONE_WIRE_PIN = 4;  // GPIO 4

// 微秒延时
void udelay(int us) {
    gpioDelay(us);
}

// 复位脉冲
int resetPulse() {
    gpioSetMode(ONE_WIRE_PIN, PI_OUTPUT);
    gpioWrite(ONE_WIRE_PIN, 0);
    udelay(480);

    gpioSetMode(ONE_WIRE_PIN, PI_INPUT);
    udelay(70);

    int presence = gpioRead(ONE_WIRE_PIN);
    udelay(410);

    return presence;  // 0 = 存在
}

// 写一个字节
void writeByte(uint8_t byte) {
    for (int i = 0; i < 8; i++) {
        int bit = (byte >> i) & 1;

        gpioSetMode(ONE_WIRE_PIN, PI_OUTPUT);
        gpioWrite(ONE_WIRE_PIN, 0);

        if (bit) {
            udelay(6);
            gpioSetMode(ONE_WIRE_PIN, PI_INPUT);
            udelay(64);
        } else {
            udelay(60);
            gpioSetMode(ONE_WIRE_PIN, PI_INPUT);
            udelay(10);
        }
    }
}

// 读一个字节
uint8_t readByte() {
    uint8_t byte = 0;

    for (int i = 0; i < 8; i++) {
        gpioSetMode(ONE_WIRE_PIN, PI_OUTPUT);
        gpioWrite(ONE_WIRE_PIN, 0);
        udelay(6);

        gpioSetMode(ONE_WIRE_PIN, PI_INPUT);
        udelay(9);

        int bit = gpioRead(ONE_WIRE_PIN);
        byte |= (bit << i);

        udelay(55);
    }

    return byte;
}

int main() {
    if (gpioInitialise() < 0) return 1;

    // 复位
    if (resetPulse() != 0) {
        std::cerr << "未检测到设备" << std::endl;
        gpioTerminate();
        return 1;
    }

    // 跳过 ROM
    writeByte(0xCC);

    // 启动温度转换
    writeByte(0x44);
    udelay(750000);  // 等待 750ms

    // 读取温度
    resetPulse();
    writeByte(0xCC);
    writeByte(0xBE);

    uint8_t temp_l = readByte();
    uint8_t temp_h = readByte();

    float temp = ((temp_h << 8) | temp_l) / 16.0;
    std::cout << "温度: " << temp << "°C" << std::endl;

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

import { useEffect, useState } from 'react'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

export default function GpioPage() {
  return (
    <ElectronOnly
      featureName="GPIO 控制"
      supportedDevices="树莓派 (Raspberry Pi)、BeagleBone、Orange Pi 等嵌入式开发板"
    >
      <GpioPageContent />
    </ElectronOnly>
  )
}

function GpioPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [pin, setPin] = useState(17)
  const [direction, setDirection] = useState<'in' | 'out'>('out')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<number>(0)
  const [watchEdge, setWatchEdge] = useState<'none' | 'rising' | 'falling' | 'both'>('none')
  const [log, setLog] = useState('')

  const appendLog = (line: string) => setLog((p) => p + line + '\n')

  useEffect(() => {
    window.api.gpio.onData((v) => {
      setValue(v)
      appendLog(`GPIO event: ${v}`)
    })
    window.api.gpio.onError((e) => setError(e))
    window.api.gpio.onClosed(() => {
      appendLog('GPIO closed')
      setStatus('idle')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOpen = async () => {
    setStatus('scanning')
    setError(null)
    try {
      await window.api.gpio.open(pin, direction)
      setStatus('connected')
      appendLog(`GPIO opened: pin=${pin}, dir=${direction}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '打开失败')
      setStatus('error')
    }
  }

  const handleClose = async () => {
    setError(null)
    try {
      await window.api.gpio.close()
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : '关闭失败')
    }
  }

  const handleRead = async () => {
    setError(null)
    try {
      const v = await window.api.gpio.read()
      setValue(v)
      appendLog(`GPIO read: ${v}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取失败')
    }
  }

  const handleWrite = async (v: 0 | 1) => {
    setError(null)
    try {
      await window.api.gpio.write(v)
      setValue(v)
      appendLog(`GPIO write: ${v}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '写入失败')
    }
  }

  const handleWatch = async (edge: typeof watchEdge) => {
    setError(null)
    try {
      await window.api.gpio.watch(edge)
      setWatchEdge(edge)
      appendLog(`GPIO watch: ${edge}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '设置监听失败')
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>GPIO 控制</h1>
        <p>General Purpose Input/Output - 通用输入输出接口</p>
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
                <h3>通用引脚</h3>
                <p>GPIO 是微控制器与外部世界交互的基础接口，每个引脚可独立配置为输入或输出模式</p>
              </div>
              <div className="feature-card">
                <h3>输入模式</h3>
                <p>读取外部信号状态，支持上拉/下拉电阻配置，可检测高电平或低电平</p>
              </div>
              <div className="feature-card">
                <h3>输出模式</h3>
                <p>控制外部设备，可输出高电平(3.3V)或低电平(0V)，驱动LED、继电器等</p>
              </div>
              <div className="feature-card">
                <h3>中断触发</h3>
                <p>支持边沿触发中断，可监测上升沿、下降沿或双边沿变化，实现事件驱动</p>
              </div>
            </div>

            <h2>树莓派引脚布局</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    3.3V  (1)  (2)  5V     GPIO2  (3)  (4)  5V     GPIO3  (5)  (6)  GND
    GPIO4 (7)  (8)  GPIO14 GND    (9)  (10) GPIO15 GPIO17(11) (12) GPIO18
    GPIO27(13) (14) GND    GPIO22(15) (16) GPIO23 3.3V   (17) (18) GPIO24
    GPIO10(19) (20) GND    GPIO9 (21) (22) GPIO25  GPIO11(23) (24) GPIO8
    GND   (25) (26) GPIO7  GPIO0 (27) (28) GPIO1   GPIO5 (29) (30) GND
    GPIO6 (31) (32) GPIO12 GND   (33) (34) GPIO13 GPIO19(35) (36) GPIO16
    GPIO26(37) (38) GPIO20 GND   (39) (40) GPIO21
              `}</pre>
            </div>
            <div className="info-box">
              <strong>BCM 编号 vs 物理编号</strong>
              <p>BCM 编号是 Broadcom 芯片原生命号，物理编号是板载引脚位置。推荐使用 BCM 编号，更符合软件编程习惯。</p>
            </div>

            <h2>工作模式</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>模式</th>
                    <th>说明</th>
                    <th>典型应用</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>IN</code></td>
                    <td>输入模式，读取外部信号</td>
                    <td>按键检测、传感器信号</td>
                  </tr>
                  <tr>
                    <td><code>OUT</code></td>
                    <td>输出模式，驱动外部设备</td>
                    <td>LED控制、继电器开关</td>
                  </tr>
                  <tr>
                    <td><code>ALT</code></td>
                    <td>复用功能模式</td>
                    <td>I2C、SPI、UART 等外设</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>边沿触发类型</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>上升沿 (Rising)</h3>
                <p>信号从低电平变为高电平的瞬间触发，常用于按键按下检测</p>
              </div>
              <div className="feature-card">
                <h3>下降沿 (Falling)</h3>
                <p>信号从高电平变为低电平的瞬间触发，常用于按键释放检测</p>
              </div>
              <div className="feature-card">
                <h3>双边沿 (Both)</h3>
                <p>上升沿和下降沿都触发，可完整监测信号变化过程</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>LED 控制</strong> - 通过输出高低电平控制 LED 亮灭</li>
              <li><strong>按键检测</strong> - 读取按键状态，配合边沿触发实现中断响应</li>
              <li><strong>继电器控制</strong> - 驱动继电器控制高功率设备</li>
              <li><strong>传感器接口</strong> - 读取数字传感器输出信号</li>
              <li><strong>PWM 输出</strong> - 软件模拟或硬件 PWM 产生脉冲信号</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>GPIO 设备操作</h2>

            {error && (
              <div className="info-box warning" style={{ marginBottom: '16px' }}>
                <strong>错误</strong>
                <p>{error}</p>
              </div>
            )}

            <div className="gpio-demo" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              <div className="config-grid">
                <div className="config-item">
                  <label>Pin 号 (BCM)</label>
                  <input type="number" min={0} max={40} value={pin} onChange={(e) => setPin(Number(e.target.value))} disabled={status === 'connected'} />
                </div>
                <div className="config-item">
                  <label>方向</label>
                  <select value={direction} onChange={(e) => setDirection(e.target.value as 'in' | 'out')} disabled={status === 'connected'}>
                    <option value="in">输入 (IN)</option>
                    <option value="out">输出 (OUT)</option>
                  </select>
                </div>
              </div>

              <div className="demo-controls" style={{ marginTop: '16px' }}>
                {status === 'connected' ? (
                  <button onClick={handleClose} style={{ background: '#f44336', color: '#fff' }}>关闭</button>
                ) : (
                  <button onClick={handleOpen} disabled={status === 'scanning'}>打开</button>
                )}
                <button onClick={handleRead} disabled={status !== 'connected'} style={{ background: '#e0e0e0', color: '#333' }}>读取</button>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: '#fff', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>输出控制</h4>
                <div className="demo-controls">
                  <button onClick={() => handleWrite(1)} disabled={status !== 'connected' || direction !== 'out'}>写高电平 (1)</button>
                  <button onClick={() => handleWrite(0)} disabled={status !== 'connected' || direction !== 'out'} style={{ background: '#e0e0e0', color: '#333' }}>写低电平 (0)</button>
                </div>
                <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                  当前值: <strong style={{ color: value ? '#4caf50' : '#f44336' }}>{value}</strong>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: '#fff', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>边沿监听</h4>
                <div className="config-item">
                  <label>触发方式 (仅输入模式)</label>
                  <select value={watchEdge} onChange={(e) => handleWatch(e.target.value as typeof watchEdge)} disabled={status !== 'connected' || direction !== 'in'}>
                    <option value="none">无</option>
                    <option value="rising">上升沿</option>
                    <option value="falling">下降沿</option>
                    <option value="both">双边沿</option>
                  </select>
                </div>
              </div>
            </div>

            <h2>操作日志</h2>
            <div className="code-block">
              <pre>{log || '暂无操作记录'}</pre>
            </div>

            <div className="info-box" style={{ marginTop: '16px' }}>
              <strong>状态</strong>
              <p>
                {status === 'idle' && '未连接'}
                {status === 'scanning' && '处理中...'}
                {status === 'connected' && `已打开 - Pin ${pin} (${direction})`}
                {status === 'error' && '发生错误'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>C 语言示例 (wiringPi)</h2>
            <div className="code-block">
              <pre>{`// GPIO 控制 - wiringPi 库
#include <wiringPi.h>
#include <stdio.h>

#define LED_PIN 17  // BCM 编号

int main(void) {
    if (wiringPiSetupGpio() < 0) {
        printf("wiringPi 初始化失败\\n");
        return 1;
    }

    pinMode(LED_PIN, OUTPUT);  // 设置为输出模式

    while (1) {
        digitalWrite(LED_PIN, HIGH);  // 输出高电平
        delay(1000);                  // 延时 1 秒
        digitalWrite(LED_PIN, LOW);   // 输出低电平
        delay(1000);
    }

    return 0;
}

// 编译: gcc -o gpio_demo gpio_demo.c -lwiringPi`}</pre>
            </div>

            <h2>Python 示例 (RPi.GPIO)</h2>
            <div className="code-block">
              <pre>{`# GPIO 控制 - RPi.GPIO 库
import RPi.GPIO as GPIO
import time

LED_PIN = 17  # BCM 编号

# 设置引脚编号模式
GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)

# LED 闪烁
try:
    while True:
        GPIO.output(LED_PIN, GPIO.HIGH)
        time.sleep(1)
        GPIO.output(LED_PIN, GPIO.LOW)
        time.sleep(1)
finally:
    GPIO.cleanup()  # 清理资源

# 边沿检测示例
BUTTON_PIN = 18
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# 等待下降沿（按键按下）
GPIO.wait_for_edge(BUTTON_PIN, GPIO.FALLING)
print("按键按下！")

# 或者使用事件检测
GPIO.add_event_detect(BUTTON_PIN, GPIO.FALLING,
                      callback=lambda x: print("按键按下！"),
                      bouncetime=200)`}</pre>
            </div>

            <h2>Python 示例 (gpiozero)</h2>
            <div className="code-block">
              <pre>{`# GPIO 控制 - gpiozero 库（更高级的 API）
from gpiozero import LED, Button
from signal import pause

# LED 控制
led = LED(17)
led.on()      # 点亮
led.off()     # 熄灭
led.blink()   # 闪烁

# 按键检测
button = Button(18)
button.when_pressed = led.on
button.when_released = led.off

pause()  # 保持程序运行`}</pre>
            </div>

            <h2>Go 语言示例 (go-rpio)</h2>
            <div className="code-block">
              <pre>{`// GPIO 控制 - go-rpio 库
package main

import (
    "fmt"
    "time"
    "github.com/stianeikeland/go-rpio/v4"
)

func main() {
    if err := rpio.Open(); err != nil {
        fmt.Println("rpio 初始化失败:", err)
        return
    }
    defer rpio.Close()

    pin := rpio.Pin(17)  // BCM 编号
    pin.Output()         // 设置为输出模式

    for {
        pin.High()       // 输出高电平
        time.Sleep(time.Second)
        pin.Low()        // 输出低电平
        time.Sleep(time.Second)
    }
}

// 输入模式示例
func readInput() {
    inputPin := rpio.Pin(18)
    inputPin.Input()
    inputPin.PullUp()  // 上拉电阻

    if inputPin.Read() == rpio.Low {
        fmt.Println("按键按下")
    }
}`}</pre>
            </div>

            <h2>C++ 示例 (pigpio)</h2>
            <div className="code-block">
              <pre>{`// GPIO 控制 - pigpio 库
#include <pigpio.h>
#include <iostream>
#include <unistd.h>

const int LED_PIN = 17;

void buttonCallback(int gpio, int level, uint32_t tick) {
    std::cout << "GPIO " << gpio << " 变化: " << level << std::endl;
}

int main() {
    if (gpioInitialise() < 0) {
        std::cerr << "pigpio 初始化失败" << std::endl;
        return 1;
    }

    // 设置输出
    gpioSetMode(LED_PIN, PI_OUTPUT);

    // LED 闪烁
    while (true) {
        gpioWrite(LED_PIN, 1);
        sleep(1);
        gpioWrite(LED_PIN, 0);
        sleep(1);
    }

    // 设置中断回调
    gpioSetISRFunc(18, EITHER_EDGE, buttonCallback);

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

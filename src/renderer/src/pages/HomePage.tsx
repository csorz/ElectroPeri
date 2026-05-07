import { Link } from 'react-router-dom'
import './HomePage.css'

const groups = [
  {
    title: 'P1 工业核心接口',
    items: [
      { to: '/serial', label: '串口采集', desc: 'SerialPort 扫描、连接、收发' },
      { to: '/web-serial', label: 'Web 串口', desc: '基于 Web Serial API 的串口通信' },
      { to: '/usb', label: 'USB 采集', desc: 'USB 设备枚举与端点通信' },
      { to: '/web-usb', label: 'WebUSB', desc: '基于 WebUSB API 的 USB 通信' },
      { to: '/hid', label: 'HID 采集', desc: 'HID 设备扫描、连接、收发' },
      { to: '/web-hid', label: 'WebHID', desc: '基于 WebHID API 的 HID 通信' },
      { to: '/bluetooth', label: '蓝牙采集', desc: 'BLE 扫描、连接与简单通信' },
      { to: '/web-bluetooth', label: 'Web Bluetooth', desc: '基于 Web Bluetooth API 的 BLE 通信' },
      { to: '/network', label: '网络采集', desc: '网卡扫描、TCP 通信与回环测试' }
    ]
  },
  {
    title: 'P2 系统与终端能力',
    items: [
      { to: '/system', label: '系统信息', desc: 'CPU、内存、OS、负载' },
      { to: '/storage', label: '存储设备', desc: '分区、磁盘、块设备信息' },
      { to: '/display', label: '显示/GPU', desc: '显示器配置与图形设备信息' },
      { to: '/power', label: '电源状态', desc: '电池供电状态快照' },
      { to: '/process', label: '进程/负载', desc: '进程列表与系统负载' },
      { to: '/printer', label: '打印机', desc: '系统打印机列表读取' },
      { to: '/media', label: '音视频/外设', desc: '音频、图形、USB 概览' },
      { to: '/screenshot', label: '屏幕截图', desc: '区域截图、多屏支持与即时预览' },
      { to: '/mixer', label: '混流助手', desc: '多流源混流、画中画布局与录制' }
    ]
  },
  {
    title: 'P4 嵌入式扩展接口',
    items: [
      { to: '/gpio', label: 'GPIO', desc: '引脚读写与输入监听' },
      { to: '/i2c', label: 'I2C', desc: '总线扫描、地址读写' },
      { to: '/spi', label: 'SPI', desc: '总线打开与 transfer 传输' },
      { to: '/onewire', label: '1-Wire', desc: 'DS18B20 扫描与温度读取' }
    ]
  }
]

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-header">
        <h1>设备能力首页</h1>
        <p>点击下方能力卡片，进入对应采集与通信页面。</p>
      </div>

      <div className="home-groups">
        {groups.map((group) => (
          <section key={group.title} className="home-group">
            <h2>{group.title}</h2>
            <div className="home-grid">
              {group.items.map((item) => (
                <Link key={item.to} to={item.to} className="home-card">
                  <div className="home-card-title">{item.label}</div>
                  <div className="home-card-desc">{item.desc}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}


import { Link } from 'react-router-dom'
import './HomePage.css'

const groups = [
  {
    title: 'P0 全栈工具箱',
    items: [
      { to: '/frontend-toolbox/encoding', label: '编码与加解密', desc: 'Hash、Base64、加密解密' },
      { to: '/frontend-toolbox/json', label: 'JSON 处理', desc: '格式化、压缩、校验' },
      { to: '/frontend-toolbox/url', label: 'URL 与参数', desc: 'URL/Base64/Query 解析' },
      { to: '/frontend-toolbox/time', label: '时间与时间戳', desc: '时间戳与日期互转' },
      { to: '/frontend-toolbox/http', label: '请求调试', desc: 'HTTP、WebSocket、MQTT' },
      { to: '/frontend-toolbox/text', label: '文本与数据转换', desc: '正则、Diff、CSV、YAML' },
      { to: '/frontend-toolbox/color', label: '颜色工具', desc: '转换、调色板、渐变' },
      { to: '/frontend-toolbox/css', label: 'CSS 样式工具', desc: '阴影、按钮、Grid布局' },
      { to: '/frontend-toolbox/image', label: '图片工具', desc: '压缩、转换、水印、二维码' },
      { to: '/frontend-toolbox/markdown', label: 'Markdown 工具', desc: '编辑器、表格、HTML互转' },
      { to: '/frontend-toolbox/code', label: '代码编译运行', desc: 'JS、Python、Go、Java、Rust' },
      { to: '/frontend-toolbox/dev', label: '开发辅助工具', desc: 'UUID、JWT、Cron、随机密码' },
      { to: '/frontend-toolbox/seo', label: 'SEO 与站长工具', desc: 'IP、Whois、DNS查询' },
      { to: '/frontend-toolbox/ocr', label: 'OCR 与识别', desc: '文字识别、SVG编辑' },
      { to: '/frontend-toolbox/utils', label: '实用工具', desc: '视频解析、文件传输' },
      { to: '/frontend-toolbox/fun', label: '娱乐工具', desc: '在线钢琴、语音合成' },
      { to: '/frontend-toolbox/network', label: '网络编程', desc: 'TCP、UDP、KCP 协议' },
      { to: '/frontend-toolbox/database', label: '数据库', desc: 'MySQL、PostgreSQL、MongoDB' },
      { to: '/frontend-toolbox/pool', label: '连接池', desc: '连接池、线程池、对象池' },
      { to: '/frontend-toolbox/redis', label: 'Redis', desc: '缓存策略、熔断限流' },
      { to: '/frontend-toolbox/deploy', label: '部署运维', desc: 'Docker、K8s、Linux' },
      { to: '/frontend-toolbox/monitor', label: '监控告警', desc: 'Grafana 监控面板' },
      { to: '/frontend-toolbox/release', label: '发布策略', desc: '灰度、蓝绿、滚动更新' },
      { to: '/frontend-toolbox/scaling', label: '集群扩容', desc: '多活架构、备份同步' },
      { to: '/frontend-toolbox/ha', label: '高可用', desc: '负载均衡、DNS、CDN' }
    ]
  },
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


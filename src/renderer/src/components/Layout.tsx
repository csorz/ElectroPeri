import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { isElectron } from '../utils/environment'
import './Layout.css'

type NavItem = { to: string; icon: string; label: string; end?: boolean; children?: NavItem[] }

const navGroups: { key: string; title: string; items: NavItem[] }[] = [
  {
    key: 'p0',
    title: 'P0 全栈工具箱',
    items: [
      {
        to: '/frontend-toolbox/encoding',
        icon: '🔐',
        label: '编码与加解密',
        children: [
          { to: '/frontend-toolbox/encoding/hash', icon: '#️⃣', label: 'Hash 计算' },
          { to: '/frontend-toolbox/encoding/base64', icon: '📦', label: 'Base64 编解码' },
          { to: '/frontend-toolbox/encoding/url', icon: '🔗', label: 'URL 编解码' },
          { to: '/frontend-toolbox/encoding/encrypt', icon: '🔒', label: '加密解密' },
          { to: '/frontend-toolbox/encoding/unicode', icon: '🌐', label: 'Unicode 编码' }
        ]
      },
      {
        to: '/frontend-toolbox/json',
        icon: '📄',
        label: 'JSON 处理',
        children: [
          { to: '/frontend-toolbox/json/format', icon: '✨', label: 'JSON 格式化' },
          { to: '/frontend-toolbox/json/minify', icon: '🗜️', label: 'JSON 压缩' },
          { to: '/frontend-toolbox/json/validate', icon: '✅', label: 'JSON 校验' },
          { to: '/frontend-toolbox/json/to-yaml', icon: '📝', label: 'JSON 转 YAML' },
          { to: '/frontend-toolbox/json/to-csv', icon: '📊', label: 'JSON 转 CSV' }
        ]
      },
      {
        to: '/frontend-toolbox/url',
        icon: '🔗',
        label: 'URL 与参数',
        children: [
          { to: '/frontend-toolbox/url/encode', icon: '🔤', label: 'URL 编解码' },
          { to: '/frontend-toolbox/url/short', icon: '✂️', label: '短网址生成' },
          { to: '/frontend-toolbox/url/query', icon: '🔍', label: 'Query 解析' }
        ]
      },
      {
        to: '/frontend-toolbox/time',
        icon: '🕐',
        label: '时间与时间戳',
        children: [
          { to: '/frontend-toolbox/time/stamp', icon: '⏱️', label: '时间戳转换' },
          { to: '/frontend-toolbox/time/now', icon: '🕐', label: '当前时间' },
          { to: '/frontend-toolbox/time/timezone', icon: '🌍', label: '时区转换' }
        ]
      },
      {
        to: '/frontend-toolbox/http',
        icon: '📡',
        label: '请求调试',
        children: [
          { to: '/frontend-toolbox/http/request', icon: '📤', label: 'HTTP 请求' },
          { to: '/frontend-toolbox/http/websocket', icon: '🔌', label: 'WebSocket' },
          { to: '/frontend-toolbox/http/mqtt', icon: '📨', label: 'MQTT' },
          { to: '/frontend-toolbox/http/status', icon: '📊', label: '状态码查询' }
        ]
      },
      {
        to: '/frontend-toolbox/text',
        icon: '📝',
        label: '文本与数据转换',
        children: [
          { to: '/frontend-toolbox/text/regex', icon: '🔎', label: '正则测试' },
          { to: '/frontend-toolbox/text/diff', icon: '📋', label: '文本比对' },
          { to: '/frontend-toolbox/text/csv-json', icon: '🔄', label: 'CSV/JSON 互转' },
          { to: '/frontend-toolbox/text/yaml-json', icon: '🔄', label: 'YAML/JSON 互转' },
          { to: '/frontend-toolbox/text/count', icon: '🔢', label: '字数统计' }
        ]
      },
      {
        to: '/frontend-toolbox/color',
        icon: '🎨',
        label: '颜色工具',
        children: [
          { to: '/frontend-toolbox/color/convert', icon: '🔄', label: '颜色转换' },
          { to: '/frontend-toolbox/color/palette', icon: '🎨', label: '调色板' },
          { to: '/frontend-toolbox/color/gradient', icon: '🌈', label: '渐变生成' },
          { to: '/frontend-toolbox/color/contrast', icon: '👁️', label: '对比度计算' },
          { to: '/frontend-toolbox/color/picker', icon: '🎯', label: '颜色提取' }
        ]
      },
      {
        to: '/frontend-toolbox/css',
        icon: '💅',
        label: 'CSS 样式工具',
        children: [
          { to: '/frontend-toolbox/css/shadow', icon: '🌫️', label: '阴影生成' },
          { to: '/frontend-toolbox/css/button', icon: '🔘', label: '按钮设计' },
          { to: '/frontend-toolbox/css/grid', icon: '📐', label: 'Grid 布局' },
          { to: '/frontend-toolbox/css/background', icon: '🖼️', label: '背景生成' },
          { to: '/frontend-toolbox/css/format', icon: '✨', label: 'CSS 格式化' }
        ]
      },
      {
        to: '/frontend-toolbox/image',
        icon: '🖼️',
        label: '图片工具',
        children: [
          { to: '/frontend-toolbox/image/compress', icon: '🗜️', label: '图片压缩' },
          { to: '/frontend-toolbox/image/convert', icon: '🔄', label: '格式转换' },
          { to: '/frontend-toolbox/image/base64', icon: '📦', label: '图片 Base64' },
          { to: '/frontend-toolbox/image/watermark', icon: '💧', label: '图片水印' },
          { to: '/frontend-toolbox/image/qrcode', icon: '📱', label: '二维码生成' }
        ]
      },
      {
        to: '/frontend-toolbox/markdown',
        icon: '📑',
        label: 'Markdown 工具',
        children: [
          { to: '/frontend-toolbox/markdown/editor', icon: '✏️', label: 'MD 编辑器' },
          { to: '/frontend-toolbox/markdown/table', icon: '📊', label: '表格生成' },
          { to: '/frontend-toolbox/markdown/html-md', icon: '🔄', label: 'HTML/MD 互转' }
        ]
      },
      {
        to: '/frontend-toolbox/code',
        icon: '💻',
        label: '代码编译运行',
        children: [
          { to: '/frontend-toolbox/code/js', icon: '🟨', label: 'JavaScript' },
          { to: '/frontend-toolbox/code/python', icon: '🐍', label: 'Python' },
          { to: '/frontend-toolbox/code/java', icon: '☕', label: 'Java' },
          { to: '/frontend-toolbox/code/go', icon: '🐹', label: 'Go' },
          { to: '/frontend-toolbox/code/rust', icon: '🦀', label: 'Rust' }
        ]
      },
      {
        to: '/frontend-toolbox/dev',
        icon: '🛠️',
        label: '开发辅助工具',
        children: [
          { to: '/frontend-toolbox/dev/uuid', icon: '🔑', label: 'UUID 生成' },
          { to: '/frontend-toolbox/dev/jwt', icon: '🎫', label: 'JWT 编解码' },
          { to: '/frontend-toolbox/dev/cron', icon: '⏰', label: 'Cron 生成' },
          { to: '/frontend-toolbox/dev/random', icon: '🎲', label: '随机密码' }
        ]
      },
      {
        to: '/frontend-toolbox/seo',
        icon: '📈',
        label: 'SEO 与站长工具',
        children: [
          { to: '/frontend-toolbox/seo/ip', icon: '🌐', label: 'IP 查询' },
          { to: '/frontend-toolbox/seo/whois', icon: '📋', label: 'Whois 查询' },
          { to: '/frontend-toolbox/seo/meta', icon: '🏷️', label: 'Meta 检测' },
          { to: '/frontend-toolbox/seo/dns', icon: '📡', label: 'DNS 查询' }
        ]
      },
      {
        to: '/frontend-toolbox/ocr',
        icon: '👁️',
        label: 'OCR 与识别',
        children: [
          { to: '/frontend-toolbox/ocr/text', icon: '📝', label: '文字识别' },
          { to: '/frontend-toolbox/ocr/svg', icon: '🎨', label: 'SVG 编辑' }
        ]
      },
      {
        to: '/frontend-toolbox/utils',
        icon: '🔧',
        label: '实用工具',
        children: [
          { to: '/frontend-toolbox/utils/video', icon: '🎬', label: '视频解析' },
          { to: '/frontend-toolbox/utils/file', icon: '📁', label: '文件传输' },
          { to: '/frontend-toolbox/utils/phone', icon: '📱', label: '归属地查询' }
        ]
      },
      {
        to: '/frontend-toolbox/fun',
        icon: '🎮',
        label: '娱乐工具',
        children: [
          { to: '/frontend-toolbox/fun/piano', icon: '🎹', label: '在线钢琴' },
          { to: '/frontend-toolbox/fun/voice', icon: '🎤', label: '语音合成' },
          { to: '/frontend-toolbox/fun/avatar', icon: '👤', label: '头像生成' }
        ]
      },
      {
        to: '/frontend-toolbox/network',
        icon: '🌐',
        label: '网络编程',
        children: [
          { to: '/frontend-toolbox/network/tcp', icon: '🔗', label: 'TCP 协议' },
          { to: '/frontend-toolbox/network/udp', icon: '📡', label: 'UDP 协议' },
          { to: '/frontend-toolbox/network/kcp', icon: '⚡', label: 'KCP 协议' }
        ]
      },
      {
        to: '/frontend-toolbox/database',
        icon: '🗄️',
        label: '数据库',
        children: [
          { to: '/frontend-toolbox/database/mysql', icon: '🐬', label: 'MySQL' },
          { to: '/frontend-toolbox/database/postgresql', icon: '🐘', label: 'PostgreSQL' },
          { to: '/frontend-toolbox/database/mongodb', icon: '🍃', label: 'MongoDB' },
          { to: '/frontend-toolbox/database/sharding', icon: '📊', label: '分库分表' },
          { to: '/frontend-toolbox/database/index', icon: '🔍', label: '索引优化' },
          { to: '/frontend-toolbox/database/replication', icon: '🔄', label: '读写分离' }
        ]
      },
      {
        to: '/frontend-toolbox/pool',
        icon: '🔗',
        label: '连接池',
        children: [
          { to: '/frontend-toolbox/pool/connection', icon: '🔗', label: '连接池' },
          { to: '/frontend-toolbox/pool/thread', icon: '🧵', label: '线程池' },
          { to: '/frontend-toolbox/pool/object', icon: '📦', label: '对象池' }
        ]
      },
      {
        to: '/frontend-toolbox/redis',
        icon: '📦',
        label: 'Redis',
        children: [
          { to: '/frontend-toolbox/redis/cache', icon: '💾', label: '缓存策略' },
          { to: '/frontend-toolbox/redis/problems', icon: '⚠️', label: '缓存问题' },
          { to: '/frontend-toolbox/redis/resilience', icon: '🛡️', label: '高可用机制' }
        ]
      },
      {
        to: '/frontend-toolbox/deploy',
        icon: '🖥️',
        label: '部署运维',
        children: [
          { to: '/frontend-toolbox/deploy/architecture', icon: '🏗️', label: '部署架构' },
          { to: '/frontend-toolbox/deploy/linux', icon: '🐧', label: 'Linux 运维' },
          { to: '/frontend-toolbox/deploy/docker', icon: '🐳', label: 'Docker' },
          { to: '/frontend-toolbox/deploy/kubernetes', icon: '☸️', label: 'Kubernetes' },
          { to: '/frontend-toolbox/deploy/security', icon: '🔒', label: '安全配置' }
        ]
      },
      {
        to: '/frontend-toolbox/monitor',
        icon: '📊',
        label: '监控告警',
        children: [
          { to: '/frontend-toolbox/monitor/grafana', icon: '📊', label: 'Grafana 监控' }
        ]
      },
      {
        to: '/frontend-toolbox/release',
        icon: '🚀',
        label: '发布策略',
        children: [
          { to: '/frontend-toolbox/release/canary', icon: '🐦', label: '灰度发布' },
          { to: '/frontend-toolbox/release/blue-green', icon: '🔵', label: '蓝绿部署' },
          { to: '/frontend-toolbox/release/rolling', icon: '🔄', label: '滚动更新' }
        ]
      },
      {
        to: '/frontend-toolbox/scaling',
        icon: '🌍',
        label: '集群扩容',
        children: [
          { to: '/frontend-toolbox/scaling/multi-active', icon: '🌍', label: '多活架构' },
          { to: '/frontend-toolbox/scaling/backup', icon: '💾', label: '备份同步' }
        ]
      },
      {
        to: '/frontend-toolbox/ha',
        icon: '⚡',
        label: '高可用',
        children: [
          { to: '/frontend-toolbox/ha/loadbalancer', icon: '⚖️', label: '负载均衡' },
          { to: '/frontend-toolbox/ha/dns', icon: '🌐', label: 'DNS 解析' },
          { to: '/frontend-toolbox/ha/proxy', icon: '🔄', label: '反向代理' },
          { to: '/frontend-toolbox/ha/cdn', icon: '🚀', label: 'CDN 加速' }
        ]
      }
    ]
  },
  {
    key: 'p1',
    title: 'P1 工业核心接口',
    items: [
      { to: '/serial', icon: '🔌', label: '串口采集' },
      { to: '/web-serial', icon: '🧪', label: 'Web 串口' },
      { to: '/usb', icon: '📱', label: 'USB采集' },
      { to: '/web-usb', icon: '🔌', label: 'WebUSB' },
      { to: '/bluetooth', icon: '📶', label: '蓝牙采集' },
      { to: '/web-bluetooth', icon: '📶', label: 'Web Bluetooth' },
      { to: '/hid', icon: '⌨️', label: 'HID采集' },
      { to: '/web-hid', icon: '⌨️', label: 'WebHID' },
      { to: '/network', icon: '🌐', label: '网络采集' }
    ]
  },
  {
    key: 'p2',
    title: 'P2 系统与终端能力',
    items: [
      { to: '/system', icon: '🖥️', label: '系统信息' },
      { to: '/storage', icon: '💾', label: '存储设备' },
      { to: '/display', icon: '🖵', label: '显示/GPU' },
      { to: '/power', icon: '🔋', label: '电源' },
      { to: '/process', icon: '🧠', label: '进程/负载' },
      { to: '/printer', icon: '🖨️', label: '打印机' },
      { to: '/media', icon: '🎙️', label: '音视频/外设' }
    ]
  },
  {
    key: 'p4',
    title: 'P4 嵌入式扩展接口',
    items: [
      { to: '/gpio', icon: '🟩', label: 'GPIO' },
      { to: '/i2c', icon: '🧩', label: 'I2C' },
      { to: '/spi', icon: '🧵', label: 'SPI' },
      { to: '/onewire', icon: '🌡️', label: '1-Wire' }
    ]
  }
]

export default function Layout() {
  const location = useLocation()
  const [notice, setNotice] = useState<{ type: string; message: string; ts: number } | null>(null)
  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const currentPath = location.pathname

  const pageType = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/serial')) return 'serial'
    if (path.startsWith('/usb')) return 'usb'
    if (path.startsWith('/hid')) return 'hid'
    if (path.startsWith('/network')) return 'network'
    return ''
  }, [location.pathname])

  useEffect(() => {
    // Only listen for hotplug events in Electron environment
    if (!isElectron() || !window.api?.events?.onHotplug) return

    const off = window.api.events.onHotplug((evt) => {
      if (evt.type === pageType) setNotice(evt)
    })
    return () => off()
  }, [pageType])

  const [subExpanded, setSubExpanded] = useState<Record<string, boolean>>({})

  // Check if a nav item or its children is active
  const isItemActive = (item: NavItem, currentPath: string): boolean => {
    if (currentPath === item.to || currentPath.startsWith(item.to + '/')) return true
    if (item.children) {
      return item.children.some((child) => currentPath === child.to || currentPath.startsWith(child.to + '/'))
    }
    return false
  }

  return (
    <div className="layout">
      {/* Mobile menu toggle */}
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <h2>ElectronPeri</h2>
        </div>
        <nav className="nav">
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="icon">🏠</span>
            <span>首页</span>
          </NavLink>
          {navGroups.map((group) => {
            const hasActiveItem =
              group.key === 'p0'
                ? currentPath.startsWith('/frontend-toolbox')
                : group.items.some((item) => isItemActive(item, currentPath))
            const isExpanded = hasActiveItem || Boolean(manualExpanded[group.key])
            return (
              <div key={group.key} className={`nav-group ${isExpanded ? 'expanded' : ''}`}>
                <button
                  type="button"
                  className={`nav-group-title ${isExpanded ? 'expanded' : ''}`}
                  onClick={() =>
                    setManualExpanded((prev) => ({
                      ...prev,
                      [group.key]: !Boolean(prev[group.key])
                    }))
                  }
                  aria-expanded={isExpanded}
                >
                  <span className="group-title-text">{group.title}</span>
                  <span className="group-toggle-icon">{isExpanded ? '▾' : '▸'}</span>
                </button>
                <div className="nav-group-items">
                  {group.items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0
                    const itemActive = isItemActive(item, currentPath)
                    const isSubExpanded = itemActive || Boolean(subExpanded[item.to])

                    if (hasChildren) {
                      return (
                        <div key={item.to} className={`nav-sub-group ${isSubExpanded ? 'expanded' : ''}`}>
                          <button
                            type="button"
                            className={`nav-item nav-sub-item nav-sub-toggle ${itemActive ? 'active' : ''}`}
                            onClick={() =>
                              setSubExpanded((prev) => ({
                                ...prev,
                                [item.to]: !Boolean(prev[item.to])
                              }))
                            }
                          >
                            <span className="icon">{item.icon}</span>
                            <span>{item.label}</span>
                            <span className="sub-toggle-icon">{isSubExpanded ? '▾' : '▸'}</span>
                          </button>
                          {isSubExpanded && (
                            <div className="nav-sub-children">
                              {item.children!.map((child) => (
                                <NavLink
                                  key={child.to}
                                  to={child.to}
                                  className={({ isActive }) =>
                                    isActive ? 'nav-item nav-child-item active' : 'nav-item nav-child-item'
                                  }
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <span className="icon">{child.icon}</span>
                                  <span>{child.label}</span>
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end ?? false}
                        className={({ isActive }) =>
                          isActive ? 'nav-item nav-sub-item active' : 'nav-item nav-sub-item'
                        }
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>
      <main className="main-content">
        {notice && (
          <div className="hotplug-notice">
            <span>🔔 {notice.message}</span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}

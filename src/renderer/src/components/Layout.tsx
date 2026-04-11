import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './Layout.css'

type NavItem = { to: string; icon: string; label: string; end?: boolean }

const navGroups: { key: string; title: string; items: NavItem[] }[] = [
  {
    key: 'p0',
    title: 'P0 工业核心接口',
    items: [
      { to: '/serial', icon: '🔌', label: '串口采集' },
      { to: '/web-serial', icon: '🧪', label: 'Web 串口' },
      { to: '/usb', icon: '📱', label: 'USB采集' },
      { to: '/bluetooth', icon: '📶', label: '蓝牙采集' },
      { to: '/hid', icon: '⌨️', label: 'HID采集' },
      { to: '/network', icon: '🌐', label: '网络采集' }
    ]
  },
  {
    key: 'p1',
    title: 'P1 嵌入式扩展接口',
    items: [
      { to: '/gpio', icon: '🟩', label: 'GPIO' },
      { to: '/i2c', icon: '🧩', label: 'I2C' },
      { to: '/spi', icon: '🧵', label: 'SPI' },
      { to: '/onewire', icon: '🌡️', label: '1-Wire' }
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
    key: 'p3',
    title: 'P3 前端工具箱',
    items: [
      { to: '/frontend-toolbox', icon: '📋', label: '概览', end: true },
      { to: '/frontend-toolbox/encoding', icon: '🔐', label: '1. 编码与加解密', end: true },
      { to: '/frontend-toolbox/json', icon: '📄', label: '2. JSON', end: true },
      { to: '/frontend-toolbox/url', icon: '🔗', label: '3. URL 与参数', end: true },
      { to: '/frontend-toolbox/time', icon: '🕐', label: '4. 时间戳', end: true },
      { to: '/frontend-toolbox/http', icon: '📡', label: '5. 请求调试', end: true },
      { to: '/frontend-toolbox/text', icon: '📝', label: '6. 文本转换', end: true }
    ]
  }
]

export default function Layout() {
  const location = useLocation()
  const [notice, setNotice] = useState<{ type: string; message: string; ts: number } | null>(null)
  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({})
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
    const off = window.api.events.onHotplug((evt) => {
      if (evt.type === pageType) setNotice(evt)
    })
    return () => off()
  }, [pageType])

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <h2>ElectronPeri</h2>
        </div>
        <nav className="nav">
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="icon">🏠</span>
            <span>首页</span>
          </NavLink>
          {navGroups.map((group) => {
            const hasActiveItem =
              group.key === 'p3'
                ? currentPath.startsWith('/frontend-toolbox')
                : group.items.some((item) => currentPath.startsWith(item.to))
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
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end ?? false}
                      className={({ isActive }) =>
                        isActive ? 'nav-item nav-sub-item active' : 'nav-item nav-sub-item'
                      }
                    >
                      <span className="icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
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

import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { isElectron } from '../utils/environment'
import './Layout.css'

type NavItem = { to: string; icon: string; label: string; end?: boolean; children?: NavItem[] }

const navGroups: { key: string; title: string; items: NavItem[] }[] = [
  {
    key: 'p1',
    title: 'P1 工业核心接口',
    items: [
      { to: '/serial', icon: '🔌', label: '串口采集' },
      { to: '/usb', icon: '📱', label: 'USB采集' },
      { to: '/bluetooth', icon: '📶', label: '蓝牙采集' },
      { to: '/ble-scan', icon: '📡', label: 'BLE广播扫描' },
      { to: '/mac-scan', icon: '🔌', label: 'MAC帧扫描' },
      { to: '/raw-keyboard', icon: '⌨️', label: '指定键盘监听' },
      { to: '/hid', icon: '⌨️', label: 'HID采集' },
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
      { to: '/media', icon: '🎙️', label: '音视频/外设' },
      { to: '/screenshot', icon: '📷', label: '屏幕截图' },
      { to: '/mixer', icon: '🎭', label: '混流助手' }
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

  // Track manually collapsed items (user explicitly collapsed)
  const [manualCollapsed, setManualCollapsed] = useState<Record<string, boolean>>({})

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
            const hasActiveItem = group.items.some((item) => isItemActive(item, currentPath))
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
                    // Expand if: user manually expanded, OR (item is active AND user hasn't manually collapsed)
                    const isSubExpanded = Boolean(subExpanded[item.to]) || (itemActive && !manualCollapsed[item.to])

                    if (hasChildren) {
                      return (
                        <div key={item.to} className={`nav-sub-group ${isSubExpanded ? 'expanded' : ''}`}>
                          <button
                            type="button"
                            className={`nav-item nav-sub-item nav-sub-toggle ${itemActive ? 'active' : ''}`}
                            onClick={() => {
                              // Toggle: if expanded, collapse it; if collapsed, expand it
                              if (isSubExpanded) {
                                // Currently expanded, so collapse
                                setManualCollapsed((prev) => ({ ...prev, [item.to]: true }))
                                setSubExpanded((prev) => ({ ...prev, [item.to]: false }))
                              } else {
                                // Currently collapsed, so expand
                                setManualCollapsed((prev) => ({ ...prev, [item.to]: false }))
                                setSubExpanded((prev) => ({ ...prev, [item.to]: true }))
                              }
                            }}
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

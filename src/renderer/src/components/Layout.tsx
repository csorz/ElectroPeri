import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './Layout.css'

type NavItem = { to: string; icon: string; label: string; end?: boolean; children?: NavItem[] }

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
      }
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

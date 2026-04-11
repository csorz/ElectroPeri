import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/http/request', icon: '📤', title: 'HTTP 请求', desc: '发送 HTTP/HTTPS 请求' },
  { to: '/frontend-toolbox/http/websocket', icon: '🔌', title: 'WebSocket', desc: 'WebSocket 连接测试' },
  { to: '/frontend-toolbox/http/status', icon: '📊', title: '状态码查询', desc: 'HTTP 状态码对照表' }
]

export default function HttpCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📡</span>
          <h1>请求调试</h1>
        </div>
        <p className="page-sub">HTTP 请求、WebSocket、状态码查询</p>
      </div>

      <div className="toolbox-category-grid">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="toolbox-tool-card">
            <span className="tool-icon">{tool.icon}</span>
            <div className="tool-info">
              <div className="tool-title">{tool.title}</div>
              <div className="tool-desc">{tool.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

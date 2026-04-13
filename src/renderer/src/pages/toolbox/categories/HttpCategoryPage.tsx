import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/http/request', icon: '📤', title: 'HTTP 请求', desc: '发送 HTTP/HTTPS 请求' },
  { to: '/frontend-toolbox/http/websocket', icon: '🔌', title: 'WebSocket', desc: 'WebSocket 连接测试' },
  { to: '/frontend-toolbox/http/mqtt', icon: '📡', title: 'MQTT', desc: 'MQTT 连接测试' },
  { to: '/frontend-toolbox/http/status', icon: '📊', title: '状态码查询', desc: 'HTTP 状态码对照表' }
]

export default function HttpCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>📡 请求调试</h1>
        <p>HTTP 请求、WebSocket、MQTT、状态码查询</p>
      </div>

      <div className="tool-grid">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="tool-card">
            <span className="tool-icon">{tool.icon}</span>
            <div className="tool-info">
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

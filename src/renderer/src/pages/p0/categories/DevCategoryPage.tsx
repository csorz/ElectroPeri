import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/dev/uuid', icon: '🔑', title: 'UUID 生成', desc: '生成 UUID/GUID' },
  { to: '/frontend-toolbox/dev/jwt', icon: '🎫', title: 'JWT 编解码', desc: 'JWT 编码解码验证' },
  { to: '/frontend-toolbox/dev/cron', icon: '⏰', title: 'Cron 生成', desc: 'Cron 表达式生成' },
  { to: '/frontend-toolbox/dev/random', icon: '🎲', title: '随机密码', desc: '随机密码生成' }
]

export default function DevCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🛠️</span>
          <h1>开发辅助工具</h1>
        </div>
        <p className="page-sub">UUID 生成、JWT 编解码、Cron 生成、随机密码</p>
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

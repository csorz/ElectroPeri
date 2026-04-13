import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/dev/uuid', icon: '🔑', title: 'UUID 生成', desc: '生成 UUID/GUID' },
  { to: '/frontend-toolbox/dev/jwt', icon: '🎫', title: 'JWT 编解码', desc: 'JWT 编码解码验证' },
  { to: '/frontend-toolbox/dev/cron', icon: '⏰', title: 'Cron 生成', desc: 'Cron 表达式生成' },
  { to: '/frontend-toolbox/dev/random', icon: '🎲', title: '随机密码', desc: '随机密码生成' }
]

export default function DevCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🛠️ 开发辅助工具</h1>
        <p>UUID 生成、JWT 编解码、Cron 生成、随机密码</p>
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

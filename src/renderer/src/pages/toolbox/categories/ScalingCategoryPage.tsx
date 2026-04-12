import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/scaling/multi-active', icon: '🌍', title: '多活架构', desc: '异地多活、多区域部署、容灾设计' },
  { to: '/frontend-toolbox/scaling/backup', icon: '💾', title: '备份同步', desc: '定时快照、冷热备份、跨城同步' }
]

export default function ScalingCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🌍 集群扩容</h1>
        <p>异地多活、多区域部署、备份同步</p>
      </div>
      <div className="tool-grid">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="tool-card">
            <span className="tool-icon">{tool.icon}</span>
            <div className="tool-info"><h3>{tool.title}</h3><p>{tool.desc}</p></div>
          </Link>
        ))}
      </div>
    </div>
  )
}

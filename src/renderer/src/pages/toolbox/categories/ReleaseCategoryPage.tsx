import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/release/canary', icon: '🐦', title: '灰度发布', desc: '逐步放量，降低发布风险' },
  { to: '/frontend-toolbox/release/blue-green', icon: '🔵', title: '蓝绿部署', desc: '两套环境，快速切换' },
  { to: '/frontend-toolbox/release/rolling', icon: '🔄', title: '滚动更新', desc: '逐个更新，保持服务可用' }
]

export default function ReleaseCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🚀 发布策略</h1>
        <p>灰度发布、蓝绿部署、滚动更新</p>
      </div>

      <div className="category-overview">
        <h2>发布策略对比</h2>
        <table className="comparison-table">
          <thead><tr><th>策略</th><th>特点</th><th>回滚速度</th><th>资源成本</th></tr></thead>
          <tbody>
            <tr><td>灰度发布</td><td>逐步放量</td><td>中</td><td>低</td></tr>
            <tr><td>蓝绿部署</td><td>完整环境切换</td><td>快</td><td>高</td></tr>
            <tr><td>滚动更新</td><td>逐个替换</td><td>慢</td><td>中</td></tr>
          </tbody>
        </table>
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

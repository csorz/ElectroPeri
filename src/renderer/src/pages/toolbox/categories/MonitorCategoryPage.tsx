import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/monitor/grafana', icon: '📊', title: 'Grafana 监控', desc: 'CPU、内存、磁盘、网络监控面板' }
]

export default function MonitorCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>📊 监控告警</h1>
        <p>系统监控、指标采集、告警配置</p>
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

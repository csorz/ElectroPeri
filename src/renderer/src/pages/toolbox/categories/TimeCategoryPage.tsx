import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/time/stamp', icon: '⏱️', title: '时间戳转换', desc: 'Unix 时间戳与日期互转' },
  { to: '/frontend-toolbox/time/now', icon: '🕐', title: '当前时间', desc: '显示当前时间戳和日期' },
  { to: '/frontend-toolbox/time/timezone', icon: '🌍', title: '时区转换', desc: '不同时区时间转换' }
]

export default function TimeCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🕐 时间与时间戳</h1>
        <p>时间戳转换、当前时间、时区转换</p>
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

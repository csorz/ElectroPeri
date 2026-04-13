import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/fun/piano', icon: '🎹', title: '在线钢琴', desc: '在线弹钢琴' },
  { to: '/frontend-toolbox/fun/voice', icon: '🎤', title: '语音合成', desc: '在线语音合成' },
  { to: '/frontend-toolbox/fun/avatar', icon: '👤', title: '头像生成', desc: '节日头像生成' }
]

export default function FunCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🎮 娱乐工具</h1>
        <p>在线钢琴、语音合成、头像生成</p>
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

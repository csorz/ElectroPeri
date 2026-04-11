import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/fun/piano', icon: '🎹', title: '在线钢琴', desc: '在线弹钢琴' },
  { to: '/frontend-toolbox/fun/voice', icon: '🎤', title: '语音合成', desc: '在线语音合成' },
  { to: '/frontend-toolbox/fun/avatar', icon: '👤', title: '头像生成', desc: '节日头像生成' }
]

export default function FunCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🎮</span>
          <h1>娱乐工具</h1>
        </div>
        <p className="page-sub">在线钢琴、语音合成、头像生成</p>
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

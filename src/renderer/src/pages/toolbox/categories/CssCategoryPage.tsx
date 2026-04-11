import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/css/shadow', icon: '🌫️', title: '阴影生成', desc: 'CSS 阴影效果生成' },
  { to: '/frontend-toolbox/css/button', icon: '🔘', title: '按钮设计', desc: 'CSS 按钮样式设计' },
  { to: '/frontend-toolbox/css/grid', icon: '📐', title: 'Grid 布局', desc: 'CSS Grid 布局生成' },
  { to: '/frontend-toolbox/css/background', icon: '🖼️', title: '背景生成', desc: 'CSS 背景样式生成' },
  { to: '/frontend-toolbox/css/format', icon: '✨', title: 'CSS 格式化', desc: 'CSS 代码格式化压缩' }
]

export default function CssCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">💅</span>
          <h1>CSS 样式工具</h1>
        </div>
        <p className="page-sub">阴影生成、按钮设计、Grid 布局、背景生成、CSS 格式化</p>
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

import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/css/shadow', icon: '🌫️', title: '阴影生成', desc: 'CSS 阴影效果生成' },
  { to: '/frontend-toolbox/css/button', icon: '🔘', title: '按钮设计', desc: 'CSS 按钮样式设计' },
  { to: '/frontend-toolbox/css/flex', icon: '📦', title: 'Flex 布局', desc: 'CSS Flexbox 布局生成' },
  { to: '/frontend-toolbox/css/grid', icon: '📐', title: 'Grid 布局', desc: 'CSS Grid 布局生成' },
  { to: '/frontend-toolbox/css/background', icon: '🖼️', title: '背景生成', desc: 'CSS 背景样式生成' },
  { to: '/frontend-toolbox/css/format', icon: '✨', title: 'CSS 格式化', desc: 'CSS 代码格式化压缩' }
]

export default function CssCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>💅 CSS 样式工具</h1>
        <p>阴影生成、按钮设计、Flex/Grid 布局、背景生成、CSS 格式化</p>
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

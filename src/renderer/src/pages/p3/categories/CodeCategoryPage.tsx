import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/code/js', icon: '🟨', title: 'JavaScript', desc: 'JavaScript 在线运行' },
  { to: '/frontend-toolbox/code/python', icon: '🐍', title: 'Python', desc: 'Python 在线运行' },
  { to: '/frontend-toolbox/code/java', icon: '☕', title: 'Java', desc: 'Java 在线编译运行' },
  { to: '/frontend-toolbox/code/go', icon: '🐹', title: 'Go', desc: 'Go 在线编译运行' },
  { to: '/frontend-toolbox/code/rust', icon: '🦀', title: 'Rust', desc: 'Rust 在线编译运行' }
]

export default function CodeCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">💻</span>
          <h1>代码编译运行</h1>
        </div>
        <p className="page-sub">JavaScript、Python、Java、Go、Rust 在线编译运行</p>
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

import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/code/js', icon: '🟨', title: 'JavaScript', desc: 'JavaScript 在线运行' },
  { to: '/frontend-toolbox/code/python', icon: '🐍', title: 'Python', desc: 'Python 在线运行' },
  { to: '/frontend-toolbox/code/java', icon: '☕', title: 'Java', desc: 'Java 在线编译运行' },
  { to: '/frontend-toolbox/code/go', icon: '🐹', title: 'Go', desc: 'Go 在线编译运行' },
  { to: '/frontend-toolbox/code/rust', icon: '🦀', title: 'Rust', desc: 'Rust 在线编译运行' }
]

export default function CodeCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>💻 代码编译运行</h1>
        <p>JavaScript、Python、Java、Go、Rust 在线编译运行</p>
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

import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/markdown/editor', icon: '✏️', title: 'MD 编辑器', desc: 'Markdown 在线编辑器' },
  { to: '/frontend-toolbox/markdown/table', icon: '📊', title: '表格生成', desc: 'Markdown 表格生成' },
  { to: '/frontend-toolbox/markdown/html-md', icon: '🔄', title: 'HTML/MD 互转', desc: 'HTML 与 Markdown 互转' }
]

export default function MarkdownCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>📑 Markdown 工具</h1>
        <p>Markdown 编辑器、表格生成、HTML/MD 互转</p>
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

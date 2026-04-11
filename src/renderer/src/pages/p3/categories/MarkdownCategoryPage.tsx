import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/markdown/editor', icon: '✏️', title: 'MD 编辑器', desc: 'Markdown 在线编辑器' },
  { to: '/frontend-toolbox/markdown/table', icon: '📊', title: '表格生成', desc: 'Markdown 表格生成' },
  { to: '/frontend-toolbox/markdown/html-md', icon: '🔄', title: 'HTML/MD 互转', desc: 'HTML 与 Markdown 互转' }
]

export default function MarkdownCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📑</span>
          <h1>Markdown 工具</h1>
        </div>
        <p className="page-sub">Markdown 编辑器、表格生成、HTML/MD 互转</p>
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

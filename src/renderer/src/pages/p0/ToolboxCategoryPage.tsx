import { Link } from 'react-router-dom'
import './toolbox.css'

type ToolItem = { to: string; icon: string; title: string; desc: string }

type Props = {
  title: string
  icon: string
  desc: string
  tools: ToolItem[]
  backTo?: string
}

export default function ToolboxCategoryPage({ title, icon, desc, tools, backTo = '/frontend-toolbox' }: Props) {
  return (
    <div className="toolbox-page">
      <Link to={backTo} className="toolbox-back">
        ← 返回工具箱概览
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">{icon}</span>
          <h1>{title}</h1>
        </div>
        <p className="page-sub">{desc}</p>
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

import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/json/format', icon: '✨', title: 'JSON 格式化', desc: 'JSON 数据格式化美化' },
  { to: '/frontend-toolbox/json/minify', icon: '🗜️', title: 'JSON 压缩', desc: 'JSON 数据压缩' },
  { to: '/frontend-toolbox/json/validate', icon: '✅', title: 'JSON 校验', desc: 'JSON 格式校验' },
  { to: '/frontend-toolbox/json/to-yaml', icon: '📝', title: 'JSON 转 YAML', desc: 'JSON 数据转 YAML 格式' },
  { to: '/frontend-toolbox/json/to-csv', icon: '📊', title: 'JSON 转 CSV', desc: 'JSON 数据转 CSV 格式' }
]

export default function JsonCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>📄 JSON 处理</h1>
        <p>JSON 格式化、压缩、校验、转换</p>
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

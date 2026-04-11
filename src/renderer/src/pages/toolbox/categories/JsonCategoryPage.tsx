import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/json/format', icon: '✨', title: 'JSON 格式化', desc: 'JSON 数据格式化美化' },
  { to: '/frontend-toolbox/json/minify', icon: '🗜️', title: 'JSON 压缩', desc: 'JSON 数据压缩' },
  { to: '/frontend-toolbox/json/validate', icon: '✅', title: 'JSON 校验', desc: 'JSON 格式校验' },
  { to: '/frontend-toolbox/json/to-yaml', icon: '📝', title: 'JSON 转 YAML', desc: 'JSON 数据转 YAML 格式' },
  { to: '/frontend-toolbox/json/to-csv', icon: '📊', title: 'JSON 转 CSV', desc: 'JSON 数据转 CSV 格式' }
]

export default function JsonCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📄</span>
          <h1>JSON 处理</h1>
        </div>
        <p className="page-sub">JSON 格式化、压缩、校验、转换</p>
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

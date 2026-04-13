import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/text/regex', icon: '🔎', title: '正则测试', desc: '正则表达式在线测试' },
  { to: '/frontend-toolbox/text/diff', icon: '📋', title: '文本比对', desc: '文本差异对比' },
  { to: '/frontend-toolbox/text/csv-json', icon: '🔄', title: 'CSV/JSON 互转', desc: 'CSV 与 JSON 格式互转' },
  { to: '/frontend-toolbox/text/yaml-json', icon: '🔄', title: 'YAML/JSON 互转', desc: 'YAML 与 JSON 格式互转' },
  { to: '/frontend-toolbox/text/count', icon: '🔢', title: '字数统计', desc: '文本字数统计与排版' }
]

export default function TextCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>📝 文本与数据转换</h1>
        <p>正则测试、文本比对、CSV/JSON/YAML 互转、字数统计</p>
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

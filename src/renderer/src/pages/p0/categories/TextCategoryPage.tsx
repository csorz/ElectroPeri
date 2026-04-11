import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/text/regex', icon: '🔎', title: '正则测试', desc: '正则表达式在线测试' },
  { to: '/frontend-toolbox/text/diff', icon: '📋', title: '文本比对', desc: '文本差异对比' },
  { to: '/frontend-toolbox/text/csv-json', icon: '🔄', title: 'CSV/JSON 互转', desc: 'CSV 与 JSON 格式互转' },
  { to: '/frontend-toolbox/text/yaml-json', icon: '🔄', title: 'YAML/JSON 互转', desc: 'YAML 与 JSON 格式互转' },
  { to: '/frontend-toolbox/text/count', icon: '🔢', title: '字数统计', desc: '文本字数统计与排版' }
]

export default function TextCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📝</span>
          <h1>文本与数据转换</h1>
        </div>
        <p className="page-sub">正则测试、文本比对、CSV/JSON/YAML 互转、字数统计</p>
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

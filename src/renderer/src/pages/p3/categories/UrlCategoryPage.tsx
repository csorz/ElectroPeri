import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/url/encode', icon: '🔤', title: 'URL 编解码', desc: 'URL 编码与解码' },
  { to: '/frontend-toolbox/url/short', icon: '✂️', title: '短网址生成', desc: '生成短网址链接' },
  { to: '/frontend-toolbox/url/query', icon: '🔍', title: 'Query 解析', desc: 'URL 参数解析为对象' }
]

export default function UrlCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔗</span>
          <h1>URL 与参数</h1>
        </div>
        <p className="page-sub">URL 编解码、短网址生成、Query 解析</p>
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

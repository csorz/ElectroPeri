import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/url/encode', icon: '🔤', title: 'URL 编解码', desc: 'URL 编码与解码' },
  { to: '/frontend-toolbox/url/short', icon: '✂️', title: '短网址生成', desc: '生成短网址链接' },
  { to: '/frontend-toolbox/url/query', icon: '🔍', title: 'Query 解析', desc: 'URL 参数解析为对象' }
]

export default function UrlCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🔗 URL 与参数</h1>
        <p>URL 编解码、短网址生成、Query 解析</p>
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

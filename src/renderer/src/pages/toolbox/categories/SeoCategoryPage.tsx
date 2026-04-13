import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/seo/ip', icon: '🌐', title: 'IP 查询', desc: 'IP 地址归属地查询' },
  { to: '/frontend-toolbox/seo/whois', icon: '📋', title: 'Whois 查询', desc: '域名 Whois 信息查询' },
  { to: '/frontend-toolbox/seo/meta', icon: '🏷️', title: 'Meta 检测', desc: '网页 Meta 信息检测' },
  { to: '/frontend-toolbox/seo/dns', icon: '📡', title: 'DNS 查询', desc: '域名 DNS 解析查询' }
]

export default function SeoCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>📈 SEO 与站长工具</h1>
        <p>IP 查询、Whois 查询、Meta 检测、DNS 查询</p>
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

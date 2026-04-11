import { Link } from 'react-router-dom'
import '../toolbox.css'

const tools = [
  { to: '/frontend-toolbox/seo/ip', icon: '🌐', title: 'IP 查询', desc: 'IP 地址归属地查询' },
  { to: '/frontend-toolbox/seo/whois', icon: '📋', title: 'Whois 查询', desc: '域名 Whois 信息查询' },
  { to: '/frontend-toolbox/seo/meta', icon: '🏷️', title: 'Meta 检测', desc: '网页 Meta 信息检测' },
  { to: '/frontend-toolbox/seo/dns', icon: '📡', title: 'DNS 查询', desc: '域名 DNS 解析查询' }
]

export default function SeoCategoryPage() {
  return (
    <div className="toolbox-page">
      <Link to="/home" className="toolbox-back">
        ← 返回首页
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📈</span>
          <h1>SEO 与站长工具</h1>
        </div>
        <p className="page-sub">IP 查询、Whois 查询、Meta 检测、DNS 查询</p>
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

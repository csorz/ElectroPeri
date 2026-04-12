import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/ha/loadbalancer', icon: '⚖️', title: '负载均衡', desc: 'L4/L7 负载均衡、算法选择' },
  { to: '/frontend-toolbox/ha/dns', icon: '🌐', title: 'DNS 解析', desc: 'DNS 负载均衡、智能解析' },
  { to: '/frontend-toolbox/ha/proxy', icon: '🔄', title: '反向代理', desc: 'Nginx、HAProxy 配置' },
  { to: '/frontend-toolbox/ha/cdn', icon: '🚀', title: 'CDN 加速', desc: '静态资源加速、边缘节点' }
]

export default function HaCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>⚡ 高可用</h1>
        <p>负载均衡、DNS解析、反向代理、CDN加速</p>
      </div>
      <div className="tool-grid">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="tool-card">
            <span className="tool-icon">{tool.icon}</span>
            <div className="tool-info"><h3>{tool.title}</h3><p>{tool.desc}</p></div>
          </Link>
        ))}
      </div>
    </div>
  )
}

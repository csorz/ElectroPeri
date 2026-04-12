import { Link } from 'react-router-dom'
import './CategoryPage.css'

const tools = [
  { to: '/frontend-toolbox/deploy/architecture', icon: '🏗️', title: '部署架构', desc: '主机、实例、集群架构设计' },
  { to: '/frontend-toolbox/deploy/linux', icon: '🐧', title: 'Linux 运维', desc: '常用命令、性能分析、故障排查' },
  { to: '/frontend-toolbox/deploy/docker', icon: '🐳', title: 'Docker', desc: '容器化部署、镜像构建、编排' },
  { to: '/frontend-toolbox/deploy/kubernetes', icon: '☸️', title: 'Kubernetes', desc: 'Pod、Service、Deployment、ConfigMap' },
  { to: '/frontend-toolbox/deploy/security', icon: '🔒', title: '安全配置', desc: '端口、权限、防火墙、SSL' }
]

export default function DeployCategoryPage() {
  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🖥️ 部署运维</h1>
        <p>部署架构、容器化、Kubernetes、安全配置</p>
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

import { useState } from 'react'
import './ToolPage.css'

export default function DeployArchitectureToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🏗️ 部署架构</h1>
        <p>主机、实例、集群架构设计</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>部署层次</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌─────────────────────────────────────────────────────┐
  │                    集群 (Cluster)                    │
  │  ┌───────────────────────────────────────────────┐ │
  │  │                 实例 (Instance)                │ │
  │  │  ┌─────────────────────────────────────────┐   │ │
  │  │  │              主机 (Host)                 │   │ │
  │  │  │  ┌───────────────────────────────────┐  │   │ │
  │  │  │  │           应用进程                 │  │   │ │
  │  │  │  └───────────────────────────────────┘  │   │ │
  │  │  └─────────────────────────────────────────┘   │ │
  │  └───────────────────────────────────────────────┘ │
  └─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>架构模式</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>单机部署</h3>
                <p>适合开发测试，简单易维护</p>
              </div>
              <div className="feature-card">
                <h3>主从部署</h3>
                <p>主节点写入，从节点读取</p>
              </div>
              <div className="feature-card">
                <h3>集群部署</h3>
                <p>多节点负载均衡，高可用</p>
              </div>
              <div className="feature-card">
                <h3>分布式部署</h3>
                <p>数据分片，水平扩展</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>架构拓扑图</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
                    ┌─────────────┐
                    │   用户请求   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │   Nginx LB  │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   App 1     │ │   App 2     │ │   App 3     │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           └───────────────┼───────────────┘
                           ▼
                    ┌─────────────┐
                    │   MySQL     │
                    │  (主从复制) │
                    └─────────────┘
              `}</pre>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Docker Compose 架构</h2>
            <div className="code-block">
              <pre>{`version: '3'
services:
  nginx:
    image: nginx:latest
    ports: ["80:80"]
    depends_on: [app1, app2]

  app1:
    image: myapp:latest
    environment: [DB_HOST=mysql]

  app2:
    image: myapp:latest
    environment: [DB_HOST=mysql]

  mysql:
    image: mysql:8.0
    volumes: [mysql_data:/var/lib/mysql]

volumes:
  mysql_data:`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

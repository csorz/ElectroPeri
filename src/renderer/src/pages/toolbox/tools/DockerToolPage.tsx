import { useState } from 'react'
import './ToolPage.css'

export default function DockerToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🐳 Docker</h1>
        <p>容器化部署、镜像构建、编排</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心概念</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>镜像 (Image)</h3><p>只读模板，包含运行环境</p></div>
              <div className="feature-card"><h3>容器 (Container)</h3><p>镜像的运行实例</p></div>
              <div className="feature-card"><h3>仓库 (Registry)</h3><p>镜像存储分发</p></div>
              <div className="feature-card"><h3>Dockerfile</h3><p>镜像构建脚本</p></div>
            </div>

            <h2>常用命令</h2>
            <table className="comparison-table">
              <thead><tr><th>命令</th><th>说明</th></tr></thead>
              <tbody>
                <tr><td>docker build</td><td>构建镜像</td></tr>
                <tr><td>docker run</td><td>运行容器</td></tr>
                <tr><td>docker ps</td><td>查看容器</td></tr>
                <tr><td>docker logs</td><td>查看日志</td></tr>
                <tr><td>docker exec</td><td>进入容器</td></tr>
                <tr><td>docker-compose up</td><td>启动编排</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Dockerfile 示例</h2>
            <div className="code-block">
              <pre>{`FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]`}</pre>
            </div>

            <h2>Docker Compose</h2>
            <div className="code-block">
              <pre>{`version: '3.8'
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
    depends_on: [redis]

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

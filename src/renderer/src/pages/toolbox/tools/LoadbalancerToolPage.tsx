import { useState } from 'react'
import './ToolPage.css'

export default function LoadbalancerToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>⚖️ 负载均衡</h1>
        <p>流量分发，提高系统可用性和性能</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>负载均衡层次</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌─────────────────────────────────────────────────────────┐
  │                     L7 应用层                           │
  │   Nginx / HAProxy / Envoy (HTTP/HTTPS 路由)            │
  └─────────────────────────┬───────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────┐
  │                     L4 传输层                           │
  │   LVS / F5 (TCP/UDP 转发)                              │
  └─────────────────────────┬───────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────┐
  │                     L3 网络层                           │
  │   DNS 负载均衡                                         │
  └─────────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>负载均衡算法</h2>
            <table className="comparison-table">
              <thead><tr><th>算法</th><th>说明</th><th>适用场景</th></tr></thead>
              <tbody>
                <tr><td>轮询 (Round Robin)</td><td>依次分配</td><td>服务器性能相近</td></tr>
                <tr><td>加权轮询 (Weighted)</td><td>按权重分配</td><td>服务器性能不同</td></tr>
                <tr><td>最少连接 (Least Conn)</td><td>分配给连接最少的</td><td>长连接场景</td></tr>
                <tr><td>IP Hash</td><td>根据客户端IP</td><td>会话保持</td></tr>
                <tr><td>URL Hash</td><td>根据请求URL</td><td>缓存命中</td></tr>
                <tr><td>一致性哈希</td><td>哈希环分配</td><td>分布式缓存</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Nginx 负载均衡配置</h2>
            <div className="code-block">
              <pre>{`upstream backend {
    # 加权轮询
    server 192.168.1.1:8080 weight=3;
    server 192.168.1.2:8080 weight=2;
    server 192.168.1.3:8080 weight=1;

    # 健康检查
    server 192.168.1.4:8080 backup;

    # 最少连接
    # least_conn;

    # IP Hash (会话保持)
    # ip_hash;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 一致性哈希 (需要模块)
# upstream backend {
#     hash $request_uri consistent;
# }`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

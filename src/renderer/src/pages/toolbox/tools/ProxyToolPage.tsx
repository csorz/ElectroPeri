import { useState } from 'react'
import './ToolPage.css'

export default function ProxyToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔄 反向代理</h1>
        <p>Nginx、HAProxy 配置与最佳实践</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>正向代理 vs 反向代理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  正向代理 (代理客户端):
  客户端 ──▶ 代理服务器 ──▶ 目标服务器
           (VPN、科学上网)

  反向代理 (代理服务端):
  客户端 ──▶ 反向代理 ──▶ 后端服务器1
                    └──▶ 后端服务器2
           (Nginx、负载均衡)
              `}</pre>
            </div>

            <h2>反向代理功能</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>负载均衡</h3><p>分发请求到多个后端</p></div>
              <div className="feature-card"><h3>SSL 终结</h3><p>卸载 HTTPS 加密</p></div>
              <div className="feature-card"><h3>缓存</h3><p>缓存静态资源</p></div>
              <div className="feature-card"><h3>压缩</h3><p>Gzip 压缩响应</p></div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Nginx 反向代理配置</h2>
            <div className="code-block">
              <pre>{`server {
    listen 80;
    server_name example.com;

    # SSL 配置
    listen 443 ssl;
    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    # 反向代理
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件
    location /static/ {
        alias /var/www/static/;
        expires 30d;
    }

    # 缓存
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
    location /api/ {
        proxy_cache my_cache;
        proxy_cache_valid 200 10m;
        proxy_pass http://backend;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain application/json;
    gzip_min_length 1000;
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import './ToolPage.css'

export default function CdnToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🚀 CDN 加速</h1>
        <p>内容分发网络，静态资源加速</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>CDN 工作原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌─────────────────────────────────────────────────────────┐
  │                      源站 (Origin)                      │
  │                   北京: example.com                     │
  └───────────────────────────┬─────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
  ┌───────────┐       ┌───────────┐       ┌───────────┐
  │ 边缘节点1 │       │ 边缘节点2 │       │ 边缘节点3 │
  │  (上海)   │       │  (广州)   │       │  (成都)   │
  └───────────┘       └───────────┘       └───────────┘
        │                     │                     │
        ▼                     ▼                     ▼
   上海用户              广州用户              成都用户
   (就近访问)            (就近访问)            (就近访问)
              `}</pre>
            </div>

            <h2>CDN 加速内容</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>静态资源</h3><p>JS/CSS/图片/视频</p></div>
              <div className="feature-card"><h3>文件下载</h3><p>软件包、文档分发</p></div>
              <div className="feature-card"><h3>流媒体</h3><p>直播、点播加速</p></div>
              <div className="feature-card"><h3>全站加速</h3><p>动态内容加速</p></div>
            </div>

            <h2>动静分离架构</h2>
            <div className="info-box">
              <ul>
                <li><strong>静态资源</strong> → CDN 边缘节点缓存</li>
                <li><strong>动态请求</strong> → 源站处理</li>
                <li><strong>缓存策略</strong> → 根据文件类型设置 TTL</li>
                <li><strong>缓存刷新</strong> → 发布时主动刷新 CDN</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Nginx 动静分离配置</h2>
            <div className="code-block">
              <pre>{`server {
    listen 80;
    server_name example.com;

    # 静态资源 - CDN 加速
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";

        # 或代理到 CDN
        # return 301 https://cdn.example.com$request_uri;
    }

    # 动态请求 - 转发到后端
    location /api/ {
        proxy_pass http://backend;
    }

    # HTML - 不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache";
    }
}

# CDN 缓存规则示例
# 静态资源: Cache-Control: max-age=31536000
# HTML:     Cache-Control: no-cache
# API:      Cache-Control: no-store`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

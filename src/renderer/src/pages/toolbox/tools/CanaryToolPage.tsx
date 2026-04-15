import { useState } from 'react'
import './ToolPage.css'

export default function CanaryToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🐦 灰度发布</h1>
        <p>逐步放量，降低发布风险</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>灰度发布流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌──────────────────────────────────────────────────────────┐
  │                      用户请求                             │
  └─────────────────────────┬────────────────────────────────┘
                            ▼
  ┌──────────────────────────────────────────────────────────┐
  │                    负载均衡/网关                          │
  │         根据规则分流到不同版本                             │
  └──────────┬───────────────────────────────┬───────────────┘
             │                               │
             ▼                               ▼
  ┌─────────────────────┐         ┌─────────────────────┐
  │   旧版本 (90%)      │         │   新版本 (10%)      │
  │   v1.0.0            │         │   v2.0.0 (灰度)     │
  └─────────────────────┘         └─────────────────────┘

  放量策略: 10% → 30% → 50% → 100%
              `}</pre>
            </div>

            <h2>分流策略</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>按比例</h3><p>随机分流，如 10% 流量到新版本</p></div>
              <div className="feature-card"><h3>按用户</h3><p>特定用户/用户组访问新版本</p></div>
              <div className="feature-card"><h3>按地域</h3><p>特定地区先上线</p></div>
              <div className="feature-card"><h3>按请求头</h3><p>根据 Cookie/Header 分流</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>灰度放量模拟</h2>
            <CanaryDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Nginx 灰度配置</h2>
            <div className="code-block">
              <pre>{`upstream backend {
    server v1:8080 weight=90;
    server v2:8080 weight=10;
}

# 或基于 Cookie
map $cookie_version $backend {
    default v1;
    "v2"   v2;
}

server {
    location / {
        proxy_pass http://$backend;
    }
}`}</pre>
            </div>

            <h2>Kubernetes 灰度</h2>
            <div className="code-block">
              <pre>{`apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 10    # 10% 流量
      - pause: {duration: 10m}
      - setWeight: 30    # 30% 流量
      - pause: {duration: 10m}
      - setWeight: 50
      - pause: {duration: 10m}
  selector:
    matchLabels:
      app: myapp
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v2`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CanaryDemo() {
  const [percentage, setPercentage] = useState(10)

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label>新版本流量比例: {percentage}%</label>
        <input type="range" min="0" max="100" step="10" value={percentage} onChange={(e) => setPercentage(parseInt(e.target.value))} style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${100 - percentage}%`, background: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>
          旧版本 {100 - percentage}%
        </div>
        <div style={{ width: `${percentage}%`, background: '#ff9800', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>
          新版本 {percentage}%
        </div>
      </div>
    </div>
  )
}

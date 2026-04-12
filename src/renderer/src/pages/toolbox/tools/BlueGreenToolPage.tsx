import { useState } from 'react'
import './ToolPage.css'

export default function BlueGreenToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [activeEnv, setActiveEnv] = useState<'blue' | 'green'>('blue')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔵 蓝绿部署</h1>
        <p>两套完整环境，快速切换</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>蓝绿部署架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
                    ┌─────────────┐
                    │   用户请求   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │   负载均衡   │
                    └──────┬──────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
  ┌─────────────────┐              ┌─────────────────┐
  │   Blue (活跃)   │              │   Green (待命)  │
  │   v1.0.0        │              │   v2.0.0        │
  │   生产流量 ✓    │              │   无流量        │
  └─────────────────┘              └─────────────────┘

  切换后:
  ┌─────────────────┐              ┌─────────────────┐
  │   Blue (待命)   │              │   Green (活跃)  │
  │   v1.0.0        │              │   v2.0.0        │
  │   无流量        │              │   生产流量 ✓    │
  └─────────────────┘              └─────────────────┘
              `}</pre>
            </div>

            <h2>优缺点</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>优点</h3>
                <ul style={{ fontSize: '13px', paddingLeft: '16px' }}>
                  <li>零停机发布</li>
                  <li>秒级回滚</li>
                  <li>新环境可充分测试</li>
                </ul>
              </div>
              <div className="feature-card">
                <h3>缺点</h3>
                <ul style={{ fontSize: '13px', paddingLeft: '16px' }}>
                  <li>资源成本翻倍</li>
                  <li>数据库迁移复杂</li>
                  <li>需要处理会话状态</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>蓝绿切换模拟</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div style={{ padding: '20px', background: activeEnv === 'blue' ? '#e3f2fd' : '#f5f5f5', borderRadius: '8px', border: activeEnv === 'blue' ? '2px solid #1976d2' : '2px solid #ddd' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>🔵 Blue</h4>
                <p style={{ fontSize: '13px', margin: 0 }}>版本: v1.0.0</p>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: activeEnv === 'blue' ? '#4caf50' : '#999' }}>
                  {activeEnv === 'blue' ? '● 生产流量' : '○ 待命'}
                </p>
              </div>
              <div style={{ padding: '20px', background: activeEnv === 'green' ? '#e8f5e9' : '#f5f5f5', borderRadius: '8px', border: activeEnv === 'green' ? '2px solid #4caf50' : '2px solid #ddd' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#4caf50' }}>🟢 Green</h4>
                <p style={{ fontSize: '13px', margin: 0 }}>版本: v2.0.0</p>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: activeEnv === 'green' ? '#4caf50' : '#999' }}>
                  {activeEnv === 'green' ? '● 生产流量' : '○ 待命'}
                </p>
              </div>
            </div>
            <button onClick={() => setActiveEnv(activeEnv === 'blue' ? 'green' : 'blue')} style={{ padding: '12px 24px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              切换到 {activeEnv === 'blue' ? 'Green' : 'Blue'} 环境
            </button>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Kubernetes 蓝绿部署</h2>
            <div className="code-block">
              <pre>{`# blue-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v1

---
# green-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v2

---
# service.yaml - 切换选择器即可
apiVersion: v1
kind: Service
metadata:
  name: myapp-svc
spec:
  selector:
    app: myapp
    version: blue  # 改为 green 即可切换
  ports:
  - port: 80
    targetPort: 8080`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

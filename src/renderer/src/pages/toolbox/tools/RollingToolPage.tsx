import { useState } from 'react'
import './ToolPage.css'

export default function RollingToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔄 滚动更新</h1>
        <p>逐个替换实例，保持服务持续可用</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>滚动更新流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  初始状态 (4个旧版本实例):
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ v1  │ │ v1  │ │ v1  │ │ v1  │
  └─────┘ └─────┘ └─────┘ └─────┘

  步骤1 (更新1个):
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ v2  │ │ v1  │ │ v1  │ │ v1  │
  └─────┘ └─────┘ └─────┘ └─────┘

  步骤2 (更新第2个):
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ v2  │ │ v2  │ │ v1  │ │ v1  │
  └─────┘ └─────┘ └─────┘ └─────┘

  步骤3:
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ v2  │ │ v2  │ │ v2  │ │ v1  │
  └─────┘ └─────┘ └─────┘ └─────┘

  完成:
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ v2  │ │ v2  │ │ v2  │ │ v2  │
  └─────┘ └─────┘ └─────┘ └─────┘
              `}</pre>
            </div>

            <h2>关键参数</h2>
            <table className="comparison-table">
              <thead><tr><th>参数</th><th>说明</th><th>推荐值</th></tr></thead>
              <tbody>
                <tr><td>maxSurge</td><td>更新期间最多可多出的实例数</td><td>25%</td></tr>
                <tr><td>maxUnavailable</td><td>更新期间最多不可用的实例数</td><td>25%</td></tr>
                <tr><td>minReadySeconds</td><td>新实例就绪后等待时间</td><td>10s</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Kubernetes 滚动更新</h2>
            <div className="code-block">
              <pre>{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 最多多1个实例
      maxUnavailable: 1  # 最多少1个实例
  selector:
    matchLabels:
      app: myapp
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v2
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10

# 更新镜像触发滚动更新
kubectl set image deployment/myapp myapp=myapp:v3

# 查看更新状态
kubectl rollout status deployment/myapp

# 回滚
kubectl rollout undo deployment/myapp`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

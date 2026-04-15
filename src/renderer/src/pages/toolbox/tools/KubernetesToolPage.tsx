import { useState } from 'react'
import './ToolPage.css'

export default function KubernetesToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>☸️ Kubernetes</h1>
        <p>容器编排平台，自动化部署、扩展和管理</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心概念</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>Pod</h3><p>最小部署单元，一个或多个容器</p></div>
              <div className="feature-card"><h3>Service</h3><p>服务发现和负载均衡</p></div>
              <div className="feature-card"><h3>Deployment</h3><p>声明式更新，副本管理</p></div>
              <div className="feature-card"><h3>ConfigMap/Secret</h3><p>配置和敏感信息管理</p></div>
            </div>

            <h2>架构图</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌──────────────────────── Master Node ────────────────────────┐
  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
  │  │ API Svr │  │Scheduler│  │Ctrl Mgr│  │    etcd         │ │
  │  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │
  └──────────────────────────────────────────────────────────────┘
                              │
  ┌───────────────────────────┼───────────────────────────────────┐
  │                Worker Nodes                                   │
  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
  │  │  kubelet    │  │  kubelet    │  │  kubelet    │           │
  │  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │           │
  │  │  │ Pods  │  │  │  │ Pods  │  │  │  │ Pods  │  │           │
  │  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │           │
  │  └─────────────┘  └─────────────┘  └─────────────┘           │
  └───────────────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>常用命令</h2>
            <table className="comparison-table">
              <thead><tr><th>命令</th><th>说明</th></tr></thead>
              <tbody>
                <tr><td>kubectl get pods</td><td>查看 Pod</td></tr>
                <tr><td>kubectl get svc</td><td>查看 Service</td></tr>
                <tr><td>kubectl apply -f</td><td>应用配置</td></tr>
                <tr><td>kubectl logs</td><td>查看日志</td></tr>
                <tr><td>kubectl exec</td><td>进入容器</td></tr>
                <tr><td>kubectl describe</td><td>详细信息</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Deployment YAML</h2>
            <div className="code-block">
              <pre>{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:v1
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-svc
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

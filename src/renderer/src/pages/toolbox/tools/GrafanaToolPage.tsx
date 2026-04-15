import { useState } from 'react'
import './ToolPage.css'

export default function GrafanaToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📊 Grafana 监控</h1>
        <p>CPU、内存、磁盘、网络监控面板</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>监控体系</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
  │   应用服务   │    │   数据库    │    │   中间件    │
  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
                   ┌─────────────────┐
                   │   Prometheus    │  数据采集
                   │   (时序数据库)   │
                   └────────┬────────┘
                            ▼
                   ┌─────────────────┐
                   │    Grafana      │  可视化
                   │   (Dashboard)   │
                   └────────┬────────┘
                            ▼
                   ┌─────────────────┐
                   │  AlertManager   │  告警通知
                   └─────────────────┘
              `}</pre>
            </div>

            <h2>核心指标</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>CPU</h3><p>使用率、负载、上下文切换</p></div>
              <div className="feature-card"><h3>内存</h3><p>使用率、缓存、交换分区</p></div>
              <div className="feature-card"><h3>磁盘</h3><p>IOPS、吞吐量、使用率</p></div>
              <div className="feature-card"><h3>网络</h3><p>带宽、连接数、错误率</p></div>
            </div>

            <h2>告警规则</h2>
            <table className="comparison-table">
              <thead><tr><th>指标</th><th>告警条件</th><th>级别</th></tr></thead>
              <tbody>
                <tr><td>CPU 使用率</td><td>&gt; 80% 持续 5 分钟</td><td>警告</td></tr>
                <tr><td>内存使用率</td><td>&gt; 90%</td><td>严重</td></tr>
                <tr><td>磁盘使用率</td><td>&gt; 85%</td><td>警告</td></tr>
                <tr><td>服务不可用</td><td>持续 1 分钟</td><td>严重</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>监控面板模拟</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#1e1e1e', borderRadius: '8px', color: '#fff' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#4fc3f7' }}>CPU 使用率</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>45%</div>
                <div style={{ height: '4px', background: '#333', borderRadius: '2px', marginTop: '8px' }}>
                  <div style={{ width: '45%', height: '100%', background: '#4caf50', borderRadius: '2px' }} />
                </div>
              </div>
              <div style={{ padding: '16px', background: '#1e1e1e', borderRadius: '8px', color: '#fff' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#4fc3f7' }}>内存使用率</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>72%</div>
                <div style={{ height: '4px', background: '#333', borderRadius: '2px', marginTop: '8px' }}>
                  <div style={{ width: '72%', height: '100%', background: '#ff9800', borderRadius: '2px' }} />
                </div>
              </div>
              <div style={{ padding: '16px', background: '#1e1e1e', borderRadius: '8px', color: '#fff' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#4fc3f7' }}>磁盘使用率</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>38%</div>
                <div style={{ height: '4px', background: '#333', borderRadius: '2px', marginTop: '8px' }}>
                  <div style={{ width: '38%', height: '100%', background: '#4caf50', borderRadius: '2px' }} />
                </div>
              </div>
              <div style={{ padding: '16px', background: '#1e1e1e', borderRadius: '8px', color: '#fff' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#4fc3f7' }}>网络流量</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>125 MB/s</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>↑ 45 MB/s  ↓ 80 MB/s</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Prometheus 配置</h2>
            <div className="code-block">
              <pre>{`# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']

# 告警规则
rule_files:
  - /etc/prometheus/rules/*.yml

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']`}</pre>
            </div>

            <h2>告警规则示例</h2>
            <div className="code-block">
              <pre>{`groups:
- name: node_alerts
  rules:
  - alert: HighCPU
    expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage"

  - alert: HighMemory
    expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
    labels:
      severity: critical
    annotations:
      summary: "High memory usage"`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

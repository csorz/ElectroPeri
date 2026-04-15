import { useState } from 'react'
import './ToolPage.css'

export default function MultiActiveToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🌍 多活架构</h1>
        <p>异地多活、多区域部署、容灾设计</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>异地多活架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
                    ┌─────────────────┐
                    │    DNS/GSLB     │
                    │  全局负载均衡    │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
  │   北京机房    │  │   上海机房    │  │   广州机房    │
  │   (主)       │  │   (从)       │  │   (从)       │
  │              │  │              │  │              │
  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
  │  │ App    │  │  │  │ App    │  │  │  │ App    │  │
  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │
  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
  │  │ MySQL  │◄─┼──┼─►│ MySQL  │◄─┼──┼─►│ MySQL  │  │
  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │
  └───────────────┘  └───────────────┘  └───────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                      数据同步
              `}</pre>
            </div>

            <h2>异地多活 vs 多区域部署</h2>
            <table className="comparison-table">
              <thead><tr><th>特性</th><th>异地多活</th><th>多区域部署</th></tr></thead>
              <tbody>
                <tr><td>数据同步</td><td>实时双向同步</td><td>主从单向复制</td></tr>
                <tr><td>写入能力</td><td>多地可写</td><td>仅主区域写</td></tr>
                <tr><td>复杂度</td><td>高</td><td>中</td></tr>
                <tr><td>成本</td><td>高</td><td>中</td></tr>
                <tr><td>适用场景</td><td>金融、电商</td><td>一般业务</td></tr>
              </tbody>
            </table>

            <h2>关键挑战</h2>
            <div className="info-box warning">
              <ul>
                <li><strong>数据一致性</strong> - 分布式事务、最终一致性</li>
                <li><strong>网络延迟</strong> - 跨地域同步延迟</li>
                <li><strong>冲突解决</strong> - 同时修改同一数据的冲突处理</li>
                <li><strong>流量调度</strong> - 智能DNS、就近接入</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>MySQL 跨地域复制</h2>
            <div className="code-block">
              <pre>{`# 主库配置 (北京)
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW
gtid_mode = ON
enforce_gtid_consistency = ON

# 从库配置 (上海)
[mysqld]
server-id = 2
relay-log = relay-bin
read_only = ON

# 从库连接主库
CHANGE MASTER TO
  MASTER_HOST = 'beijing-db.example.com',
  MASTER_USER = 'repl',
  MASTER_PASSWORD = 'password',
  MASTER_AUTO_POSITION = 1;

START SLAVE;`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

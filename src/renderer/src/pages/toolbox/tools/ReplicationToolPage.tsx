import { useState } from 'react'
import './ToolPage.css'

export default function ReplicationToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔄 读写分离</h1>
        <p>主从复制与读写路由策略</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>架构原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌──────────────────────────────────────────────────────┐
  │                    应用层                             │
  │  ┌──────────────────────────────────────────────┐   │
  │  │              读写路由中间件                    │   │
  │  │         写 → Master    读 → Slave            │   │
  │  └──────────────────────────────────────────────┘   │
  └──────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
  ┌───────────────┐              ┌───────────────┐
  │    Master     │   Binlog     │    Slave      │
  │   (读写)      │ ──────────▶  │    (只读)     │
  │               │   复制       │               │
  └───────────────┘              └───────────────┘
          │                               │
          ▼                               ▼
    写入数据                        读取数据
    INSERT/UPDATE                  SELECT
    DELETE
              `}</pre>
            </div>

            <h2>复制模式</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>异步复制</h3>
                <p>Master 不等待 Slave 确认，性能高但可能丢数据</p>
              </div>
              <div className="feature-card">
                <h3>半同步复制</h3>
                <p>等待至少一个 Slave 确认，性能与安全的平衡</p>
              </div>
              <div className="feature-card">
                <h3>全同步复制</h3>
                <p>等待所有 Slave 确认，最安全但性能最低</p>
              </div>
              <div className="feature-card">
                <h3>GTID 复制</h3>
                <p>全局事务ID，便于故障恢复和切换</p>
              </div>
            </div>

            <h2>数据一致性问题</h2>
            <table className="comparison-table">
              <thead><tr><th>问题</th><th>原因</th><th>解决方案</th></tr></thead>
              <tbody>
                <tr><td>主从延迟</td><td>复制需要时间</td><td>关键读走主库</td></tr>
                <tr><td>数据不一致</td><td>异步复制</td><td>半同步复制</td></tr>
                <tr><td>主从切换</td><td>主库故障</td><td>MHA/Orchestrator</td></tr>
              </tbody>
            </table>

            <h2>路由策略</h2>
            <div className="info-box">
              <ul>
                <li><strong>基于注解</strong> - @Master / @Slave 注解标记</li>
                <li><strong>基于SQL</strong> - INSERT/UPDATE/DELETE 走主，SELECT 走从</li>
                <li><strong>强制主库</strong> - 关键业务、事务内读走主库</li>
                <li><strong>权重路由</strong> - 多从库按权重分配读请求</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>读写路由模拟</h2>
            <ReadWriteDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>ShardingSphere 读写分离配置</h2>
            <div className="code-block">
              <pre>{`spring:
  shardingsphere:
    datasource:
      names: master,slave0,slave1
      master:
        type: com.zaxxer.hikari.HikariDataSource
        jdbc-url: jdbc:mysql://master:3306/db
      slave0:
        type: com.zaxxer.hikari.HikariDataSource
        jdbc-url: jdbc:mysql://slave0:3306/db
      slave1:
        type: com.zaxxer.hikari.HikariDataSource
        jdbc-url: jdbc:mysql://slave1:3306/db

    rules:
      readwrite-splitting:
        data-sources:
          myds:
            write-data-source-name: master
            read-data-source-names: slave0,slave1
            load-balancer-name: round_robin
        load-balancers:
          round_robin:
            type: ROUND_ROBIN`}</pre>
            </div>

            <h2>MyBatis 强制主库</h2>
            <div className="code-block">
              <pre>{`// 使用 Hint 强制走主库
HintManager.getInstance().setWriteRouteOnly(true);
userMapper.selectById(1L);
HintManager.clear();

// 或者使用 ThreadLocal
public class DataSourceContext {
    private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();

    public static void useMaster() {
        CONTEXT.set("master");
    }

    public static void clear() {
        CONTEXT.remove();
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReadWriteDemo() {
  const [sql, setSql] = useState('SELECT * FROM users WHERE id = 1')
  const [route, setRoute] = useState('')

  const analyze = () => {
    const upperSql = sql.trim().toUpperCase()
    if (upperSql.startsWith('SELECT')) {
      setRoute('Slave (从库) - 读操作')
    } else if (upperSql.startsWith('INSERT') || upperSql.startsWith('UPDATE') || upperSql.startsWith('DELETE')) {
      setRoute('Master (主库) - 写操作')
    } else {
      setRoute('Master (主库) - DDL/事务操作')
    }
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label>SQL 语句:</label>
        <input
          type="text"
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '8px' }}
        />
      </div>
      <button onClick={analyze}>分析路由</button>
      {route && (
        <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
          <strong>路由目标:</strong> {route}
        </div>
      )}
    </div>
  )
}

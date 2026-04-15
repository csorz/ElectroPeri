import { useState } from 'react'
import './ToolPage.css'

export default function ConnectionPoolToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔗 连接池</h1>
        <p>复用连接，减少连接创建开销</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>为什么需要连接池？</h2>
            <div className="info-box">
              <p>每次创建数据库连接的开销：</p>
              <ul>
                <li>TCP 三次握手：~1-3ms</li>
                <li>MySQL 认证：~1-2ms</li>
                <li>SSL 握手（如果启用）：~2-5ms</li>
                <li>总开销：~5-10ms</li>
              </ul>
              <p>使用连接池后，获取连接只需 <strong>~0.1ms</strong></p>
            </div>

            <h2>核心参数</h2>
            <table className="comparison-table">
              <thead><tr><th>参数</th><th>说明</th><th>推荐值</th></tr></thead>
              <tbody>
                <tr><td>maxPoolSize</td><td>最大连接数</td><td>CPU核心数 * 2 + 有效磁盘数</td></tr>
                <tr><td>minIdle</td><td>最小空闲连接</td><td>与 maxPoolSize 相同</td></tr>
                <tr><td>connectionTimeout</td><td>获取连接超时</td><td>30s</td></tr>
                <tr><td>idleTimeout</td><td>空闲连接超时</td><td>10min</td></tr>
                <tr><td>maxLifetime</td><td>连接最大生命周期</td><td>30min</td></tr>
              </tbody>
            </table>

            <h2>主流连接池对比</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>HikariCP</h3>
                <p>Spring Boot 默认，性能最高</p>
              </div>
              <div className="feature-card">
                <h3>Druid</h3>
                <p>阿里开源，监控功能丰富</p>
              </div>
              <div className="feature-card">
                <h3>c3p0</h3>
                <p>老牌连接池，性能较低</p>
              </div>
              <div className="feature-card">
                <h3>DBCP</h3>
                <p>Apache Commons，功能基础</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>连接池状态模拟</h2>
            <PoolStatusDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>HikariCP 配置</h2>
            <div className="code-block">
              <pre>{`HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/db");
config.setUsername("root");
config.setPassword("password");
config.setMaximumPoolSize(20);
config.setMinimumIdle(5);
config.setConnectionTimeout(30000);
config.setIdleTimeout(600000);
config.setMaxLifetime(1800000);
config.setPoolName("MyPool");

HikariDataSource ds = new HikariDataSource(config);

// 使用连接
try (Connection conn = ds.getConnection()) {
    // 执行查询
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PoolStatusDemo() {
  const [active, setActive] = useState(3)
  const [idle, setIdle] = useState(7)
  const maxPool = 10

  const borrow = () => { if (idle > 0) { setActive(active + 1); setIdle(idle - 1) } }
  const release = () => { if (active > 0) { setActive(active - 1); setIdle(idle + 1) } }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {Array.from({ length: maxPool }, (_, i) => (
          <div key={i} style={{
            width: '30px', height: '30px', borderRadius: '4px',
            background: i < active ? '#4caf50' : i < active + idle ? '#e0e0e0' : '#f5f5f5',
            border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', color: i < active ? '#fff' : '#666'
          }}>{i < active ? '●' : i < active + idle ? '○' : ''}</div>
        ))}
      </div>
      <p>活跃: {active} | 空闲: {idle} | 最大: {maxPool}</p>
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <button onClick={borrow} disabled={idle === 0}>获取连接</button>
        <button onClick={release} disabled={active === 0}>释放连接</button>
      </div>
    </div>
  )
}

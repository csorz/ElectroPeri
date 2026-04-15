import { useState } from 'react'
import './ToolPage.css'

export default function PostgresqlToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🐘 PostgreSQL</h1>
        <p>功能最强大的开源关系型数据库</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>完整 ACID</h3>
                <p>完整的事务支持，MVCC 并发控制</p>
              </div>
              <div className="feature-card">
                <h3>丰富数据类型</h3>
                <p>JSON/JSONB、数组、范围类型、自定义类型</p>
              </div>
              <div className="feature-card">
                <h3>扩展生态</h3>
                <p>PostGIS（GIS）、TimescaleDB（时序）、Citus（分布式）</p>
              </div>
              <div className="feature-card">
                <h3>高级查询</h3>
                <p>窗口函数、CTE、递归查询、物化视图</p>
              </div>
            </div>

            <h2>与 MySQL 对比</h2>
            <table className="comparison-table">
              <thead>
                <tr><th>特性</th><th>PostgreSQL</th><th>MySQL</th></tr>
              </thead>
              <tbody>
                <tr><td>JSON 支持</td><td>原生 JSONB，可索引</td><td>JSON 类型，部分索引</td></tr>
                <tr><td>数组类型</td><td>✅ 原生支持</td><td>❌ 不支持</td></tr>
                <tr><td>全文搜索</td><td>内置，支持中文</td><td>5.6+ 支持</td></tr>
                <tr><td>GIS</td><td>PostGIS 功能强大</td><td>基础空间支持</td></tr>
                <tr><td>复制</td><td>流复制、逻辑复制</td><td>主从复制、组复制</td></tr>
                <tr><td>窗口函数</td><td>完整支持</td><td>8.0+ 支持</td></tr>
              </tbody>
            </table>

            <h2>JSONB 操作</h2>
            <div className="info-box">
              <strong>JSONB 优势</strong>
              <ul>
                <li>二进制存储，查询更快</li>
                <li>支持 GIN 索引</li>
                <li>支持路径查询、嵌套查询</li>
                <li>适合存储半结构化数据</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>🗺️ GIS 应用</h4><p>PostGIS 提供强大的地理空间功能</p></div>
              <div className="scenario-card"><h4>📊 复杂查询</h4><p>分析型查询、报表统计</p></div>
              <div className="scenario-card"><h4>📱 移动应用</h4><p>JSON 存储灵活的移动端数据</p></div>
              <div className="scenario-card"><h4>🔬 科学计算</h4><p>数组、范围类型适合科学数据</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>JSONB 查询演示</h2>
            <JsonbQueryDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 连接 PostgreSQL</h2>
            <div className="code-block">
              <pre>{`import (
    "database/sql"
    "github.com/lib/pq"
)

db, _ := sql.Open("postgres", "postgres://user:pass@localhost/db?sslmode=disable")

// JSONB 查询
rows, _ := db.Query(\`
    SELECT data->>'name' as name
    FROM users
    WHERE data @> '{"active": true}'
\`)

// 使用 GIN 索引加速 JSONB 查询
// CREATE INDEX idx_data ON users USING GIN (data);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function JsonbQueryDemo() {
  const [query, setQuery] = useState(`SELECT * FROM users WHERE data @> '{"role": "admin"}'`)
  const [result, setResult] = useState('')

  const execute = () => {
    setResult(`执行结果:
{"id": 1, "name": "张三", "role": "admin", "active": true}
{"id": 3, "name": "王五", "role": "admin", "active": false}

扫描行数: 2
执行时间: 0.5ms
使用索引: idx_data (GIN)`)
  }

  return (
    <div>
      <textarea value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', height: '80px', fontFamily: 'monospace' }} />
      <button onClick={execute} style={{ marginTop: '8px' }}>执行查询</button>
      {result && <pre style={{ marginTop: '12px', background: '#1e1e1e', color: '#4fc3f7', padding: '12px', borderRadius: '6px' }}>{result}</pre>}
    </div>
  )
}

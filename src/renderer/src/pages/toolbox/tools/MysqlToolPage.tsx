import { useState } from 'react'
import './ToolPage.css'

export default function MysqlToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🐬 MySQL</h1>
        <p>最流行的开源关系型数据库</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>存储引擎</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>特性</th>
                  <th>InnoDB</th>
                  <th>MyISAM</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>事务</td><td>✅ 支持</td><td>❌ 不支持</td></tr>
                <tr><td>外键</td><td>✅ 支持</td><td>❌ 不支持</td></tr>
                <tr><td>行锁</td><td>✅ 支持</td><td>❌ 只有表锁</td></tr>
                <tr><td>崩溃恢复</td><td>✅ 支持</td><td>❌ 不支持</td></tr>
                <tr><td>全文索引</td><td>✅ 5.6+</td><td>✅ 支持</td></tr>
                <tr><td>适用场景</td><td>OLTP、高并发</td><td>只读、统计</td></tr>
              </tbody>
            </table>

            <h2>事务隔离级别</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>READ UNCOMMITTED</h3>
                <p>读未提交，可能读到脏数据，极少使用</p>
              </div>
              <div className="feature-card">
                <h3>READ COMMITTED</h3>
                <p>读已提交，避免脏读，Oracle 默认级别</p>
              </div>
              <div className="feature-card">
                <h3>REPEATABLE READ</h3>
                <p>可重复读，MySQL 默认，避免脏读、不可重复读</p>
              </div>
              <div className="feature-card">
                <h3>SERIALIZABLE</h3>
                <p>串行化，最高隔离级别，性能最低</p>
              </div>
            </div>

            <h2>索引类型</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>🌲 B+Tree 索引</h4>
                <p>默认索引类型，适合范围查询、排序</p>
              </div>
              <div className="scenario-card">
                <h4>🔗 Hash 索引</h4>
                <p>等值查询极快，不支持范围查询</p>
              </div>
              <div className="scenario-card">
                <h4>📝 全文索引</h4>
                <p>文本搜索，支持中文分词</p>
              </div>
              <div className="scenario-card">
                <h4>📍 空间索引</h4>
                <p>GIS 数据，地理位置查询</p>
              </div>
            </div>

            <h2>锁机制</h2>
            <div className="info-box">
              <strong>锁粒度</strong>
              <ul>
                <li><strong>全局锁</strong> - 整库只读，用于备份</li>
                <li><strong>表锁</strong> - 锁整张表，MyISAM 使用</li>
                <li><strong>行锁</strong> - 锁单行，InnoDB 使用，并发度高</li>
                <li><strong>间隙锁</strong> - 锁记录间隙，防止幻读</li>
              </ul>
            </div>

            <h2>主从复制</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │   Master    │ ────▶  │   Slave 1   │        │   Slave 2   │
  │  (写入)     │        │  (读取)     │        │  (读取)     │
  └─────────────┘        └─────────────┘        └─────────────┘
        │                      ▲                      ▲
        │      Binlog          │                      │
        └──────────────────────┴──────────────────────┘

  复制模式: 异步 / 半同步 / 组复制
              `}</pre>
            </div>

            <h2>性能优化要点</h2>
            <div className="info-box warning">
              <strong>⚠️ 常见优化建议</strong>
              <ul>
                <li>避免 SELECT *，只查需要的列</li>
                <li>使用 EXPLAIN 分析执行计划</li>
                <li>合理使用索引，避免索引失效</li>
                <li>大表查询使用 LIMIT 分页</li>
                <li>避免在 WHERE 子句中对字段进行函数操作</li>
                <li>使用连接池减少连接开销</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>EXPLAIN 执行计划分析</h2>
            <ExplainDemo />

            <h2>索引效果对比</h2>
            <IndexCompareDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>连接池配置（Go）</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "database/sql"
    "time"
    _ "github.com/go-sql-driver/mysql"
)

func main() {
    db, err := sql.Open("mysql", "user:password@tcp(127.0.0.1:3306)/dbname")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    // 连接池配置
    db.SetMaxOpenConns(100)              // 最大连接数
    db.SetMaxIdleConns(10)               // 最大空闲连接
    db.SetConnMaxLifetime(time.Hour)     // 连接最大生命周期
    db.SetConnMaxIdleTime(10 * time.Minute) // 空闲连接超时

    // 查询
    rows, _ := db.Query("SELECT id, name FROM users WHERE id = ?", 1)
    defer rows.Close()

    for rows.Next() {
        var id int
        var name string
        rows.Scan(&id, &name)
    }
}`}</pre>
            </div>

            <h2>事务处理</h2>
            <div className="code-block">
              <pre>{`// 事务示例
tx, err := db.Begin()
if err != nil {
    return err
}

// 使用 defer 处理回滚
defer func() {
    if err != nil {
        tx.Rollback()
    }
}()

// 执行多个操作
_, err = tx.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", 100, 1)
if err != nil {
    return err
}

_, err = tx.Exec("UPDATE accounts SET balance = balance + ? WHERE id = ?", 100, 2)
if err != nil {
    return err
}

// 提交事务
return tx.Commit()`}</pre>
            </div>

            <h2>批量插入优化</h2>
            <div className="code-block">
              <pre>{`// 批量插入 - 方式1: 多值 INSERT
INSERT INTO users (name, email) VALUES
    ('user1', 'user1@example.com'),
    ('user2', 'user2@example.com'),
    ('user3', 'user3@example.com');

// 批量插入 - 方式2: 使用事务
tx, _ := db.Begin()
stmt, _ := tx.Prepare("INSERT INTO users (name, email) VALUES (?, ?)")
defer stmt.Close()

for i := 0; i < 1000; i++ {
    stmt.Exec(fmt.Sprintf("user%d", i), fmt.Sprintf("user%d@example.com", i))
}
tx.Commit()`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ExplainDemo() {
  const [query, setQuery] = useState('SELECT * FROM users WHERE name = "张三"')
  const [result, setResult] = useState<string[]>([])

  const analyze = () => {
    // 模拟 EXPLAIN 结果
    const results = [
      'id: 1',
      'select_type: SIMPLE',
      'table: users',
      'type: ALL (全表扫描)',
      'possible_keys: NULL',
      'key: NULL (未使用索引)',
      'rows: 10000',
      'Extra: Using where',
      '',
      '⚠️ 优化建议:',
      '- type=ALL 表示全表扫描，考虑添加索引',
      '- 查询扫描了 10000 行，效率较低',
      '- 建议在 name 字段添加索引: CREATE INDEX idx_name ON users(name)'
    ]
    setResult(results)
  }

  return (
    <div className="explain-demo">
      <div className="query-input">
        <label>SQL 查询:</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>
      <button onClick={analyze} style={{ marginTop: '12px' }}>EXPLAIN 分析</button>
      {result.length > 0 && (
        <div className="result-box" style={{ marginTop: '12px' }}>
          <pre style={{ margin: 0, fontSize: '13px' }}>{result.join('\n')}</pre>
        </div>
      )}
    </div>
  )
}

function IndexCompareDemo() {
  const [withIndex, setWithIndex] = useState(false)

  return (
    <div className="index-demo">
      <div className="index-toggle">
        <button
          className={withIndex ? '' : 'active'}
          onClick={() => setWithIndex(false)}
          style={{ marginRight: '8px', padding: '8px 16px' }}
        >
          无索引
        </button>
        <button
          className={withIndex ? 'active' : ''}
          onClick={() => setWithIndex(true)}
          style={{ padding: '8px 16px' }}
        >
          有索引
        </button>
      </div>

      <div className="compare-visual" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ width: '80px', flexShrink: 0 }}>扫描行数:</span>
          <div style={{ flex: '1 1 100px', height: '24px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', minWidth: '100px' }}>
            <div
              style={{
                width: withIndex ? '5%' : '100%',
                height: '100%',
                background: withIndex ? '#4caf50' : '#ff9800',
                transition: 'width 0.3s'
              }}
            />
          </div>
          <span style={{ width: '60px', flexShrink: 0 }}>{withIndex ? '50' : '10000'}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '80px', flexShrink: 0 }}>查询时间:</span>
          <div style={{ flex: '1 1 100px', height: '24px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', minWidth: '100px' }}>
            <div
              style={{
                width: withIndex ? '10%' : '100%',
                height: '100%',
                background: withIndex ? '#4caf50' : '#ff9800',
                transition: 'width 0.3s'
              }}
            />
          </div>
          <span style={{ width: '60px', flexShrink: 0 }}>{withIndex ? '2ms' : '50ms'}</span>
        </div>
      </div>
    </div>
  )
}

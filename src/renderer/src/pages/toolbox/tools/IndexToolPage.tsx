import { useState } from 'react'
import './ToolPage.css'

export default function IndexToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔍 索引优化</h1>
        <p>数据库索引设计与优化策略</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>索引类型</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>主键索引</h3>
                <p>唯一标识一行，聚簇索引存储数据</p>
              </div>
              <div className="feature-card">
                <h3>唯一索引</h3>
                <p>字段值唯一，允许 NULL</p>
              </div>
              <div className="feature-card">
                <h3>普通索引</h3>
                <p>加速查询，允许重复值</p>
              </div>
              <div className="feature-card">
                <h3>复合索引</h3>
                <p>多字段组合，遵循最左前缀</p>
              </div>
            </div>

            <h2>B+Tree 索引结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
                    ┌─────────┐
                    │ Root    │
                    │ 20 | 40 │
                    └────┬────┘
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │ 5 | 10  │ │ 20 | 30 │ │ 40 | 50 │
        └────┬────┘ └────┬────┘ └────┬────┘
             │           │           │
        ┌────┴────┐ ┌────┴────┐ ┌────┴────┐
        │ 叶子节点 │ │ 叶子节点 │ │ 叶子节点 │
        │ 数据指针 │ │ 数据指针 │ │ 数据指针 │
        └─────────┘ └─────────┘ └─────────┘
              `}</pre>
            </div>

            <h2>索引失效场景</h2>
            <table className="comparison-table">
              <thead><tr><th>场景</th><th>示例</th><th>原因</th></tr></thead>
              <tbody>
                <tr><td>LIKE 左模糊</td><td>LIKE '%abc'</td><td>无法使用索引</td></tr>
                <tr><td>函数操作</td><td>WHERE YEAR(date) = 2024</td><td>破坏索引有序性</td></tr>
                <tr><td>类型转换</td><td>WHERE str_col = 123</td><td>隐式转换</td></tr>
                <tr><td>OR 条件</td><td>WHERE a = 1 OR b = 2</td><td>可能不走索引</td></tr>
                <tr><td>不等于</td><td>WHERE col != 1</td><td>全表扫描</td></tr>
                <tr><td>IS NOT NULL</td><td>WHERE col IS NOT NULL</td><td>可能全表扫描</td></tr>
              </tbody>
            </table>

            <h2>最左前缀原则</h2>
            <div className="info-box">
              <strong>复合索引 (a, b, c)</strong>
              <ul>
                <li>✅ WHERE a = 1</li>
                <li>✅ WHERE a = 1 AND b = 2</li>
                <li>✅ WHERE a = 1 AND b = 2 AND c = 3</li>
                <li>❌ WHERE b = 2（缺少 a）</li>
                <li>❌ WHERE c = 3（缺少 a, b）</li>
                <li>⚠️ WHERE a = 1 AND c = 3（只用 a）</li>
              </ul>
            </div>

            <h2>索引设计原则</h2>
            <div className="info-box warning">
              <ul>
                <li>选择区分度高的列（选择性高）</li>
                <li>频繁查询的列建立索引</li>
                <li>外键列建立索引</li>
                <li>复合索引顺序：等值 → 范围 → 排序</li>
                <li>避免冗余索引</li>
                <li>定期维护索引统计信息</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>索引选择性分析</h2>
            <SelectivityDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>索引创建语句</h2>
            <div className="code-block">
              <pre>{`-- 创建索引
CREATE INDEX idx_name ON users(name);
CREATE UNIQUE INDEX idx_email ON users(email);
CREATE INDEX idx_composite ON orders(user_id, created_at, status);

-- 查看执行计划
EXPLAIN SELECT * FROM users WHERE name = '张三';

-- 查看索引使用情况
SHOW INDEX FROM users;

-- 分析表
ANALYZE TABLE users;

-- 强制使用索引
SELECT * FROM users FORCE INDEX(idx_name) WHERE name = '张三';

-- 删除索引
DROP INDEX idx_name ON users;`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SelectivityDemo() {
  const [totalRows, setTotalRows] = useState(10000)
  const [distinctValues, setDistinctValues] = useState(100)

  const selectivity = (distinctValues / totalRows * 100).toFixed(2)
  const recommendation = distinctValues / totalRows > 0.1 ? '✅ 适合建索引' : '⚠️ 选择性较低，考虑其他列'

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label>总行数: </label>
        <input type="number" value={totalRows} onChange={(e) => setTotalRows(parseInt(e.target.value) || 1)} />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label>不同值数量: </label>
        <input type="number" value={distinctValues} onChange={(e) => setDistinctValues(parseInt(e.target.value) || 1)} />
      </div>
      <div style={{ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '6px' }}>
        <p><strong>选择性:</strong> {selectivity}%</p>
        <p><strong>建议:</strong> {recommendation}</p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          选择性 = 不同值数量 / 总行数，越高越适合建索引
        </p>
      </div>
    </div>
  )
}

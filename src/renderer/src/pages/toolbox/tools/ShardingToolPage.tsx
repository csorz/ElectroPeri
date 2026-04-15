import { useState } from 'react'
import './ToolPage.css'

export default function ShardingToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📊 分库分表</h1>
        <p>数据库水平拆分策略与实现</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>为什么需要分库分表？</h2>
            <div className="info-box">
              <p>当单表数据量超过千万级，单库性能下降明显：</p>
              <ul>
                <li>查询变慢（索引树过深）</li>
                <li>写入瓶颈（锁竞争）</li>
                <li>备份恢复时间长</li>
                <li>单机存储容量限制</li>
              </ul>
            </div>

            <h2>拆分策略</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>垂直拆分</h3>
                <p>按业务拆分，不同表分到不同库</p>
                <small>用户库、订单库、商品库</small>
              </div>
              <div className="feature-card">
                <h3>水平拆分</h3>
                <p>同表数据按规则分散到多库多表</p>
                <small>订单表 → 订单表1、订单表2...</small>
              </div>
            </div>

            <h2>分片键选择</h2>
            <table className="comparison-table">
              <thead><tr><th>分片键</th><th>优点</th><th>缺点</th></tr></thead>
              <tbody>
                <tr><td>用户ID</td><td>用户数据聚合</td><td>跨用户查询困难</td></tr>
                <tr><td>订单ID</td><td>订单相关查询快</td><td>用户维度查询需广播</td></tr>
                <tr><td>时间</td><td>范围查询友好</td><td>数据分布不均</td></tr>
                <tr><td>取模</td><td>数据均匀分布</td><td>扩容复杂</td></tr>
              </tbody>
            </table>

            <h2>分片算法</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>🔢 取模分片</h4>
                <p>shard = id % N</p>
                <p style={{fontSize: '12px', color: '#888'}}>简单均匀，扩容需数据迁移</p>
              </div>
              <div className="scenario-card">
                <h4>📏 范围分片</h4>
                <p>id 1-10000 → shard1</p>
                <p style={{fontSize: '12px', color: '#888'}}>范围查询友好，可能热点</p>
              </div>
              <div className="scenario-card">
                <h4>🎯 一致性哈希</h4>
                <p>hash(id) → 环上节点</p>
                <p style={{fontSize: '12px', color: '#888'}}>扩容影响小，数据迁移少</p>
              </div>
              <div className="scenario-card">
                <h4>📍 地理位置分片</h4>
                <p>按地区分片</p>
                <p style={{fontSize: '12px', color: '#888'}}>地域性业务，就近访问</p>
              </div>
            </div>

            <h2>常见问题与解决方案</h2>
            <div className="info-box warning">
              <strong>⚠️ 挑战</strong>
              <ul>
                <li><strong>跨分片查询</strong> - 使用冗余数据、数据同步</li>
                <li><strong>分布式事务</strong> - 最终一致性、Saga 模式</li>
                <li><strong>全局唯一ID</strong> - 雪花算法、号段模式</li>
                <li><strong>数据迁移</strong> - 双写迁移、增量同步</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>分片策略模拟</h2>
            <ShardingDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>ShardingSphere 配置</h2>
            <div className="code-block">
              <pre>{`# application.yml
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/db0
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/db1

    rules:
      sharding:
        tables:
          t_order:
            actual-data-nodes: ds$->{0..1}.t_order_$->{0..1}
            table-strategy:
              standard:
                sharding-column: order_id
                sharding-algorithm-name: t_order_inline
            sharding-algorithms:
              t_order_inline:
                type: INLINE
                props:
                  algorithm-expression: t_order_$->{order_id % 2}`}</pre>
            </div>

            <h2>雪花算法生成 ID</h2>
            <div className="code-block">
              <pre>{`// Go 雪花算法
import "github.com/bwmarrin/snowflake"

node, _ := snowflake.NewNode(1)
id := node.Generate()  // 64位唯一ID

// ID 结构:
// | 1位符号 | 41位时间戳 | 10位机器ID | 12位序列号 |
// |   0    |  毫秒级时间  |  5位数据中心+5位机器 |  同毫秒内序列 |`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ShardingDemo() {
  const [shardKey, setShardKey] = useState(12345)
  const [shardCount, setShardCount] = useState(4)

  const getShard = (id: number, count: number) => id % count

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label>分片键值: </label>
        <input type="number" value={shardKey} onChange={(e) => setShardKey(parseInt(e.target.value) || 0)} />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label>分片数量: </label>
        <select value={shardCount} onChange={(e) => setShardCount(parseInt(e.target.value))}>
          <option value={2}>2 分片</option>
          <option value={4}>4 分片</option>
          <option value={8}>8 分片</option>
        </select>
      </div>
      <div style={{ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '6px' }}>
        <p><strong>计算过程:</strong></p>
        <code>shard = {shardKey} % {shardCount} = {getShard(shardKey, shardCount)}</code>
        <p style={{ marginTop: '12px' }}><strong>目标分片:</strong> shard_{getShard(shardKey, shardCount)}</p>
      </div>
    </div>
  )
}

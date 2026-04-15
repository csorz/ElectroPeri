import { useState } from 'react'
import './ToolPage.css'

export default function MongodbToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🍃 MongoDB</h1>
        <p>流行的文档型 NoSQL 数据库</p>
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
                <h3>文档存储</h3>
                <p>BSON 格式，灵活 Schema，嵌套文档</p>
              </div>
              <div className="feature-card">
                <h3>水平扩展</h3>
                <p>分片集群，自动数据分布</p>
              </div>
              <div className="feature-card">
                <h3>高可用</h3>
                <p>副本集，自动故障转移</p>
              </div>
              <div className="feature-card">
                <h3>丰富查询</h3>
                <p>聚合管道、全文搜索、地理查询</p>
              </div>
            </div>

            <h2>与关系型数据库对比</h2>
            <table className="comparison-table">
              <thead><tr><th>概念</th><th>MongoDB</th><th>关系型</th></tr></thead>
              <tbody>
                <tr><td>数据结构</td><td>文档 (Document)</td><td>行 (Row)</td></tr>
                <tr><td>存储单位</td><td>集合 (Collection)</td><td>表 (Table)</td></tr>
                <tr><td>字段</td><td>字段 (Field)</td><td>列 (Column)</td></tr>
                <tr><td>主键</td><td>_id</td><td>主键</td></tr>
                <tr><td>外键</td><td>引用/嵌入</td><td>外键关联</td></tr>
                <tr><td>Schema</td><td>灵活</td><td>固定</td></tr>
              </tbody>
            </table>

            <h2>副本集架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌─────────────────────────────────────────────────────┐
  │                    副本集 (Replica Set)              │
  │                                                     │
  │   ┌─────────┐      ┌─────────┐      ┌─────────┐    │
  │   │ Primary │ ───▶ │Secondary│      │Secondary│    │
  │   │  (读写)  │      │  (只读) │      │  (只读) │    │
  │   └────┬────┘      └────┬────┘      └────┬────┘    │
  │        │                │                │         │
  │        └────────────────┴────────────────┘         │
  │                    Oplog 复制                      │
  │                                                     │
  │   ┌─────────┐                                      │
  │   │Arbiter  │  仲裁节点（不存数据，仅投票）         │
  │   └─────────┘                                      │
  └─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>分片集群</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  mongos  │    │  mongos  │    │  mongos  │   路由层
  └────┬─────┘    └────┬─────┘    └────┬─────┘
       │               │               │
       └───────────────┴───────────────┘
                       │
  ┌────────────────────┴────────────────────┐
  │              Config Servers              │   配置服务器
  └────────────────────┬────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
  ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
  │ Shard 1 │    │ Shard 2 │    │ Shard 3 │   数据分片
  │(副本集) │    │(副本集) │    │(副本集) │
  └─────────┘    └─────────┘    └─────────┘
              `}</pre>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>📝 内容管理</h4><p>灵活 Schema 适合内容多变场景</p></div>
              <div className="scenario-card"><h4>📊 日志收集</h4><p>高写入、嵌套结构</p></div>
              <div className="scenario-card"><h4>🛒 电商商品</h4><p>商品属性差异大</p></div>
              <div className="scenario-card"><h4>📱 移动后端</h4><p>快速迭代，Schema 灵活</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>聚合管道演示</h2>
            <AggregationDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Node.js 连接 MongoDB</h2>
            <div className="code-block">
              <pre>{`const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');

async function main() {
  await client.connect();
  const db = client.db('test');
  const users = db.collection('users');

  // 插入文档
  await users.insertOne({
    name: '张三',
    age: 25,
    address: { city: '北京', district: '朝阳' },
    tags: ['developer', 'golang']
  });

  // 查询
  const result = await users.find({ 'address.city': '北京' }).toArray();

  // 聚合
  const stats = await users.aggregate([
    { $match: { age: { $gte: 20 } } },
    { $group: { _id: '$address.city', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
}`}</pre>
            </div>

            <h2>Go 连接 MongoDB</h2>
            <div className="code-block">
              <pre>{`import (
    "context"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

client, _ := mongo.Connect(context.TODO(), options.Client().ApplyURI("mongodb://localhost:27017"))
coll := client.Database("test").Collection("users")

// 插入
coll.InsertOne(context.TODO(), bson.D{
    {"name", "张三"},
    {"age", 25},
})

// 查询
cursor, _ := coll.Find(context.TODO(), bson.M{"age": bson.M{"$gte": 20}})`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AggregationDemo() {
  const [pipeline, setPipeline] = useState(`[
  { "$match": { "status": "active" } },
  { "$group": { "_id": "$category", "total": { "$sum": "$amount" } } },
  { "$sort": { "total": -1 } }
]`)

  return (
    <div>
      <label>聚合管道:</label>
      <textarea value={pipeline} onChange={(e) => setPipeline(e.target.value)} style={{ width: '100%', height: '120px', fontFamily: 'monospace', marginTop: '8px' }} />
      <div style={{ marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
        <h4>阶段说明:</h4>
        <ul style={{ fontSize: '13px' }}>
          <li><code>$match</code> - 过滤文档，类似 WHERE</li>
          <li><code>$group</code> - 分组聚合，类似 GROUP BY</li>
          <li><code>$sort</code> - 排序，类似 ORDER BY</li>
          <li><code>$project</code> - 字段投影，类似 SELECT</li>
          <li><code>$lookup</code> - 关联查询，类似 LEFT JOIN</li>
        </ul>
      </div>
    </div>
  )
}

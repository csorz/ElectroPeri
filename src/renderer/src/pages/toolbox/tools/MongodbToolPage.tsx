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
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>常用命令</button>
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
            <h2>连接与状态</h2>
            <div className="code-block">
              <pre>{`-- 连接数据库
mongosh "mongodb://localhost:27017"
mongosh "mongodb://user:pass@localhost:27017/dbname"
mongosh "mongodb+srv://cluster.example.com/dbname" --username user

-- 查看状态
db.version()
db.stats()
db.serverStatus()
db.hostInfo()

-- 切换数据库
use dbname                    -- 不存在则创建
show dbs                      -- 列出数据库
db.getName()                  -- 当前数据库

-- 查看集合
show collections
db.getCollectionNames()`}</pre>
            </div>

            <h2>集合与文档操作</h2>
            <div className="code-block">
              <pre>{`-- 创建集合
db.createCollection("users")
db.createCollection("logs", { capped: true, size: 10000000 })  -- 固定大小

-- 删除集合
db.users.drop()

-- 插入文档
db.users.insertOne({ name: "张三", age: 25, email: "zhangsan@example.com" })
db.users.insertMany([
    { name: "李四", age: 30 },
    { name: "王五", age: 28 }
])

-- 查询文档
db.users.find()
db.users.findOne({ name: "张三" })
db.users.find({ age: { $gt: 25 } })
db.users.find({ name: "张三" }, { name: 1, age: 1, _id: 0 })  -- 投影

-- 更新文档
db.users.updateOne({ name: "张三" }, { $set: { age: 26 } })
db.users.updateMany({ age: { $lt: 30 } }, { $inc: { age: 1 } })
db.users.replaceOne({ name: "张三" }, { name: "张三", age: 30 })

-- 删除文档
db.users.deleteOne({ name: "张三" })
db.users.deleteMany({ age: { $lt: 20 } })
db.users.deleteMany({})        -- 删除所有`}</pre>
            </div>

            <h2>查询操作符</h2>
            <div className="code-block">
              <pre>{`-- 比较操作符
db.users.find({ age: { $eq: 25 } })      -- 等于
db.users.find({ age: { $ne: 25 } })      -- 不等于
db.users.find({ age: { $gt: 25 } })      -- 大于
db.users.find({ age: { $gte: 25 } })     -- 大于等于
db.users.find({ age: { $lt: 30 } })      -- 小于
db.users.find({ age: { $lte: 30 } })     -- 小于等于
db.users.find({ age: { $in: [25, 30, 35] } })  -- 在列表中
db.users.find({ age: { $nin: [25, 30] } })     -- 不在列表中

-- 逻辑操作符
db.users.find({ $and: [{ age: { $gt: 20 } }, { age: { $lt: 30 } }] })
db.users.find({ $or: [{ age: 25 }, { age: 30 }] })
db.users.find({ age: { $not: { $gt: 30 } } })
db.users.find({ age: { $nor: [25, 30] } })

-- 元素操作符
db.users.find({ email: { $exists: true } })    -- 字段存在
db.users.find({ age: { $type: "int" } })       -- 类型匹配

-- 数组操作符
db.users.find({ tags: "dev" })                 -- 数组包含元素
db.users.find({ tags: { $all: ["dev", "go"] } })  -- 包含所有
db.users.find({ tags: { $size: 3 } })          -- 数组长度
db.users.find({ tags: { $elemMatch: { $gt: 5 } } })  -- 元素匹配`}</pre>
            </div>

            <h2>更新操作符</h2>
            <div className="code-block">
              <pre>{`-- 字段更新
db.users.updateOne({ _id: 1 }, { $set: { name: "新名字" } })      -- 设置字段
db.users.updateOne({ _id: 1 }, { $unset: { email: "" } })        -- 删除字段
db.users.updateOne({ _id: 1 }, { $rename: { name: "username" } }) -- 重命名字段
db.users.updateOne({ _id: 1 }, { $inc: { age: 1 } })             -- 数值增加
db.users.updateOne({ _id: 1 }, { $mul: { price: 1.1 } })         -- 数值乘法

-- 数组更新
db.users.updateOne({ _id: 1 }, { $push: { tags: "new" } })       -- 添加元素
db.users.updateOne({ _id: 1 }, { $push: { tags: { $each: ["a", "b"] } } })  -- 批量添加
db.users.updateOne({ _id: 1 }, { $pull: { tags: "old" } })       -- 删除元素
db.users.updateOne({ _id: 1 }, { $pullAll: { tags: ["a", "b"] } })  -- 批量删除
db.users.updateOne({ _id: 1 }, { $addToSet: { tags: "unique" } }) -- 添加不重复元素
db.users.updateOne({ _id: 1 }, { $pop: { tags: 1 } })            -- 删除最后一个
db.users.updateOne({ _id: 1 }, { $pop: { tags: -1 } })           -- 删除第一个

-- 位运算
db.users.updateOne({ _id: 1 }, { $bit: { flags: { and: 5 } } })`}</pre>
            </div>

            <h2>聚合管道</h2>
            <div className="code-block">
              <pre>{`-- 基本聚合
db.orders.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$customerId", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
    { $limit: 10 }
])

-- 常用阶段
{ $project: { name: 1, age: 1, _id: 0 } }    -- 字段投影
{ $match: { age: { $gt: 20 } } }              -- 过滤
{ $group: { _id: "$category", count: { $sum: 1 } } }  -- 分组
{ $sort: { age: -1 } }                        -- 排序
{ $skip: 10 }                                 -- 跳过
{ $limit: 10 }                                -- 限制
{ $unwind: "$tags" }                          -- 展开数组
{ $lookup: {                                  -- 关联查询
    from: "orders",
    localField: "_id",
    foreignField: "userId",
    as: "orders"
}}

-- 聚合函数
{ $sum: 1 }                    -- 计数
{ $sum: "$amount" }            -- 求和
{ $avg: "$age" }               -- 平均值
{ $min: "$age" }               -- 最小值
{ $max: "$age" }               -- 最大值
{ $first: "$name" }            -- 第一个
{ $last: "$name" }             -- 最后一个
{ $push: "$name" }             -- 推入数组
{ $addToSet: "$name" }         -- 推入不重复数组`}</pre>
            </div>

            <h2>索引操作</h2>
            <div className="code-block">
              <pre>{`-- 创建索引
db.users.createIndex({ name: 1 })                    -- 升序索引
db.users.createIndex({ name: 1, age: -1 })           -- 复合索引
db.users.createIndex({ email: 1 }, { unique: true }) -- 唯一索引
db.users.createIndex({ location: "2dsphere" })       -- 地理空间索引
db.users.createIndex({ content: "text" })            -- 全文索引
db.users.createIndex({ name: 1 }, { background: true })  -- 后台创建

-- 查看索引
db.users.getIndexes()

-- 删除索引
db.users.dropIndex("name_1")
db.users.dropIndexes()           -- 删除所有索引（除_id）

-- 查看索引大小
db.users.totalIndexSize()

-- 强制使用索引
db.users.find({ name: "张三" }).hint({ name: 1 })

-- 执行计划
db.users.find({ name: "张三" }).explain("executionStats")`}</pre>
            </div>

            <h2>用户与权限</h2>
            <div className="code-block">
              <pre>{`-- 创建管理员
use admin
db.createUser({
    user: "admin",
    pwd: "password123",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

-- 创建应用用户
use mydb
db.createUser({
    user: "app_user",
    pwd: "password",
    roles: [ { role: "readWrite", db: "mydb" } ]
})

-- 内置角色
read                    -- 只读
readWrite               -- 读写
dbAdmin                 -- 数据库管理
userAdmin               -- 用户管理
root                    -- 超级管理员

-- 查看用户
db.getUsers()
show users

-- 删除用户
db.dropUser("app_user")

-- 更新密码
db.changeUserPassword("app_user", "new_password")`}</pre>
            </div>

            <h2>备份与恢复</h2>
            <div className="code-block">
              <pre>{`-- mongodump 备份
mongodump --db mydb --out /backup/
mongodump --uri="mongodb://user:pass@localhost:27017/mydb" --out /backup/
mongodump --db mydb --collection users --out /backup/

-- mongorestore 恢复
mongorestore --db mydb /backup/mydb/
mongorestore --drop --db mydb /backup/mydb/  -- 恢复前删除

-- mongoexport 导出
mongoexport --db mydb --collection users --out users.json
mongoexport --db mydb --collection users --type=csv --fields name,age --out users.csv

-- mongoimport 导入
mongoimport --db mydb --collection users --file users.json
mongoimport --db mydb --collection users --type=csv --headerline --file users.csv`}</pre>
            </div>

            <h2>副本集管理</h2>
            <div className="code-block">
              <pre>{`-- 初始化副本集
rs.initiate({
    _id: "rs0",
    members: [
        { _id: 0, host: "mongo1:27017" },
        { _id: 1, host: "mongo2:27017" },
        { _id: 2, host: "mongo3:27017" }
    ]
})

-- 查看状态
rs.status()
rs.conf()

-- 添加/删除成员
rs.add("mongo4:27017")
rs.remove("mongo4:27017")

-- 添加仲裁节点
rs.addArb("arbiter:27017")

-- 查看复制延迟
rs.printSlaveReplicationInfo()

-- 切换主节点
rs.stepDown()`}</pre>
            </div>

            <h2>性能监控</h2>
            <div className="code-block">
              <pre>{`-- 慢查询日志
db.setProfilingLevel(1, 50)    -- 记录超过50ms的查询
db.system.profile.find().sort({ ts: -1 }).limit(10)

-- 当前操作
db.currentOp()
db.currentOp({ "secs_running": { $gt: 5 } })  -- 运行超过5秒

-- 终止操作
db.killOp(opId)

-- 集合统计
db.users.stats()
db.users.dataSize()
db.users.storageSize()

-- 服务器指标
db.serverStatus().connections
db.serverStatus().opcounters
db.serverStatus().mem

-- 索引使用情况
db.users.aggregate([ { $indexStats: {} } ])`}</pre>
            </div>

            <h2>实用技巧</h2>
            <div className="code-block">
              <pre>{`-- 分页查询
db.users.find().skip(100).limit(20)

-- 批量更新
var bulk = db.users.initializeUnorderedBulkOp();
bulk.find({ age: { $lt: 30 } }).update({ $set: { category: "young" } });
bulk.find({ age: { $gte: 30 } }).update({ $set: { category: "adult" } });
bulk.execute();

-- 查找重复
db.users.aggregate([
    { $group: { _id: "$email", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
])

-- 批量删除
db.users.deleteMany({ createdAt: { $lt: new Date("2024-01-01") } })

-- 计时查询
db.users.find({ name: "张三" }).explain("executionStats").executionStats.executionTimeMillis

-- 格式化输出
db.users.find().pretty()`}</pre>
            </div>
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
cursor, _ := coll.Find(context.TODO(), bson.M{"age": bson.M{"$gte": 20}})
var results []bson.M
cursor.All(context.TODO(), &results)

// 聚合
pipeline := mongo.Pipeline{
    {{"$match", bson.D{{"age", bson.D{{"$gte", 20}}}}}},
    {{"$group", bson.D{{"_id", "$city"}, {"count", bson.D{{"$sum", 1}}}}}},
}
cursor, _ = coll.Aggregate(context.TODO(), pipeline)`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import './ToolPage.css'

export default function RedisCacheToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>💾 Redis 缓存策略</h1>
        <p>缓存模式、过期策略、内存淘汰机制</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>常用命令</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>缓存模式</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Cache Aside</h3>
                <p>旁路缓存，应用维护缓存，最常用模式</p>
                <small>读：先缓存后DB；写：先DB后删缓存</small>
              </div>
              <div className="feature-card">
                <h3>Read Through</h3>
                <p>缓存代理读取，应用只访问缓存</p>
              </div>
              <div className="feature-card">
                <h3>Write Through</h3>
                <p>写入时同步更新缓存和DB</p>
              </div>
              <div className="feature-card">
                <h3>Write Behind</h3>
                <p>异步写入DB，高性能但有数据丢失风险</p>
              </div>
            </div>

            <h2>过期策略</h2>
            <div className="info-box">
              <ul>
                <li><strong>定时删除</strong> - 创建定时器，到期删除（CPU消耗大）</li>
                <li><strong>惰性删除</strong> - 访问时检查过期（内存占用高）</li>
                <li><strong>定期删除</strong> - 定期随机检查删除（折中方案）</li>
              </ul>
              <p>Redis 采用：<strong>惰性删除 + 定期删除</strong></p>
            </div>

            <h2>内存淘汰策略</h2>
            <table className="comparison-table">
              <thead><tr><th>策略</th><th>说明</th></tr></thead>
              <tbody>
                <tr><td>noeviction</td><td>不淘汰，内存满时返回错误</td></tr>
                <tr><td>allkeys-lru</td><td>所有键中淘汰最久未使用</td></tr>
                <tr><td>volatile-lru</td><td>设置了过期时间的键中淘汰LRU</td></tr>
                <tr><td>allkeys-lfu</td><td>所有键中淘汰最少使用</td></tr>
                <tr><td>volatile-lfu</td><td>设置了过期时间的键中淘汰LFU</td></tr>
                <tr><td>allkeys-random</td><td>随机淘汰</td></tr>
                <tr><td>volatile-random</td><td>过期键中随机淘汰</td></tr>
                <tr><td>volatile-ttl</td><td>淘汰即将过期的键</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>连接与状态</h2>
            <div className="code-block">
              <pre>{`-- 连接 Redis
redis-cli
redis-cli -h 127.0.0.1 -p 6379 -a password
redis-cli -u redis://user:password@localhost:6379/0

-- 查看信息
INFO                        -- 查看所有信息
INFO memory                 -- 内存信息
INFO stats                  -- 统计信息
INFO replication            -- 复制信息

-- 查看配置
CONFIG GET maxmemory
CONFIG GET maxmemory-policy
CONFIG GET timeout

-- 修改配置
CONFIG SET maxmemory 1gb
CONFIG SET maxmemory-policy allkeys-lru

-- 查看数据库
SELECT 0                    -- 切换数据库（默认16个库）
DBSIZE                      -- 当前库键数量
FLUSHDB                     -- 清空当前库
FLUSHALL                    -- 清空所有库`}</pre>
            </div>

            <h2>字符串操作 (String)</h2>
            <div className="code-block">
              <pre>{`-- 基本操作
SET key value              -- 设置值
GET key                     -- 获取值
DEL key                     -- 删除
EXISTS key                  -- 检查存在
TYPE key                    -- 查看类型

-- 带选项设置
SET key value EX 3600       -- 设置并过期（秒）
SET key value PX 60000      -- 过期（毫秒）
SET key value NX            -- 不存在才设置
SET key value XX            -- 存在才设置
SETEX key 3600 value        -- 设置并过期
SETNX key value             -- 不存在才设置

-- 批量操作
MSET key1 val1 key2 val2    -- 批量设置
MGET key1 key2              -- 批量获取

-- 数值操作
INCR key                    -- 加1
INCRBY key 10               -- 加指定值
DECR key                    -- 减1
DECRBY key 10               -- 减指定值
INCRBYFLOAT key 2.5         -- 加浮点数

-- 字符串操作
APPEND key suffix           -- 追加
STRLEN key                  -- 长度
GETRANGE key 0 10           -- 获取子串
SETRANGE key 0 new          -- 替换子串`}</pre>
            </div>

            <h2>哈希操作 (Hash)</h2>
            <div className="code-block">
              <pre>{`-- 基本操作
HSET user:1 name "张三" age 25        -- 设置字段
HGET user:1 name                      -- 获取字段
HMSET user:1 name "李四" email "li@example.com"  -- 批量设置
HMGET user:1 name age                 -- 批量获取
HGETALL user:1                        -- 获取所有字段
HDEL user:1 age                       -- 删除字段
HEXISTS user:1 name                   -- 检查字段存在
HLEN user:1                           -- 字段数量

-- 数值操作
HINCRBY user:1 age 1                  -- 字段加值
HINCRBYFLOAT user:1 score 0.5         -- 字段加浮点数

-- 其他操作
HKEYS user:1                          -- 获取所有字段名
HVALS user:1                          -- 获取所有字段值
HSETNX user:1 name "王五"             -- 字段不存在才设置`}</pre>
            </div>

            <h2>列表操作 (List)</h2>
            <div className="code-block">
              <pre>{`-- 基本操作
LPUSH list a b c                       -- 左侧插入
RPUSH list x y z                       -- 右侧插入
LPOP list                              -- 左侧弹出
RPOP list                              -- 右侧弹出
LLEN list                              -- 列表长度

-- 查询
LRANGE list 0 -1                       -- 获取所有元素
LRANGE list 0 10                       -- 获取前11个元素
LINDEX list 0                          -- 获取指定位置元素

-- 修改
LSET list 0 new_value                  -- 设置指定位置值
LTRIM list 0 99                        -- 只保留前100个

-- 阻塞操作（消息队列场景）
BLPOP list1 list2 10                   -- 阻塞左侧弹出（超时10秒）
BRPOP list1 list2 10                   -- 阻塞右侧弹出

-- 其他
LINSERT list BEFORE "a" "new"          -- 在元素前插入
LINSERT list AFTER "a" "new"           -- 在元素后插入
LREM list 2 "a"                        -- 删除2个值为a的元素
RPOPLPUSH source dest                  -- 弹出并推入另一个列表`}</pre>
            </div>

            <h2>集合操作 (Set)</h2>
            <div className="code-block">
              <pre>{`-- 基本操作
SADD set a b c                         -- 添加元素
SREM set a                             -- 删除元素
SISMEMBER set a                        -- 检查成员
SCARD set                              -- 元素数量
SMEMBERS set                           -- 获取所有元素

-- 随机操作
SRANDMEMBER set                        -- 随机获取元素
SPOP set                               -- 随机弹出元素

-- 集合运算
SINTER set1 set2                       -- 交集
SUNION set1 set2                       -- 并集
SDIFF set1 set2                        -- 差集
SINTERCARD set1 set2                   -- 交集元素数量

-- 移动
SMOVE source dest member               -- 移动元素`}</pre>
            </div>

            <h2>有序集合 (Sorted Set)</h2>
            <div className="code-block">
              <pre>{`-- 基本操作
ZADD zset 100 "张三" 90 "李四"         -- 添加元素（带分数）
ZREM zset "张三"                       -- 删除元素
ZSCORE zset "张三"                     -- 获取分数
ZCARD zset                             -- 元素数量
ZCOUNT zset 80 100                     -- 分数范围内元素数量

-- 排序查询
ZRANGE zset 0 -1                       -- 按分数升序
ZRANGE zset 0 -1 WITHSCORES            -- 带分数
ZREVRANGE zset 0 -1                    -- 按分数降序
ZRANGEBYSCORE zset 80 100              -- 按分数范围查询
ZRANK zset "张三"                      -- 获取排名（升序）
ZREVRANK zset "张三"                   -- 获取排名（降序）

-- 分数操作
ZINCRBY zset 10 "张三"                 -- 增加分数

-- 集合运算
ZUNIONSTORE result 2 zset1 zset2       -- 并集存入result
ZINTERSTORE result 2 zset1 zset2       -- 交集存入result`}</pre>
            </div>

            <h2>键操作与过期</h2>
            <div className="code-block">
              <pre>{`-- 查找键
KEYS pattern                           -- 查找匹配的键（慎用，阻塞）
SCAN 0 MATCH user:* COUNT 100          -- 游标扫描（推荐）

-- 过期时间
EXPIRE key 3600                        -- 设置过期（秒）
EXPIREAT key 1700000000                -- 设置过期时间戳
TTL key                                -- 查看剩余时间（秒）
PTTL key                               -- 查看剩余时间（毫秒）
PERSIST key                            -- 移除过期时间

-- 键操作
RENAME oldkey newkey                   -- 重命名
MOVE key 1                             -- 移动到其他数据库
DUMP key                               -- 序列化
RESTORE key 0 serialized_value         -- 反序列化

-- 排序
SORT list BY weight_* GET object_*     -- 排序`}</pre>
            </div>

            <h2>发布订阅</h2>
            <div className="code-block">
              <pre>{`-- 订阅
SUBSCRIBE channel1 channel2            -- 订阅频道
PSUBSCRIBE news:*                      -- 订阅模式

-- 发布
PUBLISH channel1 "message"             -- 发布消息

-- 查看订阅信息
PUBSUB CHANNELS                        -- 查看活跃频道
PUBSUB NUMSUB channel1                 -- 查看订阅者数量
PUBSUB NUMPAT                          -- 查看模式订阅数量

-- 退订
UNSUBSCRIBE channel1                   -- 退订频道
PUNSUBSCRIBE news:*                    -- 退订模式`}</pre>
            </div>

            <h2>事务与脚本</h2>
            <div className="code-block">
              <pre>{`-- 事务（MULTI/EXEC）
MULTI                                  -- 开始事务
SET key1 value1
SET key2 value2
EXEC                                   -- 执行事务
DISCARD                                -- 取消事务

-- 监视键（乐观锁）
WATCH key1 key2
GET key1
MULTI
SET key1 newvalue
EXEC                                   -- 如果key1被修改，事务失败

-- Lua 脚本
EVAL "return redis.call('GET', KEYS[1])" 1 mykey
EVALSHA sha1 1 mykey                   -- 使用脚本哈希
SCRIPT LOAD "return redis.call('GET', KEYS[1])"  -- 加载脚本
SCRIPT EXISTS sha1                     -- 检查脚本存在
SCRIPT FLUSH                           -- 清空脚本缓存`}</pre>
            </div>

            <h2>持久化</h2>
            <div className="code-block">
              <pre>{`-- RDB 快照
SAVE                                   -- 同步保存（阻塞）
BGSAVE                                 -- 后台保存
LASTSAVE                               -- 上次保存时间

-- AOF 追加
BGREWRITEAOF                           -- 重写AOF文件

-- 查看持久化状态
INFO persistence

-- 配置
CONFIG SET save "900 1 300 10"         -- RDB触发条件
CONFIG SET appendonly yes              -- 启用AOF
CONFIG SET appendfsync everysec        -- AOF同步策略`}</pre>
            </div>

            <h2>主从复制</h2>
            <div className="code-block">
              <pre>{`-- 从库配置
REPLICAOF host port                    -- 设置主库
REPLICAOF NO ONE                       -- 取消复制（成为主库）

-- 查看复制状态
INFO replication
ROLE                                   -- 查看角色

-- 复制偏移量
DEBUG REPLICATE OFFSET                 -- 获取复制偏移量`}</pre>
            </div>

            <h2>性能监控</h2>
            <div className="code-block">
              <pre>{`-- 慢查询日志
SLOWLOG GET 10                         -- 获取慢查询
SLOWLOG LEN                            -- 慢查询数量
SLOWLOG RESET                          -- 清空慢查询

-- 客户端连接
CLIENT LIST                            -- 查看所有连接
CLIENT ID                              -- 当前连接ID
CLIENT KILL ID 123                     -- 终止连接
CLIENT SETNAME myapp                   -- 设置连接名称

-- 内存分析
MEMORY USAGE key                       -- 键内存占用
MEMORY STATS                           -- 内存统计
MEMORY DOCTOR                          -- 内存诊断建议

-- 统计信息
INFO stats                             -- 统计信息
INFO commandstats                      -- 命令统计
INFO keyspace                          -- 键空间统计

-- 实时监控
MONITOR                                -- 实时监控所有命令`}</pre>
            </div>

            <h2>实用技巧</h2>
            <div className="code-block">
              <pre>{`-- 批量删除匹配的键
redis-cli --scan --pattern "user:*" | xargs redis-cli DEL

-- 批量设置过期
redis-cli --scan --pattern "session:*" | xargs -I {} redis-cli EXPIRE {} 3600

-- 导出数据
redis-cli --rdb backup.rdb

-- 查看大键
redis-cli --bigkeys

-- 查看热点键
redis-cli --hotkeys

-- 内存采样分析
redis-cli --memkeys

-- 连接延迟测试
redis-cli --latency
redis-cli --latency-history`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Cache Aside 模式实现</h2>
            <div className="code-block">
              <pre>{`// 读取数据
func Get(key string) (*Data, error) {
    // 1. 先查缓存
    val, err := redis.Get(key)
    if err == nil {
        return val, nil
    }

    // 2. 缓存未命中，查DB
    data, err := db.Query(key)
    if err != nil {
        return nil, err
    }

    // 3. 写入缓存
    redis.Set(key, data, 30*time.Minute)
    return data, nil
}

// 更新数据
func Update(key string, data *Data) error {
    // 1. 先更新DB
    if err := db.Update(key, data); err != nil {
        return err
    }

    // 2. 删除缓存（而非更新）
    redis.Del(key)
    return nil
}`}</pre>
            </div>

            <h2>Go Redis 客户端示例</h2>
            <div className="code-block">
              <pre>{`import "github.com/redis/go-redis/v9"

rdb := redis.NewClient(&redis.Options{
    Addr:     "localhost:6379",
    Password: "",
    DB:       0,
})

// 基本操作
ctx := context.Background()
rdb.Set(ctx, "key", "value", time.Hour)
val, _ := rdb.Get(ctx, "key").Result()
rdb.Del(ctx, "key")

// Hash
rdb.HSet(ctx, "user:1", "name", "张三", "age", 25)
rdb.HGet(ctx, "user:1", "name").Result()

// List
rdb.LPush(ctx, "queue", "task1", "task2")
rdb.RPop(ctx, "queue").Result()

// Sorted Set
rdb.ZAdd(ctx, "leaderboard", redis.Z{Score: 100, Member: "张三"})
rdb.ZRangeWithScores(ctx, "leaderboard", 0, -1).Result()

// Pipeline（批量操作）
pipe := rdb.Pipeline()
pipe.Set(ctx, "key1", "val1", 0)
pipe.Set(ctx, "key2", "val2", 0)
pipe.Exec(ctx)`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

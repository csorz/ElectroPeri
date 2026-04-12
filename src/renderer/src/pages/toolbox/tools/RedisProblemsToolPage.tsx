import { useState } from 'react'
import './ToolPage.css'

export default function RedisProblemsToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>⚠️ 缓存问题</h1>
        <p>缓存穿透、击穿、雪崩及解决方案</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>缓存穿透</h2>
            <div className="info-box">
              <strong>问题</strong>
              <p>查询不存在的数据，缓存和DB都无数据，请求直接穿透到DB</p>
              <strong>解决方案</strong>
              <ul>
                <li><strong>布隆过滤器</strong> - 快速判断数据是否存在</li>
                <li><strong>缓存空值</strong> - 缓存NULL值，设置较短过期时间</li>
                <li><strong>参数校验</strong> - 提前拦截非法请求</li>
              </ul>
            </div>

            <h2>缓存击穿</h2>
            <div className="info-box">
              <strong>问题</strong>
              <p>热点数据过期瞬间，大量请求同时访问，直接打到DB</p>
              <strong>解决方案</strong>
              <ul>
                <li><strong>互斥锁</strong> - 只让一个线程查DB并更新缓存</li>
                <li><strong>逻辑过期</strong> - 不设置TTL，后台异步更新</li>
                <li><strong>热点数据永不过期</strong> - 配合主动更新</li>
              </ul>
            </div>

            <h2>缓存雪崩</h2>
            <div className="info-box">
              <strong>问题</strong>
              <p>大量缓存同时过期，或Redis宕机，所有请求打到DB</p>
              <strong>解决方案</strong>
              <ul>
                <li><strong>过期时间随机</strong> - 避免同时过期</li>
                <li><strong>多级缓存</strong> - 本地缓存 + Redis</li>
                <li><strong>熔断降级</strong> - 保护后端服务</li>
                <li><strong>Redis 高可用</strong> - 哨兵/集群</li>
              </ul>
            </div>

            <h2>问题对比</h2>
            <table className="comparison-table">
              <thead><tr><th>问题</th><th>原因</th><th>影响</th><th>解决</th></tr></thead>
              <tbody>
                <tr><td>穿透</td><td>数据不存在</td><td>DB压力</td><td>布隆过滤器/空值缓存</td></tr>
                <tr><td>击穿</td><td>热点数据过期</td><td>DB瞬间压力</td><td>互斥锁/逻辑过期</td></tr>
                <tr><td>雪崩</td><td>大量缓存失效</td><td>系统崩溃</td><td>随机过期/多级缓存</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>缓存问题模拟</h2>
            <CacheProblemDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>布隆过滤器实现</h2>
            <div className="code-block">
              <pre>{`// Redis 布隆过滤器
// 添加元素
BF.ADD myfilter item1
BF.ADD myfilter item2

// 检查是否存在
BF.EXISTS myfilter item1  // 1 存在
BF.EXISTS myfilter item3  // 0 不存在（可能误判）

// Go 使用
import "github.com/bits-and-blooms/bloom/v3"

filter := bloom.NewWithEstimates(1000000, 0.01)
filter.AddString("user_123")

if filter.TestString("user_123") {
    // 可能存在
}`}</pre>
            </div>

            <h2>互斥锁防击穿</h2>
            <div className="code-block">
              <pre>{`func GetWithLock(key string) (*Data, error) {
    // 1. 查缓存
    if val, err := redis.Get(key); err == nil {
        return val, nil
    }

    // 2. 获取分布式锁
    lockKey := "lock:" + key
    if redis.SetNX(lockKey, 1, 10*time.Second) {
        defer redis.Del(lockKey)

        // 3. 查DB并更新缓存
        data, _ := db.Query(key)
        redis.Set(key, data, 30*time.Minute)
        return data, nil
    }

    // 4. 未获取锁，等待后重试
    time.Sleep(100 * time.Millisecond)
    return GetWithLock(key)
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CacheProblemDemo() {
  const [scenario, setScenario] = useState<'penetration' | 'breakdown' | 'avalanche'>('penetration')

  const scenarios = {
    penetration: {
      title: '缓存穿透',
      desc: '查询 id=-1，缓存和DB都不存在',
      flow: ['请求 id=-1', '缓存未命中', 'DB未命中', '返回空', '下次请求继续穿透...']
    },
    breakdown: {
      title: '缓存击穿',
      desc: '热点数据过期，大量并发请求',
      flow: ['热点数据过期', '请求1 查DB', '请求2 查DB', '请求3 查DB', 'DB压力骤增']
    },
    avalanche: {
      title: '缓存雪崩',
      desc: '大量缓存同时过期',
      flow: ['缓存A过期', '缓存B过期', '缓存C过期', '大量请求到DB', '系统崩溃']
    }
  }

  const s = scenarios[scenario]

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setScenario('penetration')} style={{ background: scenario === 'penetration' ? '#4caf50' : '#e0e0e0', color: scenario === 'penetration' ? '#fff' : '#333' }}>穿透</button>
        <button onClick={() => setScenario('breakdown')} style={{ background: scenario === 'breakdown' ? '#ff9800' : '#e0e0e0', color: scenario === 'breakdown' ? '#fff' : '#333' }}>击穿</button>
        <button onClick={() => setScenario('avalanche')} style={{ background: scenario === 'avalanche' ? '#f44336' : '#e0e0e0', color: scenario === 'avalanche' ? '#fff' : '#333' }}>雪崩</button>
      </div>
      <h4>{s.title}</h4>
      <p style={{ fontSize: '13px', color: '#666' }}>{s.desc}</p>
      <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
        {s.flow.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '20px', height: '20px', background: '#4fc3f7', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>{i + 1}</span>
            <span style={{ fontSize: '13px' }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

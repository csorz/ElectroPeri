import { useState } from 'react'
import './ToolPage.css'

export default function RedisCacheToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>💾 Redis 缓存策略</h1>
        <p>缓存模式、过期策略、内存淘汰机制</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
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
            <h2>LRU 淘汰模拟</h2>
            <LruDemo />
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
          </div>
        )}
      </div>
    </div>
  )
}

function LruDemo() {
  const [capacity] = useState(4)
  const [cache, setCache] = useState<string[]>(['A', 'B', 'C'])
  const [accessOrder, setAccessOrder] = useState<string[]>(['A', 'B', 'C'])

  const access = (key: string) => {
    const newOrder = [...accessOrder.filter(k => k !== key), key]
    setAccessOrder(newOrder)
  }

  const add = (key: string) => {
    if (cache.includes(key)) {
      access(key)
      return
    }
    let newCache = [...cache]
    if (newCache.length >= capacity) {
      // 淘汰最久未使用
      const evict = accessOrder[0]
      newCache = newCache.filter(k => k !== evict)
    }
    setCache([...newCache, key])
    setAccessOrder([...accessOrder.filter(k => k !== key), key])
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '12px' }}>
        <strong>缓存内容 (容量 {capacity}):</strong>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {cache.map(k => (
            <span key={k} onClick={() => access(k)} style={{ padding: '8px 16px', background: '#4caf50', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
              {k}
            </span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '12px', fontSize: '13px' }}>
        访问顺序 (新→旧): {accessOrder.slice().reverse().join(' → ')}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['A', 'B', 'C', 'D', 'E', 'F'].map(k => (
          <button key={k} onClick={() => add(k)} style={{ padding: '4px 12px' }}>访问 {k}</button>
        ))}
      </div>
    </div>
  )
}

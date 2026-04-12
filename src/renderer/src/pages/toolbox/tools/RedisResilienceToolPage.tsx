import { useState } from 'react'
import './ToolPage.css'

export default function RedisResilienceToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🛡️ 高可用机制</h1>
        <p>熔断、限流、降级保护系统稳定性</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>熔断 (Circuit Breaker)</h2>
            <div className="info-box">
              <p>当下游服务故障率达到阈值时，自动切断请求，快速失败</p>
              <ul>
                <li><strong>关闭状态</strong> - 正常请求</li>
                <li><strong>打开状态</strong> - 快速失败，不发起请求</li>
                <li><strong>半开状态</strong> - 放行部分请求探测恢复</li>
              </ul>
            </div>

            <h2>限流 (Rate Limiting)</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>固定窗口</h3>
                <p>单位时间内固定请求数</p>
                <small>简单但有临界问题</small>
              </div>
              <div className="feature-card">
                <h3>滑动窗口</h3>
                <p>精确统计任意时间窗口</p>
                <small>内存占用较高</small>
              </div>
              <div className="feature-card">
                <h3>令牌桶</h3>
                <p>固定速率生成令牌</p>
                <small>允许突发流量</small>
              </div>
              <div className="feature-card">
                <h3>漏桶</h3>
                <p>固定速率流出</p>
                <small>平滑流量</small>
              </div>
            </div>

            <h2>降级 (Degradation)</h2>
            <div className="info-box">
              <p>当服务不可用时，返回兜底数据或简化逻辑</p>
              <ul>
                <li><strong>自动降级</strong> - 超时/异常自动触发</li>
                <li><strong>手动降级</strong> - 运维人工开关</li>
                <li><strong>读降级</strong> - 读缓存/默认值</li>
                <li><strong>写降级</strong> - 写入队列异步处理</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>令牌桶限流演示</h2>
            <TokenBucketDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>熔断器实现 (Hystrix)</h2>
            <div className="code-block">
              <pre>{`// Go hystrix-go
hystrix.ConfigureCommand("my_service", hystrix.CommandConfig{
    Timeout:                1000,  // 超时时间
    MaxConcurrentRequests:  100,   // 最大并发
    ErrorPercentThreshold:  50,    // 错误率阈值
    RequestVolumeThreshold: 10,    // 请求量阈值
    SleepWindow:            5000,  // 熔断持续时间
})

err := hystrix.Do("my_service", func() error {
    // 正常逻辑
    return callService()
}, func(err error) error {
    // 降级逻辑
    return fallback()
})`}</pre>
            </div>

            <h2>限流实现</h2>
            <div className="code-block">
              <pre>{`// Go 令牌桶限流
import "golang.org/x/time/rate"

limiter := rate.NewLimiter(100, 200)  // 100/s, burst 200

if limiter.Allow() {
    // 允许请求
} else {
    // 限流
}

// 或等待获取
limiter.Wait(context.Background())`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TokenBucketDemo() {
  const [tokens, setTokens] = useState(10)
  const [rate] = useState(1) // 每秒补充
  const [maxTokens] = useState(10)
  const [requests, setRequests] = useState<number[]>([])

  const request = () => {
    if (tokens > 0) {
      setTokens(tokens - 1)
      setRequests([...requests, Date.now()])
    }
  }

  const refill = () => {
    if (tokens < maxTokens) {
      setTokens(Math.min(tokens + rate, maxTokens))
    }
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '12px' }}>
        <strong>令牌桶:</strong>
        <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
          {Array.from({ length: maxTokens }, (_, i) => (
            <div key={i} style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: i < tokens ? '#4caf50' : '#e0e0e0'
            }} />
          ))}
        </div>
      </div>
      <p style={{ fontSize: '13px' }}>当前令牌: {tokens}/{maxTokens} | 补充速率: {rate}/s</p>
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <button onClick={request} disabled={tokens === 0}>发起请求</button>
        <button onClick={refill}>补充令牌</button>
      </div>
      <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
        成功请求: {requests.length} 次
      </p>
    </div>
  )
}

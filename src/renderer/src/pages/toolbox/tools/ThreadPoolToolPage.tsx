import { useState } from 'react'
import './ToolPage.css'

export default function ThreadPoolToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🧵 线程池</h1>
        <p>复用线程，控制并发，管理任务队列</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>线程池参数</h2>
            <table className="comparison-table">
              <thead><tr><th>参数</th><th>说明</th></tr></thead>
              <tbody>
                <tr><td>corePoolSize</td><td>核心线程数，常驻线程</td></tr>
                <tr><td>maximumPoolSize</td><td>最大线程数</td></tr>
                <tr><td>keepAliveTime</td><td>非核心线程空闲存活时间</td></tr>
                <tr><td>workQueue</td><td>任务队列</td></tr>
                <tr><td>handler</td><td>拒绝策略</td></tr>
              </tbody>
            </table>

            <h2>任务执行流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  提交任务
     │
     ▼
  核心线程已满？ ──否──▶ 创建核心线程执行
     │
     是
     ▼
  队列已满？ ──否──▶ 加入队列等待
     │
     是
     ▼
  最大线程已满？ ──否──▶ 创建非核心线程执行
     │
     是
     ▼
  执行拒绝策略
              `}</pre>
            </div>

            <h2>拒绝策略</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>AbortPolicy</h3><p>抛异常，默认策略</p></div>
              <div className="feature-card"><h3>CallerRunsPolicy</h3><p>调用者线程执行</p></div>
              <div className="feature-card"><h3>DiscardPolicy</h3><p>静默丢弃</p></div>
              <div className="feature-card"><h3>DiscardOldestPolicy</h3><p>丢弃最老任务</p></div>
            </div>

            <h2>队列类型</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>ArrayBlockingQueue</h4><p>有界数组队列</p></div>
              <div className="scenario-card"><h4>LinkedBlockingQueue</h4><p>可选有界链表队列</p></div>
              <div className="scenario-card"><h4>SynchronousQueue</h4><p>无缓冲，直接传递</p></div>
              <div className="scenario-card"><h4>PriorityBlockingQueue</h4><p>优先级队列</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>线程池状态模拟</h2>
            <ThreadPoolDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Java 线程池</h2>
            <div className="code-block">
              <pre>{`ThreadPoolExecutor executor = new ThreadPoolExecutor(
    4,                      // corePoolSize
    8,                      // maximumPoolSize
    60L, TimeUnit.SECONDS,  // keepAliveTime
    new ArrayBlockingQueue<>(100),  // workQueue
    new ThreadPoolExecutor.CallerRunsPolicy()  // handler
);

executor.submit(() -> {
    // 执行任务
});

executor.shutdown();`}</pre>
            </div>

            <h2>Go goroutine 池</h2>
            <div className="code-block">
              <pre>{`// ants 协程池
pool, _ := ants.NewPoolWithFunc(100, func(i interface{}) {
    task := i.(*Task)
    task.Run()
})

pool.Invoke(&Task{...})`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ThreadPoolDemo() {
  const [coreThreads, setCoreThreads] = useState(4)
  const [maxThreads, setMaxThreads] = useState(8)
  const [activeThreads, setActiveThreads] = useState(2)
  const [queueSize, setQueueSize] = useState(3)

  const submitTask = () => {
    if (activeThreads < coreThreads) {
      setActiveThreads(activeThreads + 1)
    } else if (queueSize < 10) {
      setQueueSize(queueSize + 1)
    } else if (activeThreads < maxThreads) {
      setActiveThreads(activeThreads + 1)
    }
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label>核心线程: </label>
        <input type="number" value={coreThreads} onChange={(e) => setCoreThreads(parseInt(e.target.value) || 1)} style={{ width: '60px' }} />
        <label style={{ marginLeft: '12px' }}>最大线程: </label>
        <input type="number" value={maxThreads} onChange={(e) => setMaxThreads(parseInt(e.target.value) || 1)} style={{ width: '60px' }} />
      </div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {Array.from({ length: maxThreads }, (_, i) => (
          <div key={i} style={{
            width: '24px', height: '24px', borderRadius: '4px',
            background: i < activeThreads ? '#4caf50' : i < coreThreads ? '#e3f2fd' : '#f5f5f5',
            border: '1px solid #ccc'
          }} />
        ))}
      </div>
      <p style={{ fontSize: '13px' }}>活跃: {activeThreads} | 队列: {queueSize}/10</p>
      <button onClick={submitTask} style={{ marginTop: '8px' }}>提交任务</button>
    </div>
  )
}

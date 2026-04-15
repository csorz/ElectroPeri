import { useState } from 'react'
import './ToolPage.css'

export default function ObjectPoolToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📦 对象池</h1>
        <p>复用对象实例，减少 GC 压力</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>适用场景</h2>
            <div className="info-box">
              <ul>
                <li>对象创建成本高（如大缓冲区、连接）</li>
                <li>对象频繁创建销毁</li>
                <li>需要减少 GC 压力</li>
                <li>对象可重置状态后复用</li>
              </ul>
            </div>

            <h2>典型应用</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>📝 Buffer 池</h4><p>ByteBuf、StringBuilder 复用</p></div>
              <div className="scenario-card"><h4>🎮 游戏对象</h4><p>子弹、敌人等频繁创建的对象</p></div>
              <div className="scenario-card"><h4>📊 数据结构</h4><p>切片、Map 临时对象复用</p></div>
              <div className="scenario-card"><h4>🔌 连接对象</h4><p>HTTP Request/Response 对象</p></div>
            </div>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <ul>
                <li>对象状态必须可重置</li>
                <li>注意内存泄漏（对象引用未清理）</li>
                <li>多线程访问需要同步</li>
                <li>池大小需要合理控制</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>对象池状态</h2>
            <ObjectPoolDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go sync.Pool</h2>
            <div className="code-block">
              <pre>{`var bufferPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

// 获取对象
buf := bufferPool.Get().(*bytes.Buffer)
buf.Reset()  // 重置状态

// 使用
buf.WriteString("hello")

// 放回池中
bufferPool.Put(buf)`}</pre>
            </div>

            <h2>Java Apache Commons Pool</h2>
            <div className="code-block">
              <pre>{`GenericObjectPool<MyObject> pool = new GenericObjectPool<>(
    new BasePooledObjectFactory<MyObject>() {
        @Override
        public MyObject create() {
            return new MyObject();
        }
        @Override
        public PooledObject<MyObject> wrap(MyObject obj) {
            return new DefaultPooledObject<>(obj);
        }
    }
);

MyObject obj = pool.borrowObject();
try {
    obj.doSomething();
} finally {
    pool.returnObject(obj);
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ObjectPoolDemo() {
  const [pool, setPool] = useState([1, 2, 3])
  const [inUse, setInUse] = useState<number[]>([])

  const get = () => {
    if (pool.length > 0) {
      const obj = pool[pool.length - 1]
      setPool(pool.slice(0, -1))
      setInUse([...inUse, obj])
    }
  }

  const put = (obj: number) => {
    setInUse(inUse.filter(o => o !== obj))
    setPool([...pool, obj])
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ marginBottom: '16px' }}>
        <strong>池中对象:</strong>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {pool.map(o => <span key={o} style={{ padding: '8px 12px', background: '#e0e0e0', borderRadius: '4px' }}>对象{ o}</span>)}
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <strong>使用中:</strong>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {inUse.map(o => (
            <span key={o} style={{ padding: '8px 12px', background: '#4caf50', color: '#fff', borderRadius: '4px', cursor: 'pointer' }} onClick={() => put(o)}>
              对象{o} (点击归还)
            </span>
          ))}
        </div>
      </div>
      <button onClick={get} disabled={pool.length === 0}>获取对象</button>
    </div>
  )
}

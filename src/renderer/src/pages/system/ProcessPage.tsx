import { useEffect, useState, useMemo } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import { GaugeBar, StatCard, SectionCard, InfoRow } from '../../components/dashboard'

export default function ProcessPage() {
  return (
    <ElectronOnly>
      <ProcessPageContent />
    </ElectronOnly>
  )
}

function ProcessPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState<'cpu' | 'memory'>('cpu')
  const [limit, setLimit] = useState(20)
  const [refreshSec, setRefreshSec] = useState(0)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const [list, load] = await Promise.all([window.api.process.list(), window.api.process.load()])
      const next = { list, load }
      setData(next)
      setPageSnapshot('process', { data: next, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('process', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.process
    if (snapshot?.data) {
      setData(snapshot.data)
      setError(snapshot.error || null)
      handleScan()
    }
    if (!refreshSec) return
    const timer = setInterval(() => {
      handleScan()
    }, refreshSec * 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSec])

  const rows = useMemo(() => {
    if (!data?.list) return []
    const lower = keyword.trim().toLowerCase()
    return [...data.list]
      .filter((p: any) => !lower || `${p.name || ''}`.toLowerCase().includes(lower))
      .sort((a: any, b: any) => (sortBy === 'cpu' ? (b.cpu || 0) - (a.cpu || 0) : (b.memory || 0) - (a.memory || 0)))
      .slice(0, limit)
  }, [data, keyword, sortBy, limit])

  const cpuLoad = data?.load?.currentLoad?.currentLoad ?? 0
  const totalProcesses = (data?.list || []).length

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>进程 / 负载</h1>
        <p>Process & Load - 系统进程管理与负载监控</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心能力</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>进程列表</h3><p>获取系统所有运行进程的 PID、名称、路径等信息</p></div>
              <div className="feature-card"><h3>资源占用</h3><p>监控每个进程的 CPU、内存使用情况</p></div>
              <div className="feature-card"><h3>系统负载</h3><p>获取系统整体负载、平均负载、运行队列长度</p></div>
              <div className="feature-card"><h3>进程管理</h3><p>支持进程终止、优先级调整等管理操作</p></div>
            </div>
            <h2>进程状态模型</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  +------------+     fork()     +------------+
  |   运行     | -------------> |   就绪     |
  |  (Running) | <------------- |  (Ready)   |
  +------------+    schedule    +------------+
        |
        | wait()
        v
  +------------+     I/O完成    +------------+
  |   阻塞     | -------------> |   就绪     |
  |  (Blocked) |                |  (Ready)   |
  +------------+                +------------+
        |
        | exit()
        v
  +------------+
  |   僵尸     |
  |  (Zombie)  |
  +------------+
              `}</pre>
            </div>
            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>性能监控</h4><p>识别高 CPU/内存占用的进程，优化系统性能</p></div>
              <div className="scenario-card"><h4>异常检测</h4><p>发现僵尸进程、异常进程，及时处理问题</p></div>
              <div className="scenario-card"><h4>资源管理</h4><p>管理系统资源分配，保证关键进程运行</p></div>
              <div className="scenario-card"><h4>安全审计</h4><p>检测可疑进程，发现潜在安全威胁</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>进程信息采集</h2>
            <div className="connection-demo">
              <div className="demo-controls">
                <label>
                  自动刷新
                  <select value={refreshSec} onChange={(e) => setRefreshSec(Number(e.target.value))}>
                    <option value={0}>关闭</option>
                    <option value={3}>3s</option>
                    <option value={5}>5s</option>
                  </select>
                </label>
                <button onClick={handleScan} disabled={status === 'scanning'}>
                  {status === 'scanning' ? '采集中...' : '采集'}
                </button>
              </div>

              {error && (
                <div className="step-info" style={{ background: '#ffebee', borderColor: '#ef5350' }}>
                  <p style={{ color: '#c62828' }}>错误: {error}</p>
                </div>
              )}

              {!data ? (
                <div className="step-info"><p>点击"采集"获取进程列表与系统负载</p></div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  {/* Top stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <StatCard icon="📊" title="总进程数" value={totalProcesses} />
                    <StatCard
                      icon="🔲"
                      title="CPU 总负载"
                      value={`${cpuLoad.toFixed(1)}%`}
                      color={cpuLoad > 80 ? '#ef5350' : cpuLoad > 60 ? '#ff9800' : '#4caf50'}
                    />
                    <StatCard
                      icon="💾"
                      title="内存使用率"
                      value={data.load?.currentLoad?.avgLoad ? `${data.load.currentLoad.avgLoad.toFixed(1)}%` : '-'}
                    />
                  </div>

                  {/* CPU Load gauge */}
                  <SectionCard title="系统负载" icon="📈" accentColor="#4fc3f7" >
                    <GaugeBar value={cpuLoad} label="CPU" />
                    {data.load?.currentLoad?.cpus && (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {data.load.currentLoad.cpus.slice(0, 8).map((c: any, i: number) => (
                          <GaugeBar key={i} value={c.load ?? c ?? 0} label={`核${i}`} height={3} showPercent={false} />
                        ))}
                      </div>
                    )}
                    {data.load?.currentLoad?.avgLoad && (
                      <div style={{ marginTop: 8 }}>
                        <InfoRow label="平均负载" value={data.load.currentLoad.avgLoad.toFixed(2)} />
                      </div>
                    )}
                  </SectionCard>

                  {/* Process table */}
                  <SectionCard title="进程列表" icon="📋" accentColor="#66bb6a" >
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="搜索进程名..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, flex: 1, minWidth: 140, fontSize: 13 }}
                      />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'cpu' | 'memory')}
                        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                      >
                        <option value="cpu">按 CPU 排序</option>
                        <option value="memory">按内存排序</option>
                      </select>
                      <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                      >
                        <option value={20}>20 条</option>
                        <option value={50}>50 条</option>
                        <option value={100}>100 条</option>
                      </select>
                    </div>

                    <table className="comparison-table">
                      <thead>
                        <tr><th>PID</th><th>名称</th><th>CPU%</th><th>内存</th></tr>
                      </thead>
                      <tbody>
                        {rows.map((p: any) => (
                          <tr key={p.pid}>
                            <td>{p.pid}</td>
                            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                            <td style={{ minWidth: 100 }}>
                              <GaugeBar value={Math.min(p.cpu || 0, 100)} showPercent height={4} />
                            </td>
                            <td>{p.memory ? `${(p.memory / 1024 / 1024).toFixed(1)} MB` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </SectionCard>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`const si = require('systeminformation');

// 获取进程列表
async function getProcesses() {
  const processes = await si.processes();
  console.log(\`总进程数: \${processes.all}\`);
  const topMemory = processes.list
    .sort((a, b) => b.memRss - a.memRss)
    .slice(0, 10);
  topMemory.forEach(p => {
    console.log(\`PID: \${p.pid}, 名称: \${p.name}, 内存: \${(p.memRss / 1024 / 1024).toFixed(1)} MB\`);
  });
}

// 获取系统负载
async function getLoad() {
  const load = await si.currentLoad();
  console.log(\`CPU 负载: \${load.currentLoad.toFixed(1)}%\`);
}

(async () => { await getProcesses(); await getLoad(); })();`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

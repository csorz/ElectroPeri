import { useEffect, useState, useMemo } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = useMemo(() => {
    if (!data?.list) return []
    const lower = keyword.trim().toLowerCase()
    return [...data.list]
      .filter((p: any) => !lower || `${p.name || ''}`.toLowerCase().includes(lower))
      .sort((a: any, b: any) => (sortBy === 'cpu' ? (b.cpu || 0) - (a.cpu || 0) : (b.memory || 0) - (a.memory || 0)))
      .slice(0, limit)
  }, [data, keyword, sortBy, limit])

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
              <div className="feature-card">
                <h3>进程列表</h3>
                <p>获取系统所有运行进程的 PID、名称、路径等信息</p>
              </div>
              <div className="feature-card">
                <h3>资源占用</h3>
                <p>监控每个进程的 CPU、内存使用情况</p>
              </div>
              <div className="feature-card">
                <h3>系统负载</h3>
                <p>获取系统整体负载、平均负载、运行队列长度</p>
              </div>
              <div className="feature-card">
                <h3>进程管理</h3>
                <p>支持进程终止、优先级调整等管理操作</p>
              </div>
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
        |
        | parent wait()
        v
  +------------+
  |   终止     |
  |(Terminated)|
  +------------+
              `}</pre>
            </div>

            <h2>进程状态对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>状态</th>
                  <th>说明</th>
                  <th>特点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Running</td>
                  <td>正在执行</td>
                  <td>占用 CPU 时间片</td>
                </tr>
                <tr>
                  <td>Ready</td>
                  <td>就绪等待</td>
                  <td>可立即执行，等待调度</td>
                </tr>
                <tr>
                  <td>Blocked</td>
                  <td>阻塞等待</td>
                  <td>等待 I/O 或事件</td>
                </tr>
                <tr>
                  <td>Zombie</td>
                  <td>僵尸进程</td>
                  <td>已终止，等待父进程回收</td>
                </tr>
                <tr>
                  <td>Sleeping</td>
                  <td>睡眠中</td>
                  <td>主动休眠或等待中断</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>性能监控</h4>
                <p>识别高 CPU/内存占用的进程，优化系统性能</p>
              </div>
              <div className="scenario-card">
                <h4>异常检测</h4>
                <p>发现僵尸进程、异常进程，及时处理问题</p>
              </div>
              <div className="scenario-card">
                <h4>资源管理</h4>
                <p>管理系统资源分配，保证关键进程运行</p>
              </div>
              <div className="scenario-card">
                <h4>安全审计</h4>
                <p>检测可疑进程，发现潜在安全威胁</p>
              </div>
            </div>

            <h2>负载指标解读</h2>
            <div className="info-box">
              <strong>系统负载 Load Average</strong>
              <ul>
                <li><strong>Load 1min</strong> - 1分钟平均负载，反映当前系统繁忙程度</li>
                <li><strong>Load 5min</strong> - 5分钟平均负载，观察短期趋势</li>
                <li><strong>Load 15min</strong> - 15分钟平均负载，观察长期趋势</li>
                <li><strong>经验法则</strong> - Load 超过 CPU 核心数，系统可能过载</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>进程信息采集</h2>
            <div className="connection-demo">
              <div className="demo-controls">
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
                <div className="step-info">
                  <p>点击"采集"获取进程列表与系统负载</p>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <div className="feature-grid" style={{ marginBottom: '16px' }}>
                    <div className="feature-card">
                      <h3>总进程数</h3>
                      <p style={{ fontSize: '20px', fontWeight: 600 }}>{(data.list || []).length}</p>
                    </div>
                    <div className="feature-card">
                      <h3>CPU 总负载</h3>
                      <p style={{ fontSize: '20px', fontWeight: 600 }}>
                        {data.load?.currentLoad?.currentLoad?.toFixed?.(1) ?? '-'}%
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="搜索进程名..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', flex: 1, minWidth: '150px' }}
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'cpu' | 'memory')}
                      style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="cpu">按 CPU 排序</option>
                      <option value="memory">按内存排序</option>
                    </select>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value={20}>20 条</option>
                      <option value={50}>50 条</option>
                      <option value={100}>100 条</option>
                    </select>
                  </div>

                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>PID</th>
                        <th>名称</th>
                        <th>CPU%</th>
                        <th>内存MB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((p: any) => (
                        <tr key={p.pid}>
                          <td>{p.pid}</td>
                          <td>{p.name}</td>
                          <td>{p.cpu?.toFixed?.(1) ?? '-'}</td>
                          <td>{p.memory ? (p.memory / 1024 / 1024).toFixed(1) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
  console.log(\`运行中: \${processes.running}\`);
  console.log(\`睡眠中: \${processes.sleeping}\`);

  // 按内存排序，取前 10
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
  console.log(\`用户态: \${load.currentLoadUser.toFixed(1)}%\`);
  console.log(\`系统态: \${load.currentLoadSystem.toFixed(1)}%\`);
}

// 获取平均负载
async function getLoadAvg() {
  const load = await si.getloadavg();
  console.log(\`1分钟: \${load[0].toFixed(2)}\`);
  console.log(\`5分钟: \${load[1].toFixed(2)}\`);
  console.log(\`15分钟: \${load[2].toFixed(2)}\`);
}

// 执行
(async () => {
  await getProcesses();
  await getLoad();
  await getLoadAvg();
})();`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import psutil

# 获取进程列表
def get_processes():
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            processes.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    # 按 CPU 排序
    processes.sort(key=lambda x: x['cpu_percent'] or 0, reverse=True)

    for p in processes[:10]:
        print(f"PID: {p['pid']}, 名称: {p['name']}, CPU: {p['cpu_percent']}%")

# 获取系统负载
def get_load():
    load1, load5, load15 = psutil.getloadavg()
    print(f"1分钟负载: {load1:.2f}")
    print(f"5分钟负载: {load5:.2f}")
    print(f"15分钟负载: {load15:.2f}")

# 获取 CPU 使用率
def get_cpu_usage():
    print(f"CPU 使用率: {psutil.cpu_percent(interval=1)}%")
    print(f"每核使用率: {psutil.cpu_percent(interval=1, percpu=True)}")

# 执行
get_processes()
get_load()
get_cpu_usage()`}</pre>
            </div>

            <h2>Electron 主进程示例</h2>
            <div className="code-block">
              <pre>{`// main.ts - Electron 主进程
import { ipcMain } from 'electron';
import si from 'systeminformation';

// 获取进程列表
ipcMain.handle('process:list', async () => {
  const processes = await si.processes();
  return processes.list.map(p => ({
    pid: p.pid,
    name: p.name,
    cpu: p.cpu,
    memory: p.memRss,
    state: p.state,
    user: p.user
  }));
});

// 获取系统负载
ipcMain.handle('process:load', async () => {
  const load = await si.currentLoad();
  return load;
});

// 渲染进程调用
const list = await window.api.process.list();
const load = await window.api.process.load();
console.log('进程列表:', list);
console.log('系统负载:', load);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

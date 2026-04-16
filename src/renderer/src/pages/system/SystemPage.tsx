import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import { GaugeBar, StatCard, InfoRow, SectionCard } from '../../components/dashboard'

const toGB = (bytes = 0) => `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
const formatUptime = (sec = 0) => {
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return d > 0 ? `${d}天 ${h}时 ${m}分` : `${h}时 ${m}分`
}

export default function SystemPage() {
  return (
    <ElectronOnly>
      <SystemPageContent />
    </ElectronOnly>
  )
}

function SystemPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [refreshSec, setRefreshSec] = useState(0)
  const [updatedAt, setUpdatedAt] = useState<string>('-')
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.system.basic()
      setData(res)
      const now = new Date().toLocaleTimeString()
      setUpdatedAt(now)
      setPageSnapshot('system', { data: res, error: null, updatedAt: now })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('system', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.system
    if (snapshot?.data) {
      setData(snapshot.data)
      setError(snapshot.error || null)
      setUpdatedAt(snapshot.updatedAt || '-')
      handleScan()
    }
    if (!refreshSec) return
    const timer = setInterval(() => {
      handleScan()
    }, refreshSec * 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSec])

  const cpuLoad = data?.load?.currentLoad ?? 0
  const memUsed = data?.mem?.active ?? data?.mem?.used ?? 0
  const memTotal = data?.mem?.total ?? 1
  const memPercent = (memUsed / memTotal) * 100
  const swapUsed = data?.mem?.swapused ?? 0
  const swapTotal = data?.mem?.swaptotal ?? 0
  const swapPercent = swapTotal > 0 ? (swapUsed / swapTotal) * 100 : 0

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>系统信息</h1>
        <p>System Information - 操作系统基础信息采集</p>
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
              <div className="feature-card"><h3>OS 信息</h3><p>获取操作系统类型、版本、发行版、架构等基础信息</p></div>
              <div className="feature-card"><h3>CPU 信息</h3><p>获取处理器品牌、核心数、速度、负载等详细信息</p></div>
              <div className="feature-card"><h3>内存状态</h3><p>获取总内存、可用内存、使用率等运行时状态</p></div>
              <div className="feature-card"><h3>系统负载</h3><p>获取系统当前负载情况，包括 CPU、内存使用百分比</p></div>
            </div>
            <h2>系统信息架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  +-------------------+     +-------------------+
  |    OS Information |     |    CPU Information |
  +-------------------+     +-------------------+
  | - Platform        |     | - Brand           |
  | - Distro          |     | - Cores           |
  | - Release         |     | - Speed           |
  | - Architecture    |     | - Model           |
  | - Hostname        |     | - Temperature     |
  +-------------------+     +-------------------+
            |                       |
            v                       v
  +-------------------+     +-------------------+
  |  Memory Status    |     |   System Load     |
  +-------------------+     +-------------------+
  | - Total           |     | - CurrentLoad     |
  | - Free            |     | - AvgLoad         |
  | - Used            |     | - Processes       |
  | - Available       |     | - Uptime          |
  +-------------------+     +-------------------+
              `}</pre>
            </div>
            <h2>跨平台支持</h2>
            <table className="comparison-table">
              <thead><tr><th>平台</th><th>支持情况</th><th>特殊说明</th></tr></thead>
              <tbody>
                <tr><td>Windows</td><td>完全支持</td><td>使用 WMI 和系统 API</td></tr>
                <tr><td>macOS</td><td>完全支持</td><td>使用 system_profiler</td></tr>
                <tr><td>Linux</td><td>完全支持</td><td>读取 /proc 文件系统</td></tr>
              </tbody>
            </table>
            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>系统监控</h4><p>实时监控系统资源使用情况，及时发现性能瓶颈</p></div>
              <div className="scenario-card"><h4>硬件检测</h4><p>获取硬件配置信息，用于兼容性检查或系统诊断</p></div>
              <div className="scenario-card"><h4>运维自动化</h4><p>批量收集服务器信息，生成资产清单报告</p></div>
              <div className="scenario-card"><h4>性能分析</h4><p>分析系统负载趋势，优化资源配置</p></div>
            </div>
            <h2>技术要点</h2>
            <div className="info-box">
              <strong>systeminformation 库</strong>
              <ul>
                <li><strong>跨平台</strong> - 支持 Windows、macOS、Linux、FreeBSD</li>
                <li><strong>轻量级</strong> - 无外部依赖，纯 JavaScript 实现</li>
                <li><strong>丰富 API</strong> - 50+ 种系统信息获取方法</li>
                <li><strong>异步设计</strong> - 所有方法返回 Promise，不阻塞主线程</li>
                <li><strong>实时监控</strong> - 支持连续采样和平均值计算</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>系统信息采集</h2>
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
                <div className="step-info">
                  <p>点击"采集"获取系统信息（CPU/内存/OS/负载）</p>
                </div>
              ) : (
                <>
                  {/* Top stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 16 }}>
                    <StatCard
                      icon="💻"
                      title="操作系统"
                      value={data.osInfo?.distro || '-'}
                      subtitle={`${data.osInfo?.release || ''} ${data.osInfo?.arch || ''}`}
                    />
                    <StatCard
                      icon="🔲"
                      title="CPU"
                      value={data.cpu?.brand?.split(' ').slice(0, 3).join(' ') || '-'}
                      subtitle={`${data.cpu?.cores || '-'} 核 / ${data.cpu?.speed?.toFixed?.(1) ?? '-'} GHz`}
                    />
                    <StatCard
                      icon="💾"
                      title="内存"
                      value={toGB(memUsed)}
                      subtitle={`总量 ${toGB(memTotal)}`}
                      color={memPercent > 80 ? '#ef5350' : '#333'}
                    />
                    <StatCard
                      icon="⏱️"
                      title="运行时间"
                      value={formatUptime(data.uptime)}
                      subtitle={`更新: ${updatedAt}`}
                    />
                  </div>

                  {/* CPU Load */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginTop: 16 }}>
                    <SectionCard title="CPU 负载" icon="🔲" accentColor="#4fc3f7">
                      <GaugeBar value={cpuLoad} label="总负载" />
                      {data.load?.cpus && (
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {data.load.cpus.slice(0, 16).map((c: any, i: number) => (
                            <GaugeBar key={i} value={c.load ?? c ?? 0} label={`核${i}`} height={4} showPercent={false} />
                          ))}
                        </div>
                      )}
                      {data.temp?.main > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <InfoRow label="CPU 温度" value={`${data.temp.main}°C`} />
                        </div>
                      )}
                    </SectionCard>

                    {/* Memory */}
                    <SectionCard title="内存" icon="💾" accentColor="#66bb6a">
                      <GaugeBar value={memPercent} label="内存" />
                      <div style={{ marginTop: 8 }}>
                        <InfoRow label="已用" value={toGB(memUsed)} />
                        <InfoRow label="可用" value={toGB(data.mem?.available ?? data.mem?.free)} />
                        <InfoRow label="总量" value={toGB(memTotal)} />
                      </div>
                      {swapTotal > 0 && (
                        <>
                          <div style={{ marginTop: 12 }}><GaugeBar value={swapPercent} label="Swap" /></div>
                          <div style={{ marginTop: 4 }}>
                            <InfoRow label="Swap 已用" value={toGB(swapUsed)} />
                            <InfoRow label="Swap 总量" value={toGB(swapTotal)} />
                          </div>
                        </>
                      )}
                    </SectionCard>
                  </div>

                  {/* OS Details */}
                  <SectionCard title="系统详情" icon="💻" accentColor="#ff9800" >
                    <InfoRow label="主机名" value={data.hostname} />
                    <InfoRow label="平台" value={data.platform} />
                    <InfoRow label="架构" value={data.osInfo?.arch} />
                    <InfoRow label="发行版" value={data.osInfo?.distro} />
                    <InfoRow label="版本" value={data.osInfo?.release} />
                    <InfoRow label="内核" value={data.osInfo?.kernel} />
                    <InfoRow label="代号" value={data.osInfo?.codename} />
                    <InfoRow label="构建" value={data.osInfo?.build} />
                  </SectionCard>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`const si = require('systeminformation');

// 获取操作系统信息
async function getOsInfo() {
  const osInfo = await si.osInfo();
  console.log('操作系统:', osInfo.distro, osInfo.release);
  console.log('平台:', osInfo.platform);
  console.log('架构:', osInfo.arch);
  console.log('主机名:', osInfo.hostname);
}

// 获取 CPU 信息
async function getCpuInfo() {
  const cpu = await si.cpu();
  const currentSpeed = await si.cpuCurrentspeed();
  console.log('CPU:', cpu.brand);
  console.log('核心数:', cpu.cores);
  console.log('当前速度:', currentSpeed.avg, 'GHz');
}

// 获取内存信息
async function getMemoryInfo() {
  const mem = await si.mem();
  console.log('总内存:', (mem.total / 1024 / 1024 / 1024).toFixed(2), 'GB');
  console.log('可用内存:', (mem.available / 1024 / 1024 / 1024).toFixed(2), 'GB');
  console.log('使用率:', ((mem.used / mem.total) * 100).toFixed(1), '%');
}

// 获取系统负载
async function getLoadInfo() {
  const load = await si.currentLoad();
  console.log('CPU 负载:', load.currentLoad.toFixed(1), '%');
}

// 执行所有
(async () => {
  await getOsInfo();
  await getCpuInfo();
  await getMemoryInfo();
  await getLoadInfo();
})();`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'

const toGB = (bytes = 0) => `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`

export default function SystemPage() {
  return (
    <ElectronOnly>
      <SystemPageContent />
    </ElectronOnly>
  )
}

function SystemPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
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

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>系统信息</h1>
        <p>System Information - 操作系统基础信息采集</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心能力</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>OS 信息</h3>
                <p>获取操作系统类型、版本、发行版、架构等基础信息</p>
              </div>
              <div className="feature-card">
                <h3>CPU 信息</h3>
                <p>获取处理器品牌、核心数、速度、负载等详细信息</p>
              </div>
              <div className="feature-card">
                <h3>内存状态</h3>
                <p>获取总内存、可用内存、使用率等运行时状态</p>
              </div>
              <div className="feature-card">
                <h3>系统负载</h3>
                <p>获取系统当前负载情况，包括 CPU、内存使用百分比</p>
              </div>
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
              <thead>
                <tr>
                  <th>平台</th>
                  <th>支持情况</th>
                  <th>特殊说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Windows</td>
                  <td>完全支持</td>
                  <td>使用 WMI 和系统 API</td>
                </tr>
                <tr>
                  <td>macOS</td>
                  <td>完全支持</td>
                  <td>使用 system_profiler</td>
                </tr>
                <tr>
                  <td>Linux</td>
                  <td>完全支持</td>
                  <td>读取 /proc 文件系统</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>系统监控</h4>
                <p>实时监控系统资源使用情况，及时发现性能瓶颈</p>
              </div>
              <div className="scenario-card">
                <h4>硬件检测</h4>
                <p>获取硬件配置信息，用于兼容性检查或系统诊断</p>
              </div>
              <div className="scenario-card">
                <h4>运维自动化</h4>
                <p>批量收集服务器信息，生成资产清单报告</p>
              </div>
              <div className="scenario-card">
                <h4>性能分析</h4>
                <p>分析系统负载趋势，优化资源配置</p>
              </div>
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
                  <div className="feature-grid" style={{ marginTop: '16px' }}>
                    <div className="feature-card">
                      <h3>操作系统</h3>
                      <p style={{ fontSize: '15px', fontWeight: 500, color: '#333' }}>
                        {data.osInfo?.distro} {data.osInfo?.release}
                      </p>
                      <p>{data.platform} / {data.osInfo?.arch} / {data.hostname}</p>
                    </div>
                    <div className="feature-card">
                      <h3>CPU</h3>
                      <p style={{ fontSize: '15px', fontWeight: 500, color: '#333' }}>{data.cpu?.brand || '-'}</p>
                      <p>{data.cpu?.cores || '-'} 核，当前负载 {data.load?.currentLoad?.toFixed?.(1) ?? '-'}%</p>
                    </div>
                    <div className="feature-card">
                      <h3>内存</h3>
                      <p style={{ fontSize: '15px', fontWeight: 500, color: '#333' }}>
                        {toGB(data.mem?.active)} / {toGB(data.mem?.total)}
                      </p>
                      <p>已用 {((data.mem?.active / data.mem?.total) * 100 || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="step-info">
                    <p>最近更新: {updatedAt}</p>
                  </div>
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

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import psutil
import platform
import socket

# 获取操作系统信息
def get_os_info():
    print(f"系统: {platform.system()}")
    print(f"版本: {platform.version()}")
    print(f"架构: {platform.machine()}")
    print(f"主机名: {socket.gethostname()}")

# 获取 CPU 信息
def get_cpu_info():
    print(f"CPU 核心数: {psutil.cpu_count(logical=True)}")
    print(f"CPU 使用率: {psutil.cpu_percent(interval=1)}%")

# 获取内存信息
def get_memory_info():
    mem = psutil.virtual_memory()
    total_gb = mem.total / (1024 ** 3)
    used_gb = mem.used / (1024 ** 3)
    print(f"总内存: {total_gb:.2f} GB")
    print(f"已用内存: {used_gb:.2f} GB")
    print(f"使用率: {mem.percent}%")

# 获取系统负载
def get_load_info():
    load1, load5, load15 = psutil.getloadavg()
    print(f"1分钟负载: {load1:.2f}")
    print(f"5分钟负载: {load5:.2f}")
    print(f"15分钟负载: {load15:.2f}")

# 执行
get_os_info()
get_cpu_info()
get_memory_info()
get_load_info()`}</pre>
            </div>

            <h2>Electron 主进程示例</h2>
            <div className="code-block">
              <pre>{`// main.ts - Electron 主进程
import { ipcMain } from 'electron';
import si from 'systeminformation';

// 注册 IPC 处理器
ipcMain.handle('system:basic', async () => {
  const [osInfo, cpu, mem, load] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.mem(),
    si.currentLoad()
  ]);

  return {
    platform: process.platform,
    hostname: osInfo.hostname,
    osInfo,
    cpu,
    mem,
    load
  };
});

// 渲染进程调用
const result = await window.api.system.basic();
console.log('系统信息:', result);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

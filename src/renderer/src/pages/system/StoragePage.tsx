import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'

const toGB = (value = 0) => `${(value / 1024 / 1024 / 1024).toFixed(1)} GB`

export default function StoragePage() {
  return (
    <ElectronOnly>
      <StoragePageContent />
    </ElectronOnly>
  )
}

function StoragePageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.storage.fs()
      setData(res)
      setPageSnapshot('storage', { data: res, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('storage', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.storage
    if (snapshot?.data) {
      setData(snapshot.data)
      setError(snapshot.error || null)
      handleScan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>存储设备</h1>
        <p>Storage Devices - 磁盘、分区、文件系统信息</p>
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
                <h3>磁盘信息</h3>
                <p>获取物理磁盘的型号、类型（HDD/SSD）、容量、接口类型等</p>
              </div>
              <div className="feature-card">
                <h3>分区信息</h3>
                <p>获取磁盘分区表、分区类型、大小、挂载点等信息</p>
              </div>
              <div className="feature-card">
                <h3>文件系统</h3>
                <p>获取文件系统类型、使用量、可用空间、挂载信息</p>
              </div>
              <div className="feature-card">
                <h3>块设备</h3>
                <p>获取块设备的详细信息，包括读写速度、IO 状态</p>
              </div>
            </div>

            <h2>存储层次结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  +--------------------------------------------------+
  |                   物理磁盘                        |
  +--------------------------------------------------+
  |  型号: Samsung SSD 970 EVO                       |
  |  类型: NVMe SSD                                  |
  |  容量: 512 GB                                    |
  +--------------------------------------------------+
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
  +------------+  +------------+  +------------+
  |  分区 1    |  |  分区 2    |  |  分区 3    |
  +------------+  +------------+  +------------+
  |  EFI 系统  |  |  系统分区  |  |  数据分区  |
  |  100 MB    |  |  200 GB    |  |  300 GB    |
  +------------+  +------------+  +------------+
          |              |              |
          v              v              v
  +------------+  +------------+  +------------+
  |  FAT32     |  |  NTFS      |  |  NTFS      |
  |  /boot/efi |  |  C:\\       |  |  D:\\       |
  +------------+  +------------+  +------------+
              `}</pre>
            </div>

            <h2>常见文件系统</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>文件系统</th>
                  <th>平台</th>
                  <th>最大文件</th>
                  <th>特点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>NTFS</td>
                  <td>Windows</td>
                  <td>16 EB</td>
                  <td>支持权限、加密、压缩</td>
                </tr>
                <tr>
                  <td>FAT32</td>
                  <td>跨平台</td>
                  <td>4 GB</td>
                  <td>兼容性好，适合 U 盘</td>
                </tr>
                <tr>
                  <td>exFAT</td>
                  <td>跨平台</td>
                  <td>16 EB</td>
                  <td>大文件支持，适合移动设备</td>
                </tr>
                <tr>
                  <td>ext4</td>
                  <td>Linux</td>
                  <td>16 TB</td>
                  <td>日志文件系统，稳定性好</td>
                </tr>
                <tr>
                  <td>APFS</td>
                  <td>macOS</td>
                  <td>8 EB</td>
                  <td>快照、加密、空间共享</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>磁盘监控</h4>
                <p>实时监控磁盘使用率，提前预警空间不足</p>
              </div>
              <div className="scenario-card">
                <h4>容量规划</h4>
                <p>分析磁盘使用趋势，规划扩容方案</p>
              </div>
              <div className="scenario-card">
                <h4>系统诊断</h4>
                <p>检测磁盘健康状态，预防硬件故障</p>
              </div>
              <div className="scenario-card">
                <h4>资产管理</h4>
                <p>收集服务器存储配置，生成资产报告</p>
              </div>
            </div>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>安全提示</strong>
              <ul>
                <li><strong>权限要求</strong> - 某些信息需要管理员权限才能获取</li>
                <li><strong>性能影响</strong> - 频繁查询可能影响系统性能</li>
                <li><strong>隐私考虑</strong> - 磁盘信息可能包含敏感数据</li>
                <li><strong>跨平台差异</strong> - 不同操作系统返回的信息字段可能不同</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>存储信息采集</h2>
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
                  <p>点击"采集"获取磁盘/分区/块设备信息</p>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>文件系统容量</h3>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>挂载点</th>
                        <th>文件系统</th>
                        <th>已用/总量</th>
                        <th>使用率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.fsSize || []).map((item: any, i: number) => (
                        <tr key={i}>
                          <td>{item.mount || '-'}</td>
                          <td>{item.fs || '-'}</td>
                          <td>
                            {toGB(item.used)} / {toGB(item.size)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                flex: 1,
                                height: '8px',
                                background: '#e0e0e0',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                maxWidth: '100px'
                              }}>
                                <div style={{
                                  width: `${item.use || 0}%`,
                                  height: '100%',
                                  background: (item.use || 0) > 80 ? '#ef5350' : '#4caf50',
                                  borderRadius: '4px'
                                }} />
                              </div>
                              <span style={{ fontSize: '13px' }}>{item.use || 0}%</span>
                            </div>
                          </td>
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

// 获取文件系统信息
async function getFsInfo() {
  const fsSize = await si.fsSize();
  fsSize.forEach(fs => {
    console.log(\`挂载点: \${fs.mount}\`);
    console.log(\`  文件系统: \${fs.fs}\`);
    console.log(\`  总容量: \${(fs.size / 1024 / 1024 / 1024).toFixed(2)} GB\`);
    console.log(\`  已使用: \${(fs.used / 1024 / 1024 / 1024).toFixed(2)} GB\`);
    console.log(\`  使用率: \${fs.use}%\`);
  });
}

// 获取磁盘信息
async function getDiskInfo() {
  const disks = await si.blockDevices();
  disks.forEach(disk => {
    console.log(\`设备: \${disk.name}\`);
    console.log(\`  类型: \${disk.type}\`);
    console.log(\`  文件系统: \${disk.fsType}\`);
    console.log(\`  挂载点: \${disk.mount}\`);
  });
}

// 获取物理磁盘
async function getPhysicalDisks() {
  const disks = await si.diskLayout();
  disks.forEach(disk => {
    console.log(\`磁盘: \${disk.name}\`);
    console.log(\`  型号: \${disk.device}\`);
    console.log(\`  类型: \${disk.type}\`);
    console.log(\`  容量: \${(disk.size / 1024 / 1024 / 1024).toFixed(2)} GB\`);
  });
}

// 执行
(async () => {
  await getFsInfo();
  await getDiskInfo();
  await getPhysicalDisks();
})();`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import psutil
import shutil

# 获取磁盘分区信息
def get_partitions():
    partitions = psutil.disk_partitions()
    for p in partitions:
        print(f"设备: {p.device}")
        print(f"  挂载点: {p.mountpoint}")
        print(f"  文件系统: {p.fstype}")
        # 获取使用情况
        usage = psutil.disk_usage(p.mountpoint)
        total_gb = usage.total / (1024 ** 3)
        used_gb = usage.used / (1024 ** 3)
        print(f"  总容量: {total_gb:.2f} GB")
        print(f"  已使用: {used_gb:.2f} GB")
        print(f"  使用率: {usage.percent}%")

# 获取磁盘 IO 统计
def get_disk_io():
    io = psutil.disk_io_counters()
    print(f"读取: {io.read_bytes / (1024**3):.2f} GB")
    print(f"写入: {io.write_bytes / (1024**3):.2f} GB")

# 执行
get_partitions()
get_disk_io()`}</pre>
            </div>

            <h2>Electron 主进程示例</h2>
            <div className="code-block">
              <pre>{`// main.ts - Electron 主进程
import { ipcMain } from 'electron';
import si from 'systeminformation';

// 注册 IPC 处理器
ipcMain.handle('storage:fs', async () => {
  const [fsSize, blockDevices, diskLayout] = await Promise.all([
    si.fsSize(),
    si.blockDevices(),
    si.diskLayout()
  ]);

  return {
    fsSize,
    blockDevices,
    diskLayout
  };
});

// 渲染进程调用
const result = await window.api.storage.fs();
console.log('存储信息:', result);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

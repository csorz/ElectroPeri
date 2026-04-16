import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import { SectionCard, InfoRow } from '../../components/dashboard'

export default function PrinterPage() {
  return (
    <ElectronOnly>
      <PrinterPageContent />
    </ElectronOnly>
  )
}

function PrinterPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [printers, setPrinters] = useState<any[]>([])
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const list = await window.api.printer.list()
      setPrinters(list as any[])
      setPageSnapshot('printer', { data: list, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取失败'
      setError(msg)
      setPageSnapshot('printer', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.printer
    if (snapshot?.data) {
      setPrinters(snapshot.data)
      setError(snapshot.error || null)
      handleScan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statusColor = (s: number) => {
    if (s === 0) return '#4caf50' // Ready
    if (s === 1) return '#2196f3' // Paused
    if (s === 2) return '#ff9800' // Error
    return '#999'
  }

  const statusText = (s: number) => {
    const map: Record<number, string> = { 0: '就绪', 1: '暂停', 2: '错误', 3: '删除中', 4: '脱机', 5: '缺纸' }
    return map[s] || `状态 ${s}`
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>打印机</h1>
        <p>Printer - 系统打印机管理与打印任务控制</p>
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
              <div className="feature-card"><h3>打印机列表</h3><p>获取系统已安装的所有打印机设备信息</p></div>
              <div className="feature-card"><h3>默认打印机</h3><p>识别系统默认打印机，支持设置默认打印设备</p></div>
              <div className="feature-card"><h3>打印状态</h3><p>获取打印机在线/离线状态、错误状态等信息</p></div>
              <div className="feature-card"><h3>打印任务</h3><p>监控打印队列，支持取消、暂停打印任务</p></div>
            </div>
            <h2>打印机类型</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  +------------------------------------------------+
  |                    打印机类型                  |
  +------------------------------------------------+
            |
    +-------+-------+-------+-------+-------+
    |       |       |       |       |       |
    v       v       v       v       v       v
  +----+ +----+ +----+ +----+ +----+ +----+
  |本地| |网络| |虚拟| |云打| |3D  | |热敏|
  +----+ +----+ +----+ +----+ +----+ +----+
    |       |       |       |       |       |
    v       v       v       v       v       v
  USB    IP/SMB   PDF    云服务  模型   小票
  并口    AirPrint XPS   打印   文件   标签
              `}</pre>
            </div>
            <h2>打印机状态</h2>
            <table className="comparison-table">
              <thead><tr><th>状态</th><th>说明</th><th>可操作</th></tr></thead>
              <tbody>
                <tr><td>Ready</td><td>就绪，可以打印</td><td>发送打印任务</td></tr>
                <tr><td>Printing</td><td>正在打印</td><td>等待完成</td></tr>
                <tr><td>Offline</td><td>离线，不可用</td><td>检查连接</td></tr>
                <tr><td>Error</td><td>错误状态</td><td>检查故障</td></tr>
                <tr><td>Paused</td><td>已暂停</td><td>恢复打印</td></tr>
              </tbody>
            </table>
            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>文档打印</h4><p>快速打印文档、报告、发票等纸质材料</p></div>
              <div className="scenario-card"><h4>批量打印</h4><p>批量处理打印任务，支持队列管理</p></div>
              <div className="scenario-card"><h4>设备管理</h4><p>统一管理多个打印机设备，监控状态</p></div>
              <div className="scenario-card"><h4>票据打印</h4><p>小票打印机、标签打印机专用场景</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>打印机信息采集</h2>
            <div className="connection-demo">
              <div className="demo-controls">
                <button onClick={handleScan} disabled={status === 'scanning'}>
                  {status === 'scanning' ? '获取中...' : '获取列表'}
                </button>
              </div>

              {error && (
                <div className="step-info" style={{ background: '#ffebee', borderColor: '#ef5350' }}>
                  <p style={{ color: '#c62828' }}>错误: {error}</p>
                </div>
              )}

              {printers.length === 0 ? (
                <div className="step-info"><p>点击"获取列表"读取系统打印机</p></div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ marginBottom: 12, fontSize: 16 }}>打印机列表 ({printers.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {printers.map((p, i) => (
                      <SectionCard
                        key={i}
                        title={p.name || `打印机 ${i + 1}`}
                        icon="🖨️"
                        accentColor={p.isDefault ? '#4caf50' : '#9e9e9e'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: statusColor(p.status),
                            display: 'inline-block'
                          }} />
                          <span style={{ fontSize: 13, color: statusColor(p.status) }}>
                            {statusText(p.status)}
                          </span>
                          {p.isDefault && (
                            <span style={{
                              fontSize: 11, background: '#e8f5e9', color: '#2e7d32',
                              padding: '2px 6px', borderRadius: 3, marginLeft: 4
                            }}>默认</span>
                          )}
                        </div>
                        <InfoRow label="描述" value={p.description} />
                        <InfoRow label="URI" value={p.options?.['printer-uri'] || p.uri} />
                        <InfoRow label="状态码" value={p.status} />
                      </SectionCard>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`const { ipcRenderer } = require('electron');

// 获取打印机列表
const printers = await ipcRenderer.invoke('get-printers');
printers.forEach(p => {
  console.log(\`名称: \${p.name}\`);
  console.log(\`  状态: \${p.status}\`);
  console.log(\`  默认: \${p.isDefault}\`);
  console.log(\`  描述: \${p.description}\`);
});`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

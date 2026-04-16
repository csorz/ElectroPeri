import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import { SectionCard, InfoRow } from '../../components/dashboard'

export default function DisplayPage() {
  return (
    <ElectronOnly>
      <DisplayPageContent />
    </ElectronOnly>
  )
}

function DisplayPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.display.info()
      setData(res)
      setPageSnapshot('display', { data: res, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('display', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.display
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
        <h1>显示设备 / GPU</h1>
        <p>Display & GPU - 显示器与图形处理器信息</p>
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
              <div className="feature-card"><h3>显示器信息</h3><p>获取分辨率、刷新率、缩放比例、色彩深度等显示参数</p></div>
              <div className="feature-card"><h3>GPU 信息</h3><p>获取显卡型号、显存、驱动版本、核心频率等信息</p></div>
              <div className="feature-card"><h3>多屏支持</h3><p>支持多显示器环境，获取每个显示器的独立配置</p></div>
              <div className="feature-card"><h3>图形性能</h3><p>监控 GPU 负载、温度、显存使用等性能指标</p></div>
            </div>
            <h2>显示系统架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  +------------------+     +------------------+
  |     GPU 核心     |     |     显存 VRAM    |
  +------------------+     +------------------+
  | - 渲染管线       |     | - 帧缓冲区       |
  | - 光栅化单元     |     | - 纹理缓存       |
  | - 计算单元       |     | - 顶点缓存       |
  +------------------+     +------------------+
            |                       |
            +-----------+-----------+
                        |
                        v
  +------------------------------------------------+
  |              显示输出接口                       |
  +------------------------------------------------+
  |  HDMI  |  DisplayPort  |  DVI  |  VGA (旧)    |
  +--------+---------------+-------+--------------+
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
  +------------+  +------------+  +------------+
  |  显示器 1  |  |  显示器 2  |  |  显示器 3  |
  +------------+  +------------+  +------------+
  | 1920x1080  |  | 2560x1440  |  | 3840x2160  |
  |  60 Hz     |  |  144 Hz    |  |  60 Hz     |
  +------------+  +------------+  +------------+
              `}</pre>
            </div>
            <h2>常见显示接口</h2>
            <table className="comparison-table">
              <thead><tr><th>接口</th><th>最大分辨率</th><th>刷新率</th><th>特点</th></tr></thead>
              <tbody>
                <tr><td>HDMI 2.1</td><td>10K</td><td>120 Hz</td><td>支持 HDR、eARC、游戏模式</td></tr>
                <tr><td>DP 2.0</td><td>16K</td><td>60 Hz</td><td>高带宽、支持多流传输</td></tr>
                <tr><td>Thunderbolt</td><td>8K</td><td>60 Hz</td><td>数据+视频+供电</td></tr>
                <tr><td>DVI-D</td><td>2560x1600</td><td>60 Hz</td><td>仅视频，逐渐淘汰</td></tr>
              </tbody>
            </table>
            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>分辨率检测</h4><p>自动检测最佳分辨率，优化显示效果</p></div>
              <div className="scenario-card"><h4>GPU 监控</h4><p>实时监控显卡负载，优化游戏或渲染性能</p></div>
              <div className="scenario-card"><h4>多屏布局</h4><p>检测多显示器配置，支持窗口管理优化</p></div>
              <div className="scenario-card"><h4>硬件诊断</h4><p>检测显卡型号和驱动版本，排查兼容性问题</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>显示设备信息采集</h2>
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
                <div className="step-info"><p>点击"采集"获取显示器信息、GPU 信息</p></div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  {/* GPU Controllers */}
                  <h3 style={{ marginBottom: 12, fontSize: 16 }}>GPU 控制器</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {(data.graphics?.controllers || []).map((g: any, i: number) => (
                      <SectionCard
                        key={i}
                        title={g.model || g.vendor || `GPU ${i + 1}`}
                        icon="🎮"
                        accentColor="#7c4dff"
                      >
                        <InfoRow label="厂商" value={g.vendor} />
                        <InfoRow label="显存" value={g.vram ? `${g.vram} MB` : undefined} />
                        <InfoRow label="驱动版本" value={g.driverVersion} />
                        <InfoRow label="总线" value={g.bus} />
                        <InfoRow label="核心频率" value={g.clockSpeed ? `${g.clockSpeed} MHz` : undefined} />
                      </SectionCard>
                    ))}
                  </div>

                  {/* Displays */}
                  <h3 style={{ marginBottom: 12, fontSize: 16 }}>显示器</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {(data.displays || []).map((d: any, i: number) => (
                      <SectionCard
                        key={d.id || i}
                        title={`显示器 ${i + 1}`}
                        icon="🖥️"
                        accentColor="#4fc3f7"
                      >
                        <InfoRow label="分辨率" value={`${d.size?.width} x ${d.size?.height}`} />
                        <InfoRow label="刷新率" value={d.displayFrequency ? `${d.displayFrequency} Hz` : undefined} />
                        <InfoRow label="缩放" value={d.scaleFactor ? `${d.scaleFactor}x` : undefined} />
                        <InfoRow label="旋转" value={d.rotation ? `${d.rotation}°` : undefined} />
                        <InfoRow label="工作区" value={d.workArea ? `${d.workArea.width}x${d.workArea.height}` : undefined} />
                        <InfoRow label="位置" value={d.bounds ? `(${d.bounds.x}, ${d.bounds.y})` : undefined} />
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
              <pre>{`const si = require('systeminformation');

// 获取 GPU 信息
async function getGpuInfo() {
  const graphics = await si.graphics();
  graphics.controllers.forEach(gpu => {
    console.log(\`GPU: \${gpu.model}\`);
    console.log(\`  厂商: \${gpu.vendor}\`);
    console.log(\`  显存: \${gpu.vram} MB\`);
    console.log(\`  驱动版本: \${gpu.driverVersion}\`);
  });
}

// Electron: 获取显示器信息
const { screen } = require('electron');
const displays = screen.getAllDisplays();
displays.forEach(d => {
  console.log(\`显示器 ID: \${d.id}\`);
  console.log(\`  分辨率: \${d.size.width} x \${d.size.height}\`);
  console.log(\`  缩放比例: \${d.scaleFactor}\`);
});

getGpuInfo();`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

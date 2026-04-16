import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import { StatCard, SectionCard } from '../../components/dashboard'

const formatHex = (n: number | undefined) => n !== undefined ? `0x${n.toString(16).toUpperCase().padStart(4, '0')}` : '-'

export default function MediaPage() {
  return (
    <ElectronOnly>
      <MediaPageContent />
    </ElectronOnly>
  )
}

function MediaPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.media.devices()
      setData(res)
      setPageSnapshot('media', { data: res, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('media', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.media
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
        <h1>音视频/外设</h1>
        <p>Media & Peripherals - 音频、视频设备与外设管理</p>
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
              <div className="feature-card"><h3>音频设备</h3><p>获取输入/输出音频设备，如麦克风、扬声器</p></div>
              <div className="feature-card"><h3>视频设备</h3><p>获取摄像头、采集卡等视频输入设备信息</p></div>
              <div className="feature-card"><h3>USB 设备</h3><p>列出所有 USB 设备，获取厂商、型号、VID/PID</p></div>
              <div className="feature-card"><h3>图形设备</h3><p>获取 GPU、显卡等图形处理设备信息</p></div>
            </div>
            <h2>设备类型对比</h2>
            <table className="comparison-table">
              <thead><tr><th>设备类型</th><th>接口</th><th>驱动</th><th>特点</th></tr></thead>
              <tbody>
                <tr><td>键盘/鼠标</td><td>USB/蓝牙</td><td>HID</td><td>低延迟，即插即用</td></tr>
                <tr><td>摄像头</td><td>USB 3.0</td><td>UVC</td><td>标准协议，跨平台</td></tr>
                <tr><td>音频设备</td><td>USB/HDA</td><td>USB Audio</td><td>数字/模拟混合</td></tr>
                <tr><td>存储设备</td><td>USB/NVMe</td><td>Mass Storage</td><td>大容量，高速传输</td></tr>
              </tbody>
            </table>
            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>音视频通话</h4><p>枚举可用摄像头和麦克风，支持设备选择</p></div>
              <div className="scenario-card"><h4>设备诊断</h4><p>检测设备是否正常连接，排查驱动问题</p></div>
              <div className="scenario-card"><h4>资产管理</h4><p>收集外设信息，生成硬件清单报告</p></div>
              <div className="scenario-card"><h4>权限管理</h4><p>检测设备权限状态，申请必要权限</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>设备信息采集</h2>
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
                <div className="step-info"><p>点击"采集"获取音频设备、图形设备、USB 设备等信息</p></div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  {/* Summary cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <StatCard icon="🔊" title="音频设备" value={(data.audio || []).length} />
                    <StatCard icon="🎮" title="图形控制器" value={(data.graphics?.controllers || []).length} />
                    <StatCard icon="🔌" title="USB 设备" value={(data.usb || []).length} />
                  </div>

                  {/* Audio devices */}
                  <SectionCard title="音频设备" icon="🔊" accentColor="#4fc3f7" >
                    {(data.audio || []).length === 0 ? (
                      <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: 12 }}>未检测到音频设备</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
                        {(data.audio || []).map((a: any, i: number) => (
                          <div key={i} style={{
                            padding: '10px 12px',
                            background: '#f8f9fa',
                            borderRadius: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                          }}>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{a.name || a.driver || '未知音频设备'}</div>
                            <div style={{ fontSize: 11, color: '#888' }}>
                              {a.type && <span>{a.type} </span>}
                              {a.default && <span style={{ color: '#4caf50' }}>默认 </span>}
                              {a.status && <span>| {a.status}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>

                  {/* GPU controllers */}
                  {(data.graphics?.controllers || []).length > 0 && (
                    <SectionCard title="GPU 控制器" icon="🎮" accentColor="#7c4dff" >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
                        {(data.graphics.controllers || []).map((g: any, i: number) => (
                          <div key={i} style={{ padding: '10px 12px', background: '#f8f9fa', borderRadius: 6 }}>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{g.model || g.vendor || 'Unknown GPU'}</div>
                            <div style={{ fontSize: 11, color: '#888' }}>
                              {g.vendor && <span>{g.vendor} </span>}
                              {g.vram && <span>| {g.vram} MB </span>}
                              {g.driverVersion && <span>| 驱动 {g.driverVersion}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* USB devices */}
                  <SectionCard title="USB 设备" icon="🔌" accentColor="#ff9800" >
                    <table className="comparison-table">
                      <thead>
                        <tr><th>厂商</th><th>设备</th><th>VID</th><th>PID</th><th>类型</th></tr>
                      </thead>
                      <tbody>
                        {(data.usb || []).slice(0, 30).map((u: any, i: number) => (
                          <tr key={i}>
                            <td>{u.manufacturer || '-'}</td>
                            <td>{u.name || '-'}</td>
                            <td style={{ fontFamily: 'Consolas, monospace', fontSize: 12 }}>{formatHex(u.idVendor)}</td>
                            <td style={{ fontFamily: 'Consolas, monospace', fontSize: 12 }}>{formatHex(u.idProduct)}</td>
                            <td>{u.type || '-'}</td>
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

// 获取音频设备
async function getAudioDevices() {
  const audio = await si.audio();
  audio.forEach(a => {
    console.log(\`名称: \${a.name}\`);
    console.log(\`  类型: \${a.type}\`);
    console.log(\`  状态: \${a.status}\`);
    console.log(\`  默认: \${a.default}\`);
  });
}

// 获取 USB 设备
async function getUsbDevices() {
  const usb = await si.usb();
  usb.forEach(u => {
    console.log(\`设备: \${u.name}\`);
    console.log(\`  厂商: \${u.manufacturer}\`);
    console.log(\`  VID:PID: 0x\${u.idVendor}:0x\${u.idProduct}\`);
  });
}

(async () => { await getAudioDevices(); await getUsbDevices(); })();`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

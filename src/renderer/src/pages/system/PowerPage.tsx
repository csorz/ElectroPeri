import { useEffect, useState } from 'react'
import '../toolbox/tools/ToolPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import { GaugeBar, StatCard, SectionCard, InfoRow } from '../../components/dashboard'

export default function PowerPage() {
  return (
    <ElectronOnly>
      <PowerPageContent />
    </ElectronOnly>
  )
}

function PowerPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.power.snapshot()
      setData(res)
      setPageSnapshot('power', { data: res, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('power', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.power
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
        <h1>电源状态</h1>
        <p>Power Status - 电池、电源管理与节能策略</p>
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
              <div className="feature-card"><h3>电源状态</h3><p>检测当前是使用电池还是交流电源供电</p></div>
              <div className="feature-card"><h3>电池信息</h3><p>获取电池电量、充电状态、剩余时间、健康度等</p></div>
              <div className="feature-card"><h3>节能模式</h3><p>检测系统节能模式状态，支持电源计划管理</p></div>
              <div className="feature-card"><h3>电源事件</h3><p>监听电源变化事件，如拔插电源、电量变化等</p></div>
            </div>
            <h2>电源状态流转</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  +-------------------+                    +-------------------+
  |    交流电源 (AC)  |                    |    电池 (Battery) |
  +-------------------+                    +-------------------+
           ^                                         |
           |                                         |
           |  拔掉电源                               |  插入电源
           |                                         |
           +----------------+------------------------+
                            |
                            v
  +------------------------------------------------+
  |                  电源管理                       |
  +------------------------------------------------+
  |  +-------------+  +-------------+  +-----------+
  |  |  电量监测   |  |  充电控制   |  |  节能策略 |
  |  +-------------+  +-------------+  +-----------+
  |  | 剩余百分比  |  | 充电速度    |  | CPU 降频  |
  |  | 剩余时间    |  | 充电阈值    |  | 屏幕调暗  |
  |  | 循环次数    |  | 温度保护    |  | 睡眠策略  |
  |  +-------------+  +-------------+  +-----------+
  +------------------------------------------------+
              `}</pre>
            </div>
            <h2>电池状态对比</h2>
            <table className="comparison-table">
              <thead><tr><th>状态</th><th>电源</th><th>充电</th><th>建议操作</th></tr></thead>
              <tbody>
                <tr><td>充电中</td><td>AC</td><td>是</td><td>继续使用，注意温度</td></tr>
                <tr><td>已充满</td><td>AC</td><td>否</td><td>可断开电源延长电池寿命</td></tr>
                <tr><td>放电中</td><td>Battery</td><td>否</td><td>注意剩余电量</td></tr>
                <tr><td>低电量</td><td>Battery</td><td>否</td><td>尽快充电或保存工作</td></tr>
              </tbody>
            </table>
            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>电量监控</h4><p>实时显示电池状态，提醒用户及时充电或保存工作</p></div>
              <div className="scenario-card"><h4>自适应行为</h4><p>根据电源状态自动调整应用行为，如降低刷新率</p></div>
              <div className="scenario-card"><h4>数据保护</h4><p>电量过低时自动保存数据，防止意外关机丢失</p></div>
              <div className="scenario-card"><h4>节能优化</h4><p>电池模式下启用节能策略，延长续航时间</p></div>
            </div>
            <h2>电源事件监听</h2>
            <div className="info-box">
              <strong>Electron 电源事件</strong>
              <ul>
                <li><strong>suspend</strong> - 系统即将挂起（睡眠）</li>
                <li><strong>resume</strong> - 系统从挂起恢复</li>
                <li><strong>on-battery</strong> - 切换到电池供电</li>
                <li><strong>on-ac</strong> - 切换到交流电源</li>
                <li><strong>shutdown</strong> - 系统即将关机</li>
                <li><strong>lock-screen</strong> - 系统锁屏</li>
                <li><strong>unlock-screen</strong> - 系统解锁</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>电源状态采集</h2>
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
                <div className="step-info"><p>点击"采集"获取电源状态</p></div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  {/* Top stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <StatCard
                      icon={data.onBattery ? '🔋' : '🔌'}
                      title="电源状态"
                      value={data.onBattery ? '电池供电' : '交流电源'}
                      color={data.onBattery ? '#ff9800' : '#4caf50'}
                    />
                    <StatCard
                      icon="🔋"
                      title="电池电量"
                      value={data.percent !== undefined ? `${data.percent}%` : '-'}
                      color={data.percent < 20 ? '#ef5350' : data.percent < 50 ? '#ff9800' : '#4caf50'}
                    />
                    <StatCard
                      icon="⚡"
                      title="充电状态"
                      value={data.charging ? '充电中' : '未充电'}
                      color={data.charging ? '#4caf50' : '#666'}
                    />
                  </div>

                  {/* Battery gauge */}
                  {data.percent !== undefined && data.percent > 0 && (
                    <SectionCard title="电池电量" icon="🔋" accentColor="#4caf50" >
                      <GaugeBar value={data.percent} label="电量" />
                    </SectionCard>
                  )}

                  {/* Battery details */}
                  <SectionCard title="电池详情" icon="📋" accentColor="#ff9800" >
                    <InfoRow label="电源类型" value={data.onBattery ? '电池' : '交流电源'} />
                    <InfoRow label="充电状态" value={data.charging ? '充电中' : '未充电'} />
                    <InfoRow label="AC 连接" value={data.acConnected ? '是' : '否'} />
                    <InfoRow label="剩余时间" value={data.timeRemaining >= 0 ? `${Math.round(data.timeRemaining)} 分钟` : '计算中'} />
                    <InfoRow label="电池类型" value={data.type} />
                    <InfoRow label="制造商" value={data.manufacturer} />
                    <InfoRow label="型号" value={data.model} />
                    <InfoRow label="序列号" value={data.serial} />
                    <InfoRow label="循环次数" value={data.cycleCount || '-'} />
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

// 获取电池信息
async function getBatteryInfo() {
  const battery = await si.battery();
  console.log(\`是否电池供电: \${battery.acConnected ? '否' : '是'}\`);
  console.log(\`电量: \${battery.percent}%\`);
  console.log(\`是否充电: \${battery.charging}\`);
  console.log(\`剩余时间: \${battery.timeRemaining} 分钟\`);
  console.log(\`电池类型: \${battery.type}\`);
  console.log(\`制造商: \${battery.manufacturer}\`);
  console.log(\`循环次数: \${battery.cycleCount}\`);
}

getBatteryInfo();`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import './OnewirePage.css'

export default function OnewirePage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [sensors, setSensors] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [log, setLog] = useState('')

  const appendLog = (line: string) => setLog((p) => p + line + '\n')

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const list = await window.api.onewire.list()
      setSensors(list as string[])
      setStatus('idle')
      appendLog(`sensors: ${(list as string[]).join(', ')}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '扫描失败')
      setStatus('error')
    }
  }

  const handleRead = async () => {
    if (!selected) return
    setError(null)
    try {
      const c = await window.api.onewire.read(selected)
      appendLog(`${selected}: ${c} °C`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取失败')
    }
  }

  return (
    <div className="onewire-page">
      <div className="page-header">
        <h1>1-Wire（DS18B20）采集</h1>
        <button className="btn btn-primary" onClick={handleScan} disabled={status === 'scanning'}>
          {status === 'scanning' ? '扫描中...' : '扫描传感器'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>传感器列表 ({sensors.length})</h3>
          {sensors.length === 0 ? (
            <div className="empty-state">
              <p>点击“扫描传感器”获取 1-Wire 设备</p>
            </div>
          ) : (
            <ul className="sensor-list">
              {sensors.map((id) => (
                <li key={id} className={`sensor-item ${selected === id ? 'selected' : ''}`}>
                  <button className="sensor-btn" onClick={() => setSelected(id)}>
                    {id}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btn-success" onClick={handleRead} disabled={!selected}>
              读取温度
            </button>
            {selected && <span className="pill">当前: {selected}</span>}
          </div>
        </div>

        <div className="data-panel">
          <div className="panel-header">
            <h3>日志</h3>
            <button className="btn btn-secondary" onClick={() => setLog('')}>
              清空
            </button>
          </div>
          <div className="data-display">
            <pre>{log || '暂无数据'}</pre>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-indicator ${status}`} />
        <span>
          状态: {status === 'idle' && '就绪'}
          {status === 'scanning' && '处理中'}
          {status === 'connected' && '已连接'}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}


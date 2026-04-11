import { useState } from 'react'
import './SpiPage.css'

export default function SpiPage() {
  const [bus, setBus] = useState(0)
  const [cs, setCs] = useState(0)
  const [speedHz, setSpeedHz] = useState(1_000_000)
  const [mode, setMode] = useState<0 | 1 | 2 | 3>(0)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [hexTx, setHexTx] = useState('AA 55 00 01')
  const [rxLength, setRxLength] = useState(4)
  const [log, setLog] = useState('')

  const appendLog = (line: string) => setLog((p) => p + line + '\n')

  const handleOpen = async () => {
    setStatus('scanning')
    setError(null)
    try {
      await window.api.spi.open(bus, cs)
      setStatus('connected')
      appendLog(`spi opened: bus=${bus}, cs=${cs}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '打开失败')
      setStatus('error')
    }
  }

  const handleClose = async () => {
    setError(null)
    try {
      await window.api.spi.close()
      setStatus('idle')
      appendLog('spi closed')
    } catch (err) {
      setError(err instanceof Error ? err.message : '关闭失败')
    }
  }

  const handleTransfer = async () => {
    setError(null)
    try {
      const rx = await window.api.spi.transfer(hexTx, rxLength, speedHz, mode)
      appendLog(`TX: ${hexTx}`)
      appendLog(`RX: ${rx}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '传输失败')
    }
  }

  return (
    <div className="spi-page">
      <div className="page-header">
        <h1>SPI 采集</h1>
        <div className="header-actions">
          {status === 'connected' ? (
            <button className="btn btn-danger" onClick={handleClose}>
              关闭
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleOpen} disabled={status === 'scanning'}>
              打开
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>配置</h3>
          <div className="form">
            <label>
              Bus:
              <input type="number" value={bus} min={0} max={10} onChange={(e) => setBus(Number(e.target.value))} disabled={status === 'connected'} />
            </label>
            <label>
              CS:
              <input type="number" value={cs} min={0} max={10} onChange={(e) => setCs(Number(e.target.value))} disabled={status === 'connected'} />
            </label>
            <label>
              Speed(Hz):
              <input type="number" value={speedHz} min={1} onChange={(e) => setSpeedHz(Number(e.target.value))} disabled={status !== 'connected'} />
            </label>
            <label>
              Mode:
              <select value={mode} onChange={(e) => setMode(Number(e.target.value) as any)} disabled={status !== 'connected'}>
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </label>
          </div>

          <h3 style={{ marginTop: 12 }}>传输</h3>
          <div className="form">
            <label>
              TX(hex):
              <input type="text" value={hexTx} onChange={(e) => setHexTx(e.target.value)} disabled={status !== 'connected'} />
            </label>
            <label>
              RX length:
              <input type="number" value={rxLength} min={0} max={4096} onChange={(e) => setRxLength(Number(e.target.value))} disabled={status !== 'connected'} />
            </label>
            <button className="btn btn-primary" onClick={handleTransfer} disabled={status !== 'connected'}>
              Transfer
            </button>
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
          {status === 'connected' && `已打开 - bus ${bus}, cs ${cs}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}


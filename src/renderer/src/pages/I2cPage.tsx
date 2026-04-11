import { useState } from 'react'
import './I2cPage.css'

export default function I2cPage() {
  const [bus, setBus] = useState(1)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<number[]>([])
  const [addr, setAddr] = useState(0x23)
  const [hex, setHex] = useState('01 02 03')
  const [readLen, setReadLen] = useState(8)
  const [log, setLog] = useState('')

  const appendLog = (line: string) => setLog((p) => p + line + '\n')
  const formatAddr = (a: number) => `0x${a.toString(16).toUpperCase().padStart(2, '0')}`

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const found = await window.api.i2c.scan(bus)
      setAddresses(found as number[])
      setStatus('idle')
      appendLog(`scan bus ${bus}: ${found.map(formatAddr).join(', ')}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '扫描失败')
      setStatus('error')
    }
  }

  const handleOpen = async () => {
    setStatus('scanning')
    setError(null)
    try {
      await window.api.i2c.open(bus)
      setStatus('connected')
      appendLog(`i2c open bus ${bus}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '打开失败')
      setStatus('error')
    }
  }

  const handleClose = async () => {
    setError(null)
    try {
      await window.api.i2c.close()
      setStatus('idle')
      appendLog('i2c closed')
    } catch (err) {
      setError(err instanceof Error ? err.message : '关闭失败')
    }
  }

  const handleWrite = async () => {
    setError(null)
    try {
      await window.api.i2c.write(addr, hex)
      appendLog(`TX ${formatAddr(addr)}: ${hex}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '写入失败')
    }
  }

  const handleRead = async () => {
    setError(null)
    try {
      const data = await window.api.i2c.read(addr, readLen)
      appendLog(`RX ${formatAddr(addr)}: ${data}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取失败')
    }
  }

  return (
    <div className="i2c-page">
      <div className="page-header">
        <h1>I2C 采集</h1>
        <div className="header-actions">
          <label>
            Bus:
            <input type="number" value={bus} min={0} max={10} onChange={(e) => setBus(Number(e.target.value))} />
          </label>
          <button className="btn btn-primary" onClick={handleScan} disabled={status === 'scanning'}>
            {status === 'scanning' ? '扫描中...' : '扫描地址'}
          </button>
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
          <h3>发现的地址 ({addresses.length})</h3>
          {addresses.length === 0 ? (
            <div className="empty-state">
              <p>点击“扫描地址”获取 I2C 设备</p>
            </div>
          ) : (
            <ul className="addr-list">
              {addresses.map((a) => (
                <li key={a} className={`addr-item ${a === addr ? 'selected' : ''}`}>
                  <button className="addr-btn" onClick={() => setAddr(a)}>
                    {formatAddr(a)}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3 style={{ marginTop: 12 }}>读写</h3>
          <div className="form">
            <label>
              Addr:
              <input
                type="number"
                value={addr}
                min={0}
                max={127}
                onChange={(e) => setAddr(Number(e.target.value))}
                disabled={status !== 'connected'}
              />
            </label>
            <label>
              Write(hex):
              <input type="text" value={hex} onChange={(e) => setHex(e.target.value)} disabled={status !== 'connected'} />
            </label>
            <label>
              ReadLen:
              <input type="number" value={readLen} min={1} max={256} onChange={(e) => setReadLen(Number(e.target.value))} disabled={status !== 'connected'} />
            </label>
            <div className="row">
              <button className="btn btn-primary" onClick={handleWrite} disabled={status !== 'connected'}>
                写入
              </button>
              <button className="btn btn-secondary" onClick={handleRead} disabled={status !== 'connected'}>
                读取
              </button>
            </div>
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
          {status === 'connected' && `已打开 - bus ${bus}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}


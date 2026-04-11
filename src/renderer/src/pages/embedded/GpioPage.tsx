import { useEffect, useState } from 'react'
import './GpioPage.css'

export default function GpioPage() {
  const [pin, setPin] = useState(17)
  const [direction, setDirection] = useState<'in' | 'out'>('out')
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<number>(0)
  const [watchEdge, setWatchEdge] = useState<'none' | 'rising' | 'falling' | 'both'>('none')
  const [log, setLog] = useState('')

  const appendLog = (line: string) => setLog((p) => p + line + '\n')

  useEffect(() => {
    window.api.gpio.onData((v) => {
      setValue(v)
      appendLog(`GPIO event: ${v}`)
    })
    window.api.gpio.onError((e) => setError(e))
    window.api.gpio.onClosed(() => {
      appendLog('GPIO closed')
      setStatus('idle')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOpen = async () => {
    setStatus('scanning')
    setError(null)
    try {
      await window.api.gpio.open(pin, direction)
      setStatus('connected')
      appendLog(`GPIO opened: pin=${pin}, dir=${direction}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '打开失败')
      setStatus('error')
    }
  }

  const handleClose = async () => {
    setError(null)
    try {
      await window.api.gpio.close()
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : '关闭失败')
    }
  }

  const handleRead = async () => {
    setError(null)
    try {
      const v = await window.api.gpio.read()
      setValue(v)
      appendLog(`GPIO read: ${v}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取失败')
    }
  }

  const handleWrite = async (v: 0 | 1) => {
    setError(null)
    try {
      await window.api.gpio.write(v)
      setValue(v)
      appendLog(`GPIO write: ${v}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '写入失败')
    }
  }

  const handleWatch = async (edge: typeof watchEdge) => {
    setError(null)
    try {
      await window.api.gpio.watch(edge)
      setWatchEdge(edge)
      appendLog(`GPIO watch: ${edge}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '设置监听失败')
    }
  }

  return (
    <div className="gpio-page">
      <div className="page-header">
        <h1>GPIO 采集</h1>
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
              Pin:
              <input
                type="number"
                min={0}
                max={40}
                value={pin}
                onChange={(e) => setPin(Number(e.target.value))}
                disabled={status === 'connected'}
              />
            </label>
            <label>
              Direction:
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                disabled={status === 'connected'}
              >
                <option value="in">in</option>
                <option value="out">out</option>
              </select>
            </label>
            <div className="row">
              {status === 'connected' ? (
                <button className="btn btn-danger" onClick={handleClose}>
                  关闭
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleOpen} disabled={status === 'scanning'}>
                  打开
                </button>
              )}
              <button className="btn btn-secondary" onClick={handleRead} disabled={status !== 'connected'}>
                读取
              </button>
            </div>
          </div>

          <h3 style={{ marginTop: 12 }}>简单控制</h3>
          <div className="row">
            <button className="btn btn-primary" onClick={() => handleWrite(1)} disabled={status !== 'connected' || direction !== 'out'}>
              写 1
            </button>
            <button className="btn btn-primary" onClick={() => handleWrite(0)} disabled={status !== 'connected' || direction !== 'out'}>
              写 0
            </button>
            <div className="pill">当前值: {value}</div>
          </div>

          <h3 style={{ marginTop: 12 }}>监听</h3>
          <div className="row">
            <select
              value={watchEdge}
              onChange={(e) => handleWatch(e.target.value as any)}
              disabled={status !== 'connected' || direction !== 'in'}
            >
              <option value="none">none</option>
              <option value="rising">rising</option>
              <option value="falling">falling</option>
              <option value="both">both</option>
            </select>
            <span className="hint">仅输入模式有效</span>
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
          状态: {status === 'idle' && '未连接'}
          {status === 'scanning' && '处理中'}
          {status === 'connected' && `已打开 - pin ${pin}`}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}


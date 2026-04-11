import { useEffect, useState } from 'react'
import './PowerPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'

export default function PowerPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [onBattery, setOnBattery] = useState<boolean | null>(null)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.power.snapshot()
      setOnBattery(res.onBattery)
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
      setOnBattery(snapshot.data.onBattery)
      setError(snapshot.error || null)
      handleScan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="power-page">
      <div className="page-header">
        <h1>电源状态</h1>
        <button className="btn btn-primary" onClick={handleScan} disabled={status === 'scanning'}>
          {status === 'scanning' ? '采集中...' : '采集'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      <div className="card">
        <div className="kv">
          <span className="k">是否电池供电</span>
          <span className="v">{onBattery === null ? '-' : onBattery ? '是' : '否'}</span>
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-indicator ${status}`} />
        <span>
          状态: {status === 'idle' && '就绪'}
          {status === 'scanning' && '处理中'}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}


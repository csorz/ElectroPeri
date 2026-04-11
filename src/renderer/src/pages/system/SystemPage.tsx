import { useEffect, useState } from 'react'
import './SystemPage.css'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'

const toGB = (bytes = 0) => `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`

export default function SystemPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [refreshSec, setRefreshSec] = useState(0)
  const [updatedAt, setUpdatedAt] = useState<string>('-')
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.system.basic()
      setData(res)
      const now = new Date().toLocaleTimeString()
      setUpdatedAt(now)
      setPageSnapshot('system', { data: res, error: null, updatedAt: now })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('system', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.system
    if (snapshot?.data) {
      setData(snapshot.data)
      setError(snapshot.error || null)
      setUpdatedAt(snapshot.updatedAt || '-')
      // 再次进入页面后自动重新采集
      handleScan()
    }
    if (!refreshSec) return
    const timer = setInterval(() => {
      handleScan()
    }, refreshSec * 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSec])

  return (
    <div className="system-page">
      <div className="page-header">
        <h1>系统信息</h1>
        <div className="header-actions">
          <label>
            自动刷新
            <select value={refreshSec} onChange={(e) => setRefreshSec(Number(e.target.value))}>
              <option value={0}>关闭</option>
              <option value={3}>3s</option>
              <option value={5}>5s</option>
            </select>
          </label>
          <button className="btn btn-primary" onClick={handleScan} disabled={status === 'scanning'}>
            {status === 'scanning' ? '采集中...' : '采集'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      {!data ? (
        <div className="card">
          <pre>点击“采集”获取系统信息（CPU/内存/OS/负载）</pre>
        </div>
      ) : (
        <>
          <div className="card-grid">
            <div className="info-card">
              <div className="title">操作系统</div>
              <div className="value">
                {data.osInfo?.distro} {data.osInfo?.release}
              </div>
              <div className="sub">
                {data.platform} / {data.osInfo?.arch} / {data.hostname}
              </div>
            </div>
            <div className="info-card">
              <div className="title">CPU</div>
              <div className="value">{data.cpu?.brand || '-'}</div>
              <div className="sub">
                {data.cpu?.cores || '-'} 核，当前负载 {data.load?.currentLoad?.toFixed?.(1) ?? '-'}%
              </div>
            </div>
            <div className="info-card">
              <div className="title">内存</div>
              <div className="value">
                {toGB(data.mem?.active)} / {toGB(data.mem?.total)}
              </div>
              <div className="sub">已用 {((data.mem?.active / data.mem?.total) * 100 || 0).toFixed(1)}%</div>
            </div>
          </div>
          <div className="updated-time">最近更新: {updatedAt}</div>
        </>
      )}

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


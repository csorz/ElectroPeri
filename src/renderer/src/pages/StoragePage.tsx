import { useEffect, useState } from 'react'
import './StoragePage.css'
import { usePageSnapshotStore } from '../store/pageSnapshotStore'

const toGB = (value = 0) => `${(value / 1024 / 1024 / 1024).toFixed(1)} GB`

export default function StoragePage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.storage.fs()
      setData(res)
      setPageSnapshot('storage', { data: res, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('storage', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.storage
    if (snapshot?.data) {
      setData(snapshot.data)
      setError(snapshot.error || null)
      handleScan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="storage-page">
      <div className="page-header">
        <h1>存储设备</h1>
        <button className="btn btn-primary" onClick={handleScan} disabled={status === 'scanning'}>
          {status === 'scanning' ? '采集中...' : '采集'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      {!data ? (
        <div className="card">
          <pre>点击“采集”获取磁盘/分区/块设备信息</pre>
        </div>
      ) : (
        <div className="card-list">
          <div className="section">
            <h3>文件系统容量</h3>
            <table>
              <thead>
                <tr>
                  <th>挂载点</th>
                  <th>文件系统</th>
                  <th>已用/总量</th>
                  <th>使用率</th>
                </tr>
              </thead>
              <tbody>
                {(data.fsSize || []).map((item: any, i: number) => (
                  <tr key={i}>
                    <td>{item.mount || '-'}</td>
                    <td>{item.fs || '-'}</td>
                    <td>
                      {toGB(item.used)} / {toGB(item.size)}
                    </td>
                    <td>
                      <div className="usage-cell">
                        <div className="usage-bar">
                          <div className="usage-fill" style={{ width: `${item.use || 0}%` }} />
                        </div>
                        <span>{item.use || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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


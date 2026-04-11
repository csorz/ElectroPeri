import { useEffect, useState } from 'react'
import './MediaPage.css'
import { usePageSnapshotStore } from '../store/pageSnapshotStore'

export default function MediaPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
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
    <div className="media-page">
      <div className="page-header">
        <h1>音视频/外设概览</h1>
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
          <pre>点击“采集”获取音频设备、图形设备、USB 设备等信息</pre>
        </div>
      ) : (
        <div className="card-list">
          <div className="info-row">
            <div className="pill">音频设备: {(data.audio || []).length}</div>
            <div className="pill">图形控制器: {(data.graphics?.controllers || []).length}</div>
            <div className="pill">USB 设备: {(data.usb || []).length}</div>
          </div>
          <div className="section">
            <h3>音频设备</h3>
            <ul>
              {(data.audio || []).slice(0, 20).map((a: any, i: number) => (
                <li key={i}>{a.name || a.driver || 'Unknown Audio Device'}</li>
              ))}
            </ul>
          </div>
          <div className="section">
            <h3>USB 设备</h3>
            <table>
              <thead>
                <tr>
                  <th>厂商</th>
                  <th>设备</th>
                  <th>VID:PID</th>
                </tr>
              </thead>
              <tbody>
                {(data.usb || []).slice(0, 20).map((u: any, i: number) => (
                  <tr key={i}>
                    <td>{u.manufacturer || '-'}</td>
                    <td>{u.name || '-'}</td>
                    <td>{u.idVendor || '-'}:{u.idProduct || '-'}</td>
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


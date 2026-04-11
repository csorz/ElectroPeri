import { useEffect, useState } from 'react'
import './DisplayPage.css'
import { usePageSnapshotStore } from '../store/pageSnapshotStore'

export default function DisplayPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const res = await window.api.display.info()
      setData(res)
      setPageSnapshot('display', { data: res, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('display', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.display
    if (snapshot?.data) {
      setData(snapshot.data)
      setError(snapshot.error || null)
      handleScan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="display-page">
      <div className="page-header">
        <h1>显示设备 / GPU</h1>
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
          <pre>点击“采集”获取显示器信息、GPU 信息</pre>
        </div>
      ) : (
        <div className="card-list">
          <div className="section">
            <h3>显示器</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>分辨率</th>
                  <th>缩放</th>
                  <th>旋转</th>
                </tr>
              </thead>
              <tbody>
                {(data.displays || []).map((d: any) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>
                      {d.size?.width} x {d.size?.height}
                    </td>
                    <td>{d.scaleFactor}</td>
                    <td>{d.rotation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="section">
            <h3>GPU 控制器</h3>
            <ul>
              {(data.graphics?.controllers || []).map((g: any, i: number) => (
                <li key={i}>{g.model || g.vendor || 'Unknown GPU'}</li>
              ))}
            </ul>
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


import { useMemo, useState } from 'react'
import './ProcessPage.css'
import { useEffect } from 'react'
import { usePageSnapshotStore } from '../../store/pageSnapshotStore'

export default function ProcessPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState<'cpu' | 'memory'>('cpu')
  const [limit, setLimit] = useState(20)
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const [list, load] = await Promise.all([window.api.process.list(), window.api.process.load()])
      const next = { list, load }
      setData(next)
      setPageSnapshot('process', { data: next, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '采集失败'
      setError(msg)
      setPageSnapshot('process', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.process
    if (snapshot?.data) {
      setData(snapshot.data)
      setError(snapshot.error || null)
      handleScan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = useMemo(() => {
    if (!data?.list) return []
    const lower = keyword.trim().toLowerCase()
    return [...data.list]
      .filter((p: any) => !lower || `${p.name || ''}`.toLowerCase().includes(lower))
      .sort((a: any, b: any) => (sortBy === 'cpu' ? (b.cpu || 0) - (a.cpu || 0) : (b.memory || 0) - (a.memory || 0)))
      .slice(0, limit)
  }, [data, keyword, sortBy, limit])

  return (
    <div className="process-page">
      <div className="page-header">
        <h1>进程 / 负载</h1>
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
          <pre>点击“采集”获取进程列表与系统负载</pre>
        </div>
      ) : (
        <div className="card-list">
          <div className="info-row">
            <div className="pill">
              总进程: {(data.list || []).length}
            </div>
            <div className="pill">
              CPU 总负载: {data.load?.currentLoad?.currentLoad?.toFixed?.(1) ?? '-'}%
            </div>
          </div>
          <div className="toolbar">
            <input
              type="text"
              placeholder="搜索进程名..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'cpu' | 'memory')}>
              <option value="cpu">按 CPU 排序</option>
              <option value="memory">按内存排序</option>
            </select>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={20}>20 条</option>
              <option value={50}>50 条</option>
              <option value={100}>100 条</option>
            </select>
          </div>
          <div className="section">
            <h3>进程列表</h3>
            <table>
              <thead>
                <tr>
                  <th>PID</th>
                  <th>名称</th>
                  <th>CPU%</th>
                  <th>内存MB</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p: any) => (
                  <tr key={p.pid}>
                    <td>{p.pid}</td>
                    <td>{p.name}</td>
                    <td>{p.cpu?.toFixed?.(1) ?? '-'}</td>
                    <td>{p.memory ? (p.memory / 1024 / 1024).toFixed(1) : '-'}</td>
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


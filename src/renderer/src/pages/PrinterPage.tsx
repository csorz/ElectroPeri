import { useEffect, useState } from 'react'
import './PrinterPage.css'
import { usePageSnapshotStore } from '../store/pageSnapshotStore'

export default function PrinterPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [printers, setPrinters] = useState<any[]>([])
  const { pages, setPageSnapshot } = usePageSnapshotStore()

  const handleScan = async () => {
    setStatus('scanning')
    setError(null)
    try {
      const list = await window.api.printer.list()
      setPrinters(list as any[])
      setPageSnapshot('printer', { data: list, error: null })
      setStatus('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取失败'
      setError(msg)
      setPageSnapshot('printer', { error: msg })
      setStatus('error')
    }
  }

  useEffect(() => {
    const snapshot = pages.printer
    if (snapshot?.data) {
      setPrinters(snapshot.data)
      setError(snapshot.error || null)
      handleScan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="printer-page">
      <div className="page-header">
        <h1>打印机</h1>
        <button className="btn btn-primary" onClick={handleScan} disabled={status === 'scanning'}>
          {status === 'scanning' ? '获取中...' : '获取列表'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      <div className="card-list">
        {printers.length === 0 ? (
          <div className="card">
            <pre>点击“获取列表”读取系统打印机</pre>
          </div>
        ) : (
          <div className="section">
            <h3>打印机列表 ({printers.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>名称</th>
                  <th>状态</th>
                  <th>默认</th>
                </tr>
              </thead>
              <tbody>
                {printers.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{p.status || '-'}</td>
                    <td>{p.isDefault ? '是' : '否'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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


import { useCallback, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function CurrentTimeToolPage() {
  const [now, setNow] = useState(new Date())
  const [running, setRunning] = useState(true)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  const timestampMs = now.getTime()
  const timestampS = Math.floor(timestampMs / 1000)

  const formats = [
    { label: 'ISO 格式', value: now.toISOString() },
    { label: 'UTC 格式', value: now.toUTCString() },
    { label: '本地时间', value: now.toLocaleString() },
    { label: '日期', value: now.toLocaleDateString() },
    { label: '时间', value: now.toLocaleTimeString() },
    { label: '年月日', value: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` },
    { label: '时分秒', value: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}` },
    { label: '星期', value: ['日', '一', '二', '三', '四', '五', '六'][now.getDay()] },
  ]

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/time" className="toolbox-back">
        ← 返回时间与时间戳
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🕐</span>
          <h1>当前时间</h1>
        </div>
        <p className="page-sub">显示当前时间戳和各种日期格式</p>
      </div>

      <section className="tool-card">
        <div className="tool-actions" style={{ marginBottom: '16px' }}>
          <button
            type="button"
            className={`btn ${running ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setRunning(!running)}
          >
            {running ? '暂停' : '继续'}
          </button>
        </div>

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">时间戳</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="tool-result mono" style={{ padding: '12px 16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>毫秒</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{timestampMs}</div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '8px', fontSize: '12px', padding: '4px 8px' }}
                onClick={() => onCopy(String(timestampMs))}
              >
                复制
              </button>
            </div>
            <div className="tool-result mono" style={{ padding: '12px 16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>秒</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{timestampS}</div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '8px', fontSize: '12px', padding: '4px 8px' }}
                onClick={() => onCopy(String(timestampS))}
              >
                复制
              </button>
            </div>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">各种格式</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {formats.map((format) => (
              <div
                key={format.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  borderRadius: '6px',
                }}
              >
                <div>
                  <span style={{ color: '#888', fontSize: '12px', marginRight: '12px' }}>{format.label}</span>
                  <span className="mono">{format.value}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '2px 8px' }}
                  onClick={() => onCopy(format.value)}
                >
                  复制
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

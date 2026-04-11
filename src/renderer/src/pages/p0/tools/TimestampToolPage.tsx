import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function TimestampToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'timestampToDate' | 'dateToTimestamp'>('timestampToDate')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleConvert = () => {
    setError(null)
    const trimmedInput = input.trim()

    if (!trimmedInput) {
      setError('请输入内容')
      setOutput('')
      return
    }

    try {
      if (mode === 'timestampToDate') {
        // 时间戳转日期
        let timestamp = Number(trimmedInput)
        if (isNaN(timestamp)) {
          throw new Error('无效的时间戳')
        }
        // 判断是秒还是毫秒
        if (timestamp < 1e12) {
          timestamp *= 1000
        }
        const date = new Date(timestamp)
        if (isNaN(date.getTime())) {
          throw new Error('无效的时间戳')
        }
        setOutput(
          `本地时间: ${date.toLocaleString()}\n` +
          `ISO 格式: ${date.toISOString()}\n` +
          `UTC 时间: ${date.toUTCString()}\n` +
          `年: ${date.getFullYear()}\n` +
          `月: ${date.getMonth() + 1}\n` +
          `日: ${date.getDate()}\n` +
          `时: ${date.getHours()}\n` +
          `分: ${date.getMinutes()}\n` +
          `秒: ${date.getSeconds()}`
        )
      } else {
        // 日期转时间戳
        const date = new Date(trimmedInput)
        if (isNaN(date.getTime())) {
          throw new Error('无效的日期格式')
        }
        const ms = date.getTime()
        const s = Math.floor(ms / 1000)
        setOutput(
          `毫秒时间戳: ${ms}\n` +
          `秒时间戳: ${s}`
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleNow = () => {
    const now = Date.now()
    if (mode === 'timestampToDate') {
      setInput(String(now))
    } else {
      const date = new Date()
      setInput(date.toISOString().slice(0, 19))
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/time" className="toolbox-back">
        ← 返回时间与时间戳
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">⏱️</span>
          <h1>时间戳转换</h1>
        </div>
        <p className="page-sub">Unix 时间戳与日期互转</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            模式
            <select value={mode} onChange={(e) => setMode(e.target.value as 'timestampToDate' | 'dateToTimestamp')}>
              <option value="timestampToDate">时间戳 → 日期</option>
              <option value="dateToTimestamp">日期 → 时间戳</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">
            {mode === 'timestampToDate' ? '输入时间戳' : '输入日期'}
          </div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'timestampToDate'
                ? '输入 Unix 时间戳（秒或毫秒），如：1699999999'
                : '输入日期字符串，如：2024-01-01 或 2024-01-01T12:00:00'
            }
            rows={3}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleConvert}>
            转换
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleNow}>
            使用当前时间
          </button>
          {output && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
              复制结果
            </button>
          )}
        </div>

        {output && (
          <div className="tool-block">
            <div className="tool-block-title">转换结果</div>
            <pre className="tool-result mono" style={{ whiteSpace: 'pre-wrap' }}>
              {output}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

const commonTimezones = [
  { value: 'Asia/Shanghai', label: '中国 (Asia/Shanghai)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: '日本 (Asia/Tokyo)', offset: '+09:00' },
  { value: 'Asia/Seoul', label: '韩国 (Asia/Seoul)', offset: '+09:00' },
  { value: 'Asia/Singapore', label: '新加坡 (Asia/Singapore)', offset: '+08:00' },
  { value: 'Asia/Hong_Kong', label: '香港 (Asia/Hong_Kong)', offset: '+08:00' },
  { value: 'Asia/Dubai', label: '迪拜 (Asia/Dubai)', offset: '+04:00' },
  { value: 'Europe/London', label: '伦敦 (Europe/London)', offset: '+00:00' },
  { value: 'Europe/Paris', label: '巴黎 (Europe/Paris)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: '柏林 (Europe/Berlin)', offset: '+01:00' },
  { value: 'America/New_York', label: '纽约 (America/New_York)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: '洛杉矶 (America/Los_Angeles)', offset: '-08:00' },
  { value: 'America/Chicago', label: '芝加哥 (America/Chicago)', offset: '-06:00' },
  { value: 'Australia/Sydney', label: '悉尼 (Australia/Sydney)', offset: '+11:00' },
  { value: 'Pacific/Auckland', label: '奥克兰 (Pacific/Auckland)', offset: '+13:00' },
  { value: 'UTC', label: 'UTC', offset: '+00:00' },
]

export default function TimezoneToolPage() {
  const [inputTime, setInputTime] = useState('')
  const [sourceTimezone, setSourceTimezone] = useState('Asia/Shanghai')
  const [targetTimezone, setTargetTimezone] = useState('America/New_York')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleConvert = () => {
    setError(null)
    if (!inputTime.trim()) {
      setError('请输入时间')
      setOutput('')
      return
    }

    try {
      // 解析输入时间
      let date: Date
      if (inputTime.includes('T')) {
        // ISO 格式
        date = new Date(inputTime)
      } else {
        // 尝试解析本地时间字符串
        date = new Date(inputTime)
      }

      if (isNaN(date.getTime())) {
        throw new Error('无效的时间格式')
      }

      const result = `原始时间: ${date.toLocaleString('zh-CN', { timeZone: sourceTimezone })}\n` +
        `源时区: ${sourceTimezone}\n\n` +
        `目标时区: ${targetTimezone}\n` +
        `转换后时间: ${date.toLocaleString('zh-CN', { timeZone: targetTimezone })}\n\n` +
        `UTC 时间: ${date.toISOString()}`

      setOutput(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleNow = () => {
    const now = new Date()
    setInputTime(now.toISOString().slice(0, 19))
  }

  const handleSwap = () => {
    const temp = sourceTimezone
    setSourceTimezone(targetTimezone)
    setTargetTimezone(temp)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/time" className="toolbox-back">
        ← 返回时间与时间戳
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🌍</span>
          <h1>时区转换</h1>
        </div>
        <p className="page-sub">不同时区时间转换</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            源时区
            <select value={sourceTimezone} onChange={(e) => setSourceTimezone(e.target.value)}>
              {commonTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} (UTC{tz.offset})
                </option>
              ))}
            </select>
          </label>
          <label className="tool-label">
            目标时区
            <select value={targetTimezone} onChange={(e) => setTargetTimezone(e.target.value)}>
              {commonTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} (UTC{tz.offset})
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入时间</div>
          <textarea
            className="tool-textarea"
            value={inputTime}
            onChange={(e) => setInputTime(e.target.value)}
            placeholder="输入时间，如：2024-01-01 12:00:00 或 2024-01-01T12:00:00"
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
          <button type="button" className="btn btn-secondary" onClick={handleSwap}>
            交换时区
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

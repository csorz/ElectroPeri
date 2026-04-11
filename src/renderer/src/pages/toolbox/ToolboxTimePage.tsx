import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from './clipboard'
import './toolbox.css'

type EpochUnit = 'auto' | 's' | 'ms'

function parseEpochToMs(raw: string, unit: EpochUnit): number {
  const t = raw.trim()
  if (!/^\d+$/.test(t)) throw new Error('请输入非负整数时间戳')
  const n = Number(t)
  if (unit === 's') return n * 1000
  if (unit === 'ms') return n
  return t.length <= 10 ? n * 1000 : n
}

export default function ToolboxTimePage() {
  const [epochInput, setEpochInput] = useState('')
  const [epochUnit, setEpochUnit] = useState<EpochUnit>('auto')
  const [epochInfo, setEpochInfo] = useState('')
  const [epochError, setEpochError] = useState<string | null>(null)

  const [localInput, setLocalInput] = useState('')
  const [localInfo, setLocalInfo] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleEpochConvert = () => {
    setEpochError(null)
    setEpochInfo('')
    try {
      const ms = parseEpochToMs(epochInput, epochUnit)
      const d = new Date(ms)
      if (Number.isNaN(d.getTime())) throw new Error('无效时间')
      const lines = [
        `毫秒: ${ms}`,
        `本地: ${d.toString()}`,
        `ISO: ${d.toISOString()}`,
        `Locale (zh): ${d.toLocaleString('zh-CN', { hour12: false })}`
      ]
      setEpochInfo(lines.join('\n'))
    } catch (e) {
      setEpochError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleLocalConvert = () => {
    setLocalError(null)
    setLocalInfo('')
    try {
      const d = new Date(localInput)
      if (Number.isNaN(d.getTime())) throw new Error('无法解析该日期时间')
      setLocalInfo(`毫秒时间戳: ${d.getTime()}\nISO: ${d.toISOString()}`)
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const fillNow = () => {
    const ms = Date.now()
    setEpochInput(String(ms))
    setEpochUnit('ms')
    setEpochError(null)
    const d = new Date(ms)
    setEpochInfo(
      [`毫秒: ${ms}`, `本地: ${d.toString()}`, `ISO: ${d.toISOString()}`].join('\n')
    )
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox" className="toolbox-back">
        ← 返回工具箱概览
      </Link>
      <div className="page-header">
        <h1>4. 时间与时间戳</h1>
        <p className="page-sub">时间戳与日期互转；自动模式：≤10 位数字按秒，否则按毫秒</p>
      </div>

      <div className="toolbox-grid">
        <section className="tool-card">
          <h2>时间戳 → 日期</h2>
          {epochError && (
            <div className="error-message">
              <span>❌ {epochError}</span>
            </div>
          )}
          <div className="tool-inline">
            <label className="tool-label" style={{ maxWidth: 200 }}>
              单位
              <select value={epochUnit} onChange={(e) => setEpochUnit(e.target.value as EpochUnit)}>
                <option value="auto">自动</option>
                <option value="s">秒</option>
                <option value="ms">毫秒</option>
              </select>
            </label>
          </div>
          <textarea
            className="tool-textarea"
            value={epochInput}
            onChange={(e) => setEpochInput(e.target.value)}
            placeholder="例如 1700000000 或 1700000000000"
            rows={2}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleEpochConvert}>
              转换
            </button>
            <button type="button" className="btn btn-secondary" onClick={fillNow}>
              填入当前时间
            </button>
            {epochInfo && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(epochInfo)}>
                复制结果
              </button>
            )}
          </div>
          {epochInfo && <textarea className="tool-textarea tool-output" readOnly value={epochInfo} rows={6} />}
        </section>

        <section className="tool-card">
          <h2>日期字符串 → 时间戳</h2>
          <p className="tool-desc">支持 ISO 8601 及浏览器可解析的日期字符串</p>
          {localError && (
            <div className="error-message">
              <span>❌ {localError}</span>
            </div>
          )}
          <textarea
            className="tool-textarea"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="例如 2024-01-15T08:00:00.000Z"
            rows={3}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleLocalConvert}>
              转换
            </button>
            {localInfo && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(localInfo)}>
                复制结果
              </button>
            )}
          </div>
          {localInfo && <textarea className="tool-textarea tool-output" readOnly value={localInfo} rows={4} />}
        </section>
      </div>
    </div>
  )
}

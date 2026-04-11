import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function CronGeneratorToolPage() {
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('9')
  const [day, setDay] = useState('*')
  const [month, setMonth] = useState('*')
  const [weekday, setWeekday] = useState('*')
  const [cronExpression, setCronExpression] = useState('')
  const [description, setDescription] = useState('')

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const presetOptions = [
    { label: '每分钟', value: '* * * * *' },
    { label: '每小时', value: '0 * * * *' },
    { label: '每天零点', value: '0 0 * * *' },
    { label: '每天上午9点', value: '0 9 * * *' },
    { label: '每天中午12点', value: '0 12 * * *' },
    { label: '每天下午6点', value: '0 18 * * *' },
    { label: '每周一上午9点', value: '0 9 * * 1' },
    { label: '每月1号零点', value: '0 0 1 * *' },
    { label: '每月最后一天23:59', value: '59 23 28-31 * *' },
    { label: '工作日上午9点', value: '0 9 * * 1-5' },
  ]

  const generateCron = () => {
    const parts = [minute, hour, day, month, weekday]
    const expr = parts.join(' ')
    setCronExpression(expr)
    setDescription(describeCron(expr))
  }

  const describeCron = (expr: string): string => {
    const parts = expr.split(' ')
    if (parts.length !== 5) return '无效的 Cron 表达式'

    const [m, h, d, mon, w] = parts
    let desc = ''

    // 分钟
    if (m === '*') {
      desc += '每分钟'
    } else {
      desc += `在第 ${m} 分钟`
    }

    // 小时
    if (h !== '*') {
      desc += ` ${h} 点`
    }

    // 日期
    if (d !== '*') {
      desc += ` 每月 ${d} 号`
    }

    // 月份
    if (mon !== '*') {
      const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      const monthNum = parseInt(mon)
      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        desc += ` ${months[monthNum - 1]}`
      }
    }

    // 星期
    if (w !== '*') {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      if (w.includes('-')) {
        const [start, end] = w.split('-').map(Number)
        desc += ` ${weekdays[start]} 到 ${weekdays[end]}`
      } else {
        const dayNum = parseInt(w)
        if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
          desc += ` 每${weekdays[dayNum]}`
        }
      }
    }

    if (m === '*' && h === '*' && d === '*' && mon === '*' && w === '*') {
      desc = '每分钟执行'
    } else if (h !== '*' && d === '*' && mon === '*' && w === '*') {
      desc = `每天 ${h}:${m.padStart(2, '0')} 执行`
    }

    return desc
  }

  const handlePreset = (expr: string) => {
    const parts = expr.split(' ')
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDay(parts[2])
      setMonth(parts[3])
      setWeekday(parts[4])
      setCronExpression(expr)
      setDescription(describeCron(expr))
    }
  }

  const handleCustomExpression = (expr: string) => {
    setCronExpression(expr)
    const parts = expr.trim().split(/\s+/)
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDay(parts[2])
      setMonth(parts[3])
      setWeekday(parts[4])
      setDescription(describeCron(expr))
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/dev" className="toolbox-back">
        ← 返回开发辅助工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">⏰</span>
          <h1>Cron 表达式生成器</h1>
        </div>
        <p className="page-sub">可视化生成 Cron 表达式</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">常用预设</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {presetOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="btn btn-secondary"
                onClick={() => handlePreset(opt.value)}
                style={{ fontSize: '12px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">自定义配置</div>
          <div className="toolbox-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            <label className="tool-label">
              分钟
              <input
                type="text"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="0-59"
              />
            </label>
            <label className="tool-label">
              小时
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                placeholder="0-23"
              />
            </label>
            <label className="tool-label">
              日期
              <input
                type="text"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="1-31"
              />
            </label>
            <label className="tool-label">
              月份
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="1-12"
              />
            </label>
            <label className="tool-label">
              星期
              <input
                type="text"
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                placeholder="0-6"
              />
            </label>
          </div>
          <div className="tool-meta" style={{ marginTop: '12px' }}>
            提示：* 表示所有值，可使用 , 分隔多个值，- 表示范围，/ 表示间隔
          </div>
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={generateCron}>
            生成表达式
          </button>
        </div>

        {cronExpression && (
          <div className="tool-block">
            <div className="tool-block-title">Cron 表达式</div>
            <div className="tool-result mono" style={{ fontSize: '20px', textAlign: 'center' }}>
              {cronExpression}
            </div>
            {description && (
              <div className="tool-meta" style={{ marginTop: '8px' }}>
                说明：{description}
              </div>
            )}
            <div className="tool-actions">
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(cronExpression)}>
                复制表达式
              </button>
            </div>
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">直接输入 Cron 表达式</div>
          <input
            type="text"
            value={cronExpression}
            onChange={(e) => handleCustomExpression(e.target.value)}
            placeholder="输入 Cron 表达式..."
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </section>
    </div>
  )
}

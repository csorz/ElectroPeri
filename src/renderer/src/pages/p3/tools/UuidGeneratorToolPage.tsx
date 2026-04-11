import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

type UuidVersion = 'v1' | 'v4'

export default function UuidGeneratorToolPage() {
  const [version, setVersion] = useState<UuidVersion>('v4')
  const [count, setCount] = useState(5)
  const [uppercase, setUppercase] = useState(false)
  const [hyphens, setHyphens] = useState(true)
  const [results, setResults] = useState<string[]>([])

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 生成 v4 UUID
  const generateV4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // 生成 v1 UUID (模拟时间戳版本)
  const generateV1 = (): string => {
    const now = Date.now()
    const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0')
    const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0')
    const timeHi = (((now >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0')
    const clockSeq = Math.random().toString(16).slice(2, 6)
    const node = Math.random().toString(16).slice(2, 8).padStart(12, '0')

    return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`
  }

  const formatUuid = (uuid: string): string => {
    let formatted = uuid
    if (!hyphens) {
      formatted = formatted.replace(/-/g, '')
    }
    if (uppercase) {
      formatted = formatted.toUpperCase()
    }
    return formatted
  }

  const generate = () => {
    const uuids: string[] = []
    for (let i = 0; i < count; i++) {
      const uuid = version === 'v4' ? generateV4() : generateV1()
      uuids.push(formatUuid(uuid))
    }
    setResults(uuids)
  }

  const copyAll = () => {
    if (results.length > 0) {
      onCopy(results.join('\n'))
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/dev" className="toolbox-back">
        ← 返回开发辅助工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔑</span>
          <h1>UUID 生成器</h1>
        </div>
        <p className="page-sub">生成 UUID/GUID 标识符</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            UUID 版本
            <select value={version} onChange={(e) => setVersion(e.target.value as UuidVersion)}>
              <option value="v4">v4 - 随机生成</option>
              <option value="v1">v1 - 时间戳</option>
            </select>
          </label>
        </div>

        <div className="tool-row">
          <label className="tool-label">
            生成数量
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              min="1"
              max="100"
              style={{ width: '100px' }}
            />
          </label>
        </div>

        <div className="tool-inline">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
            />
            大写
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
            />
            包含连字符
          </label>
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={generate}>
            生成 UUID
          </button>
          <button type="button" className="btn btn-secondary" onClick={clearResults}>
            清空
          </button>
        </div>

        {results.length > 0 && (
          <div className="tool-block">
            <div className="tool-block-title">生成结果 ({results.length} 个)</div>
            <textarea
              className="tool-textarea"
              value={results.join('\n')}
              readOnly
              rows={Math.min(results.length + 2, 15)}
              style={{ fontFamily: "'Consolas', 'Monaco', monospace" }}
            />
            <div className="tool-actions">
              <button type="button" className="btn btn-secondary" onClick={copyAll}>
                复制全部
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

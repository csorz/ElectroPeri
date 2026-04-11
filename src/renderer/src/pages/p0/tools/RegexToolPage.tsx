import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function RegexToolPage() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('')
  const [matches, setMatches] = useState<RegExpMatchArray[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleTest = () => {
    setError(null)
    setMatches(null)
    try {
      const regex = new RegExp(pattern, flags)
      const allMatches = [...text.matchAll(regex)]
      if (allMatches.length > 0) {
        setMatches(allMatches)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '正则表达式错误')
    }
  }

  const handleClear = () => {
    setPattern('')
    setText('')
    setMatches(null)
    setError(null)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/text" className="toolbox-back">
        ← 返回文本与数据转换
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔎</span>
          <h1>正则测试</h1>
        </div>
        <p className="page-sub">正则表达式在线测试与匹配</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-row">
          <label className="tool-label" style={{ flex: 1 }}>
            正则表达式
            <input
              type="text"
              className="tool-input"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="输入正则表达式，如：\d+"
            />
          </label>
          <label className="tool-label">
            标志
            <input
              type="text"
              className="tool-input"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gimsuvy"
              style={{ width: '100px' }}
            />
          </label>
        </div>

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">测试文本</div>
          <textarea
            className="tool-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入要测试的文本..."
            rows={8}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleTest}>
            测试匹配
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClear}>
            清空
          </button>
        </div>

        {matches && (
          <div className="tool-block">
            <div className="tool-block-title">匹配结果 ({matches.length} 个)</div>
            <div className="tool-result" style={{ maxHeight: '300px', overflow: 'auto' }}>
              {matches.map((match, index) => (
                <div key={index} className="match-item" style={{ marginBottom: '8px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold' }}>匹配 {index + 1}:</div>
                  <div className="mono" style={{ margin: '4px 0', color: 'var(--primary)' }}>
                    "{match[0]}"
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    位置: {match.index}
                    {match.length > 1 && (
                      <span> | 捕获组: {JSON.stringify(match.slice(1))}</span>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(matches.map(m => m[0]).join('\n'))}>
                复制所有匹配
              </button>
            </div>
          </div>
        )}

        {matches && matches.length === 0 && (
          <div className="tool-block">
            <div className="tool-result" style={{ color: 'var(--text-secondary)' }}>
              未找到匹配项
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

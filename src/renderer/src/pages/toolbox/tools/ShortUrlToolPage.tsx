import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function ShortUrlToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 简单演示：生成随机短码
  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleGenerate = () => {
    setError(null)
    if (!input.trim()) {
      setError('请输入要缩短的 URL')
      setOutput('')
      return
    }
    // 简单 URL 验证
    try {
      new URL(input)
    } catch {
      setError('请输入有效的 URL')
      setOutput('')
      return
    }
    const shortCode = generateShortCode()
    // 演示用的短网址格式
    setOutput(`https://s.url/${shortCode}`)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/url" className="toolbox-back">
        ← 返回 URL 与参数
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">✂️</span>
          <h1>短网址生成</h1>
        </div>
        <p className="page-sub">生成短网址链接（演示功能）</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入长网址</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入要缩短的 URL，如：https://example.com/very/long/url/path"
            rows={4}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleGenerate}>
            生成短网址
          </button>
          {output && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
              复制结果
            </button>
          )}
        </div>

        {output && (
          <div className="tool-block">
            <div className="tool-block-title">短网址</div>
            <pre className="tool-result mono" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {output}
            </pre>
            <p style={{ marginTop: '8px', color: '#888', fontSize: '12px' }}>
              * 此为演示功能，生成的短网址仅作展示用途
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

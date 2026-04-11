import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function UrlEncodeToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleConvert = () => {
    setError(null)
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input))
      } else {
        setOutput(decodeURIComponent(input))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/encoding" className="toolbox-back">
        ← 返回编码与加解密
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔗</span>
          <h1>URL 编解码</h1>
        </div>
        <p className="page-sub">URL 编码与解码</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            模式
            <select value={mode} onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}>
              <option value="encode">编码 (Encode)</option>
              <option value="decode">解码 (Decode)</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的 URL 或文本...' : '输入要解码的 URL 编码字符串...'}
            rows={6}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleConvert}>
            {mode === 'encode' ? '编码' : '解码'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleSwap}>
            交换输入输出
          </button>
          {output && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
              复制结果
            </button>
          )}
        </div>

        {output && (
          <div className="tool-block">
            <div className="tool-block-title">输出</div>
            <pre className="tool-result mono" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {output}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

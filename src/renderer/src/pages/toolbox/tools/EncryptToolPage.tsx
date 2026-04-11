import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function EncryptToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 简单的 XOR 加密（仅用于演示，生产环境请使用专业加密库）
  const xorCipher = (text: string, key: string): string => {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return result
  }

  const handleConvert = () => {
    setError(null)
    if (!password) {
      setError('请输入密钥')
      setOutput('')
      return
    }
    try {
      if (mode === 'encrypt') {
        const encrypted = xorCipher(input, password)
        // 转为 Base64 便于传输
        setOutput(btoa(unescape(encodeURIComponent(encrypted))))
      } else {
        const decoded = decodeURIComponent(escape(atob(input)))
        setOutput(xorCipher(decoded, password))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/encoding" className="toolbox-back">
        ← 返回编码与加解密
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔒</span>
          <h1>加密解密</h1>
        </div>
        <p className="page-sub">简单的 XOR 加密解密（演示用途）</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            模式
            <select value={mode} onChange={(e) => setMode(e.target.value as 'encrypt' | 'decrypt')}>
              <option value="encrypt">加密</option>
              <option value="decrypt">解密</option>
            </select>
          </label>
        </div>

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">密钥</div>
          <input
            type="password"
            className="tool-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入加密/解密密钥..."
          />
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">输入</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encrypt' ? '输入要加密的文本...' : '输入要解密的密文...'}
            rows={6}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleConvert}>
            {mode === 'encrypt' ? '加密' : '解密'}
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

      <div className="tool-notice">
        <p>⚠️ 注意：此工具使用简单的 XOR 加密，仅用于演示目的。生产环境请使用 AES、RSA 等专业加密算法。</p>
      </div>
    </div>
  )
}

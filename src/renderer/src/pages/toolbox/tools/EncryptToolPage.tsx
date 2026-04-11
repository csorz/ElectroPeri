import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import CryptoJS from 'crypto-js'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

type EncryptMode = 'encrypt' | 'decrypt'
type Algorithm = 'AES' | 'DES' | 'TripleDES' | 'RC4'

export default function EncryptToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<EncryptMode>('encrypt')
  const [algorithm, setAlgorithm] = useState<Algorithm>('AES')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const encrypt = (text: string, key: string, algo: Algorithm): string => {
    const keyBytes = CryptoJS.enc.Utf8.parse(key)
    switch (algo) {
      case 'AES':
        return CryptoJS.AES.encrypt(text, keyBytes).toString()
      case 'DES':
        return CryptoJS.DES.encrypt(text, keyBytes).toString()
      case 'TripleDES':
        return CryptoJS.TripleDES.encrypt(text, keyBytes).toString()
      case 'RC4':
        return CryptoJS.RC4.encrypt(text, keyBytes).toString()
      default:
        return CryptoJS.AES.encrypt(text, keyBytes).toString()
    }
  }

  const decrypt = (text: string, key: string, algo: Algorithm): string => {
    const keyBytes = CryptoJS.enc.Utf8.parse(key)
    let result: CryptoJS.lib.WordArray
    switch (algo) {
      case 'AES':
        result = CryptoJS.AES.decrypt(text, keyBytes)
        break
      case 'DES':
        result = CryptoJS.DES.decrypt(text, keyBytes)
        break
      case 'TripleDES':
        result = CryptoJS.TripleDES.decrypt(text, keyBytes)
        break
      case 'RC4':
        result = CryptoJS.RC4.decrypt(text, keyBytes)
        break
      default:
        result = CryptoJS.AES.decrypt(text, keyBytes)
    }
    return result.toString(CryptoJS.enc.Utf8)
  }

  const handleConvert = () => {
    setError(null)
    if (!password) {
      setError('请输入密钥')
      setOutput('')
      return
    }
    if (!input.trim()) {
      setError('请输入内容')
      setOutput('')
      return
    }
    try {
      if (mode === 'encrypt') {
        setOutput(encrypt(input, password, algorithm))
      } else {
        const result = decrypt(input, password, algorithm)
        if (!result) {
          throw new Error('解密失败，请检查密钥或密文是否正确')
        }
        setOutput(result)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleSwap = () => {
    if (output) {
      setInput(output)
      setOutput('')
      setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt')
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
        <p className="page-sub">支持 AES、DES、TripleDES、RC4 加密算法</p>
      </div>

      <section className="tool-card">
        <div className="tool-inline">
          <label className="tool-label">
            模式
            <select value={mode} onChange={(e) => setMode(e.target.value as EncryptMode)}>
              <option value="encrypt">加密</option>
              <option value="decrypt">解密</option>
            </select>
          </label>

          <label className="tool-label">
            算法
            <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as Algorithm)}>
              <option value="AES">AES</option>
              <option value="DES">DES</option>
              <option value="TripleDES">TripleDES</option>
              <option value="RC4">RC4</option>
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
          <div className="tool-block-title">{mode === 'encrypt' ? '明文' : '密文'}</div>
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
            <>
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
                复制结果
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleSwap}>
                结果作为输入
              </button>
            </>
          )}
        </div>

        {output && (
          <div className="tool-block">
            <div className="tool-block-title">{mode === 'encrypt' ? '密文' : '明文'}</div>
            <pre className="tool-result mono" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {output}
            </pre>
          </div>
        )}
      </section>

      <div className="tool-notice">
        <p>💡 提示：AES 是最常用的对称加密算法，安全性高且性能好。</p>
        <p>请妥善保管您的密钥，密钥丢失将无法解密数据。</p>
      </div>
    </div>
  )
}

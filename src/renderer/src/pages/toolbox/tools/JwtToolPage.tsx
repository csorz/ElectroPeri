import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import CryptoJS from 'crypto-js'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

type JwtMode = 'decode' | 'encode'

interface JwtHeader {
  alg: string
  typ: string
}

interface JwtPayload {
  [key: string]: unknown
}

export default function JwtToolPage() {
  const [mode, setMode] = useState<JwtMode>('decode')
  const [jwtInput, setJwtInput] = useState('')
  const [header, setHeader] = useState<JwtHeader | null>(null)
  const [payload, setPayload] = useState<JwtPayload | null>(null)
  const [signature, setSignature] = useState('')
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 编码相关状态
  const [encodeHeader, setEncodeHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [encodePayload, setEncodePayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}')
  const [encodeSecret, setEncodeSecret] = useState('')
  const [encodedJwt, setEncodedJwt] = useState('')

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const base64UrlEncode = (str: string): string => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const base64UrlDecode = (str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    try {
      return atob(base64)
    } catch {
      return ''
    }
  }

  const createSignature = (headerB64: string, payloadB64: string, secret: string): string => {
    const message = `${headerB64}.${payloadB64}`
    const signature = CryptoJS.HmacSHA256(message, secret)
    return CryptoJS.enc.Base64.stringify(signature)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const decodeJwt = () => {
    setError(null)
    setHeader(null)
    setPayload(null)
    setSignature('')
    setSignatureValid(null)

    const token = jwtInput.trim()
    if (!token) {
      setError('请输入 JWT Token')
      return
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      setError('无效的 JWT 格式，应该包含三部分（用 . 分隔）')
      return
    }

    try {
      const headerJson = base64UrlDecode(parts[0])
      const payloadJson = base64UrlDecode(parts[1])

      setHeader(JSON.parse(headerJson))
      setPayload(JSON.parse(payloadJson))
      setSignature(parts[2])
    } catch {
      setError('JWT 解析失败，请检查格式是否正确')
    }
  }

  const verifySignature = () => {
    if (!jwtInput.trim() || !encodeSecret.trim()) {
      setError('请输入 JWT Token 和密钥')
      return
    }

    const parts = jwtInput.trim().split('.')
    if (parts.length !== 3) {
      setError('无效的 JWT 格式')
      return
    }

    const expectedSignature = createSignature(parts[0], parts[1], encodeSecret)
    setSignatureValid(expectedSignature === parts[2])
  }

  const encodeJwt = () => {
    setError(null)
    setEncodedJwt('')

    if (!encodeSecret.trim()) {
      setError('请输入 Secret 密钥')
      return
    }

    try {
      const headerObj = JSON.parse(encodeHeader)
      const payloadObj = JSON.parse(encodePayload)

      const headerB64 = base64UrlEncode(JSON.stringify(headerObj))
      const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj))
      const signatureB64 = createSignature(headerB64, payloadB64, encodeSecret)

      setEncodedJwt(`${headerB64}.${payloadB64}.${signatureB64}`)
    } catch {
      setError('JSON 格式错误，请检查 Header 和 Payload 格式')
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/dev" className="toolbox-back">
        ← 返回开发辅助工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🎫</span>
          <h1>JWT 编解码</h1>
        </div>
        <p className="page-sub">JWT Token 编码、解码与签名验证</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            模式
            <select value={mode} onChange={(e) => setMode(e.target.value as JwtMode)}>
              <option value="decode">解码 JWT</option>
              <option value="encode">编码 JWT</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {mode === 'decode' ? (
          <>
            <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="tool-block-title">JWT Token</div>
              <textarea
                className="tool-textarea"
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                placeholder="输入 JWT Token..."
                rows={4}
              />
            </div>

            <div className="tool-block">
              <div className="tool-block-title">验证签名（可选）</div>
              <input
                type="text"
                className="tool-input"
                value={encodeSecret}
                onChange={(e) => setEncodeSecret(e.target.value)}
                placeholder="输入 Secret 密钥验证签名..."
              />
            </div>

            <div className="tool-actions">
              <button type="button" className="btn btn-primary" onClick={decodeJwt}>
                解码
              </button>
              {jwtInput && encodeSecret && (
                <button type="button" className="btn btn-secondary" onClick={verifySignature}>
                  验证签名
                </button>
              )}
            </div>

            {signatureValid !== null && (
              <div className={signatureValid ? 'success-message' : 'error-message'} style={{ marginTop: 12 }}>
                <span>{signatureValid ? '✅ 签名验证通过' : '❌ 签名验证失败'}</span>
              </div>
            )}

            {header && (
              <div className="tool-block">
                <div className="tool-block-title">Header</div>
                <pre className="tool-result mono">{JSON.stringify(header, null, 2)}</pre>
                <div className="tool-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onCopy(JSON.stringify(header, null, 2))}>
                    复制
                  </button>
                </div>
              </div>
            )}

            {payload && (
              <div className="tool-block">
                <div className="tool-block-title">Payload</div>
                <pre className="tool-result mono">{JSON.stringify(payload, null, 2)}</pre>
                <div className="tool-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onCopy(JSON.stringify(payload, null, 2))}>
                    复制
                  </button>
                </div>
              </div>
            )}

            {signature && (
              <div className="tool-block">
                <div className="tool-block-title">Signature</div>
                <pre className="tool-result mono" style={{ wordBreak: 'break-all' }}>{signature}</pre>
                <div className="tool-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onCopy(signature)}>
                    复制
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="tool-block-title">Header</div>
              <textarea
                className="tool-textarea"
                value={encodeHeader}
                onChange={(e) => setEncodeHeader(e.target.value)}
                rows={4}
              />
            </div>

            <div className="tool-block">
              <div className="tool-block-title">Payload</div>
              <textarea
                className="tool-textarea"
                value={encodePayload}
                onChange={(e) => setEncodePayload(e.target.value)}
                rows={6}
              />
            </div>

            <div className="tool-block">
              <div className="tool-block-title">Secret 密钥</div>
              <input
                type="text"
                className="tool-input"
                value={encodeSecret}
                onChange={(e) => setEncodeSecret(e.target.value)}
                placeholder="输入密钥（用于签名）..."
              />
            </div>

            <div className="tool-actions">
              <button type="button" className="btn btn-primary" onClick={encodeJwt}>
                编码并签名
              </button>
            </div>

            {encodedJwt && (
              <div className="tool-block">
                <div className="tool-block-title">编码结果</div>
                <textarea
                  className="tool-textarea"
                  value={encodedJwt}
                  readOnly
                  rows={4}
                />
                <div className="tool-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => onCopy(encodedJwt)}>
                    复制 JWT
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <div className="tool-notice">
        <p>💡 提示：使用 HMAC-SHA256 算法进行签名。请妥善保管您的 Secret 密钥。</p>
      </div>
    </div>
  )
}

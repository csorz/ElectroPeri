import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function RandomPasswordToolPage() {
  const [length, setLength] = useState(16)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(false)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [passwords, setPasswords] = useState<string[]>([])
  const [count, setCount] = useState(5)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const NUMBERS = '0123456789'
  const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const AMBIGUOUS = 'l1IO0'

  const generatePassword = () => {
    let charset = ''
    let requiredChars = ''

    if (includeLowercase) {
      const chars = excludeAmbiguous
        ? LOWERCASE.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
        : LOWERCASE
      charset += chars
      requiredChars += chars[Math.floor(Math.random() * chars.length)]
    }

    if (includeUppercase) {
      const chars = excludeAmbiguous
        ? UPPERCASE.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
        : UPPERCASE
      charset += chars
      requiredChars += chars[Math.floor(Math.random() * chars.length)]
    }

    if (includeNumbers) {
      const chars = excludeAmbiguous
        ? NUMBERS.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
        : NUMBERS
      charset += chars
      requiredChars += chars[Math.floor(Math.random() * chars.length)]
    }

    if (includeSymbols) {
      charset += SYMBOLS
      requiredChars += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    }

    if (!charset) {
      return
    }

    const newPasswords: string[] = []
    for (let i = 0; i < count; i++) {
      let password = ''
      // 先添加必需字符
      password = requiredChars

      // 填充剩余长度
      for (let j = password.length; j < length; j++) {
        password += charset[Math.floor(Math.random() * charset.length)]
      }

      // 打乱字符顺序
      password = password.split('').sort(() => Math.random() - 0.5).join('')
      newPasswords.push(password)
    }

    setPasswords(newPasswords)
  }

  const copyAll = () => {
    if (passwords.length > 0) {
      onCopy(passwords.join('\n'))
    }
  }

  const clearPasswords = () => {
    setPasswords([])
  }

  const calculateStrength = (pwd: string): { level: string; color: string } => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    if (score <= 2) return { level: '弱', color: '#f44336' }
    if (score <= 4) return { level: '中等', color: '#ff9800' }
    if (score <= 5) return { level: '强', color: '#4caf50' }
    return { level: '非常强', color: '#2e7d32' }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/dev" className="toolbox-back">
        ← 返回开发辅助工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🎲</span>
          <h1>随机密码生成器</h1>
        </div>
        <p className="page-sub">生成安全的随机密码</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            密码长度: {length}
            <input
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              style={{ width: '200px' }}
            />
          </label>
        </div>

        <div className="tool-row">
          <label className="tool-label">
            生成数量
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              min="1"
              max="50"
              style={{ width: '80px' }}
            />
          </label>
        </div>

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">包含字符</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
              />
              小写字母 (a-z)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
              />
              大写字母 (A-Z)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
              />
              数字 (0-9)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
              />
              特殊符号 (!@#$%^&*...)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={excludeAmbiguous}
                onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              />
              排除易混淆字符 (l, 1, I, O, 0)
            </label>
          </div>
        </div>

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={generatePassword}
            disabled={!includeLowercase && !includeUppercase && !includeNumbers && !includeSymbols}
          >
            生成密码
          </button>
          <button type="button" className="btn btn-secondary" onClick={clearPasswords}>
            清空
          </button>
        </div>

        {passwords.length > 0 && (
          <div className="tool-block">
            <div className="tool-block-title">生成结果</div>
            {passwords.map((pwd, index) => {
              const strength = calculateStrength(pwd)
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    fontFamily: "'Consolas', 'Monaco', monospace"
                  }}
                >
                  <span style={{ flex: 1, wordBreak: 'break-all' }}>{pwd}</span>
                  <span
                    style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: strength.color,
                      color: '#fff'
                    }}
                  >
                    {strength.level}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onCopy(pwd)}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    复制
                  </button>
                </div>
              )
            })}
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

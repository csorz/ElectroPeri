import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

type ConvertMode = 'text-to-unicode' | 'unicode-to-text' | 'text-to-utf8' | 'utf8-to-text'

export default function UnicodeToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<ConvertMode>('text-to-unicode')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleConvert = () => {
    setError(null)
    try {
      switch (mode) {
        case 'text-to-unicode': {
          const codes: string[] = []
          for (let i = 0; i < input.length; i++) {
            codes.push(`U+${input.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')}`)
          }
          setOutput(codes.join(' '))
          break
        }
        case 'unicode-to-text': {
          const codes = input.split(/\s+/).filter(Boolean)
          const chars = codes.map((code) => {
            const hex = code.replace(/^U\+/i, '')
            return String.fromCharCode(parseInt(hex, 16))
          })
          setOutput(chars.join(''))
          break
        }
        case 'text-to-utf8': {
          const encoder = new TextEncoder()
          const bytes = encoder.encode(input)
          setOutput(Array.from(bytes).map((b) => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`).join(' '))
          break
        }
        case 'utf8-to-text': {
          const hexBytes = input.split(/\s+/).filter(Boolean)
          const bytes = new Uint8Array(
            hexBytes.map((hex) => parseInt(hex.replace(/^0x/i, ''), 16))
          )
          const decoder = new TextDecoder()
          setOutput(decoder.decode(bytes))
          break
        }
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
          <span className="page-icon">🌐</span>
          <h1>Unicode 编码</h1>
        </div>
        <p className="page-sub">Unicode、UTF-8 编码转换</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            模式
            <select value={mode} onChange={(e) => setMode(e.target.value as ConvertMode)}>
              <option value="text-to-unicode">文本 → Unicode 码点</option>
              <option value="unicode-to-text">Unicode 码点 → 文本</option>
              <option value="text-to-utf8">文本 → UTF-8 字节</option>
              <option value="utf8-to-text">UTF-8 字节 → 文本</option>
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
            placeholder={
              mode === 'text-to-unicode'
                ? '输入文本...'
                : mode === 'unicode-to-text'
                  ? '输入 Unicode 码点（如 U+4E2D U+6587）...'
                  : mode === 'text-to-utf8'
                    ? '输入文本...'
                    : '输入 UTF-8 字节（如 0xE4 0xB8 0xAD）...'
            }
            rows={6}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleConvert}>
            转换
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

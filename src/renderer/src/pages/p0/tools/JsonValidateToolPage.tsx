import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../toolbox.css'

export default function JsonValidateToolPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ valid: boolean; message: string; path?: string } | null>(null)

  const handleValidate = () => {
    if (!input.trim()) {
      setResult({ valid: false, message: '请输入 JSON 数据' })
      return
    }
    try {
      JSON.parse(input)
      setResult({ valid: true, message: '✅ JSON 格式正确' })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'JSON 格式错误'
      // 尝试提取错误位置
      const match = message.match(/position (\d+)/)
      const path = match ? `位置 ${match[1]}` : undefined
      setResult({ valid: false, message: `❌ ${message}`, path })
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/json" className="toolbox-back">
        ← 返回 JSON 处理
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">✅</span>
          <h1>JSON 校验</h1>
        </div>
        <p className="page-sub">校验 JSON 格式是否正确</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入 JSON</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='输入要校验的 JSON 数据...'
            rows={10}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleValidate}>
            校验
          </button>
        </div>

        {result && (
          <div className={`tool-block ${result.valid ? 'success-block' : 'error-block'}`}>
            <div className="tool-block-title">校验结果</div>
            <div className={result.valid ? 'success-message' : 'error-message'}>
              {result.message}
              {result.path && <span> ({result.path})</span>}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

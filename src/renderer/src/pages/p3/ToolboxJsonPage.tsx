import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from './clipboard'
import './toolbox.css'

export default function ToolboxJsonPage() {
  const [jsonInput, setJsonInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleJsonFormat = () => {
    setJsonError(null)
    try {
      const obj = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(obj, null, 2))
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'JSON 解析失败')
    }
  }

  const handleJsonMinify = () => {
    setJsonError(null)
    try {
      const obj = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(obj))
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'JSON 解析失败')
    }
  }

  const handleJsonValidate = () => {
    setJsonError(null)
    try {
      JSON.parse(jsonInput)
      setJsonOutput('校验通过：JSON 格式正确')
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'JSON 解析失败')
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox" className="toolbox-back">
        ← 返回工具箱概览
      </Link>
      <div className="page-header">
        <h1>2. JSON 处理</h1>
        <p className="page-sub">格式化、压缩、校验（JSON.parse）</p>
      </div>

      <section className="tool-card">
        {jsonError && (
          <div className="error-message">
            <span>❌ {jsonError}</span>
          </div>
        )}

        <textarea
          className="tool-textarea"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='粘贴 JSON，例如 {"a":1}'
          rows={12}
        />

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleJsonFormat}>
            格式化
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleJsonMinify}>
            压缩
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleJsonValidate}>
            校验
          </button>
          {jsonOutput && (
            <button type="button" className="btn btn-secondary" onClick={() => onCopy(jsonOutput)}>
              复制输出
            </button>
          )}
        </div>

        {jsonOutput && <textarea className="tool-textarea tool-output" readOnly value={jsonOutput} rows={14} />}
      </section>
    </div>
  )
}

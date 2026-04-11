import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function JsonToYamlToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 简单的 JSON 转 YAML 实现
  const jsonToYaml = (obj: unknown, indent: number = 0): string => {
    const spaces = '  '.repeat(indent)
    if (obj === null) return 'null'
    if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj)
    if (typeof obj === 'string') {
      // 如果字符串包含换行或特殊字符，使用引号
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || obj.includes('"')) {
        return `"${obj.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
      }
      return obj
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      return obj.map((item) => {
        const value = jsonToYaml(item, indent + 1)
        if (typeof item === 'object' && item !== null) {
          return `- \n${value.split('\n').map((l) => spaces + '  ' + l).join('\n')}`
        }
        return `- ${value}`
      }).join('\n')
    }
    if (typeof obj === 'object') {
      const entries = Object.entries(obj)
      if (entries.length === 0) return '{}'
      return entries.map(([key, value]) => {
        const yamlValue = jsonToYaml(value, indent + 1)
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value as object).length > 0) {
          return `${key}:\n${yamlValue.split('\n').map((l) => spaces + '  ' + l).join('\n')}`
        }
        if (Array.isArray(value) && value.length > 0) {
          return `${key}:\n${yamlValue.split('\n').map((l) => spaces + l).join('\n')}`
        }
        return `${key}: ${yamlValue}`
      }).join('\n')
    }
    return String(obj)
  }

  const handleConvert = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input)
      setOutput(jsonToYaml(parsed))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON 格式错误')
      setOutput('')
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/json" className="toolbox-back">
        ← 返回 JSON 处理
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📝</span>
          <h1>JSON 转 YAML</h1>
        </div>
        <p className="page-sub">将 JSON 数据转换为 YAML 格式</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入 JSON</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='输入 JSON 数据...'
            rows={10}
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
            <div className="tool-block-title">YAML 输出</div>
            <pre className="tool-result mono" style={{ maxHeight: '400px', overflow: 'auto' }}>
              {output}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

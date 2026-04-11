import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function JsonToCsvToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const jsonToCsv = (data: unknown): string => {
    if (!Array.isArray(data)) {
      throw new Error('JSON 数据必须是数组格式')
    }
    if (data.length === 0) {
      return ''
    }

    // 获取所有字段
    const headers = new Set<string>()
    data.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach((key) => headers.add(key))
      }
    })
    const headerList = Array.from(headers)

    // 生成 CSV
    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) return ''
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = [
      headerList.map(escapeCsv).join(','),
      ...data.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return headerList.map((key) => escapeCsv((item as Record<string, unknown>)[key])).join(',')
        }
        return ''
      })
    ]
    return rows.join('\n')
  }

  const handleConvert = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input)
      setOutput(jsonToCsv(parsed))
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
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
          <span className="page-icon">📊</span>
          <h1>JSON 转 CSV</h1>
        </div>
        <p className="page-sub">将 JSON 数组转换为 CSV 格式</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入 JSON 数组</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='输入 JSON 数组，如：[{"name": "张三", "age": 25}, {"name": "李四", "age": 30}]'
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
            <div className="tool-block-title">CSV 输出</div>
            <pre className="tool-result mono" style={{ maxHeight: '400px', overflow: 'auto' }}>
              {output}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

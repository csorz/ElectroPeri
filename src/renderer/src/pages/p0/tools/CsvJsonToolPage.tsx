import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function CsvJsonToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'csvToJson' | 'jsonToCsv'>('csvToJson')
  const [delimiter, setDelimiter] = useState(',')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const csvToJson = (csv: string, delim: string) => {
    const lines = csv.trim().split('\n')
    if (lines.length === 0) return '[]'

    const headers = parseCsvLine(lines[0], delim)
    const result: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = parseCsvLine(lines[i], delim)
        const obj: Record<string, string> = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        result.push(obj)
      }
    }

    return JSON.stringify(result, null, 2)
  }

  const parseCsvLine = (line: string, delim: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === delim && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const jsonToCsv = (json: string, delim: string) => {
    const data = JSON.parse(json)
    if (!Array.isArray(data) || data.length === 0) {
      return ''
    }

    const headers = Object.keys(data[0])
    const lines: string[] = [headers.join(delim)]

    for (const item of data) {
      const values = headers.map(h => {
        const val = String(item[h] ?? '')
        if (val.includes(delim) || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`
        }
        return val
      })
      lines.push(values.join(delim))
    }

    return lines.join('\n')
  }

  const handleConvert = () => {
    setError(null)
    setOutput('')
    try {
      if (mode === 'csvToJson') {
        setOutput(csvToJson(input, delimiter))
      } else {
        setOutput(jsonToCsv(input, delimiter))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setMode(mode === 'csvToJson' ? 'jsonToCsv' : 'csvToJson')
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/text" className="toolbox-back">
        ← 返回文本与数据转换
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔄</span>
          <h1>CSV/JSON 互转</h1>
        </div>
        <p className="page-sub">CSV 与 JSON 格式互相转换</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            转换模式
            <select value={mode} onChange={(e) => setMode(e.target.value as 'csvToJson' | 'jsonToCsv')}>
              <option value="csvToJson">CSV → JSON</option>
              <option value="jsonToCsv">JSON → CSV</option>
            </select>
          </label>
          <label className="tool-label">
            分隔符
            <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
              <option value=",">逗号 (,)</option>
              <option value=";">分号 (;)</option>
              <option value="	">制表符 (Tab)</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">{mode === 'csvToJson' ? 'CSV 输入' : 'JSON 输入'}</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'csvToJson' ? 'name,age,city\nAlice,25,Beijing\nBob,30,Shanghai' : '[{"name": "Alice", "age": 25}]'}
            rows={10}
          />
        </div>

        <div className="tool-actions">
          <button type="button" className="btn btn-primary" onClick={handleConvert}>
            转换
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
            <div className="tool-block-title">{mode === 'csvToJson' ? 'JSON 输出' : 'CSV 输出'}</div>
            <pre className="tool-result mono" style={{ maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {output}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

export default function YamlJsonToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'yamlToJson' | 'jsonToYaml'>('yamlToJson')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 简单的 YAML 解析器
  const parseYaml = (yaml: string): unknown => {
    const lines = yaml.split('\n')
    return parseYamlLines(lines, 0, 0)
  }

  const parseYamlLines = (lines: string[], startIndex: number, baseIndent: number): unknown => {
    const result: Record<string, unknown> = {}
    let i = startIndex

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      if (trimmed === '' || trimmed.startsWith('#')) {
        i++
        continue
      }

      const indent = line.length - line.trimStart().length
      if (indent < baseIndent) break

      if (trimmed.startsWith('- ')) {
        // 数组
        const arr: unknown[] = []
        while (i < lines.length) {
          const currentLine = lines[i]
          const currentTrimmed = currentLine.trim()
          const currentIndent = currentLine.length - currentLine.trimStart().length

          if (currentIndent < indent) break
          if (currentTrimmed.startsWith('- ')) {
            const value = currentTrimmed.slice(2)
            if (value.includes(':')) {
              // 数组项是对象
              const objLines = [value]
              i++
              while (i < lines.length) {
                const nextLine = lines[i]
                const nextIndent = nextLine.length - nextLine.trimStart().length
                if (nextIndent > currentIndent && !nextLine.trim().startsWith('- ')) {
                  objLines.push('  ' + nextLine.trim())
                  i++
                } else {
                  break
                }
              }
              arr.push(parseYamlLines(objLines, 0, 0))
            } else {
              arr.push(parseYamlValue(value))
              i++
            }
          } else {
            break
          }
        }
        return arr
      }

      const colonIndex = trimmed.indexOf(':')
      if (colonIndex > 0) {
        const key = trimmed.slice(0, colonIndex).trim()
        const value = trimmed.slice(colonIndex + 1).trim()

        if (value === '' || value === '|' || value === '>') {
          // 嵌套对象或多行字符串
          i++
          const nestedIndent = indent + 2
          if (value === '|' || value === '>') {
            // 多行字符串
            const strLines: string[] = []
            while (i < lines.length) {
              const nextLine = lines[i]
              const nextIndent = nextLine.length - nextLine.trimStart().length
              if (nextIndent >= nestedIndent && nextLine.trim()) {
                strLines.push(nextLine.trim())
                i++
              } else {
                break
              }
            }
            result[key] = strLines.join('\n')
          } else {
            result[key] = parseYamlLines(lines, i, nestedIndent)
            // 更新 i 到嵌套对象结束位置
            while (i < lines.length) {
              const nextIndent = lines[i].length - lines[i].trimStart().length
              if (nextIndent < nestedIndent && lines[i].trim()) break
              i++
            }
          }
        } else {
          result[key] = parseYamlValue(value)
          i++
        }
      } else {
        i++
      }
    }

    return result
  }

  const parseYamlValue = (value: string): unknown => {
    if (value === 'null' || value === '~') return null
    if (value === 'true') return true
    if (value === 'false') return false
    if (/^-?\d+$/.test(value)) return parseInt(value, 10)
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value)
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1)
    }
    return value
  }

  // JSON 转 YAML
  const jsonToYaml = (obj: unknown, indent: number = 0): string => {
    const spaces = '  '.repeat(indent)
    if (obj === null) return 'null'
    if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj)
    if (typeof obj === 'string') {
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
          return `-\n${value.split('\n').map((l) => spaces + '  ' + l).join('\n')}`
        }
        return `- ${value}`
      }).join('\n')
    }
    if (typeof obj === 'object') {
      const entries = Object.entries(obj)
      if (entries.length === 0) return '{}'
      return entries.map(([key, value]) => {
        const yamlValue = jsonToYaml(value, indent + 1)
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
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
    setOutput('')
    try {
      if (mode === 'yamlToJson') {
        const result = parseYaml(input)
        setOutput(JSON.stringify(result, null, 2))
      } else {
        const parsed = JSON.parse(input)
        setOutput(jsonToYaml(parsed))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setMode(mode === 'yamlToJson' ? 'jsonToYaml' : 'yamlToJson')
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/text" className="toolbox-back">
        ← 返回文本与数据转换
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🔄</span>
          <h1>YAML/JSON 互转</h1>
        </div>
        <p className="page-sub">YAML 与 JSON 格式互相转换</p>
      </div>

      <section className="tool-card">
        <div className="tool-row">
          <label className="tool-label">
            转换模式
            <select value={mode} onChange={(e) => setMode(e.target.value as 'yamlToJson' | 'jsonToYaml')}>
              <option value="yamlToJson">YAML → JSON</option>
              <option value="jsonToYaml">JSON → YAML</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">{mode === 'yamlToJson' ? 'YAML 输入' : 'JSON 输入'}</div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'yamlToJson' ? 'name: Alice\nage: 25\ncity: Beijing' : '{"name": "Alice", "age": 25}'}
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
            <div className="tool-block-title">{mode === 'yamlToJson' ? 'JSON 输出' : 'YAML 输出'}</div>
            <pre className="tool-result mono" style={{ maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {output}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

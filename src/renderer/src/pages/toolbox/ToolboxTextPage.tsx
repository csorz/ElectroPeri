import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import yaml from 'js-yaml'
import { copyToClipboard } from './clipboard'
import { csvToJsonRows } from './csvToJson'
import { diffLines } from './lineDiff'
import './toolbox.css'

export default function ToolboxTextPage() {
  const [regexPattern, setRegexPattern] = useState('\\d+')
  const [regexFlags, setRegexFlags] = useState('g')
  const [regexText, setRegexText] = useState('a1b2c3')
  const [regexOut, setRegexOut] = useState('')
  const [regexError, setRegexError] = useState<string | null>(null)

  const [diffA, setDiffA] = useState('line1\nline2\nline3')
  const [diffB, setDiffB] = useState('line1\nline2 changed\nline3')
  const [diffOut, setDiffOut] = useState('')

  const [csvInput, setCsvInput] = useState('name,age\nAlice,30\nBob,25')
  const [csvOut, setCsvOut] = useState('')
  const [csvError, setCsvError] = useState<string | null>(null)

  const [yamlJsonInput, setYamlJsonInput] = useState('a: 1\nb:\n  c: 2')
  const [yamlJsonOut, setYamlJsonOut] = useState('')
  const [yamlJsonError, setYamlJsonError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleRegex = () => {
    setRegexError(null)
    setRegexOut('')
    try {
      const re = new RegExp(regexPattern, regexFlags)
      const matches = Array.from(regexText.matchAll(re))
      if (matches.length === 0) {
        setRegexOut('无匹配')
        return
      }
      const lines = matches.map((m, i) => {
        const g = m.groups ? JSON.stringify(m.groups) : ''
        return `#${i} index=${m.index} [${m[0]}] groups=${g}`
      })
      setRegexOut(lines.join('\n'))
    } catch (e) {
      setRegexError(e instanceof Error ? e.message : '正则错误')
    }
  }

  const handleDiff = () => {
    setDiffOut(diffLines(diffA, diffB))
  }

  const handleCsv = () => {
    setCsvError(null)
    setCsvOut('')
    try {
      const rows = csvToJsonRows(csvInput)
      setCsvOut(JSON.stringify(rows, null, 2))
    } catch (e) {
      setCsvError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleYamlToJson = () => {
    setYamlJsonError(null)
    setYamlJsonOut('')
    try {
      const obj = yaml.load(yamlJsonInput) as unknown
      setYamlJsonOut(JSON.stringify(obj, null, 2))
    } catch (e) {
      setYamlJsonError(e instanceof Error ? e.message : 'YAML 解析失败')
    }
  }

  const handleJsonToYaml = () => {
    setYamlJsonError(null)
    setYamlJsonOut('')
    try {
      const obj = JSON.parse(yamlJsonInput)
      setYamlJsonOut(yaml.dump(obj))
    } catch (e) {
      setYamlJsonError(e instanceof Error ? e.message : 'JSON 解析失败')
    }
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox" className="toolbox-back">
        ← 返回工具箱概览
      </Link>
      <div className="page-header">
        <h1>6. 文本与数据转换</h1>
        <p className="page-sub">正则、行级 Diff、CSV→JSON、YAML↔JSON</p>
      </div>

      <div className="toolbox-grid">
        <section className="tool-card">
          <h2>正则匹配</h2>
          {regexError && (
            <div className="error-message">
              <span>❌ {regexError}</span>
            </div>
          )}
          <div className="tool-inline">
            <label className="tool-label">
              模式
              <input type="text" value={regexPattern} onChange={(e) => setRegexPattern(e.target.value)} />
            </label>
            <label className="tool-label">
              标志
              <input type="text" value={regexFlags} onChange={(e) => setRegexFlags(e.target.value)} style={{ width: 80 }} />
            </label>
          </div>
          <textarea
            className="tool-textarea"
            value={regexText}
            onChange={(e) => setRegexText(e.target.value)}
            placeholder="待匹配文本"
            rows={4}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleRegex}>
              匹配
            </button>
            {regexOut && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(regexOut)}>
                复制结果
              </button>
            )}
          </div>
          {regexOut && <textarea className="tool-textarea tool-output" readOnly value={regexOut} rows={6} />}
        </section>

        <section className="tool-card">
          <h2>行级 Diff</h2>
          <p className="tool-desc">前缀：空格为相同行，- 为仅 A，+ 为仅 B</p>
          <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="tool-block-title">文本 A</div>
            <textarea className="tool-textarea" value={diffA} onChange={(e) => setDiffA(e.target.value)} rows={5} />
          </div>
          <div className="tool-block">
            <div className="tool-block-title">文本 B</div>
            <textarea className="tool-textarea" value={diffB} onChange={(e) => setDiffB(e.target.value)} rows={5} />
          </div>
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleDiff}>
              生成 Diff
            </button>
            {diffOut && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(diffOut)}>
                复制结果
              </button>
            )}
          </div>
          {diffOut && <textarea className="tool-textarea tool-output" readOnly value={diffOut} rows={10} />}
        </section>

        <section className="tool-card">
          <h2>CSV → JSON</h2>
          {csvError && (
            <div className="error-message">
              <span>❌ {csvError}</span>
            </div>
          )}
          <textarea
            className="tool-textarea"
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            rows={6}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleCsv}>
              转换
            </button>
            {csvOut && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(csvOut)}>
                复制结果
              </button>
            )}
          </div>
          {csvOut && <textarea className="tool-textarea tool-output" readOnly value={csvOut} rows={10} />}
        </section>

        <section className="tool-card">
          <h2>YAML ↔ JSON</h2>
          <p className="tool-desc">左侧输入 YAML 或 JSON，选择转换方向</p>
          {yamlJsonError && (
            <div className="error-message">
              <span>❌ {yamlJsonError}</span>
            </div>
          )}
          <textarea
            className="tool-textarea"
            value={yamlJsonInput}
            onChange={(e) => setYamlJsonInput(e.target.value)}
            rows={8}
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={handleYamlToJson}>
              YAML → JSON
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleJsonToYaml}>
              JSON → YAML
            </button>
            {yamlJsonOut && (
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(yamlJsonOut)}>
                复制输出
              </button>
            )}
          </div>
          {yamlJsonOut && <textarea className="tool-textarea tool-output" readOnly value={yamlJsonOut} rows={12} />}
        </section>
      </div>
    </div>
  )
}

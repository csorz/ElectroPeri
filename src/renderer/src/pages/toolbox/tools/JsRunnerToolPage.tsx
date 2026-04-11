import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

const DEFAULT_CODE = `// JavaScript 在线运行工具
// 可以在此处编写和运行 JavaScript 代码

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));

// 数组操作示例
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled);

// 使用 console.log 输出结果
`

export default function JsRunnerToolPage() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const runCode = () => {
    setRunning(true)
    setError(null)
    setOutput('')

    try {
      // 创建安全的执行环境
      const logs: string[] = []
      const mockConsole = {
        log: (...args: unknown[]) => {
          logs.push(args.map(arg => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg, null, 2)
            }
            return String(arg)
          }).join(' '))
        },
        error: (...args: unknown[]) => {
          logs.push('[ERROR] ' + args.map(arg => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg, null, 2)
            }
            return String(arg)
          }).join(' '))
        },
        warn: (...args: unknown[]) => {
          logs.push('[WARN] ' + args.map(arg => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg, null, 2)
            }
            return String(arg)
          }).join(' '))
        },
        info: (...args: unknown[]) => {
          logs.push('[INFO] ' + args.map(arg => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg, null, 2)
            }
            return String(arg)
          }).join(' '))
        }
      }

      // 使用 Function 构造函数执行代码
      const fn = new Function('console', code)
      fn(mockConsole)

      setOutput(logs.join('\n'))
    } catch (e) {
      setError(e instanceof Error ? e.message : '执行失败')
    } finally {
      setRunning(false)
    }
  }

  const clearCode = () => {
    setCode('')
    setOutput('')
    setError(null)
  }

  const loadExample = () => {
    setCode(DEFAULT_CODE)
    setOutput('')
    setError(null)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/code" className="toolbox-back">
        ← 返回代码编译运行
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🟨</span>
          <h1>JavaScript 在线运行</h1>
        </div>
        <p className="page-sub">在浏览器中运行 JavaScript 代码</p>
      </div>

      <section className="tool-card">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">代码编辑区</div>
          <textarea
            className="tool-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="输入 JavaScript 代码..."
            style={{ minHeight: '300px', fontFamily: "'Consolas', 'Monaco', monospace" }}
          />
        </div>

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={runCode}
            disabled={!code.trim() || running}
          >
            {running ? '运行中...' : '运行代码'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={clearCode}>
            清空
          </button>
          <button type="button" className="btn btn-secondary" onClick={loadExample}>
            加载示例
          </button>
        </div>

        {output && (
          <div className="tool-block">
            <div className="tool-block-title">输出结果</div>
            <pre className="tool-result mono" style={{ whiteSpace: 'pre-wrap' }}>
              {output}
            </pre>
            <div className="tool-actions">
              <button type="button" className="btn btn-secondary" onClick={() => onCopy(output)}>
                复制输出
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

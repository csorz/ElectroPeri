import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

const DEFAULT_CODE = `# Python 运行工具
# 需要系统安装 Python 3

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# 列表操作示例
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)

# 数学运算
import math
print("PI:", math.pi)
print("Sqrt(2):", math.sqrt(2))
`

interface RunResult {
  success: boolean
  output: string
  error: string
  time: number
}

export default function PythonRunnerToolPage() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState<number | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const runCode = async () => {
    setRunning(true)
    setError(null)
    setOutput('')
    setTime(null)

    try {
      const result: RunResult = await window.api.codeRunner.runPython(code, 10000)
      setTime(result.time)

      if (result.success) {
        setOutput(result.output)
      } else {
        setError(result.error || '执行失败')
        if (result.output) {
          setOutput(result.output)
        }
      }
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
    setTime(null)
  }

  const loadExample = () => {
    setCode(DEFAULT_CODE)
    setOutput('')
    setError(null)
    setTime(null)
  }

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/code" className="toolbox-back">
        ← 返回代码编译运行
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🐍</span>
          <h1>Python 运行</h1>
        </div>
        <p className="page-sub">使用系统 Python 3 执行代码</p>
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
            placeholder="输入 Python 代码..."
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

        {(output || time !== null) && (
          <div className="tool-block">
            <div className="tool-block-title">
              输出结果
              {time !== null && <span style={{ float: 'right', color: '#888', fontSize: 12 }}>耗时: {time}ms</span>}
            </div>
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

      <div className="tool-notice">
        <p>💡 提示：需要系统安装 Python 3 并添加到 PATH 环境变量。</p>
      </div>
    </div>
  )
}

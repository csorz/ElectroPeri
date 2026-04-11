import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

const DEFAULT_CODE = `// Java 在线运行工具
// 注意：此工具需要后端支持才能实际运行 Java 代码

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        // 数组操作示例
        int[] numbers = {1, 2, 3, 4, 5};
        for (int n : numbers) {
            System.out.println(n * 2);
        }
    }
}
`

export default function JavaRunnerToolPage() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const runCode = () => {
    setError(null)
    setOutput('')

    // 由于浏览器无法直接运行 Java，显示提示信息
    setError('Java 代码需要后端服务支持才能运行。当前为演示模式。')
    setOutput(`提示：
1. 在浏览器中无法直接运行 Java 代码
2. 需要部署后端服务（如使用 Java 编译器）
3. 可考虑以下方案：
   - 后端 API: 将代码发送到服务器编译执行
   - 在线编译服务: 使用 Judge0 等在线编译 API
   - Docker 容器: 在容器中编译运行

您的代码：
${code}`)
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
          <span className="page-icon">☕</span>
          <h1>Java 在线运行</h1>
        </div>
        <p className="page-sub">Java 代码在线编译运行（需要后端支持）</p>
      </div>

      <section className="tool-card">
        <div className="tool-desc" style={{ background: '#fff3cd', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
          <strong>提示：</strong>Java 代码需要后端服务支持才能实际运行。当前为演示模式。
        </div>

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
            placeholder="输入 Java 代码..."
            style={{ minHeight: '300px', fontFamily: "'Consolas', 'Monaco', monospace" }}
          />
        </div>

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={runCode}
            disabled={!code.trim()}
          >
            运行代码
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

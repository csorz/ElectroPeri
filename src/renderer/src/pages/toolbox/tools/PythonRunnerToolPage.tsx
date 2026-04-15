import { useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

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
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState<number | null>(null)

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
    <div className="tool-page">
      <div className="tool-header">
        <h1>Python 运行</h1>
        <p>使用系统 Python 3 执行代码</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>语言特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>简洁优雅</h3>
                <p>语法简洁清晰，代码可读性强，用缩进表示代码块，减少冗余符号</p>
              </div>
              <div className="feature-card">
                <h3>动态类型</h3>
                <p>变量无需声明类型，运行时自动推断，支持鸭子类型</p>
              </div>
              <div className="feature-card">
                <h3>多范式</h3>
                <p>支持面向对象、函数式、过程式等多种编程范式</p>
              </div>
              <div className="feature-card">
                <h3>丰富生态</h3>
                <p>PyPI 拥有海量第三方库，覆盖 Web、数据科学、AI 等领域</p>
              </div>
            </div>

            <h2>语法基础</h2>
            <div className="info-box">
              <strong>变量与数据类型</strong>
              <ul>
                <li>基本类型：int, float, str, bool, None</li>
                <li>容器类型：list, tuple, dict, set</li>
                <li>无需声明类型，直接赋值即可</li>
              </ul>
            </div>
            <div className="info-box">
              <strong>缩进规则</strong>
              <ul>
                <li>使用 4 个空格作为标准缩进</li>
                <li>同一代码块必须保持相同缩进</li>
                <li>冒号后换行并缩进表示代码块开始</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>数据科学</strong> - NumPy、Pandas 数据分析与处理</li>
              <li><strong>机器学习</strong> - TensorFlow、PyTorch、scikit-learn</li>
              <li><strong>Web 开发</strong> - Django、Flask、FastAPI 后端框架</li>
              <li><strong>自动化脚本</strong> - 系统管理、运维自动化、爬虫</li>
              <li><strong>科学计算</strong> - SciPy、Matplotlib 可视化</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>代码运行</h2>
            <div className="connection-demo">
              {error && (
                <div className="info-box warning">
                  <strong>执行错误</strong>
                  <p>{error}</p>
                </div>
              )}

              <div className="config-row" style={{ marginBottom: '12px' }}>
                <label>代码编辑区</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="输入 Python 代码..."
                  style={{
                    minHeight: '280px',
                    fontFamily: "'Consolas', 'Monaco', monospace",
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '13px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="demo-controls">
                <button onClick={runCode} disabled={!code.trim() || running}>
                  {running ? '运行中...' : '运行代码'}
                </button>
                <button onClick={clearCode}>清空</button>
                <button onClick={loadExample}>加载示例</button>
              </div>

              {(output || time !== null) && (
                <div style={{ marginTop: '16px' }}>
                  <div className="step-info">
                    <h4>
                      输出结果
                      {time !== null && <span style={{ float: 'right', fontWeight: 'normal', color: '#888', fontSize: '12px' }}>耗时: {time}ms</span>}
                    </h4>
                    <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap', fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '13px' }}>
                      {output}
                    </pre>
                  </div>
                  <div className="demo-controls" style={{ marginTop: '8px' }}>
                    <button onClick={() => copyToClipboard(output)}>复制输出</button>
                  </div>
                </div>
              )}
            </div>

            <div className="info-box" style={{ marginTop: '16px' }}>
              <strong>环境要求</strong>
              <p>需要系统安装 Python 3 并添加到 PATH 环境变量，最大执行时间 10 秒。</p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>基础语法</h2>
            <div className="code-block">
              <pre>{`# 变量与数据类型
name = "Python"
version = 3.11
numbers = [1, 2, 3, 4, 5]
person = {"name": "Alice", "age": 25}

# 函数定义
def greet(name):
    return f"Hello, {name}!"

# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# 字典推导式
squared = {x: x**2 for x in range(5)}

# 条件语句
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"`}</pre>
            </div>

            <h2>类与对象</h2>
            <div className="code-block">
              <pre>{`# 类定义
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"{self.name} makes a sound.")

# 继承
class Dog(Animal):
    def speak(self):
        print(f"{self.name} barks.")

# 使用
dog = Dog("Buddy")
dog.speak()  # Buddy barks.

# 属性装饰器
class Circle:
    def __init__(self, radius):
        self.radius = radius

    @property
    def area(self):
        return 3.14159 * self.radius ** 2`}</pre>
            </div>

            <h2>异常处理与文件操作</h2>
            <div className="code-block">
              <pre>{`# 异常处理
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
finally:
    print("Cleanup")

# 文件读取
with open("file.txt", "r") as f:
    content = f.read()

# 文件写入
with open("output.txt", "w") as f:
    f.write("Hello, World!")

# 上下文管理器
class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, *args):
        print(f"Elapsed: {time.time() - self.start}s")`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

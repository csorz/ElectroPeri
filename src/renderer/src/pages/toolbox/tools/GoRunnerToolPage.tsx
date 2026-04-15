import { useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

const DEFAULT_CODE = `// Go 运行工具
// 需要系统安装 Go

package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")

    // 切片操作示例
    numbers := []int{1, 2, 3, 4, 5}
    for _, n := range numbers {
        fmt.Println(n * 2)
    }
}
`

interface RunResult {
  success: boolean
  output: string
  error: string
  time: number
}

export default function GoRunnerToolPage() {
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
      const result: RunResult = await window.api.codeRunner.runGo(code, 15000)
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
        <h1>Go 运行</h1>
        <p>使用系统 Go 编译执行代码</p>
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
                <h3>简洁高效</h3>
                <p>语法简洁，编译速度快，执行效率接近 C 语言</p>
              </div>
              <div className="feature-card">
                <h3>并发模型</h3>
                <p>原生支持 goroutine 和 channel，轻松编写并发程序</p>
              </div>
              <div className="feature-card">
                <h3>静态类型</h3>
                <p>编译时类型检查，类型推断减少代码冗余</p>
              </div>
              <div className="feature-card">
                <h3>内置工具链</h3>
                <p>集成测试、格式化、文档生成等工具，开箱即用</p>
              </div>
            </div>

            <h2>语法基础</h2>
            <div className="info-box">
              <strong>变量声明</strong>
              <ul>
                <li><code>var name type</code> - 标准声明</li>
                <li><code>name := value</code> - 短变量声明（函数内）</li>
                <li><code>const name = value</code> - 常量声明</li>
              </ul>
            </div>
            <div className="info-box">
              <strong>程序结构</strong>
              <ul>
                <li>可执行程序必须有 main 包和 main 函数</li>
                <li>导出的标识符首字母大写</li>
                <li>无需分号结尾，编译器自动处理</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>云原生</strong> - Docker、Kubernetes 等核心基础设施</li>
              <li><strong>微服务</strong> - gRPC、高性能 API 服务</li>
              <li><strong>网络编程</strong> - 代理、网关、负载均衡器</li>
              <li><strong>命令行工具</strong> - CLI 工具、DevOps 脚本</li>
              <li><strong>区块链</strong> - 以太坊、Hyperledger 等项目</li>
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
                  placeholder="输入 Go 代码..."
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
                  {running ? '编译运行中...' : '运行代码'}
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
              <p>需要系统安装 Go 并添加到 PATH 环境变量，最大执行时间 15 秒。</p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>基础语法</h2>
            <div className="code-block">
              <pre>{`package main

import "fmt"

func main() {
    // 变量声明
    var name string = "Go"
    version := 1.21  // 短变量声明

    // 基本类型
    var i int = 10
    var f float64 = 3.14
    var b bool = true

    // 数组与切片
    arr := [5]int{1, 2, 3, 4, 5}
    slice := []int{1, 2, 3}
    slice = append(slice, 4, 5)

    // Map
    m := map[string]int{
        "one":   1,
        "two":   2,
        "three": 3,
    }

    // 循环（只有 for）
    for i := 0; i < 5; i++ {
        fmt.Println(i)
    }

    // range 遍历
    for key, value := range m {
        fmt.Printf("%s: %d\\n", key, value)
    }
}`}</pre>
            </div>

            <h2>函数与方法</h2>
            <div className="code-block">
              <pre>{`// 函数定义
func add(a, b int) int {
    return a + b
}

// 多返回值
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// 命名返回值
func rectangle(width, height int) (area, perimeter int) {
    area = width * height
    perimeter = 2 * (width + height)
    return  // 自动返回命名变量
}

// 方法（绑定到类型）
type Rectangle struct {
    Width  float64
    Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// 指针接收者（可修改）
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}`}</pre>
            </div>

            <h2>并发编程</h2>
            <div className="code-block">
              <pre>{`// Goroutine
go func() {
    fmt.Println("Hello from goroutine")
}()

// Channel
ch := make(chan int)

// 发送
go func() {
    ch <- 42
}()

// 接收
value := <-ch

// 缓冲 Channel
buffered := make(chan int, 10)

// Select
select {
case msg := <-ch1:
    fmt.Println("From ch1:", msg)
case msg := <-ch2:
    fmt.Println("From ch2:", msg)
case <-time.After(time.Second):
    fmt.Println("Timeout")
}

// WaitGroup
var wg sync.WaitGroup
for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(n int) {
        defer wg.Done()
        fmt.Println(n)
    }(i)
}
wg.Wait()`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

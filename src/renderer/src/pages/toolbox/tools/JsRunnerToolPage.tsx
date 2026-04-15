import { useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

const DEFAULT_CODE = `// JavaScript 运行工具
// 使用 Node.js VM 模块安全执行

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));

// 数组操作示例
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled);

// 数学运算
console.log('PI:', Math.PI);
console.log('Random:', Math.random().toFixed(4));
`

interface RunResult {
  success: boolean
  output: string
  error: string
  time: number
}

export default function JsRunnerToolPage() {
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
      const result: RunResult = await window.api.codeRunner.runJs(code, 5000)
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
        <h1>JavaScript 运行</h1>
        <p>使用 Node.js VM 模块安全执行 JavaScript 代码</p>
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
                <h3>动态类型</h3>
                <p>变量无需声明类型，类型在运行时确定，提供极大的灵活性</p>
              </div>
              <div className="feature-card">
                <h3>原型继承</h3>
                <p>基于原型的继承机制，对象可以从其他对象继承属性和方法</p>
              </div>
              <div className="feature-card">
                <h3>事件驱动</h3>
                <p>支持异步编程模型，适合处理 I/O 密集型应用</p>
              </div>
              <div className="feature-card">
                <h3>跨平台</h3>
                <p>可在浏览器、Node.js、Deno 等多种环境中运行</p>
              </div>
            </div>

            <h2>语法基础</h2>
            <div className="info-box">
              <strong>变量声明</strong>
              <ul>
                <li><code>let</code> - 块级作用域变量，可重新赋值</li>
                <li><code>const</code> - 块级作用域常量，不可重新赋值</li>
                <li><code>var</code> - 函数作用域变量（不推荐使用）</li>
              </ul>
            </div>
            <div className="info-box">
              <strong>数据类型</strong>
              <ul>
                <li>原始类型：number, string, boolean, null, undefined, symbol, bigint</li>
                <li>引用类型：object, array, function</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>Web 前端</strong> - 浏览器端交互、DOM 操作、SPA 框架</li>
              <li><strong>服务端开发</strong> - Node.js 构建 Web 服务、API</li>
              <li><strong>跨平台应用</strong> - Electron 桌面应用、React Native 移动应用</li>
              <li><strong>工具脚本</strong> - 自动化构建、数据处理、CLI 工具</li>
              <li><strong>可视化</strong> - D3.js、ECharts 图表绑定</li>
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
                  placeholder="输入 JavaScript 代码..."
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
              <strong>安全提示</strong>
              <p>代码在隔离的 VM 沙箱中执行，无法访问文件系统和网络，最大执行时间 5 秒。</p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>基础语法</h2>
            <div className="code-block">
              <pre>{`// 变量声明
let name = 'JavaScript';
const version = 2023;

// 函数定义
function greet(name) {
  return \`Hello, \${name}!\`;
}

// 箭头函数
const add = (a, b) => a + b;

// 数组操作
const arr = [1, 2, 3, 4, 5];
const doubled = arr.map(n => n * 2);
const sum = arr.reduce((a, b) => a + b, 0);

// 对象
const obj = {
  name: 'JS',
  version: 2023,
  getInfo() {
    return \`\${this.name} \${this.version}\`;
  }
};`}</pre>
            </div>

            <h2>异步编程</h2>
            <div className="code-block">
              <pre>{`// Promise
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('data'), 1000);
  });
};

// async/await
async function main() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// 并发执行
const results = await Promise.all([
  fetch('/api/1'),
  fetch('/api/2'),
  fetch('/api/3'),
]);`}</pre>
            </div>

            <h2>类与模块</h2>
            <div className="code-block">
              <pre>{`// 类定义
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(\`\${this.name} makes a sound.\`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(\`\${this.name} barks.\`);
  }
}

// 模块导出
export { Animal, Dog };
export default Dog;

// 模块导入
import Dog, { Animal } from './animal.js';`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

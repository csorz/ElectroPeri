import { useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

const DEFAULT_CODE = `// Rust 运行工具
// 需要系统安装 Rust

fn main() {
    println!("Hello, World!");

    // 向量操作示例
    let numbers = vec![1, 2, 3, 4, 5];
    for n in &numbers {
        println!("{}", n * 2);
    }
}
`

interface RunResult {
  success: boolean
  output: string
  error: string
  time: number
}

export default function RustRunnerToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
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
      const result: RunResult = await window.api.codeRunner.runRust(code, 30000)
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
        <h1>Rust 运行</h1>
        <p>使用系统 Rust 编译执行代码</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>语言特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>内存安全</h3>
                <p>所有权系统在编译时保证内存安全，无需垃圾回收</p>
              </div>
              <div className="feature-card">
                <h3>零成本抽象</h3>
                <p>高级抽象不带来运行时开销，性能媲美 C/C++</p>
              </div>
              <div className="feature-card">
                <h3>类型系统</h3>
                <p>强静态类型、泛型、trait 系统提供强大的类型安全保障</p>
              </div>
              <div className="feature-card">
                <h3>并发安全</h3>
                <p>编译器防止数据竞争， fearless concurrency</p>
              </div>
            </div>

            <h2>语法基础</h2>
            <div className="info-box">
              <strong>所有权规则</strong>
              <ul>
                <li>每个值有且只有一个所有者</li>
                <li>值离开作用域时自动释放</li>
                <li>可变引用与不可变引用不能同时存在</li>
              </ul>
            </div>
            <div className="info-box">
              <strong>变量声明</strong>
              <ul>
                <li><code>let x = value;</code> - 不可变绑定</li>
                <li><code>let mut x = value;</code> - 可变绑定</li>
                <li>表达式结尾无分号返回值</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>系统编程</strong> - 操作系统、驱动程序、嵌入式</li>
              <li><strong>WebAssembly</strong> - 高性能 Web 应用</li>
              <li><strong>命令行工具</strong> - ripgrep、fd、bat 等</li>
              <li><strong>网络服务</strong> - Tokio 异步运行时、Web 框架</li>
              <li><strong>替代 C/C++</strong> - Firefox、Windows 组件重写</li>
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
                  placeholder="输入 Rust 代码..."
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
              <p>需要系统安装 Rust 并添加到 PATH 环境变量。首次编译可能较慢，最大执行时间 30 秒。</p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>基础语法</h2>
            <div className="code-block">
              <pre>{`fn main() {
    // 变量声明
    let x = 5;              // 不可变
    let mut y = 10;         // 可变
    y += 1;

    // 数据类型
    let a: i32 = -10;       // 有符号整数
    let b: u64 = 100;       // 无符号整数
    let c: f64 = 3.14;      // 浮点数
    let d: bool = true;     // 布尔
    let e: char = 'A';      // 字符 (Unicode)

    // 元组
    let tuple = (1, "hello", 3.14);
    let (a, b, c) = tuple;

    // 数组
    let arr = [1, 2, 3, 4, 5];
    let first = arr[0];

    // 向量
    let mut vec = Vec::new();
    vec.push(1);
    vec.push(2);
    let vec2 = vec![1, 2, 3, 4, 5];

    // 字符串
    let s1 = "hello";           // &str
    let s2 = String::from("hello");  // String
}`}</pre>
            </div>

            <h2>所有权与引用</h2>
            <div className="code-block">
              <pre>{`fn main() {
    // 所有权转移
    let s1 = String::from("hello");
    let s2 = s1;  // s1 不再有效
    // println!("{}", s1);  // 错误！

    // 克隆
    let s3 = s2.clone();
    println!("{} {}", s2, s3);

    // 引用（借用）
    let s = String::from("hello");
    let len = calculate_length(&s);  // 不可变引用
    println!("{} has length {}", s, len);

    // 可变引用
    let mut s = String::from("hello");
    change(&mut s);
    println!("{}", s);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(s: &mut String) {
    s.push_str(", world");
}`}</pre>
            </div>

            <h2>结构体与 Trait</h2>
            <div className="code-block">
              <pre>{`// 结构体定义
struct Rectangle {
    width: u32,
    height: u32,
}

// 方法实现
impl Rectangle {
    fn new(width: u32, height: u32) -> Self {
        Self { width, height }
    }

    fn area(&self) -> u32 {
        self.width * self.height
    }
}

// Trait 定义
trait Shape {
    fn area(&self) -> f64;
}

// Trait 实现
impl Shape for Rectangle {
    fn area(&self) -> f64 {
        (self.width * self.height) as f64
    }
}

// 泛型
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

// 枚举与模式匹配
enum Option<T> {
    Some(T),
    None,
}

match value {
    Some(x) => println!("{}", x),
    None => println!("None"),
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

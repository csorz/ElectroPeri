import { useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

const DEFAULT_CODE = `// Java 运行工具
// 需要系统安装 JDK

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

interface RunResult {
  success: boolean
  output: string
  error: string
  time: number
}

export default function JavaRunnerToolPage() {
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
      const result: RunResult = await window.api.codeRunner.runJava(code, 15000)
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
        <h1>Java 运行</h1>
        <p>使用系统 JDK 编译执行代码</p>
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
                <h3>面向对象</h3>
                <p>纯粹的面向对象语言，一切皆对象，支持封装、继承、多态</p>
              </div>
              <div className="feature-card">
                <h3>跨平台</h3>
                <p>编译为字节码，运行在 JVM 上，实现"一次编写，到处运行"</p>
              </div>
              <div className="feature-card">
                <h3>强类型</h3>
                <p>静态类型检查，编译时发现类型错误，提高代码健壮性</p>
              </div>
              <div className="feature-card">
                <h3>自动内存管理</h3>
                <p>垃圾回收机制自动管理内存，开发者无需手动释放</p>
              </div>
            </div>

            <h2>语法基础</h2>
            <div className="info-box">
              <strong>基本数据类型</strong>
              <ul>
                <li>整数：byte(1), short(2), int(4), long(8)</li>
                <li>浮点：float(4), double(8)</li>
                <li>字符：char(2, Unicode)</li>
                <li>布尔：boolean</li>
              </ul>
            </div>
            <div className="info-box">
              <strong>程序结构</strong>
              <ul>
                <li>类名必须与文件名相同</li>
                <li>main 方法是程序入口：public static void main(String[] args)</li>
                <li>每条语句以分号结尾</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>企业应用</strong> - 大型分布式系统、微服务架构</li>
              <li><strong>Android 开发</strong> - 移动应用开发主流语言</li>
              <li><strong>Web 后端</strong> - Spring Boot、Spring Cloud 框架</li>
              <li><strong>大数据</strong> - Hadoop、Spark、Flink 生态</li>
              <li><strong>中间件</strong> - 消息队列、数据库连接池等</li>
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
                  placeholder="输入 Java 代码..."
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
              <p>需要系统安装 JDK 并添加到 PATH 环境变量。类名必须为 Main，最大执行时间 15 秒。</p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>基础语法</h2>
            <div className="code-block">
              <pre>{`// 类定义
public class Main {
    public static void main(String[] args) {
        // 变量声明
        String name = "Java";
        int version = 17;
        double price = 99.99;
        boolean isActive = true;

        // 数组
        int[] numbers = {1, 2, 3, 4, 5};

        // 循环
        for (int i = 0; i < numbers.length; i++) {
            System.out.println(numbers[i]);
        }

        // 增强for循环
        for (int n : numbers) {
            System.out.println(n);
        }
    }
}`}</pre>
            </div>

            <h2>类与对象</h2>
            <div className="code-block">
              <pre>{`// 类定义
public class Person {
    private String name;
    private int age;

    // 构造方法
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Getter/Setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // 方法
    public void sayHello() {
        System.out.println("Hello, I'm " + name);
    }
}

// 继承
public class Student extends Person {
    private String school;

    public Student(String name, int age, String school) {
        super(name, age);
        this.school = school;
    }

    @Override
    public void sayHello() {
        System.out.println("I'm a student from " + school);
    }
}`}</pre>
            </div>

            <h2>集合与泛型</h2>
            <div className="code-block">
              <pre>{`import java.util.*;

// List
List<String> list = new ArrayList<>();
list.add("Java");
list.add("Python");
String first = list.get(0);

// Map
Map<String, Integer> map = new HashMap<>();
map.put("one", 1);
map.put("two", 2);
int value = map.get("one");

// Set
Set<Integer> set = new HashSet<>();
set.add(1);
set.add(2);
set.add(1); // 重复元素不会被添加

// 遍历
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// Stream API (Java 8+)
list.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .forEach(System.out::println);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

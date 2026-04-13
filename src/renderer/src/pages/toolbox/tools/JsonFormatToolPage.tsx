import { useState } from 'react'
import './ToolPage.css'

export default function JsonFormatToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>✨ JSON 格式化</h1>
        <p>JSON 数据格式化美化工具</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 JSON 格式化</h2>
            <div className="info-box">
              <p>JSON 格式化（Pretty Print）是指将压缩的 JSON 字符串转换为易读的格式，通过添加缩进、换行和空格，使数据结构清晰可见。这在调试、日志查看和配置文件编辑中非常有用。</p>
            </div>

            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>可读性增强</h3>
                <p>通过缩进和换行，让嵌套结构一目了然，便于人工阅读和检查</p>
              </div>
              <div className="feature-card">
                <h3>语法高亮</h3>
                <p>配合编辑器可实现键、值、字符串、数字等不同颜色显示</p>
              </div>
              <div className="feature-card">
                <h3>灵活缩进</h3>
                <p>支持 2 空格、4 空格或 Tab 缩进，满足不同编码规范</p>
              </div>
              <div className="feature-card">
                <h3>数据验证</h3>
                <p>格式化过程会验证 JSON 语法，发现错误会提示具体位置</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>API 响应调试</strong> - 格式化后便于查看返回的数据结构</li>
              <li><strong>配置文件编辑</strong> - JSON 配置文件需要保持良好的可读性</li>
              <li><strong>日志分析</strong> - 将压缩的 JSON 日志格式化便于排查问题</li>
              <li><strong>代码审查</strong> - 代码中的 JSON 数据需要格式化展示</li>
              <li><strong>数据文档</strong> - 生成易读的数据示例文档</li>
            </ul>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>使用提醒</strong>
              <ul>
                <li>格式化会改变 JSON 字符串的长度，但不影响数据内容</li>
                <li>超大 JSON 文件格式化可能消耗较多内存</li>
                <li>某些场景下需要保持压缩格式（如网络传输）</li>
                <li>注意保留原始数据的编码格式</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>JSON 格式化工具</h2>
            <JsonFormatDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// JSON 格式化
const data = '{"name":"张三","age":25,"skills":["JavaScript","Python"]}';

// 使用 JSON.stringify 格式化
const formatted = JSON.stringify(JSON.parse(data), null, 2);
console.log(formatted);
// 输出:
// {
//   "name": "张三",
//   "age": 25,
//   "skills": [
//     "JavaScript",
//     "Python"
//   ]
// }

// 自定义缩进
const formatJson = (json, spaces = 2) => {
  try {
    return JSON.stringify(JSON.parse(json), null, spaces);
  } catch (e) {
    return 'Invalid JSON: ' + e.message;
  }
};`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import json

# JSON 格式化
data = '{"name":"张三","age":25,"skills":["JavaScript","Python"]}'

# 解析并格式化
parsed = json.loads(data)
formatted = json.dumps(parsed, indent=2, ensure_ascii=False)
print(formatted)

# 自定义格式化函数
def format_json(json_str, indent=2):
    try:
        return json.dumps(
            json.loads(json_str),
            indent=indent,
            ensure_ascii=False,
            sort_keys=False
        )
    except json.JSONDecodeError as e:
        return f'Invalid JSON: {e}'`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/json"
    "fmt"
)

func formatJSON(input string) (string, error) {
    var data interface{}
    if err := json.Unmarshal([]byte(input), &data); err != nil {
        return "", err
    }

    // 格式化输出，缩进为 2 空格
    output, err := json.MarshalIndent(data, "", "  ")
    if err != nil {
        return "", err
    }
    return string(output), nil
}

func main() {
    input := \`{"name":"张三","age":25,"skills":["JavaScript","Python"]}\`
    formatted, _ := formatJSON(input)
    fmt.Println(formatted)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class JsonFormatter {
    private static final ObjectMapper mapper = new ObjectMapper()
        .enable(SerializationFeature.INDENT_OUTPUT);

    public static String format(String json) {
        try {
            Object data = mapper.readValue(json, Object.class);
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            return "Invalid JSON: " + e.getMessage();
        }
    }

    public static void main(String[] args) {
        String json = "{\"name\":\"张三\",\"age\":25}";
        System.out.println(format(json));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function JsonFormatDemo() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState(2)
  const [error, setError] = useState<string | null>(null)

  const handleFormat = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON 格式错误')
      setOutput('')
    }
  }

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <div className="connection-demo">
      <div className="config-grid">
        <div className="config-item">
          <label>缩进方式</label>
          <select value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
            <option value={1}>1 制表符</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="info-box warning">
          <strong>错误</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="config-item" style={{ marginBottom: '12px' }}>
        <label>输入 JSON</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"name": "test", "value": 123}'
          rows={8}
          style={{ width: '100%', fontFamily: 'monospace', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      <div className="demo-controls">
        <button onClick={handleFormat}>格式化</button>
        <button onClick={handleCopy} disabled={!output}>复制结果</button>
        <button onClick={handleClear}>清空</button>
      </div>

      {output && (
        <div style={{ marginTop: '16px' }}>
          <div className="config-item">
            <label>格式化结果</label>
            <pre style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '300px',
              fontSize: '13px'
            }}>
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

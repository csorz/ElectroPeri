import { useState } from 'react'
import './ToolPage.css'

export default function JsonMinifyToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🗜️ JSON 压缩</h1>
        <p>JSON 数据压缩，去除空白和换行</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 JSON 压缩</h2>
            <div className="info-box">
              <p>JSON 压缩（Minify）是指去除 JSON 字符串中所有不必要的空白字符，包括空格、换行和缩进，从而减少数据体积。这在网络传输和存储优化中非常重要。</p>
            </div>

            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>体积减少</h3>
                <p>去除所有空白字符，显著降低 JSON 数据的体积大小</p>
              </div>
              <div className="feature-card">
                <h3>传输优化</h3>
                <p>减少网络传输数据量，提升 API 响应速度</p>
              </div>
              <div className="feature-card">
                <h3>存储节省</h3>
                <p>在数据库或文件系统中存储时占用更少空间</p>
              </div>
              <div className="feature-card">
                <h3>数据完整</h3>
                <p>压缩过程不改变数据内容，仅移除格式字符</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>API 响应</strong> - 服务端返回压缩的 JSON 减少带宽消耗</li>
              <li><strong>前端打包</strong> - 配置文件压缩后嵌入代码</li>
              <li><strong>数据库存储</strong> - JSON 字段压缩存储节省空间</li>
              <li><strong>缓存优化</strong> - Redis 等缓存中存储压缩 JSON</li>
              <li><strong>日志收集</strong> - 压缩日志数据减少存储成本</li>
            </ul>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>使用提醒</strong>
              <ul>
                <li>压缩后的 JSON 可读性降低，调试时建议先格式化</li>
                <li>对于已经很小或频繁变更的数据，压缩收益有限</li>
                <li>考虑配合 Gzip 等压缩算法获得更好效果</li>
                <li>超大文件压缩时注意内存消耗</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>JSON 压缩工具</h2>
            <JsonMinifyDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// JSON 压缩
const data = {
  "name": "张三",
  "age": 25,
  "skills": ["JavaScript", "Python"]
};

// 使用 JSON.stringify 压缩
const minified = JSON.stringify(data);
console.log(minified);
// 输出: {"name":"张三","age":25,"skills":["JavaScript","Python"]}

// 自定义压缩函数
const minifyJson = (json) => {
  try {
    return JSON.stringify(JSON.parse(json));
  } catch (e) {
    return 'Invalid JSON: ' + e.message;
  }
};

// 计算压缩率
const calcSavings = (original, minified) => {
  const saved = ((1 - minified.length / original.length) * 100).toFixed(1);
  return saved + '%';
};`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import json

# JSON 压缩
data = {
    "name": "张三",
    "age": 25,
    "skills": ["JavaScript", "Python"]
}

# 使用 separators 参数去除空白
minified = json.dumps(data, separators=(',', ':'))
print(minified)
# 输出: {"name":"张三","age":25,"skills":["JavaScript","Python"]}

# 自定义压缩函数
def minify_json(json_str):
    try:
        return json.dumps(
            json.loads(json_str),
            separators=(',', ':'),
            ensure_ascii=False
        )
    except json.JSONDecodeError as e:
        return f'Invalid JSON: {e}'

# 计算压缩率
def calc_savings(original, minified):
    return f"{(1 - len(minified) / len(original)) * 100:.1f}%"`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/json"
    "fmt"
)

func minifyJSON(input string) (string, error) {
    var data interface{}
    if err := json.Unmarshal([]byte(input), &data); err != nil {
        return "", err
    }

    // 不使用缩进，直接输出
    output, err := json.Marshal(data)
    if err != nil {
        return "", err
    }
    return string(output), nil
}

func main() {
    input := \`{
  "name": "张三",
  "age": 25,
  "skills": ["JavaScript", "Python"]
}\`
    minified, _ := minifyJSON(input)
    fmt.Println(minified)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonMinifier {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static String minify(String json) {
        try {
            Object data = mapper.readValue(json, Object.class);
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            return "Invalid JSON: " + e.getMessage();
        }
    }

    public static void main(String[] args) {
        String json = "{\\"name\\":\\"张三\\",\\"age\\":25}";
        System.out.println(minify(json));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function JsonMinifyDemo() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ original: number; minified: number; saved: string } | null>(null)

  const handleMinify = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      const original = input.length
      const minifiedLen = minified.length
      const saved = ((1 - minifiedLen / original) * 100).toFixed(1)
      setStats({ original, minified: minifiedLen, saved: original > minifiedLen ? `${saved}%` : '0%' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON 格式错误')
      setOutput('')
      setStats(null)
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
    setStats(null)
  }

  return (
    <div className="connection-demo">
      {error && (
        <div className="info-box warning">
          <strong>错误</strong>
          <p>{error}</p>
        </div>
      )}

      {stats && (
        <div className="info-box" style={{ marginBottom: '16px' }}>
          <strong>压缩统计</strong>
          <p>原始: {stats.original} 字符 | 压缩后: {stats.minified} 字符 | 节省: {stats.saved}</p>
        </div>
      )}

      <div className="config-item" style={{ marginBottom: '12px' }}>
        <label>输入 JSON</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='输入 JSON 数据...'
          rows={8}
          style={{ width: '100%', fontFamily: 'monospace', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      <div className="demo-controls">
        <button onClick={handleMinify}>压缩</button>
        <button onClick={handleCopy} disabled={!output}>复制结果</button>
        <button onClick={handleClear}>清空</button>
      </div>

      {output && (
        <div style={{ marginTop: '16px' }}>
          <div className="config-item">
            <label>压缩结果</label>
            <pre style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '13px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

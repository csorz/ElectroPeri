import { useState } from 'react'
import './ToolPage.css'

export default function QueryParserToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleParse = () => {
    setError(null)
    if (!input.trim()) {
      setError('请输入要解析的 URL')
      setOutput('')
      return
    }

    try {
      let queryString = input.trim()

      if (input.includes('?')) {
        const url = new URL(input)
        queryString = url.search
      } else if (!input.startsWith('?')) {
        queryString = '?' + input
      }

      const params = new URLSearchParams(queryString)
      const result: Record<string, string | string[]> = {}

      params.forEach((value, key) => {
        const existing = result[key]
        if (existing) {
          if (Array.isArray(existing)) {
            existing.push(value)
          } else {
            result[key] = [existing, value]
          }
        } else {
          result[key] = value
        }
      })

      setOutput(JSON.stringify(result, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失败')
      setOutput('')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>Query 参数解析</h1>
        <p>URL Query String Parser - 解析 URL 参数为结构化数据</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心概念</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Query String</h3>
                <p>URL 中 ? 后面的部分，用于传递参数，格式为 key=value&amp;key2=value2</p>
              </div>
              <div className="feature-card">
                <h3>URL 编码</h3>
                <p>特殊字符需要编码，如空格变为 %20，中文也需要编码后传输</p>
              </div>
              <div className="feature-card">
                <h3>参数解析</h3>
                <p>将 Query 字符串解析为键值对对象，支持同名参数数组化处理</p>
              </div>
              <div className="feature-card">
                <h3>安全性</h3>
                <p>注意 XSS 攻击，解析后的参数使用前需进行转义或验证</p>
              </div>
            </div>

            <h2>URL 结构解析</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  https://example.com:443/path?name=test&age=18#section
  └───┬───┘└───┬───┘└─┬─┘└──────┬──────┘└──┬──┘
    协议     域名    端口    路径      Query   Fragment

  Query String 格式:
  ?key1=value1&key2=value2&key3=value3

  同名参数:
  ?color=red&color=blue&color=green  => color: ['red', 'blue', 'green']
              `}</pre>
            </div>

            <h2>常见编码规则</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>字符</th>
                    <th>编码</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>空格</code></td>
                    <td><code>%20</code> 或 <code>+</code></td>
                    <td>空格需要编码</td>
                  </tr>
                  <tr>
                    <td><code>&amp;</code></td>
                    <td><code>%26</code></td>
                    <td>参数分隔符</td>
                  </tr>
                  <tr>
                    <td><code>=</code></td>
                    <td><code>%3D</code></td>
                    <td>键值分隔符</td>
                  </tr>
                  <tr>
                    <td><code>?</code></td>
                    <td><code>%3F</code></td>
                    <td>Query 起始符</td>
                  </tr>
                  <tr>
                    <td><code>#</code></td>
                    <td><code>%23</code></td>
                    <td>Fragment 标识符</td>
                  </tr>
                  <tr>
                    <td><code>中文</code></td>
                    <td><code>%E4%B8%AD...</code></td>
                    <td>UTF-8 编码</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>API 请求</strong> - GET 请求参数传递</li>
              <li><strong>页面跳转</strong> - 页面间传递数据和状态</li>
              <li><strong>搜索功能</strong> - 搜索关键词、筛选条件传递</li>
              <li><strong>分页功能</strong> - 页码、每页数量等参数</li>
              <li><strong>分享链接</strong> - 生成带参数的分享 URL</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>Query 参数解析器</h2>
            <div className="connection-demo">
              {error && (
                <div className="info-box warning" style={{ marginBottom: '16px' }}>
                  <strong>错误</strong>
                  <p>{error}</p>
                </div>
              )}

              <div className="config-row" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>输入 URL 或 Query 字符串</label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '100px',
                    fontFamily: 'Consolas, Monaco, monospace'
                  }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入完整 URL 或 Query 字符串，如：https://example.com?name=test&age=18"
                />
              </div>

              <div className="demo-controls">
                <button onClick={handleParse}>解析参数</button>
                <button onClick={handleClear} style={{ background: '#e0e0e0', color: '#333' }}>清空</button>
                {output && <button onClick={handleCopy} style={{ background: '#4caf50', color: '#fff' }}>复制结果</button>}
              </div>

              {output && (
                <div className="result-box" style={{ marginTop: '16px' }}>
                  <h4>解析结果 (JSON)</h4>
                  <pre style={{
                    background: '#1e1e1e',
                    color: '#4fc3f7',
                    padding: '16px',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontFamily: 'Consolas, Monaco, monospace',
                    maxHeight: '400px'
                  }}>{output}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 解析 Query String
function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};

  for (const [key, value] of params) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// 使用示例
const url = 'https://example.com?name=张三&age=18&hobby=reading&hobby=coding';
const parsed = parseQueryString(url);
console.log(parsed);
// { name: '张三', age: '18', hobby: ['reading', 'coding'] }

// 构建 Query String
function buildQueryString(params) {
  return new URLSearchParams(params).toString();
}
console.log(buildQueryString({ name: 'test', page: 1 }));
// 'name=test&page=1'`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`from urllib.parse import parse_qs, urlencode, urlparse, parse_qsl

# 解析 URL 中的 Query 参数
url = 'https://example.com?name=test&age=18&hobby=reading&hobby=coding'
parsed = urlparse(url)
query_dict = parse_qs(parsed.query)

print(query_dict)
# {'name': ['test'], 'age': ['18'], 'hobby': ['reading', 'coding']}

# 获取单个值
query_single = {k: v[0] if len(v) == 1 else v for k, v in query_dict.items()}
print(query_single)
# {'name': 'test', 'age': '18', 'hobby': ['reading', 'coding']}

# 构建 Query String
params = {'name': '张三', 'age': 18}
query_string = urlencode(params)
print(query_string)  # 'name=%E5%BC%A0%E4%B8%89&age=18'`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "net/url"
)

func main() {
    // 解析 URL
    rawURL := "https://example.com?name=test&age=18&hobby=reading&hobby=coding"
    parsedURL, _ := url.Parse(rawURL)

    // 获取 Query 参数
    query := parsedURL.Query()
    fmt.Printf("name: %s\\n", query.Get("name"))
    fmt.Printf("hobby: %v\\n", query["hobby"]) // 多值参数

    // 构建 URL
    params := url.Values{}
    params.Add("name", "张三")
    params.Add("age", "18")
    params.Add("hobby", "reading")
    params.Add("hobby", "coding")

    fullURL := "https://example.com?" + params.Encode()
    fmt.Println(fullURL)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.net.URI;
import java.net.URLEncoder;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class QueryParser {
    // 解析 Query String
    public static Map<String, List<String>> parseQuery(String query) {
        Map<String, List<String>> params = new HashMap<>();

        if (query == null || query.isEmpty()) {
            return params;
        }

        for (String pair : query.split("&")) {
            String[] kv = pair.split("=", 2);
            String key = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
            String value = kv.length > 1 ?
                URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";

            params.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
        }

        return params;
    }

    // 构建 Query String
    public static String buildQuery(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) sb.append("&");
            sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
            sb.append("=");
            sb.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }
        return sb.toString();
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

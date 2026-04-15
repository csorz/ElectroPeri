import { useState } from 'react'
import './ToolPage.css'

export default function HttpRequestToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET')
  const [headers, setHeaders] = useState('')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)

  const handleSend = async () => {
    setError(null)
    setResponse('')
    setStatusCode(null)

    if (!url.trim()) {
      setError('请输入 URL')
      return
    }

    try {
      new URL(url)
    } catch {
      setError('请输入有效的 URL')
      return
    }

    setLoading(true)

    try {
      const requestHeaders: Record<string, string> = {}
      if (headers.trim()) {
        try {
          Object.assign(requestHeaders, JSON.parse(headers))
        } catch {
          setError('请求头格式错误，请使用 JSON 格式')
          setLoading(false)
          return
        }
      }

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      }

      if (method !== 'GET' && body.trim()) {
        options.body = body
      }

      const res = await fetch(url, options)
      setStatusCode(res.status)

      const contentType = res.headers.get('content-type') || ''
      let data: string

      if (contentType.includes('application/json')) {
        const json = await res.json()
        data = JSON.stringify(json, null, 2)
      } else {
        data = await res.text()
      }

      setResponse(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response)
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>HTTP 请求调试</h1>
        <p>HTTP Request Debugger - 发送 HTTP/HTTPS 请求测试 API</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>HTTP 协议基础</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>请求方法</h3>
                <p>GET 获取资源、POST 提交数据、PUT 更新资源、DELETE 删除资源、PATCH 部分更新</p>
              </div>
              <div className="feature-card">
                <h3>请求头</h3>
                <p>Content-Type 内容类型、Authorization 认证信息、User-Agent 客户端标识、Cookie 会话信息</p>
              </div>
              <div className="feature-card">
                <h3>状态码</h3>
                <p>2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务器错误</p>
              </div>
              <div className="feature-card">
                <h3>HTTPS</h3>
                <p>TLS/SSL 加密传输，保证数据安全，默认端口 443</p>
              </div>
            </div>

            <h2>HTTP 请求结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌─────────────────────────────────────────────────────┐
  │  POST /api/users HTTP/1.1                           │  请求行
  │  Host: api.example.com                              │
  │  Content-Type: application/json                     │  请求头
  │  Authorization: Bearer token123                     │
  │                                                     │
  │  {"name": "张三", "age": 18}                         │  请求体
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │  HTTP/1.1 201 Created                               │  状态行
  │  Content-Type: application/json                     │  响应头
  │  Content-Length: 42                                 │
  │                                                     │
  │  {"id": 1, "name": "张三", "age": 18}                │  响应体
  └─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>常用请求头</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>Header</th>
                    <th>说明</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Content-Type</code></td>
                    <td>请求体类型</td>
                    <td>application/json</td>
                  </tr>
                  <tr>
                    <td><code>Authorization</code></td>
                    <td>认证信息</td>
                    <td>Bearer xxx</td>
                  </tr>
                  <tr>
                    <td><code>Accept</code></td>
                    <td>期望响应类型</td>
                    <td>application/json</td>
                  </tr>
                  <tr>
                    <td><code>User-Agent</code></td>
                    <td>客户端标识</td>
                    <td>Mozilla/5.0...</td>
                  </tr>
                  <tr>
                    <td><code>Cache-Control</code></td>
                    <td>缓存控制</td>
                    <td>no-cache</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>API 测试</strong> - 验证接口功能、调试接口问题</li>
              <li><strong>接口文档</strong> - 测试接口示例、验证文档准确性</li>
              <li><strong>性能测试</strong> - 测量响应时间、并发能力</li>
              <li><strong>安全测试</strong> - 测试认证、注入等安全问题</li>
              <li><strong>集成调试</strong> - 前后端联调、第三方接口对接</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>HTTP 请求发送器</h2>
            <div className="connection-demo">
              {error && (
                <div className="info-box warning" style={{ marginBottom: '16px' }}>
                  <strong>错误</strong>
                  <p>{error}</p>
                </div>
              )}

              <div className="config-grid" style={{ marginBottom: '16px' }}>
                <div className="config-item">
                  <label>请求方法</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>

              <div className="config-row" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>请求 URL</label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/data"
                />
              </div>

              {method !== 'GET' && (
                <>
                  <div className="config-row" style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>请求头 (JSON)</label>
                    <textarea
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        minHeight: '80px',
                        fontFamily: 'Consolas, Monaco, monospace'
                      }}
                      value={headers}
                      onChange={(e) => setHeaders(e.target.value)}
                      placeholder='{"Content-Type": "application/json"}'
                    />
                  </div>

                  <div className="config-row" style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>请求体</label>
                    <textarea
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        minHeight: '120px',
                        fontFamily: 'Consolas, Monaco, monospace'
                      }}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder='{"key": "value"}'
                    />
                  </div>
                </>
              )}

              <div className="demo-controls">
                <button onClick={handleSend} disabled={loading}>
                  {loading ? '请求中...' : '发送请求'}
                </button>
                {response && (
                  <button onClick={handleCopy} style={{ background: '#e0e0e0', color: '#333' }}>复制响应</button>
                )}
              </div>

              {statusCode !== null && (
                <div className="result-box" style={{ marginTop: '16px' }}>
                  <h4>响应 (状态码: {statusCode})</h4>
                  <pre style={{
                    background: '#1e1e1e',
                    color: '#4fc3f7',
                    padding: '16px',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontFamily: 'Consolas, Monaco, monospace',
                    maxHeight: '400px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>{response}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript Fetch 示例</h2>
            <div className="code-block">
              <pre>{`// GET 请求
fetch('https://api.example.com/users')
  .then(res => res.json())
  .then(data => console.log(data));

// POST 请求
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({
    name: '张三',
    age: 18
  })
})
  .then(res => res.json())
  .then(data => console.log(data));

// async/await 写法
async function createUser() {
  const res = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '张三' })
  });
  const data = await res.json();
  return data;
}`}</pre>
            </div>

            <h2>Python Requests 示例</h2>
            <div className="code-block">
              <pre>{`import requests

# GET 请求
response = requests.get('https://api.example.com/users')
data = response.json()
print(data)

# POST 请求
response = requests.post(
    'https://api.example.com/users',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123'
    },
    json={
        'name': '张三',
        'age': 18
    }
)
print(response.status_code, response.json())

# 带参数的 GET 请求
response = requests.get(
    'https://api.example.com/users',
    params={'page': 1, 'limit': 10}
)

# 上传文件
files = {'file': open('report.pdf', 'rb')}
response = requests.post(
    'https://api.example.com/upload',
    files=files
)`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func main() {
    // GET 请求
    resp, _ := http.Get("https://api.example.com/users")
    defer resp.Body.Close()
    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))

    // POST 请求
    data := map[string]interface{}{
        "name": "张三",
        "age":  18,
    }
    jsonData, _ := json.Marshal(data)

    req, _ := http.NewRequest(
        "POST",
        "https://api.example.com/users",
        bytes.NewBuffer(jsonData),
    )
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer token123")

    client := &http.Client{}
    resp, _ = client.Do(req)
    defer resp.Body.Close()
}`}</pre>
            </div>

            <h2>cURL 命令示例</h2>
            <div className="code-block">
              <pre>{`# GET 请求
curl https://api.example.com/users

# POST 请求
curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"name": "张三", "age": 18}'

# 带参数的 GET 请求
curl "https://api.example.com/users?page=1&limit=10"

# 上传文件
curl -X POST https://api.example.com/upload \\
  -F "file=@report.pdf"

# 查看响应头
curl -i https://api.example.com/users`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

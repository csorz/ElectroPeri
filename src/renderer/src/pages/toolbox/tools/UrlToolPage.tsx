import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function UrlToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'component' | 'uri'>('component')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleEncode = () => {
    setError(null)
    try {
      if (mode === 'component') {
        setOutput(encodeURIComponent(input))
      } else {
        setOutput(encodeURI(input))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '编码失败')
    }
  }

  const handleDecode = () => {
    setError(null)
    try {
      if (mode === 'component') {
        setOutput(decodeURIComponent(input))
      } else {
        setOutput(decodeURI(input))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '解码失败')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔗 URL 编解码</h1>
        <p>URL 编码与解码，支持组件级和 URI 级两种模式</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 URL 编码？</h2>
            <div className="info-box">
              <p>URL 编码（百分号编码）将 URL 中的特殊字符转换为 <code>%XX</code> 格式，其中 XX 是字符的十六进制 ASCII 值。</p>
              <p>确保 URL 只包含 ASCII 字符，避免解析错误。</p>
            </div>

            <h2>两种编码方式</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>方法</th>
                  <th>编码范围</th>
                  <th>保留字符</th>
                  <th>用途</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>encodeURI</code></td>
                  <td>完整 URI</td>
                  <td>, / ? : @ &amp; = + $ #</td>
                  <td>编码完整 URL</td>
                </tr>
                <tr>
                  <td><code>encodeURIComponent</code></td>
                  <td>URI 组件</td>
                  <td>无</td>
                  <td>编码查询参数值</td>
                </tr>
              </tbody>
            </table>

            <h2>编码示例</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  原始文本: "你好 世界"
      ↓ encodeURIComponent
  编码结果: "%E4%BD%A0%E5%A5%BD%20%E4%B8%96%E7%95%8C"

  原始 URL: "https://example.com/search?q=你好"
      ↓ encodeURI
  编码结果: "https://example.com/search?q=%E4%BD%A0%E5%A5%BD"
      ↓ encodeURIComponent (仅参数值)
  编码结果: "https://example.com/search?q=%E4%BD%A0%E5%A5%BD"
              `}</pre>
            </div>

            <h2>需要编码的字符</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>空格</h3>
                <p>编码为 %20 或 +（查询字符串中）</p>
              </div>
              <div className="feature-card">
                <h3>非 ASCII</h3>
                <p>中文等字符编码为 UTF-8 字节的百分号形式</p>
              </div>
              <div className="feature-card">
                <h3>特殊符号</h3>
                <p>&amp;, =, ?, # 等在组件中需编码</p>
              </div>
              <div className="feature-card">
                <h3>控制字符</h3>
                <p>换行、制表符等必须编码</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>🌐 URL 构建</h4>
                <p>构建包含中文或特殊字符的 URL</p>
              </div>
              <div className="scenario-card">
                <h4>📤 表单提交</h4>
                <p>application/x-www-form-urlencoded 格式</p>
              </div>
              <div className="scenario-card">
                <h4>🔗 链接分享</h4>
                <p>确保链接在各种环境下正常工作</p>
              </div>
              <div className="scenario-card">
                <h4>📡 API 请求</h4>
                <p>正确传递查询参数</p>
              </div>
            </div>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>⚠️ 常见错误</strong>
              <ul>
                <li>不要对整个 URL 使用 encodeURIComponent</li>
                <li>不要重复编码已编码的字符串</li>
                <li>解码时注意处理无效编码会抛出 URIError</li>
                <li>空格在查询字符串中通常编码为 + 而非 %20</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>URL 编解码</h2>
            <div className="url-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>编码模式</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as 'component' | 'uri')}>
                    <option value="component">组件级 (encodeURIComponent)</option>
                    <option value="uri">URI 级 (encodeURI)</option>
                  </select>
                </div>
              </div>

              {error && (
                <div style={{ color: '#c62828', padding: '12px', background: '#ffebee', borderRadius: '6px', marginBottom: 12, marginTop: 12 }}>
                  ❌ {error}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>输入</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入 URL 或文本..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="demo-controls" style={{ marginTop: 12 }}>
                <button onClick={handleEncode}>编码</button>
                <button onClick={handleDecode} style={{ background: '#e0e0e0', color: '#333' }}>解码</button>
                {output && (
                  <>
                    <button onClick={handleSwap} style={{ background: '#e0e0e0', color: '#333' }}>交换</button>
                    <button onClick={() => onCopy(output)} style={{ background: '#e0e0e0', color: '#333' }}>复制</button>
                  </>
                )}
              </div>

              {output && (
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>输出</label>
                  <pre style={{
                    background: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    wordBreak: 'break-all',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {output}
                  </pre>
                </div>
              )}
            </div>

            <h2>Query 参数解析</h2>
            <QueryParserDemo onCopy={onCopy} />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 编码完整 URL
const url = "https://example.com/search?q=你好&page=1";
const encodedUrl = encodeURI(url);
console.log(encodedUrl);
// "https://example.com/search?q=%E4%BD%A0%E5%A5%BD&page=1"

// 编码查询参数值
const query = "你好 世界";
const encodedQuery = encodeURIComponent(query);
console.log(encodedQuery);
// "%E4%BD%A0%E5%A5%BD%20%E4%B8%96%E7%95%8C"

// 解码
const decoded = decodeURIComponent(encodedQuery);
console.log(decoded); // "你好 世界"

// 构建 URL
const baseUrl = "https://api.example.com/search";
const params = new URLSearchParams({
  q: "你好",
  page: "1",
  size: "10"
});
const fullUrl = \`\${baseUrl}?\${params.toString()\}\`;
console.log(fullUrl);`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "net/url"
)

func main() {
    // 编码查询参数
    query := "你好 世界"
    encoded := url.QueryEscape(query)
    fmt.Println("Encoded:", encoded)
    // Encoded: %E4%BD%A0%E5%A5%BD+%E4%B8%96%E7%95%8C

    // 解码
    decoded, _ := url.QueryUnescape(encoded)
    fmt.Println("Decoded:", decoded)

    // 构建 URL
    baseURL := "https://example.com/search"
    params := url.Values{}
    params.Set("q", "你好")
    params.Set("page", "1")
    fullURL := baseURL + "?" + params.Encode()
    fmt.Println("Full URL:", fullURL)

    // 解析 URL
    u, _ := url.Parse(fullURL)
    fmt.Println("Query q:", u.Query().Get("q"))
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`from urllib.parse import urlencode, quote, unquote, urlparse, parse_qs

# 编码
text = "你好 世界"
encoded = quote(text)
print(f"Encoded: {encoded}")
# Encoded: %E4%BD%A0%E5%A5%BD%20%E4%B8%96%E7%95%8C

# 解码
decoded = unquote(encoded)
print(f"Decoded: {decoded}")

# 构建 URL
params = {'q': '你好', 'page': 1}
query_string = urlencode(params)
print(f"Query: {query_string}")

# 解析 URL
url = "https://example.com/search?q=你好&page=1"
parsed = urlparse(url)
query_params = parse_qs(parsed.query)
print(f"Params: {query_params}")`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.net.URLEncoder;
import java.net.URLDecoder;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;

public class UrlExample {
    public static void main(String[] args) throws Exception {
        String text = "你好 世界";

        // 编码（Java 10+）
        String encoded = URLEncoder.encode(text, StandardCharsets.UTF_8);
        System.out.println("Encoded: " + encoded);

        // 解码
        String decoded = URLDecoder.decode(encoded, StandardCharsets.UTF_8);
        System.out.println("Decoded: " + decoded);

        // 构建 URL
        String baseUrl = "https://example.com/search";
        String query = String.format("q=%s&page=1",
            URLEncoder.encode("你好", StandardCharsets.UTF_8));
        String fullUrl = baseUrl + "?" + query;
        System.out.println("Full URL: " + fullUrl);
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QueryParserDemo({ onCopy }: { onCopy: (t: string) => void }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleParse = () => {
    setError(null)
    try {
      let search = input.trim()
      const q = search.indexOf('?')
      if (q >= 0) search = search.slice(q + 1)
      const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      const obj: Record<string, string> = {}
      sp.forEach((v, k) => {
        obj[k] = v
      })
      setOutput(JSON.stringify(obj, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失败')
    }
  }

  return (
    <div className="url-demo">
      {error && (
        <div style={{ color: '#c62828', padding: '12px', background: '#ffebee', borderRadius: '6px', marginBottom: 12 }}>
          ❌ {error}
        </div>
      )}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入 URL 或 Query 字符串，如: https://example.com?name=张三&age=18"
        rows={3}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          resize: 'vertical'
        }}
      />
      <div className="demo-controls" style={{ marginTop: 12 }}>
        <button onClick={handleParse}>解析为 JSON</button>
        {output && (
          <button onClick={() => onCopy(output)} style={{ background: '#e0e0e0', color: '#333' }}>复制</button>
        )}
      </div>
      {output && (
        <pre style={{
          background: '#f5f5f5',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '13px',
          margin: '16px 0 0 0',
          overflow: 'auto'
        }}>
          {output}
        </pre>
      )}
    </div>
  )
}

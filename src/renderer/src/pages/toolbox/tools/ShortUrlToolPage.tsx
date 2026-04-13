import { useState } from 'react'
import './ToolPage.css'

export default function ShortUrlToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 生成随机短码
  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleGenerate = () => {
    setError(null)
    if (!input.trim()) {
      setError('请输入要缩短的 URL')
      setOutput('')
      return
    }
    try {
      new URL(input)
    } catch {
      setError('请输入有效的 URL')
      setOutput('')
      return
    }
    const shortCode = generateShortCode()
    setOutput(`https://s.url/${shortCode}`)
  }

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>短网址生成</h1>
        <p>URL Shortener - 将长网址转换为短链接</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心原理</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>哈希映射</h3>
                <p>将长 URL 通过哈希算法或自增 ID 生成唯一短码，建立映射关系存储在数据库中</p>
              </div>
              <div className="feature-card">
                <h3>重定向服务</h3>
                <p>用户访问短链接时，服务端查询映射关系，返回 301/302 重定向到原始长网址</p>
              </div>
              <div className="feature-card">
                <h3>短码生成</h3>
                <p>常用方法：自增 ID 转 62 进制、随机字符串、哈希取模、雪花算法等</p>
              </div>
              <div className="feature-card">
                <h3>性能优化</h3>
                <p>使用 Redis 缓存热点数据、CDN 加速、分布式存储提高并发处理能力</p>
              </div>
            </div>

            <h2>短码生成算法</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │   长网址    │ ──> │  生成短码   │ ──> │   存储映射   │
  │ example.com │     │   Abc123    │     │ Abc123→URL  │
  └─────────────┘     └─────────────┘     └─────────────┘
         │                                        │
         │                                        │
         ▼                                        ▼
  ┌─────────────┐                        ┌─────────────┐
  │   访问短码  │ ──────────────────────>│  查询映射   │
  │  s.url/Abc │                        │  返回长网址  │
  └─────────────┘                        └─────────────┘
              `}</pre>
            </div>

            <h2>62 进制转换</h2>
            <div className="info-box">
              <strong>为什么是 62 进制？</strong>
              <p>使用 a-z (26) + A-Z (26) + 0-9 (10) = 62 个字符，6 位短码可表示 62^6 = 568 亿个 URL。</p>
              <ul>
                <li>数字 0-9 对应值 0-9</li>
                <li>小写 a-z 对应值 10-35</li>
                <li>大写 A-Z 对应值 36-61</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>社交媒体</strong> - Twitter、微博等有字数限制的平台</li>
              <li><strong>营销推广</strong> - 生成易于分享和统计的短链接</li>
              <li><strong>二维码</strong> - 短网址生成的二维码更简洁易扫描</li>
              <li><strong>短信发送</strong> - 节省短信字符数，降低成本</li>
              <li><strong>数据分析</strong> - 追踪链接点击量、来源、地域等信息</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>短网址生成器</h2>
            <div className="connection-demo">
              {error && (
                <div className="info-box warning" style={{ marginBottom: '16px' }}>
                  <strong>错误</strong>
                  <p>{error}</p>
                </div>
              )}

              <div className="config-row" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>输入长网址</label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入要缩短的 URL，如：https://example.com/very/long/url/path"
                />
              </div>

              <div className="demo-controls">
                <button onClick={handleGenerate}>生成短网址</button>
                {output && <button onClick={handleCopy} style={{ background: '#e0e0e0', color: '#333' }}>复制结果</button>}
              </div>

              {output && (
                <div className="result-box" style={{ marginTop: '16px' }}>
                  <h4>生成的短网址</h4>
                  <pre style={{
                    background: '#1e1e1e',
                    color: '#4fc3f7',
                    padding: '16px',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontFamily: 'Consolas, Monaco, monospace'
                  }}>{output}</pre>
                  <p className="hint">* 此为演示功能，生成的短网址仅作展示用途</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "math"
)

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// ID 转 62 进制短码
func Encode(id int64) string {
    if id == 0 {
        return string(chars[0])
    }

    var result []byte
    for id > 0 {
        result = append([]byte{chars[id%62]}, result...)
        id /= 62
    }
    return string(result)
}

// 短码转 ID
func Decode(shortCode string) int64 {
    var id int64
    for _, c := range shortCode {
        id = id*62 + int64(indexOf(chars, byte(c)))
    }
    return id
}

func indexOf(s string, c byte) int {
    for i := 0; i < len(s); i++ {
        if s[i] == c {
            return i
        }
    }
    return -1
}

func main() {
    id := int64(123456789)
    code := Encode(id)
    fmt.Printf("ID: %d -> Short Code: %s\\n", id, code)
    fmt.Printf("Short Code: %s -> ID: %d\\n", code, Decode(code))
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import string

CHARS = string.ascii_letters + string.digits  # 62个字符

def encode(id: int) -> str:
    """ID 转 62 进制短码"""
    if id == 0:
        return CHARS[0]

    result = []
    while id > 0:
        result.append(CHARS[id % 62])
        id //= 62
    return ''.join(reversed(result))

def decode(short_code: str) -> int:
    """短码转 ID"""
    id = 0
    for c in short_code:
        id = id * 62 + CHARS.index(c)
    return id

# 使用示例
if __name__ == "__main__":
    id = 123456789
    code = encode(id)
    print(f"ID: {id} -> Short Code: {code}")
    print(f"Short Code: {code} -> ID: {decode(code)}")`}</pre>
            </div>

            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// ID 转 62 进制短码
function encode(id) {
    if (id === 0) return CHARS[0];

    let result = '';
    while (id > 0) {
        result = CHARS[id % 62] + result;
        id = Math.floor(id / 62);
    }
    return result;
}

// 短码转 ID
function decode(shortCode) {
    let id = 0;
    for (const c of shortCode) {
        id = id * 62 + CHARS.indexOf(c);
    }
    return id;
}

// 使用示例
const id = 123456789;
const code = encode(id);
console.log(\`ID: \${id} -> Short Code: \${code}\`);
console.log(\`Short Code: \${code} -> ID: \${decode(code)}\`);`}</pre>
            </div>

            <h2>Node.js 服务端示例</h2>
            <div className="code-block">
              <pre>{`const express = require('express');
const { nanoid } = require('nanoid');
const app = express();

// 模拟数据库存储
const urlMap = new Map();

// 创建短网址
app.post('/shorten', (req, res) => {
    const { url } = req.body;
    const code = nanoid(6);  // 生成 6 位随机短码
    urlMap.set(code, url);
    res.json({ shortUrl: \`https://s.url/\${code}\` });
});

// 重定向
app.get('/:code', (req, res) => {
    const { code } = req.params;
    const longUrl = urlMap.get(code);
    if (longUrl) {
        res.redirect(301, longUrl);
    } else {
        res.status(404).send('Not found');
    }
});

app.listen(3000);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

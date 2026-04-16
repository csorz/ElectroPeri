import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function Base64ToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [variant, setVariant] = useState<'standard' | 'urlsafe'>('standard')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 标准 Base64 编码
  const base64Encode = (str: string): string => {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    return btoa(String.fromCharCode(...data))
  }

  // 标准 Base64 解码
  const base64Decode = (str: string): string => {
    const binary = atob(str)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decoder = new TextDecoder()
    return decoder.decode(bytes)
  }

  // Base64URL 编码 (URL Safe)
  const base64UrlEncode = (str: string): string => {
    return base64Encode(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  // Base64URL 解码 (URL Safe)
  const base64UrlDecode = (str: string): string => {
    // 还原为标准 Base64
    let standard = str.replace(/-/g, '+').replace(/_/g, '/')
    // 添加填充
    const pad = standard.length % 4
    if (pad) {
      standard += '='.repeat(4 - pad)
    }
    return base64Decode(standard)
  }

  const handleConvert = () => {
    setError(null)
    try {
      if (mode === 'encode') {
        if (variant === 'standard') {
          setOutput(base64Encode(input))
        } else {
          setOutput(base64UrlEncode(input))
        }
      } else {
        if (variant === 'standard') {
          setOutput(base64Decode(input))
        } else {
          setOutput(base64UrlDecode(input))
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📦 Base64 编解码</h1>
        <p>Base64 编码与解码，支持 UTF-8 字符集</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 Base64？</h2>
            <div className="info-box">
              <p>Base64 是一种<strong>二进制到文本的编码方案</strong>，将二进制数据转换为 64 个可打印 ASCII 字符。</p>
              <p>常用于在文本协议（如 HTTP、邮件）中传输二进制数据。</p>
            </div>

            <h2>编码原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  原始数据 (3字节 = 24位)
  ┌─────────────────────────────┐
  │ 01000001 01000010 01000011 │  → "ABC"
  └─────────────────────────────┘
           ↓ 分组为 6 位
  ┌────────┬────────┬────────┬────────┐
  │ 010000 │ 010100 │ 001001 │ 000011 │
  │   16   │   20   │    9   │    3   │
  └────────┴────────┴────────┴────────┘
           ↓ 查表得到字符
  ┌────────┬────────┬────────┬────────┐
  │   Q    │   U    │   J    │   D    │
  └────────┴────────┴────────┴────────┘

  结果: "ABC" → "QUJD"
              `}</pre>
            </div>

            <h2>Base64 字符表</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>范围</th>
                  <th>字符</th>
                  <th>数量</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0-25</td>
                  <td>A-Z</td>
                  <td>26</td>
                </tr>
                <tr>
                  <td>26-51</td>
                  <td>a-z</td>
                  <td>26</td>
                </tr>
                <tr>
                  <td>52-61</td>
                  <td>0-9</td>
                  <td>10</td>
                </tr>
                <tr>
                  <td>62</td>
                  <td>+</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>63</td>
                  <td>/</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>填充</td>
                  <td>=</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>

            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>可逆编码</h3>
                <p>可以无损地编码和解码数据</p>
              </div>
              <div className="feature-card">
                <h3>体积增加</h3>
                <p>编码后体积增加约 33%</p>
              </div>
              <div className="feature-card">
                <h3>文本安全</h3>
                <p>只包含可打印 ASCII 字符</p>
              </div>
              <div className="feature-card">
                <h3>非加密</h3>
                <p>Base64 是编码而非加密，无安全性</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>📧 邮件传输</h4>
                <p>MIME 协议中传输二进制附件</p>
              </div>
              <div className="scenario-card">
                <h4>🖼️ 图片内嵌</h4>
                <p>Data URL 中嵌入小图片</p>
              </div>
              <div className="scenario-card">
                <h4>🔑 认证信息</h4>
                <p>HTTP Basic Auth 编码用户名密码</p>
              </div>
              <div className="scenario-card">
                <h4>📝 JSON 数据</h4>
                <p>在 JSON 中传输二进制数据</p>
              </div>
            </div>

            <h2>变体</h2>
            <div className="info-box warning">
              <strong>⚠️ 常见变体</strong>
              <ul>
                <li><strong>标准 Base64</strong>: 使用 + 和 /</li>
                <li><strong>URL Safe</strong>: 使用 - 和 _ 替代 + 和 /</li>
                <li><strong>Base64URL</strong>: 去掉填充符 =，用于 JWT</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>Base64 编解码</h2>
            <div className="base64-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>模式</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}>
                    <option value="encode">编码 (Encode)</option>
                    <option value="decode">解码 (Decode)</option>
                  </select>
                </div>
                <div className="config-item">
                  <label>变体</label>
                  <select value={variant} onChange={(e) => setVariant(e.target.value as 'standard' | 'urlsafe')}>
                    <option value="standard">标准 Base64</option>
                    <option value="urlsafe">Base64URL (URL Safe)</option>
                  </select>
                </div>
              </div>

              {variant === 'urlsafe' && (
                <div className="info-box" style={{ marginTop: 12 }}>
                  <strong>Base64URL 说明</strong>
                  <p style={{ marginTop: 4 }}>
                    使用 <code>-</code> 替代 <code>+</code>，<code>_</code> 替代 <code>/</code>，并移除填充符 <code>=</code>。
                    适用于 URL 和文件名场景，如 JWT Token。
                  </p>
                </div>
              )}

              {error && (
                <div style={{ color: '#c62828', padding: '12px', background: '#ffebee', borderRadius: '6px', marginBottom: 12 }}>
                  ❌ {error}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  {mode === 'encode' ? '原始文本' : variant === 'urlsafe' ? 'Base64URL 字符串' : 'Base64 字符串'}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'encode' ? '输入要编码的文本...' : variant === 'urlsafe' ? '输入要解码的 Base64URL 字符串 (可包含 - 和 _)...' : '输入要解码的 Base64 字符串...'}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: mode === 'decode' ? 'monospace' : 'inherit'
                  }}
                />
              </div>

              <div className="demo-controls" style={{ marginTop: 12 }}>
                <button onClick={handleConvert}>
                  {mode === 'encode' ? '编码' : '解码'}
                </button>
                {output && (
                  <>
                    <button onClick={handleSwap} style={{ background: '#e0e0e0', color: '#333' }}>
                      交换输入输出
                    </button>
                    <button onClick={() => onCopy(output)} style={{ background: '#e0e0e0', color: '#333' }}>
                      复制结果
                    </button>
                  </>
                )}
              </div>

              {output && (
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    {mode === 'encode'
                      ? (variant === 'urlsafe' ? 'Base64URL 结果' : 'Base64 结果')
                      : '解码结果'}
                  </label>
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
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript - 浏览器原生</h2>
            <div className="code-block">
              <pre>{`// 浏览器原生方法 (btoa/atob)
const text = "Hello, 世界!";

// ============ 标准 Base64 ============
// 编码
const encoder = new TextEncoder();
const data = encoder.encode(text);
const base64 = btoa(String.fromCharCode(...data));
console.log("Base64:", base64);
// "SGVsbG8sIOS4lueVjCE="

// 解码
const binary = atob(base64);
const bytes = new Uint8Array(binary.length);
for (let i = 0; i < binary.length; i++) {
  bytes[i] = binary.charCodeAt(i);
}
const decoded = new TextDecoder().decode(bytes);
console.log("Decoded:", decoded);
// "Hello, 世界!"

// ============ Base64URL (URL Safe) ============
// 编码: + → -, / → _, 移除 =
const base64UrlEncode = (str) => {
  const data = new TextEncoder().encode(str);
  return btoa(String.fromCharCode(...data))
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '');
};

// 解码: 还原 + 和 /, 补充 =
const base64UrlDecode = (str) => {
  let standard = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = standard.length % 4;
  if (pad) standard += '='.repeat(4 - pad);
  const binary = atob(standard);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

const urlSafe = base64UrlEncode(text);
console.log("Base64URL:", urlSafe);
// "SGVsbG8sIOS4lueVjCE"

console.log("Decoded:", base64UrlDecode(urlSafe));`}</pre>
            </div>

            <h2>JavaScript - js-base64（第三方库）</h2>
            <div className="info-box" style={{ marginBottom: 16 }}>
              <p>📦 安装: <code>npm install js-base64</code></p>
              <p>✅ 自动处理 UTF-8，支持 Base64URL，API 简洁</p>
            </div>
            <div className="code-block">
              <pre>{`import { Base64 } from 'js-base64';

const text = "Hello, 世界!";

// ============ 标准 Base64 ============
const encoded = Base64.encode(text);
console.log("Encoded:", encoded);
// "SGVsbG8sIOS4lueVjCE="

const decoded = Base64.decode(encoded);
console.log("Decoded:", decoded);
// "Hello, 世界!"

// ============ Base64URL (URL Safe) ============
// 自动处理 + → -, / → _, 移除 =
const urlEncoded = Base64.encodeURI(text);
console.log("Base64URL:", urlEncoded);
// "SGVsbG8sIOS4lueVjCE"

const urlDecoded = Base64.decode(urlEncoded);
console.log("Decoded:", urlDecoded);

// ============ 其他方法 ============
// 检查是否为有效 Base64
Base64.isValid(encoded);  // true

// 编码二进制数据
const uint8Array = new TextEncoder().encode(text);
const fromUint8 = Base64.fromUint8Array(uint8Array);

// 解码为 Uint8Array
const toUint8 = Base64.toUint8Array(encoded);`}</pre>
            </div>

            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`// Node.js Buffer 原生支持
const text = "Hello, 世界!";

// ============ 标准 Base64 ============
const encoded = Buffer.from(text, 'utf8').toString('base64');
console.log("Encoded:", encoded);
// "SGVsbG8sIOS4lueVjCE="

const decoded = Buffer.from(encoded, 'base64').toString('utf8');
console.log("Decoded:", decoded);
// "Hello, 世界!"

// ============ Base64URL (URL Safe) ============
const base64url = require('base64url'); // npm install base64url

const urlEncoded = base64url(text);
console.log("Base64URL:", urlEncoded);

const urlDecoded = base64url.decode(urlEncoded);
console.log("Decoded:", urlDecoded);

// 或手动转换
const toBase64Url = (str) =>
  Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '');

const fromBase64Url = (str) => {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  return Buffer.from(b64, 'base64').toString('utf8');
};`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/base64"
    "fmt"
)

func main() {
    text := "Hello, 世界!"

    // ============ 标准 Base64 ============
    encoded := base64.StdEncoding.EncodeToString([]byte(text))
    fmt.Println("Encoded:", encoded)
    // "SGVsbG8sIOS4lueVjCE="

    decoded, _ := base64.StdEncoding.DecodeString(encoded)
    fmt.Println("Decoded:", string(decoded))

    // ============ Base64URL (URL Safe) ============
    urlEncoded := base64.URLEncoding.EncodeToString([]byte(text))
    fmt.Println("URL Safe:", urlEncoded)
    // "SGVsbG8sIOS4lueVjCE=" (有填充)

    // ============ Raw 编码 (无填充) ============
    // RawStdEncoding: 标准 Base64 无填充
    rawEncoded := base64.RawStdEncoding.EncodeToString([]byte(text))
    fmt.Println("Raw:", rawEncoded)
    // "SGVsbG8sIOS4lueVjCE"

    // RawURLEncoding: URL Safe 无填充 (JWT 常用)
    rawUrlEncoded := base64.RawURLEncoding.EncodeToString([]byte(text))
    fmt.Println("Raw URL:", rawUrlEncoded)
    // "SGVsbG8sIOS4lueVjCE"

    // 解码
    rawDecoded, _ := base64.RawURLEncoding.DecodeString(rawUrlEncoded)
    fmt.Println("Decoded:", string(rawDecoded))
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import base64

text = "Hello, 世界!"
data = text.encode('utf-8')

# ============ 标准 Base64 ============
encoded = base64.b64encode(data).decode('ascii')
print(f"Encoded: {encoded}")
# "SGVsbG8sIOS4lueVjCE="

decoded = base64.b64decode(encoded).decode('utf-8')
print(f"Decoded: {decoded}")

# ============ Base64URL (URL Safe) ============
url_encoded = base64.urlsafe_b64encode(data).decode('ascii')
print(f"URL Safe: {url_encoded}")
# "SGVsbG8sIOS4lueVjCE="

url_decoded = base64.urlsafe_b64decode(url_encoded).decode('utf-8')
print(f"Decoded: {url_decoded}")

# ============ 无填充版本 ============
# 移除填充符 =
url_encoded_no_pad = url_encoded.rstrip('=')
print(f"URL Safe (no pad): {url_encoded_no_pad}")

# 解码时自动处理
url_decoded = base64.urlsafe_b64decode(url_encoded_no_pad + '==').decode('utf-8')`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.util.Base64;
import java.nio.charset.StandardCharsets;

public class Base64Example {
    public static void main(String[] args) {
        String text = "Hello, 世界!";
        byte[] data = text.getBytes(StandardCharsets.UTF_8);

        // ============ 标准 Base64 ============
        String encoded = Base64.getEncoder().encodeToString(data);
        System.out.println("Encoded: " + encoded);
        // "SGVsbG8sIOS4lueVjCE="

        String decoded = new String(
            Base64.getDecoder().decode(encoded),
            StandardCharsets.UTF_8
        );
        System.out.println("Decoded: " + decoded);

        // ============ Base64URL (URL Safe) ============
        String urlEncoded = Base64.getUrlEncoder().encodeToString(data);
        System.out.println("URL Safe: " + urlEncoded);

        String urlDecoded = new String(
            Base64.getUrlDecoder().decode(urlEncoded),
            StandardCharsets.UTF_8
        );
        System.out.println("Decoded: " + urlDecoded);

        // ============ MIME 编码 (带换行) ============
        String mimeEncoded = Base64.getMimeEncoder().encodeToString(data);
        System.out.println("MIME: " + mimeEncoded);
    }
}`}</pre>
            </div>

            <h2>JWT 中的 Base64URL</h2>
            <div className="info-box" style={{ marginBottom: 16 }}>
              <p>JWT (JSON Web Token) 使用 Base64URL 编码，特点：</p>
              <ul>
                <li>使用 <code>-</code> 替代 <code>+</code></li>
                <li>使用 <code>_</code> 替代 <code>/</code></li>
                <li>移除所有填充符 <code>=</code></li>
              </ul>
            </div>
            <div className="code-block">
              <pre>{`// JWT Header 示例
const header = { alg: "HS256", typ: "JWT" };
const headerJson = JSON.stringify(header);

// Base64URL 编码 (JWT 标准)
const jwtBase64UrlEncode = (str) => {
  const data = new TextEncoder().encode(str);
  return btoa(String.fromCharCode(...data))
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '');
};

const encodedHeader = jwtBase64UrlEncode(headerJson);
console.log(encodedHeader);
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXIn0"

// JWT 结构: header.payload.signature
// 各部分都用 Base64URL 编码`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

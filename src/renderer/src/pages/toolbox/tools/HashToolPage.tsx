import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import { hashStringAll, hashFileAll, type HashAlgo } from '../hashUtils'
import './ToolPage.css'

const ALGOS: HashAlgo[] = ['MD5', 'SHA1', 'SHA256', 'SHA512']

export default function HashToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [hashText, setHashText] = useState('')
  const [hashTextResults, setHashTextResults] = useState<Record<HashAlgo, string>>({
    MD5: '',
    SHA1: '',
    SHA256: '',
    SHA512: ''
  })
  const [hashFileName, setHashFileName] = useState<string | null>(null)
  const [hashFileResults, setHashFileResults] = useState<Record<HashAlgo, string>>({
    MD5: '',
    SHA1: '',
    SHA256: '',
    SHA512: ''
  })
  const [hashBusy, setHashBusy] = useState(false)
  const [hashError, setHashError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleHashText = () => {
    setHashError(null)
    try {
      setHashTextResults(hashStringAll(hashText))
    } catch (e) {
      setHashError(e instanceof Error ? e.message : '计算失败')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setHashError(null)
    setHashFileResults({ MD5: '', SHA1: '', SHA256: '', SHA512: '' })
    if (!file) {
      setHashFileName(null)
      return
    }
    setHashFileName(file.name)
    setHashBusy(true)
    try {
      const results = await hashFileAll(file)
      setHashFileResults(results)
    } catch (err) {
      setHashError(err instanceof Error ? err.message : '文件 Hash 计算失败')
    } finally {
      setHashBusy(false)
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>#️⃣ Hash 计算</h1>
        <p>计算字符串或文件的 MD5、SHA1、SHA256、SHA512 哈希值</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 Hash？</h2>
            <div className="info-box">
              <p>Hash（哈希）是一种<strong>单向加密算法</strong>，将任意长度的数据映射为固定长度的字符串。</p>
              <p>具有不可逆性：无法从哈希值还原原始数据。</p>
            </div>

            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>确定性</h3>
                <p>相同输入始终产生相同输出</p>
              </div>
              <div className="feature-card">
                <h3>快速计算</h3>
                <p>能够快速计算出任意数据的哈希值</p>
              </div>
              <div className="feature-card">
                <h3>雪崩效应</h3>
                <p>输入微小变化导致输出巨大变化</p>
              </div>
              <div className="feature-card">
                <h3>抗碰撞</h3>
                <p>难以找到两个不同输入产生相同输出</p>
              </div>
            </div>

            <h2>常用算法对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>算法</th>
                  <th>输出长度</th>
                  <th>安全性</th>
                  <th>用途</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MD5</td>
                  <td>128 bit</td>
                  <td>❌ 已破解</td>
                  <td>文件校验、非安全场景</td>
                </tr>
                <tr>
                  <td>SHA1</td>
                  <td>160 bit</td>
                  <td>⚠️ 不推荐</td>
                  <td>遗留系统</td>
                </tr>
                <tr>
                  <td>SHA256</td>
                  <td>256 bit</td>
                  <td>✅ 安全</td>
                  <td>密码存储、数字签名</td>
                </tr>
                <tr>
                  <td>SHA512</td>
                  <td>512 bit</td>
                  <td>✅ 安全</td>
                  <td>高安全需求场景</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>🔐 密码存储</h4>
                <p>存储密码的哈希值而非明文，即使数据库泄露也无法还原密码</p>
              </div>
              <div className="scenario-card">
                <h4>📁 文件校验</h4>
                <p>验证文件完整性，确保下载的文件未被篡改</p>
              </div>
              <div className="scenario-card">
                <h4>🔑 数字签名</h4>
                <p>对文档哈希值签名，保证数据真实性和完整性</p>
              </div>
              <div className="scenario-card">
                <h4>📦 数据去重</h4>
                <p>通过哈希值快速判断数据是否已存在</p>
              </div>
            </div>

            <h2>安全建议</h2>
            <div className="info-box warning">
              <strong>⚠️ 注意事项</strong>
              <ul>
                <li>MD5 和 SHA1 已被破解，不应用于安全场景</li>
                <li>存储密码应使用 bcrypt、scrypt 或 Argon2</li>
                <li>加盐（Salt）可以防止彩虹表攻击</li>
                <li>文件校验可使用 MD5，但安全验证需用 SHA256+</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>字符串 Hash 计算</h2>
            <div className="hash-demo">
              {hashError && (
                <div className="error-message" style={{ color: '#c62828', marginBottom: 12 }}>
                  ❌ {hashError}
                </div>
              )}
              <textarea
                className="tool-textarea"
                value={hashText}
                onChange={(e) => setHashText(e.target.value)}
                placeholder="输入要计算 Hash 的文本..."
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
              <div className="demo-controls" style={{ marginTop: 12 }}>
                <button onClick={handleHashText}>计算 Hash</button>
              </div>
              {ALGOS.map(
                (algo) =>
                  hashTextResults[algo] && (
                    <div key={algo} style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong>{algo}</strong>
                        <button
                          onClick={() => onCopy(hashTextResults[algo])}
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          复制
                        </button>
                      </div>
                      <pre style={{
                        background: '#f5f5f5',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        wordBreak: 'break-all',
                        margin: 0
                      }}>
                        {hashTextResults[algo]}
                      </pre>
                    </div>
                  )
              )}
            </div>

            <h2>文件 Hash 计算</h2>
            <div className="hash-demo">
              <input
                type="file"
                onChange={handleFileChange}
                style={{
                  padding: '12px',
                  border: '2px dashed #ddd',
                  borderRadius: '6px',
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
              {hashFileName && <div style={{ marginTop: 8, color: '#666' }}>已选：{hashFileName}</div>}
              {hashBusy && <div style={{ marginTop: 8, color: '#1976d2' }}>计算中...</div>}
              {ALGOS.map(
                (algo) =>
                  hashFileResults[algo] && (
                    <div key={algo} style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong>{algo}</strong>
                        <button
                          onClick={() => onCopy(hashFileResults[algo])}
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          复制
                        </button>
                      </div>
                      <pre style={{
                        background: '#f5f5f5',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        wordBreak: 'break-all',
                        margin: 0
                      }}>
                        {hashFileResults[algo]}
                      </pre>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 使用 Web Crypto API（浏览器原生）
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 使用示例
const hash = await sha256('Hello World');
console.log(hash);
// 输出: a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e

// MD5 需要第三方库（如 crypto-js）
import CryptoJS from 'crypto-js';
const md5Hash = CryptoJS.MD5('Hello World').toString();`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "crypto/md5"
    "crypto/sha256"
    "encoding/hex"
    "fmt"
    "io"
    "os"
)

// 计算字符串 Hash
func hashString(s string) string {
    h := sha256.New()
    h.Write([]byte(s))
    return hex.EncodeToString(h.Sum(nil))
}

// 计算文件 Hash
func hashFile(filePath string) (string, error) {
    file, err := os.Open(filePath)
    if err != nil {
        return "", err
    }
    defer file.Close()

    h := sha256.New()
    if _, err := io.Copy(h, file); err != nil {
        return "", err
    }
    return hex.EncodeToString(h.Sum(nil)), nil
}

func main() {
    fmt.Println(hashString("Hello World"))

    // MD5
    h := md5.New()
    h.Write([]byte("Hello World"))
    fmt.Println(hex.EncodeToString(h.Sum(nil)))
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import hashlib

# 字符串 Hash
def hash_string(text: str, algorithm: str = 'sha256') -> str:
    h = hashlib.new(algorithm)
    h.update(text.encode('utf-8'))
    return h.hexdigest()

# 文件 Hash
def hash_file(filepath: str, algorithm: str = 'sha256') -> str:
    h = hashlib.new(algorithm)
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

# 使用示例
print(hash_string('Hello World'))
print(hash_string('Hello World', 'md5'))
print(hash_file('/path/to/file'))`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.security.MessageDigest;
import java.nio.file.Files;
import java.nio.file.Paths;

public class HashUtil {
    public static String hashString(String text, String algorithm) throws Exception {
        MessageDigest md = MessageDigest.getInstance(algorithm);
        byte[] digest = md.digest(text.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public static String hashFile(String filepath, String algorithm) throws Exception {
        MessageDigest md = MessageDigest.getInstance(algorithm);
        byte[] fileBytes = Files.readAllBytes(Paths.get(filepath));
        byte[] digest = md.digest(fileBytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public static void main(String[] args) throws Exception {
        System.out.println(hashString("Hello World", "SHA-256"));
        System.out.println(hashString("Hello World", "MD5"));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

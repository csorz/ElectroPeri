import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import { hashStringAll, hashFileAll, ALGO_ORDER, HASH_ALGO_INFO, type HashAlgo } from '../hashUtils'
import './ToolPage.css'

const emptyResults: Record<HashAlgo, string> = {
  MD5: '',
  SHA1: '',
  SHA224: '',
  SHA256: '',
  SHA384: '',
  SHA512: '',
  SHA3_256: '',
  SHA3_512: '',
  RIPEMD160: ''
}

export default function HashToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [hashText, setHashText] = useState('')
  const [hashTextResults, setHashTextResults] = useState<Record<HashAlgo, string>>(emptyResults)
  const [hashFileName, setHashFileName] = useState<string | null>(null)
  const [hashFileResults, setHashFileResults] = useState<Record<HashAlgo, string>>(emptyResults)
  const [hashBusy, setHashBusy] = useState(false)
  const [hashError, setHashError] = useState<string | null>(null)
  const [selectedAlgos, setSelectedAlgos] = useState<HashAlgo[]>(['MD5', 'SHA256', 'SHA512'])

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
    setHashFileResults(emptyResults)
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

  const toggleAlgo = (algo: HashAlgo) => {
    setSelectedAlgos(prev => prev.includes(algo) ? prev.filter(a => a !== algo) : [...prev, algo])
  }

  const getSecurityBadge = (security: string) => {
    switch (security) {
      case 'broken':
        return <span style={{ background: '#ffcdd2', color: '#c62828', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginLeft: 6 }}>已破解</span>
      case 'weak':
        return <span style={{ background: '#fff3e0', color: '#e65100', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginLeft: 6 }}>不推荐</span>
      case 'safe':
        return <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginLeft: 6 }}>安全</span>
      case 'recommended':
        return <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginLeft: 6 }}>推荐</span>
      default:
        return null
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔑 Hash 计算</h1>
        <p>计算字符串或文件的哈希值，支持 MD5、SHA-1、SHA-2、SHA-3、RIPEMD-160 等多种算法</p>
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
              <p>Hash（哈希/散列）是一种<strong>单向加密算法</strong>，将任意长度的数据映射为固定长度的字符串。</p>
              <p>核心特性：<strong>不可逆</strong>——无法从哈希值还原原始数据。</p>
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

            <h2>Hash 算法家族</h2>
            <h3>MD 系列（已淘汰）</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>算法</th>
                  <th>输出长度</th>
                  <th>设计者</th>
                  <th>安全性</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MD4</td>
                  <td>128 bit</td>
                  <td>Rivest</td>
                  <td>❌ 已破解</td>
                  <td>1990年，已被完全攻破</td>
                </tr>
                <tr>
                  <td>MD5</td>
                  <td>128 bit</td>
                  <td>Rivest</td>
                  <td>❌ 已破解</td>
                  <td>1991年，碰撞攻击可行</td>
                </tr>
              </tbody>
            </table>

            <h3>SHA 系列（主流）</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>系列</th>
                  <th>算法</th>
                  <th>输出长度</th>
                  <th>安全性</th>
                  <th>用途</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={2}>SHA-1</td>
                  <td>SHA-1</td>
                  <td>160 bit</td>
                  <td>⚠️ 不推荐</td>
                  <td>遗留系统、Git对象ID</td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ color: '#666', fontSize: '13px' }}>2017年Google宣布碰撞攻击，NIST已弃用</td>
                </tr>
                <tr>
                  <td rowSpan={4}>SHA-2</td>
                  <td>SHA-224</td>
                  <td>224 bit</td>
                  <td>✅ 安全</td>
                  <td>受限环境</td>
                </tr>
                <tr>
                  <td>SHA-256</td>
                  <td>256 bit</td>
                  <td>✅ 推荐</td>
                  <td>密码存储、数字签名、区块链</td>
                </tr>
                <tr>
                  <td>SHA-384</td>
                  <td>384 bit</td>
                  <td>✅ 推荐</td>
                  <td>高安全需求</td>
                </tr>
                <tr>
                  <td>SHA-512</td>
                  <td>512 bit</td>
                  <td>✅ 推荐</td>
                  <td>64位系统优化、高安全场景</td>
                </tr>
                <tr>
                  <td rowSpan={4}>SHA-3</td>
                  <td>SHA3-224</td>
                  <td>224 bit</td>
                  <td>✅ 推荐</td>
                  <td rowSpan={4}>新标准、抗量子计算</td>
                </tr>
                <tr><td>SHA3-256</td><td>256 bit</td><td>✅ 推荐</td></tr>
                <tr><td>SHA3-384</td><td>384 bit</td><td>✅ 推荐</td></tr>
                <tr><td>SHA3-512</td><td>512 bit</td><td>✅ 推荐</td></tr>
              </tbody>
            </table>

            <h3>其他算法</h3>
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
                  <td>RIPEMD-160</td>
                  <td>160 bit</td>
                  <td>✅ 安全</td>
                  <td>比特币地址生成、OpenPGP</td>
                </tr>
                <tr>
                  <td>BLAKE2b</td>
                  <td>512 bit</td>
                  <td>✅ 推荐</td>
                  <td>高性能场景，比SHA-3更快</td>
                </tr>
                <tr>
                  <td>Whirlpool</td>
                  <td>512 bit</td>
                  <td>✅ 安全</td>
                  <td>ISO/IEC标准</td>
                </tr>
              </tbody>
            </table>

            <h2>SHA-2 vs SHA-3 对比</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>SHA-2</h3>
                <p>基于Merkle-Damgård结构，广泛部署，硬件加速支持好</p>
              </div>
              <div className="feature-card">
                <h3>SHA-3</h3>
                <p>基于Keccak海绵结构，2015年成为NIST标准，抗长度扩展攻击</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>🔐 密码存储</h4>
                <p>存储密码的哈希值而非明文，推荐使用 bcrypt/Argon2</p>
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
              <div className="scenario-card">
                <h4>⛓️ 区块链</h4>
                <p>区块哈希、交易哈希、默克尔树构建</p>
              </div>
              <div className="scenario-card">
                <h4>🎫 JWT Token</h4>
                <p>JWT签名算法使用SHA-256/SHA-512</p>
              </div>
            </div>

            <h2>安全建议</h2>
            <div className="info-box warning">
              <strong>⚠️ 重要提示</strong>
              <ul>
                <li><strong>MD5/SHA1</strong>：已破解，仅用于文件校验等非安全场景</li>
                <li><strong>密码存储</strong>：不要直接使用Hash，应使用 bcrypt、scrypt、Argon2</li>
                <li><strong>加盐(Salt)</strong>：防止彩虹表攻击，每个用户使用唯一盐值</li>
                <li><strong>SHA-256</strong>：当前最推荐的通用哈希算法</li>
                <li><strong>SHA-3</strong>：新项目可考虑，抗量子计算潜力</li>
              </ul>
            </div>

            <h2>密码哈希专用算法</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>算法</th>
                  <th>特点</th>
                  <th>适用场景</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>bcrypt</td>
                  <td>内置盐、自适应成本因子</td>
                  <td>Web应用密码存储首选</td>
                </tr>
                <tr>
                  <td>scrypt</td>
                  <td>内存困难、抗ASIC</td>
                  <td>加密货币、高安全需求</td>
                </tr>
                <tr>
                  <td>Argon2</td>
                  <td>PHC冠军、抗GPU/ASIC</td>
                  <td>新项目推荐</td>
                </tr>
                <tr>
                  <td>PBKDF2</td>
                  <td>NIST标准、简单</td>
                  <td>兼容性要求场景</td>
                </tr>
              </tbody>
            </table>
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

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>选择算法</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALGO_ORDER.map(algo => {
                    const info = HASH_ALGO_INFO[algo]
                    return (
                      <label key={algo} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        background: selectedAlgos.includes(algo) ? '#e3f2fd' : '#f5f5f5',
                        border: `1px solid ${selectedAlgos.includes(algo) ? '#1976d2' : '#ddd'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedAlgos.includes(algo)}
                          onChange={() => toggleAlgo(algo)}
                          style={{ marginRight: 6 }}
                        />
                        {info.name}
                      </label>
                    )
                  })}
                </div>
              </div>

              <textarea
                className="tool-textarea"
                value={hashText}
                onChange={(e) => setHashText(e.target.value)}
                placeholder="输入要计算 Hash 的文本...&#10;支持多行文本"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}
              />
              <div className="demo-controls" style={{ marginTop: 12 }}>
                <button onClick={handleHashText}>计算 Hash</button>
              </div>
              {selectedAlgos.map(
                (algo) =>
                  hashTextResults[algo] && (
                    <div key={algo} style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <strong>{HASH_ALGO_INFO[algo].name}</strong>
                          <span style={{ color: '#666', fontSize: '12px', marginLeft: 8 }}>({HASH_ALGO_INFO[algo].bits} bit)</span>
                          {getSecurityBadge(HASH_ALGO_INFO[algo].security)}
                        </div>
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
                        whiteSpace: 'pre-wrap',
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
              {selectedAlgos.map(
                (algo) =>
                  hashFileResults[algo] && (
                    <div key={algo} style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <strong>{HASH_ALGO_INFO[algo].name}</strong>
                          <span style={{ color: '#666', fontSize: '12px', marginLeft: 8 }}>({HASH_ALGO_INFO[algo].bits} bit)</span>
                          {getSecurityBadge(HASH_ALGO_INFO[algo].security)}
                        </div>
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
                        whiteSpace: 'pre-wrap',
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
            <h2>JavaScript - Web Crypto API（原生，推荐）</h2>
            <div className="info-box" style={{ marginBottom: 16 }}>
              <p>✅ 浏览器原生支持，无需安装依赖，性能优秀</p>
              <p>⚠️ 仅支持 SHA-1、SHA-256、SHA-384、SHA-512</p>
            </div>
            <div className="code-block">
              <pre>{`// Web Crypto API - 浏览器原生支持
// 支持: SHA-1, SHA-256, SHA-384, SHA-512

async function hashText(algorithm, text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashFile(algorithm, file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 使用示例
const sha256 = await hashText('SHA-256', 'Hello World');
console.log('SHA-256:', sha256);
// a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e

const sha512 = await hashText('SHA-512', 'Hello World');
console.log('SHA-512:', sha512);

// 文件哈希
const fileHash = await hashFile('SHA-256', fileObject);
console.log('File SHA-256:', fileHash);`}</pre>
            </div>

            <h2>JavaScript - crypto-js（第三方库）</h2>
            <div className="info-box" style={{ marginBottom: 16 }}>
              <p>✅ 支持 MD5、SHA-1、SHA-2、SHA-3、RIPEMD-160 全系列</p>
              <p>📦 需要安装: <code>npm install crypto-js</code></p>
            </div>
            <div className="code-block">
              <pre>{`import CryptoJS from 'crypto-js';

// ============ 字符串哈希 ============
const text = 'Hello World';
const wordArray = CryptoJS.enc.Utf8.parse(text);

// MD5 (128 bit)
const md5 = CryptoJS.MD5(wordArray).toString();
console.log('MD5:', md5);
// b10a8db164e0754105b7a99be7e3fe5a

// SHA-1 (160 bit)
const sha1 = CryptoJS.SHA1(wordArray).toString();
console.log('SHA-1:', sha1);

// SHA-2 系列
const sha224 = CryptoJS.SHA224(wordArray).toString();
const sha256 = CryptoJS.SHA256(wordArray).toString();
const sha384 = CryptoJS.SHA384(wordArray).toString();
const sha512 = CryptoJS.SHA512(wordArray).toString();

// SHA-3 系列 (指定输出长度)
const sha3_256 = CryptoJS.SHA3(wordArray, { outputLength: 256 }).toString();
const sha3_512 = CryptoJS.SHA3(wordArray, { outputLength: 512 }).toString();

// RIPEMD-160
const ripemd160 = CryptoJS.RIPEMD160(wordArray).toString();

// ============ 文件哈希 ============
async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer));

  return {
    md5: CryptoJS.MD5(wordArray).toString(),
    sha256: CryptoJS.SHA256(wordArray).toString(),
    sha512: CryptoJS.SHA512(wordArray).toString()
  };
}

// ============ HMAC (带密钥) ============
const key = 'secret-key';
const hmac = CryptoJS.HmacSHA256(text, key).toString();
console.log('HMAC-SHA256:', hmac);`}</pre>
            </div>

            <h2>JavaScript - Node.js crypto 模块</h2>
            <div className="code-block">
              <pre>{`const crypto = require('crypto');

// 字符串哈希
const text = 'Hello World';

// 支持的算法: md5, sha1, sha224, sha256, sha384, sha512, sha3-256, sha3-512 等
const md5 = crypto.createHash('md5').update(text).digest('hex');
const sha256 = crypto.createHash('sha256').update(text).digest('hex');
const sha512 = crypto.createHash('sha512').update(text).digest('hex');
const sha3_256 = crypto.createHash('sha3-256').update(text).digest('hex');

console.log('MD5:', md5);
console.log('SHA-256:', sha256);
console.log('SHA3-256:', sha3_256);

// 文件哈希
const fs = require('fs');

function hashFile(filepath, algorithm) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filepath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// HMAC
const hmac = crypto.createHmac('sha256', 'secret-key').update(text).digest('hex');

// 查看支持的算法
console.log(crypto.getHashes());
// ['md5', 'sha1', 'sha256', 'sha512', 'sha3-256', 'blake2b512', ...]`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "crypto/md5"
    "crypto/sha1"
    "crypto/sha256"
    "crypto/sha512"
    "encoding/hex"
    "fmt"
    "io"
    "os"

    "golang.org/x/crypto/sha3"  // SHA-3 需要扩展包
)

func main() {
    text := "Hello World"
    data := []byte(text)

    // MD5
    md5Hash := md5.Sum(data)
    fmt.Println("MD5:", hex.EncodeToString(md5Hash[:]))

    // SHA-1
    sha1Hash := sha1.Sum(data)
    fmt.Println("SHA-1:", hex.EncodeToString(sha1Hash[:]))

    // SHA-256
    sha256Hash := sha256.Sum256(data)
    fmt.Println("SHA-256:", hex.EncodeToString(sha256Hash[:]))

    // SHA-512
    sha512Hash := sha512.Sum512(data)
    fmt.Println("SHA-512:", hex.EncodeToString(sha512Hash[:]))

    // SHA3-256
    h := sha3.New256()
    h.Write(data)
    sha3Hash := h.Sum(nil)
    fmt.Println("SHA3-256:", hex.EncodeToString(sha3Hash))
}

// 文件哈希
func hashFile(filepath string) (string, error) {
    file, err := os.Open(filepath)
    if err != nil { return "", err }
    defer file.Close()

    h := sha256.New()
    if _, err := io.Copy(h, file); err != nil { return "", err }
    return hex.EncodeToString(h.Sum(nil)), nil
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import hashlib

text = 'Hello World'
data = text.encode('utf-8')

# MD5
md5 = hashlib.md5(data).hexdigest()
print(f'MD5: {md5}')

# SHA-1
sha1 = hashlib.sha1(data).hexdigest()
print(f'SHA-1: {sha1}')

# SHA-2 系列
sha224 = hashlib.sha224(data).hexdigest()
sha256 = hashlib.sha256(data).hexdigest()
sha384 = hashlib.sha384(data).hexdigest()
sha512 = hashlib.sha512(data).hexdigest()
print(f'SHA-256: {sha256}')

# SHA-3 系列 (Python 3.6+)
sha3_256 = hashlib.sha3_256(data).hexdigest()
sha3_512 = hashlib.sha3_512(data).hexdigest()
print(f'SHA3-256: {sha3_256}')

# BLAKE2
blake2b = hashlib.blake2b(data).hexdigest()
print(f'BLAKE2b: {blake2b}')

# 文件哈希
def hash_file(filepath, algorithm='sha256'):
    h = hashlib.new(algorithm)
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

# HMAC
import hmac
hmac_sha256 = hmac.new(b'secret-key', data, hashlib.sha256).hexdigest()`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.security.MessageDigest;
import java.nio.file.Files;
import java.nio.file.Paths;

public class HashUtil {

    // 字符串哈希
    public static String hash(String text, String algorithm) throws Exception {
        MessageDigest md = MessageDigest.getInstance(algorithm);
        byte[] digest = md.digest(text.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    // 文件哈希
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
        String text = "Hello World";

        // 支持的算法: MD5, SHA-1, SHA-256, SHA-384, SHA-512
        System.out.println("MD5: " + hash(text, "MD5"));
        System.out.println("SHA-1: " + hash(text, "SHA-1"));
        System.out.println("SHA-256: " + hash(text, "SHA-256"));
        System.out.println("SHA-512: " + hash(text, "SHA-512"));

        // 文件哈希
        System.out.println("File SHA-256: " + hashFile("/path/to/file", "SHA-256"));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

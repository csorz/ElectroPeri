import { useCallback, useState } from 'react'
import CryptoJS from 'crypto-js'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

type EncryptMode = 'encrypt' | 'decrypt'
type Algorithm = 'AES' | 'DES' | 'TripleDES' | 'RC4'

export default function EncryptToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<EncryptMode>('encrypt')
  const [algorithm, setAlgorithm] = useState<Algorithm>('AES')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const encrypt = (text: string, key: string, algo: Algorithm): string => {
    const keyBytes = CryptoJS.enc.Utf8.parse(key)
    switch (algo) {
      case 'AES':
        return CryptoJS.AES.encrypt(text, keyBytes).toString()
      case 'DES':
        return CryptoJS.DES.encrypt(text, keyBytes).toString()
      case 'TripleDES':
        return CryptoJS.TripleDES.encrypt(text, keyBytes).toString()
      case 'RC4':
        return CryptoJS.RC4.encrypt(text, keyBytes).toString()
      default:
        return CryptoJS.AES.encrypt(text, keyBytes).toString()
    }
  }

  const decrypt = (text: string, key: string, algo: Algorithm): string => {
    const keyBytes = CryptoJS.enc.Utf8.parse(key)
    let result: CryptoJS.lib.WordArray
    switch (algo) {
      case 'AES':
        result = CryptoJS.AES.decrypt(text, keyBytes)
        break
      case 'DES':
        result = CryptoJS.DES.decrypt(text, keyBytes)
        break
      case 'TripleDES':
        result = CryptoJS.TripleDES.decrypt(text, keyBytes)
        break
      case 'RC4':
        result = CryptoJS.RC4.decrypt(text, keyBytes)
        break
      default:
        result = CryptoJS.AES.decrypt(text, keyBytes)
    }
    return result.toString(CryptoJS.enc.Utf8)
  }

  const handleConvert = () => {
    setError(null)
    if (!password) {
      setError('请输入密钥')
      setOutput('')
      return
    }
    if (!input.trim()) {
      setError('请输入内容')
      setOutput('')
      return
    }
    try {
      if (mode === 'encrypt') {
        setOutput(encrypt(input, password, algorithm))
      } else {
        const result = decrypt(input, password, algorithm)
        if (!result) {
          throw new Error('解密失败，请检查密钥或密文是否正确')
        }
        setOutput(result)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleSwap = () => {
    if (output) {
      setInput(output)
      setOutput('')
      setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt')
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔒 加密解密</h1>
        <p>支持 AES、DES、TripleDES、RC4 对称加密算法</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>对称加密</h2>
            <div className="info-box">
              <p>对称加密使用<strong>同一个密钥</strong>进行加密和解密，是最常用的加密方式。</p>
              <p>优点：速度快、效率高；缺点：密钥管理困难。</p>
            </div>

            <h2>算法对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>算法</th>
                  <th>密钥长度</th>
                  <th>分组大小</th>
                  <th>安全性</th>
                  <th>用途</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AES</td>
                  <td>128/192/256 bit</td>
                  <td>128 bit</td>
                  <td>✅ 安全</td>
                  <td>数据加密、VPN、HTTPS</td>
                </tr>
                <tr>
                  <td>DES</td>
                  <td>56 bit</td>
                  <td>64 bit</td>
                  <td>❌ 已破解</td>
                  <td>遗留系统</td>
                </tr>
                <tr>
                  <td>TripleDES</td>
                  <td>168 bit</td>
                  <td>64 bit</td>
                  <td>⚠️ 逐步淘汰</td>
                  <td>金融系统</td>
                </tr>
                <tr>
                  <td>RC4</td>
                  <td>可变 (40-2048)</td>
                  <td>流密码</td>
                  <td>❌ 已破解</td>
                  <td>不推荐使用</td>
                </tr>
              </tbody>
            </table>

            <h2>AES 加密模式</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>ECB</h3>
                <p>电子密码本，相同明文产生相同密文，不安全</p>
              </div>
              <div className="feature-card">
                <h3>CBC</h3>
                <p>密码分组链接，需要 IV，最常用模式</p>
              </div>
              <div className="feature-card">
                <h3>CTR</h3>
                <p>计数器模式，可并行处理，适合流数据</p>
              </div>
              <div className="feature-card">
                <h3>GCM</h3>
                <p>认证加密，提供加密和完整性验证</p>
              </div>
            </div>

            <h2>加密流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  加密过程:
  明文 + 密钥 → 加密算法 → 密文

  解密过程:
  密文 + 密钥 → 解密算法 → 明文

  示例:
  明文: "Hello World"
  密钥: "my-secret-key"
    ↓ AES 加密
  密文: "U2FsdGVkX1+..."
    ↓ AES 解密
  明文: "Hello World"
              `}</pre>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>🔐 数据存储</h4>
                <p>加密敏感数据如密码、个人信息</p>
              </div>
              <div className="scenario-card">
                <h4>🌐 通信加密</h4>
                <p>HTTPS、VPN、即时通讯</p>
              </div>
              <div className="scenario-card">
                <h4>📁 文件加密</h4>
                <p>保护文件内容不被未授权访问</p>
              </div>
              <div className="scenario-card">
                <h4>💳 支付系统</h4>
                <p>加密信用卡号等敏感信息</p>
              </div>
            </div>

            <h2>安全建议</h2>
            <div className="info-box warning">
              <strong>⚠️ 注意事项</strong>
              <ul>
                <li>优先使用 AES-256-GCM 或 AES-256-CBC</li>
                <li>密钥应使用密码学安全的随机数生成</li>
                <li>不要硬编码密钥在代码中</li>
                <li>使用密钥派生函数（PBKDF2）从密码生成密钥</li>
                <li>妥善保管密钥，丢失将无法解密数据</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>加密解密工具</h2>
            <div className="encrypt-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>模式</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as EncryptMode)}>
                    <option value="encrypt">加密</option>
                    <option value="decrypt">解密</option>
                  </select>
                </div>
                <div className="config-item">
                  <label>算法</label>
                  <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as Algorithm)}>
                    <option value="AES">AES (推荐)</option>
                    <option value="DES">DES</option>
                    <option value="TripleDES">TripleDES</option>
                    <option value="RC4">RC4</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>密钥</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入加密/解密密钥..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {error && (
                <div style={{ color: '#c62828', padding: '12px', background: '#ffebee', borderRadius: '6px', marginTop: 12 }}>
                  ❌ {error}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  {mode === 'encrypt' ? '明文' : '密文'}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'encrypt' ? '输入要加密的文本...' : '输入要解密的密文...'}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: mode === 'decrypt' ? 'monospace' : 'inherit'
                  }}
                />
              </div>

              <div className="demo-controls" style={{ marginTop: 12 }}>
                <button onClick={handleConvert}>
                  {mode === 'encrypt' ? '加密' : '解密'}
                </button>
                {output && (
                  <>
                    <button onClick={() => onCopy(output)} style={{ background: '#e0e0e0', color: '#333' }}>复制结果</button>
                    <button onClick={handleSwap} style={{ background: '#e0e0e0', color: '#333' }}>结果作为输入</button>
                  </>
                )}
              </div>

              {output && (
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    {mode === 'encrypt' ? '密文' : '明文'}
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
            <h2>JavaScript 示例 (crypto-js)</h2>
            <div className="code-block">
              <pre>{`import CryptoJS from 'crypto-js';

// AES 加密
const key = 'my-secret-key';
const plaintext = 'Hello World';

// 加密
const ciphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
console.log('Encrypted:', ciphertext);

// 解密
const bytes = CryptoJS.AES.decrypt(ciphertext, key);
const decrypted = bytes.toString(CryptoJS.enc.Utf8);
console.log('Decrypted:', decrypted);

// 使用密钥对象（更安全）
const keyBytes = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16字节密钥
const ivBytes = CryptoJS.enc.Utf8.parse('1234567890123456');  // 16字节IV

const encrypted = CryptoJS.AES.encrypt(plaintext, keyBytes, {
  iv: ivBytes,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
}).toString();`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/hex"
    "fmt"
    "io"
)

func encrypt(plaintext, key []byte) ([]byte, error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }

    ciphertext := make([]byte, aes.BlockSize+len(plaintext))
    iv := ciphertext[:aes.BlockSize]
    if _, err := io.ReadFull(rand.Reader, iv); err != nil {
        return nil, err
    }

    stream := cipher.NewCFBEncrypter(block, iv)
    stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)

    return ciphertext, nil
}

func decrypt(ciphertext, key []byte) ([]byte, error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }

    iv := ciphertext[:aes.BlockSize]
    ciphertext = ciphertext[aes.BlockSize:]

    stream := cipher.NewCFBDecrypter(block, iv)
    stream.XORKeyStream(ciphertext, ciphertext)

    return ciphertext, nil
}

func main() {
    key := []byte("0123456789abcdef") // 16字节密钥
    plaintext := []byte("Hello World")

    encrypted, _ := encrypt(plaintext, key)
    fmt.Println("Encrypted:", hex.EncodeToString(encrypted))

    decrypted, _ := decrypt(encrypted, key)
    fmt.Println("Decrypted:", string(decrypted))
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import base64

# 生成密钥
key = get_random_bytes(16)  # AES-128

# 加密
plaintext = b"Hello World"
cipher = AES.new(key, AES.MODE_CBC)
ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))
encrypted = base64.b64encode(cipher.iv + ciphertext).decode()
print(f"Encrypted: {encrypted}")

# 解密
data = base64.b64decode(encrypted)
iv = data[:16]
ciphertext = data[16:]
cipher = AES.new(key, AES.MODE_CBC, iv)
decrypted = unpad(cipher.decrypt(ciphertext), AES.block_size)
print(f"Decrypted: {decrypted.decode()}")`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class AESExample {
    public static String encrypt(String plaintext, String key) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");

        byte[] iv = new byte[16];
        new java.security.SecureRandom().nextBytes(iv);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, new IvParameterSpec(iv));

        byte[] encrypted = cipher.doFinal(plaintext.getBytes());
        byte[] result = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, result, 0, iv.length);
        System.arraycopy(encrypted, 0, result, iv.length, encrypted.length);

        return Base64.getEncoder().encodeToString(result);
    }

    public static String decrypt(String ciphertext, String key) throws Exception {
        byte[] data = Base64.getDecoder().decode(ciphertext);

        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");

        byte[] iv = new byte[16];
        System.arraycopy(data, 0, iv, 0, 16);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(iv));

        byte[] decrypted = cipher.doFinal(data, 16, data.length - 16);
        return new String(decrypted);
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useCallback, useState } from 'react'
import CryptoJS from 'crypto-js'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

type EncryptMode = 'encrypt' | 'decrypt'
type SymmetricAlgorithm = 'AES' | 'DES' | 'TripleDES' | 'RC4'
type AsymmetricAlgorithm = 'RSA'
type Algorithm = SymmetricAlgorithm | AsymmetricAlgorithm
type KeyType = 'AES-128' | 'AES-192' | 'AES-256' | 'DES' | 'TripleDES' | 'RSA-1024' | 'RSA-2048' | 'RSA-4096'

export default function EncryptToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<EncryptMode>('encrypt')
  const [algorithm, setAlgorithm] = useState<Algorithm>('AES')
  const [error, setError] = useState<string | null>(null)

  // RSA 相关状态
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [rsaMode, setRsaMode] = useState<'public' | 'private'>('public')

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 生成随机密钥
  const generateKey = (type: KeyType): string => {
    switch (type) {
      case 'AES-128':
        return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex)
      case 'AES-192':
        return CryptoJS.lib.WordArray.random(24).toString(CryptoJS.enc.Hex)
      case 'AES-256':
        return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex)
      case 'DES':
        return CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Hex)
      case 'TripleDES':
        return CryptoJS.lib.WordArray.random(24).toString(CryptoJS.enc.Hex)
      case 'RSA-1024':
      case 'RSA-2048':
      case 'RSA-4096':
        // RSA 密钥对生成需要 Web Crypto API，这里生成模拟密钥用于演示
        const keySize = type.split('-')[1]
        return `-----BEGIN RSA ${keySize} BIT KEY (模拟)-----\n${CryptoJS.lib.WordArray.random(parseInt(keySize) / 8).toString(CryptoJS.enc.Base64)}\n-----END RSA KEY-----`
      default:
        return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex)
    }
  }

  const handleGenerateKey = (type: KeyType) => {
    const key = generateKey(type)
    setPassword(key)
  }

  // 对称加密
  const encrypt = (text: string, key: string, algo: SymmetricAlgorithm): string => {
    try {
      switch (algo) {
        case 'AES':
          return CryptoJS.AES.encrypt(text, key).toString()
        case 'DES':
          return CryptoJS.DES.encrypt(text, key).toString()
        case 'TripleDES':
          return CryptoJS.TripleDES.encrypt(text, key).toString()
        case 'RC4':
          return CryptoJS.RC4.encrypt(text, key).toString()
        default:
          return CryptoJS.AES.encrypt(text, key).toString()
      }
    } catch (e) {
      throw new Error(`加密失败: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const decrypt = (text: string, key: string, algo: SymmetricAlgorithm): string => {
    try {
      let result: CryptoJS.lib.WordArray
      switch (algo) {
        case 'AES':
          result = CryptoJS.AES.decrypt(text, key)
          break
        case 'DES':
          result = CryptoJS.DES.decrypt(text, key)
          break
        case 'TripleDES':
          result = CryptoJS.TripleDES.decrypt(text, key)
          break
        case 'RC4':
          result = CryptoJS.RC4.decrypt(text, key)
          break
        default:
          result = CryptoJS.AES.decrypt(text, key)
      }
      return result.toString(CryptoJS.enc.Utf8)
    } catch (e) {
      throw new Error(`解密失败: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const handleConvert = () => {
    setError(null)
    if (!password && algorithm !== 'RSA') {
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
      if (algorithm === 'RSA') {
        // RSA 加密需要 Web Crypto API，这里使用模拟
        if (mode === 'encrypt') {
          if (!publicKey) {
            setError('请先生成或输入公钥')
            return
          }
          // 模拟 RSA 加密结果
          const encrypted = CryptoJS.AES.encrypt(input, publicKey).toString()
          setOutput(`[RSA加密结果]\n${encrypted}`)
        } else {
          if (!privateKey) {
            setError('请先生成或输入私钥')
            return
          }
          // 模拟 RSA 解密
          const cleanInput = input.replace('[RSA加密结果]\n', '')
          const decrypted = CryptoJS.AES.decrypt(cleanInput, privateKey).toString(CryptoJS.enc.Utf8)
          setOutput(decrypted || '解密失败')
        }
      } else {
        if (mode === 'encrypt') {
          setOutput(encrypt(input, password, algorithm as SymmetricAlgorithm))
        } else {
          const result = decrypt(input, password, algorithm as SymmetricAlgorithm)
          if (!result) {
            throw new Error('解密失败，请检查密钥或密文是否正确')
          }
          setOutput(result)
        }
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
        <p>支持 AES、DES、TripleDES、RC4 对称加密，RSA 非对称加密，一键生成密钥</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>加密算法分类</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>对称加密</h3>
                <p>加密解密使用同一把密钥，速度快，适合大量数据</p>
                <p style={{ color: '#666', fontSize: '13px' }}>代表：AES、DES、ChaCha20</p>
              </div>
              <div className="feature-card">
                <h3>非对称加密</h3>
                <p>公钥加密、私钥解密，安全性高，适合密钥交换</p>
                <p style={{ color: '#666', fontSize: '13px' }}>代表：RSA、ECC、Ed25519</p>
              </div>
              <div className="feature-card">
                <h3>哈希算法</h3>
                <p>单向不可逆，用于数据完整性校验</p>
                <p style={{ color: '#666', fontSize: '13px' }}>代表：SHA-256、MD5</p>
              </div>
              <div className="feature-card">
                <h3>消息认证码</h3>
                <p>带密钥的哈希，验证数据来源和完整性</p>
                <p style={{ color: '#666', fontSize: '13px' }}>代表：HMAC、CMAC</p>
              </div>
            </div>

            <h2>对称加密算法对比</h2>
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
                  <td>✅ 推荐</td>
                  <td>数据加密、VPN、HTTPS</td>
                </tr>
                <tr>
                  <td>ChaCha20</td>
                  <td>256 bit</td>
                  <td>流密码</td>
                  <td>✅ 推荐</td>
                  <td>TLS 1.3、移动设备</td>
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
                  <td>可变</td>
                  <td>流密码</td>
                  <td>❌ 已破解</td>
                  <td>不推荐使用</td>
                </tr>
              </tbody>
            </table>

            <h2>非对称加密算法对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>算法</th>
                  <th>密钥长度</th>
                  <th>安全性</th>
                  <th>速度</th>
                  <th>用途</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>RSA</td>
                  <td>2048/4096 bit</td>
                  <td>✅ 安全</td>
                  <td>较慢</td>
                  <td>数字签名、密钥交换</td>
                </tr>
                <tr>
                  <td>ECC (P-256)</td>
                  <td>256 bit</td>
                  <td>✅ 安全</td>
                  <td>快</td>
                  <td>TLS、区块链</td>
                </tr>
                <tr>
                  <td>Ed25519</td>
                  <td>256 bit</td>
                  <td>✅ 推荐</td>
                  <td>很快</td>
                  <td>SSH、签名</td>
                </tr>
                <tr>
                  <td>SM2</td>
                  <td>256 bit</td>
                  <td>✅ 安全</td>
                  <td>快</td>
                  <td>国密标准</td>
                </tr>
              </tbody>
            </table>

            <h2>RSA 加密原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  RSA 密钥对生成:
  1. 选择两个大质数 p, q
  2. 计算 n = p × q (模数)
  3. 计算欧拉函数 φ(n) = (p-1)(q-1)
  4. 选择公钥指数 e (通常 65537)
  5. 计算私钥 d = e⁻¹ mod φ(n)

  公钥 = (n, e)  →  可公开
  私钥 = (n, d)  →  必须保密

  加密: ciphertext = plaintext^e mod n
  解密: plaintext = ciphertext^d mod n

  应用场景:
  ┌─────────────────────────────────────────────┐
  │  发送方                接收方              │
  │  ──────────           ──────────           │
  │  明文 → 公钥加密 → 密文 → 私钥解密 → 明文  │
  │        (接收方公钥)      (接收方私钥)       │
  └─────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>AES 加密模式</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>ECB</h3>
                <p>电子密码本，相同明文产生相同密文</p>
                <p style={{ color: '#c62828', fontSize: '12px' }}>⚠️ 不安全，不推荐</p>
              </div>
              <div className="feature-card">
                <h3>CBC</h3>
                <p>密码分组链接，需要 IV，最常用模式</p>
                <p style={{ color: '#2e7d32', fontSize: '12px' }}>✅ 推荐</p>
              </div>
              <div className="feature-card">
                <h3>CTR</h3>
                <p>计数器模式，可并行处理，适合流数据</p>
                <p style={{ color: '#2e7d32', fontSize: '12px' }}>✅ 推荐</p>
              </div>
              <div className="feature-card">
                <h3>GCM</h3>
                <p>认证加密，提供加密和完整性验证</p>
                <p style={{ color: '#1565c0', fontSize: '12px' }}>⭐ 最佳选择</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>🔐 数据存储</h4>
                <p>加密敏感数据如密码、个人信息</p>
              </div>
              <div className="scenario-card">
                <h4>🌐 HTTPS 通信</h4>
                <p>TLS/SSL 握手、数据传输加密</p>
              </div>
              <div className="scenario-card">
                <h4>🔑 密钥交换</h4>
                <p>RSA/ECDH 用于安全交换对称密钥</p>
              </div>
              <div className="scenario-card">
                <h4>✍️ 数字签名</h4>
                <p>RSA/ECDSA 验证数据来源和完整性</p>
              </div>
              <div className="scenario-card">
                <h4>📁 文件加密</h4>
                <p>保护文件内容不被未授权访问</p>
              </div>
              <div className="scenario-card">
                <h4>🎫 JWT Token</h4>
                <p>使用 RSA/ECDSA 签名验证</p>
              </div>
            </div>

            <h2>安全建议</h2>
            <div className="info-box warning">
              <strong>⚠️ 重要提示</strong>
              <ul>
                <li><strong>对称加密</strong>：优先使用 AES-256-GCM 或 ChaCha20-Poly1305</li>
                <li><strong>非对称加密</strong>：RSA 密钥至少 2048 位，推荐 ECC/Ed25519</li>
                <li><strong>密钥管理</strong>：不要硬编码密钥，使用密钥管理服务 (KMS)</li>
                <li><strong>随机数</strong>：使用密码学安全的随机数生成器 (CSPRNG)</li>
                <li><strong>IV/Nonce</strong>：每次加密使用唯一的 IV，不可重复</li>
                <li><strong>密钥派生</strong>：从密码生成密钥使用 PBKDF2/Argon2/bcrypt</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            {/* 密钥生成器 */}
            <h2>🔑 密钥生成器</h2>
            <div className="encrypt-demo" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 12 }}>
                <span style={{ fontWeight: 500, width: '100%', marginBottom: 4 }}>对称加密密钥</span>
                <button onClick={() => handleGenerateKey('AES-128')} style={{ padding: '6px 12px', fontSize: '13px' }}>AES-128</button>
                <button onClick={() => handleGenerateKey('AES-192')} style={{ padding: '6px 12px', fontSize: '13px' }}>AES-192</button>
                <button onClick={() => handleGenerateKey('AES-256')} style={{ padding: '6px 12px', fontSize: '13px', background: '#1976d2', color: 'white' }}>AES-256</button>
                <button onClick={() => handleGenerateKey('DES')} style={{ padding: '6px 12px', fontSize: '13px', background: '#e0e0e0' }}>DES</button>
                <button onClick={() => handleGenerateKey('TripleDES')} style={{ padding: '6px 12px', fontSize: '13px', background: '#e0e0e0' }}>TripleDES</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: 500, width: '100%', marginBottom: 4 }}>RSA 密钥对</span>
                <button onClick={() => { handleGenerateKey('RSA-1024'); setPublicKey(generateKey('RSA-1024')); setPrivateKey(generateKey('RSA-1024')); }} style={{ padding: '6px 12px', fontSize: '13px', background: '#e0e0e0' }}>RSA-1024</button>
                <button onClick={() => { handleGenerateKey('RSA-2048'); setPublicKey(generateKey('RSA-2048')); setPrivateKey(generateKey('RSA-2048')); }} style={{ padding: '6px 12px', fontSize: '13px', background: '#7b1fa2', color: 'white' }}>RSA-2048</button>
                <button onClick={() => { handleGenerateKey('RSA-4096'); setPublicKey(generateKey('RSA-4096')); setPrivateKey(generateKey('RSA-4096')); }} style={{ padding: '6px 12px', fontSize: '13px', background: '#7b1fa2', color: 'white' }}>RSA-4096</button>
              </div>
            </div>

            {/* 对称加密 */}
            <h2>对称加密</h2>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>密钥</label>
                  <button onClick={() => handleGenerateKey('AES-256')} style={{ padding: '4px 8px', fontSize: '12px', background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    生成随机密钥
                  </button>
                </div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密钥或点击上方按钮生成..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
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
                  rows={4}
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
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {output}
                  </pre>
                </div>
              )}
            </div>

            {/* RSA 非对称加密 */}
            <h2>RSA 非对称加密</h2>
            <div className="encrypt-demo">
              <div className="info-box" style={{ marginBottom: 16 }}>
                <strong>💡 RSA 说明</strong>
                <p style={{ marginTop: 4 }}>公钥加密 → 私钥解密。适用于密钥交换、数字签名场景。</p>
                <p style={{ color: '#666', fontSize: '13px' }}>注意：浏览器环境 RSA 实现有限，以下为模拟演示。</p>
              </div>

              <div className="config-grid">
                <div className="config-item">
                  <label>加密模式</label>
                  <select value={rsaMode} onChange={(e) => setRsaMode(e.target.value as 'public' | 'private')}>
                    <option value="public">公钥加密</option>
                    <option value="private">私钥解密</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>公钥 (Public Key)</label>
                  <button onClick={() => { setPublicKey(generateKey('RSA-2048')); }} style={{ padding: '4px 8px', fontSize: '12px', background: '#f3e5f5', color: '#7b1fa2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    生成公钥
                  </button>
                </div>
                <textarea
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="输入或生成公钥..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '12px',
                    resize: 'vertical',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>私钥 (Private Key)</label>
                  <button onClick={() => { setPrivateKey(generateKey('RSA-2048')); }} style={{ padding: '4px 8px', fontSize: '12px', background: '#fce4ec', color: '#c2185b', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    生成私钥
                  </button>
                </div>
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="输入或生成私钥..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '12px',
                    resize: 'vertical',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript - 浏览器原生 (Web Crypto API)</h2>
            <div className="info-box" style={{ marginBottom: 16 }}>
              <p>✅ 浏览器原生支持，无需安装依赖</p>
              <p>⚠️ 仅支持 AES、RSA、ECDSA 等算法</p>
            </div>
            <div className="code-block">
              <pre>{`// ============ AES 对称加密 (Web Crypto API) ============
async function generateAESKey() {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encryptAES(plaintext, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = encoder.encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return {
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  };
}

async function decryptAES(encrypted, key) {
  const iv = new Uint8Array(encrypted.iv.match(/.{2}/g).map(b => parseInt(b, 16)));
  const data = Uint8Array.from(atob(encrypted.ciphertext), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}

// 使用示例
const aesKey = await generateAESKey();
const encrypted = await encryptAES('Hello World', aesKey);
console.log('Encrypted:', encrypted);
const decrypted = await decryptAES(encrypted, aesKey);
console.log('Decrypted:', decrypted);`}</pre>
            </div>

            <h2>JavaScript - RSA (Web Crypto API)</h2>
            <div className="code-block">
              <pre>{`// ============ RSA 密钥对生成 ============
async function generateRSAKeyPair() {
  return await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// 导出公钥为 PEM 格式
async function exportPublicKey(key) {
  const exported = await crypto.subtle.exportKey('spki', key);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  return \`-----BEGIN PUBLIC KEY-----\\n\${base64}\\n-----END PUBLIC KEY-----\`;
}

// 导出私钥为 PEM 格式
async function exportPrivateKey(key) {
  const exported = await crypto.subtle.exportKey('pkcs8', key);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  return \`-----BEGIN PRIVATE KEY-----\\n\${base64}\\n-----END PRIVATE KEY-----\`;
}

// RSA 公钥加密
async function encryptRSA(plaintext, publicKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// RSA 私钥解密
async function decryptRSA(ciphertext, privateKey) {
  const data = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    data
  );

  return new TextDecoder().decode(decrypted);
}

// 使用示例
const keyPair = await generateRSAKeyPair();
const publicKeyPEM = await exportPublicKey(keyPair.publicKey);
const privateKeyPEM = await exportPrivateKey(keyPair.privateKey);

console.log('Public Key:', publicKeyPEM);
console.log('Private Key:', privateKeyPEM);

const encrypted = await encryptRSA('Hello RSA', keyPair.publicKey);
console.log('Encrypted:', encrypted);

const decrypted = await decryptRSA(encrypted, keyPair.privateKey);
console.log('Decrypted:', decrypted);`}</pre>
            </div>

            <h2>JavaScript - crypto-js (第三方库)</h2>
            <div className="info-box" style={{ marginBottom: 16 }}>
              <p>📦 安装: <code>npm install crypto-js</code></p>
              <p>✅ 支持 AES、DES、TripleDES、RC4 等对称加密</p>
            </div>
            <div className="code-block">
              <pre>{`import CryptoJS from 'crypto-js';

// ============ AES 加密 ============
const plaintext = 'Hello World';
const key = 'my-secret-key-123';

// 简单加密
const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
console.log('Encrypted:', encrypted);

// 解密
const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
console.log('Decrypted:', decrypted);

// ============ 使用密钥对象 (更安全) ============
const keyBytes = CryptoJS.enc.Hex.parse('0123456789abcdef0123456789abcdef'); // 32字节
const ivBytes = CryptoJS.enc.Hex.parse('abcdef0123456789'); // 16字节

const encrypted2 = CryptoJS.AES.encrypt(plaintext, keyBytes, {
  iv: ivBytes,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
}).toString();

// ============ DES 加密 ============
const desEncrypted = CryptoJS.DES.encrypt(plaintext, key).toString();

// ============ TripleDES 加密 ============
const tripleDesEncrypted = CryptoJS.TripleDES.encrypt(plaintext, key).toString();

// ============ RC4 流加密 ============
const rc4Encrypted = CryptoJS.RC4.encrypt(plaintext, key).toString();

// ============ 生成随机密钥 ============
const randomKey = CryptoJS.lib.WordArray.random(32).toString();
console.log('Random Key (256 bit):', randomKey);`}</pre>
            </div>

            <h2>Node.js - crypto 模块</h2>
            <div className="code-block">
              <pre>{`const crypto = require('crypto');

// ============ AES 加密 ============
const algorithm = 'aes-256-gcm';
const key = crypto.randomBytes(32); // 256 bit
const iv = crypto.randomBytes(12);  // GCM 推荐 12 字节

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), encrypted, authTag: authTag.toString('hex') };
}

function decrypt(data) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(data.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const encrypted = encrypt('Hello Node.js');
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypt(encrypted));

// ============ RSA 密钥对生成 ============
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('Public Key:', publicKey);
console.log('Private Key:', privateKey);

// RSA 公钥加密
const rsaEncrypted = crypto.publicEncrypt(
  { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
  Buffer.from('Hello RSA')
);
console.log('RSA Encrypted:', rsaEncrypted.toString('base64'));

// RSA 私钥解密
const rsaDecrypted = crypto.privateDecrypt(
  { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
  rsaEncrypted
);
console.log('RSA Decrypted:', rsaDecrypted.toString());

// ============ 生成随机密钥 ============
const aesKey = crypto.randomBytes(32).toString('hex');
console.log('AES-256 Key:', aesKey);`}</pre>
            </div>

            <h2>Node.js - node-rsa (第三方库)</h2>
            <div className="info-box" style={{ marginBottom: 16 }}>
              <p>📦 安装: <code>npm install node-rsa</code></p>
              <p>✅ 简化的 RSA 操作 API</p>
            </div>
            <div className="code-block">
              <pre>{`const NodeRSA = require('node-rsa');

// 生成密钥对
const key = new NodeRSA({ b: 2048 });

// 导出密钥
const publicKey = key.exportKey('pkcs8-public-pem');
const privateKey = key.exportKey('pkcs8-private-pem');

console.log('Public Key:', publicKey);
console.log('Private Key:', privateKey);

// 加密
const encrypted = key.encrypt('Hello RSA', 'base64');
console.log('Encrypted:', encrypted);

// 解密
const decrypted = key.decrypt(encrypted, 'utf8');
console.log('Decrypted:', decrypted);

// 签名
const signature = key.sign('Hello RSA', 'base64', 'utf8');
console.log('Signature:', signature);

// 验证签名
const verified = key.verify('Hello RSA', signature, 'utf8', 'base64');
console.log('Verified:', verified);`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "crypto/rsa"
    "crypto/sha256"
    "crypto/x509"
    "encoding/base64"
    "encoding/pem"
    "fmt"
    "io"
)

// AES-GCM 加密
func encryptAES(plaintext []byte, key []byte) (string, error) {
    block, _ := aes.NewCipher(key)
    gcm, _ := cipher.NewGCM(block)
    nonce := make([]byte, gcm.NonceSize())
    io.ReadFull(rand.Reader, nonce)
    ciphertext := gcm.Seal(nil, nonce, plaintext, nil)
    return base64.StdEncoding.EncodeToString(append(nonce, ciphertext...)), nil
}

// AES-GCM 解密
func decryptAES(ciphertext string, key []byte) (string, error) {
    data, _ := base64.StdEncoding.DecodeString(ciphertext)
    block, _ := aes.NewCipher(key)
    gcm, _ := cipher.NewGCM(block)
    nonce := data[:gcm.NonceSize()]
    plaintext, _ := gcm.Open(nil, nonce, data[gcm.NonceSize():], nil)
    return string(plaintext), nil
}

// RSA 密钥对生成
func generateRSAKeyPair() (*rsa.PrivateKey, error) {
    return rsa.GenerateKey(rand.Reader, 2048)
}

// RSA 公钥加密
func encryptRSA(plaintext []byte, pubKey *rsa.PublicKey) (string, error) {
    ciphertext, _ := rsa.EncryptOAEP(sha256.New(), rand.Reader, pubKey, plaintext, nil)
    return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// RSA 私钥解密
func decryptRSA(ciphertext string, privKey *rsa.PrivateKey) (string, error) {
    data, _ := base64.StdEncoding.DecodeString(ciphertext)
    plaintext, _ := rsa.DecryptOAEP(sha256.New(), rand.Reader, privKey, data, nil)
    return string(plaintext), nil
}

// 导出 PEM 格式
func exportPEM(privKey *rsa.PrivateKey) (string, string) {
    privPEM := pem.EncodeToMemory(&pem.Block{
        Type:  "RSA PRIVATE KEY",
        Bytes: x509.MarshalPKCS1PrivateKey(privKey),
    })
    pubPEM := pem.EncodeToMemory(&pem.Block{
        Type:  "RSA PUBLIC KEY",
        Bytes: x509.MarshalPKCS1PublicKey(&privKey.PublicKey),
    })
    return string(pubPEM), string(privPEM)
}

func main() {
    // AES 示例
    key := make([]byte, 32)
    io.ReadFull(rand.Reader, key)
    encrypted, _ := encryptAES([]byte("Hello Go"), key)
    fmt.Println("AES Encrypted:", encrypted)
    decrypted, _ := decryptAES(encrypted, key)
    fmt.Println("AES Decrypted:", decrypted)

    // RSA 示例
    privKey, _ := generateRSAKeyPair()
    pubPEM, privPEM := exportPEM(privKey)
    fmt.Println("Public Key:", pubPEM)
    fmt.Println("Private Key:", privPEM)

    rsaEncrypted, _ := encryptRSA([]byte("Hello RSA"), &privKey.PublicKey)
    fmt.Println("RSA Encrypted:", rsaEncrypted)
    rsaDecrypted, _ := decryptRSA(rsaEncrypted, privKey)
    fmt.Println("RSA Decrypted:", rsaDecrypted)
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`from Crypto.Cipher import AES
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Random import get_random_bytes
import base64

# ============ AES 加密 ============
def encrypt_aes(plaintext, key):
    cipher = AES.new(key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode())
    return base64.b64encode(cipher.nonce + tag + ciphertext).decode()

def decrypt_aes(ciphertext, key):
    data = base64.b64decode(ciphertext)
    nonce, tag, ciphertext = data[:16], data[16:32], data[32:]
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    return cipher.decrypt_and_verify(ciphertext, tag).decode()

# 使用
key = get_random_bytes(32)
encrypted = encrypt_aes('Hello Python', key)
print(f'AES Encrypted: {encrypted}')
print(f'AES Decrypted: {decrypt_aes(encrypted, key)}')

# ============ RSA 密钥对生成 ============
key = RSA.generate(2048)
private_key = key.export_key().decode()
public_key = key.publickey().export_key().decode()

print(f'Public Key:\\n{public_key}')
print(f'Private Key:\\n{private_key}')

# RSA 加密
cipher = PKCS1_OAEP.new(key.publickey())
encrypted = base64.b64encode(cipher.encrypt(b'Hello RSA')).decode()
print(f'RSA Encrypted: {encrypted}')

# RSA 解密
cipher = PKCS1_OAEP.new(key)
decrypted = cipher.decrypt(base64.b64decode(encrypted)).decode()
print(f'RSA Decrypted: {decrypted}')`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.util.Base64;

public class CryptoExample {

    // AES-GCM 加密
    public static String encryptAES(String plaintext, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] iv = cipher.getIV();
        byte[] encrypted = cipher.doFinal(plaintext.getBytes());
        return Base64.getEncoder().encodeToString(
            java.nio.ByteBuffer.allocate(iv.length + encrypted.length)
                .put(iv).put(encrypted).array()
        );
    }

    // AES-GCM 解密
    public static String decryptAES(String ciphertext, SecretKey key) throws Exception {
        byte[] data = Base64.getDecoder().decode(ciphertext);
        byte[] iv = new byte[12];
        System.arraycopy(data, 0, iv, 0, 12);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
        return new String(cipher.doFinal(data, 12, data.length - 12));
    }

    // 生成 AES 密钥
    public static SecretKey generateAESKey() throws Exception {
        KeyGenerator kg = KeyGenerator.getInstance("AES");
        kg.init(256);
        return kg.generateKey();
    }

    // 生成 RSA 密钥对
    public static KeyPair generateRSAKeyPair() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        return kpg.generateKeyPair();
    }

    // RSA 公钥加密
    public static String encryptRSA(String plaintext, PublicKey publicKey) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        return Base64.getEncoder().encodeToString(cipher.doFinal(plaintext.getBytes()));
    }

    // RSA 私钥解密
    public static String decryptRSA(String ciphertext, PrivateKey privateKey) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        return new String(cipher.doFinal(Base64.getDecoder().decode(ciphertext)));
    }

    public static void main(String[] args) throws Exception {
        // AES 示例
        SecretKey aesKey = generateAESKey();
        String encrypted = encryptAES("Hello Java", aesKey);
        System.out.println("AES Encrypted: " + encrypted);
        System.out.println("AES Decrypted: " + decryptAES(encrypted, aesKey));

        // RSA 示例
        KeyPair keyPair = generateRSAKeyPair();
        String rsaEncrypted = encryptRSA("Hello RSA", keyPair.getPublic());
        System.out.println("RSA Encrypted: " + rsaEncrypted);
        System.out.println("RSA Decrypted: " + decryptRSA(rsaEncrypted, keyPair.getPrivate()));
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

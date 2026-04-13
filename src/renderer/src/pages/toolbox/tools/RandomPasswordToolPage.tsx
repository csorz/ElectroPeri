import { useState } from 'react'
import './ToolPage.css'

export default function RandomPasswordToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🎲 随机密码生成器</h1>
        <p>Random Password Generator - 安全密码生成</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>高熵值</h3>
                <p>使用加密安全的随机数生成器，确保密码不可预测</p>
              </div>
              <div className="feature-card">
                <h3>可定制</h3>
                <p>支持自定义长度、字符类型，满足不同安全需求</p>
              </div>
              <div className="feature-card">
                <h3>本地生成</h3>
                <p>密码在本地生成，不经过网络传输，安全可靠</p>
              </div>
              <div className="feature-card">
                <h3>强度评估</h3>
                <p>实时评估密码强度，帮助选择更安全的密码</p>
              </div>
            </div>

            <h2>密码强度标准</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  密码熵值计算公式

  熵值 = log2(字符集大小 ^ 密码长度) = 密码长度 × log2(字符集大小)

  ┌────────────┬──────────────┬─────────────────────────────────────┐
  │ 字符集     │ 大小         │ 示例                                │
  ├────────────┼──────────────┼─────────────────────────────────────┤
  │ 仅数字     │ 10           │ 123456, 000000                      │
  │ 仅小写     │ 26           │ abcdef, password                    │
  │ 小写+数字  │ 36           │ abc123, pass123                     │
  │ 大小写     │ 52           │ PassWord, AbCdEf                    │
  │ 大小写+数字│ 62           │ Pass123, AbC123                     │
  │ 全字符集   │ 95           │ P@ss123!, A#c_123                   │
  └────────────┴──────────────┴─────────────────────────────────────┘

  推荐密码熵值: >= 60 bits (足够安全)
  高安全场景: >= 80 bits
              `}</pre>
            </div>

            <h2>密码强度评估</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>强度</th>
                    <th>熵值范围</th>
                    <th>特点</th>
                    <th>建议</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: '#f44336' }}>弱</td>
                    <td>&lt; 40 bits</td>
                    <td>容易被破解</td>
                    <td>不推荐使用</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#ff9800' }}>中等</td>
                    <td>40-59 bits</td>
                    <td>有一定安全性</td>
                    <td>可用于一般账户</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#4caf50' }}>强</td>
                    <td>60-79 bits</td>
                    <td>较难破解</td>
                    <td>推荐用于重要账户</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#2e7d32' }}>非常强</td>
                    <td>&gt;= 80 bits</td>
                    <td>极难破解</td>
                    <td>高安全场景推荐</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>最佳实践</h2>
            <ul className="scenario-list">
              <li><strong>长度优先</strong> - 密码长度比复杂度更重要，建议至少 12 位</li>
              <li><strong>混合字符</strong> - 使用大小写字母、数字和特殊字符的组合</li>
              <li><strong>避免规律</strong> - 不使用生日、电话、连续字符等易猜测内容</li>
              <li><strong>一户一密</strong> - 不同账户使用不同密码，避免"撞库"风险</li>
              <li><strong>定期更换</strong> - 重要账户定期更换密码</li>
              <li><strong>密码管理</strong> - 使用密码管理器存储和自动填充密码</li>
            </ul>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>账户注册</h4>
                <p>为新注册账户生成安全密码</p>
              </div>
              <div className="scenario-card">
                <h4>密码重置</h4>
                <p>重置密码时生成临时密码或新密码</p>
              </div>
              <div className="scenario-card">
                <h4>API 密钥</h4>
                <p>生成 API 访问密钥或 Token</p>
              </div>
              <div className="scenario-card">
                <h4>WiFi 密码</h4>
                <p>设置安全的无线网络密码</p>
              </div>
              <div className="scenario-card">
                <h4>数据库密码</h4>
                <p>数据库连接密码生成</p>
              </div>
              <div className="scenario-card">
                <h4>加密密钥</h4>
                <p>文件加密、通信加密的密钥</p>
              </div>
            </div>

            <div className="info-box warning">
              <strong>安全提示</strong>
              <ul>
                <li>生成的密码请妥善保管，建议使用密码管理器</li>
                <li>不要在不安全的网络环境中传输明文密码</li>
                <li>避免在浏览器或云服务中保存明文密码</li>
                <li>定期检查账户安全，及时更换可能泄露的密码</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>密码生成器</h2>
            <PasswordGeneratorDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 生成随机密码
function generatePassword(length, options) {
  const {
    lowercase = true,
    uppercase = true,
    numbers = true,
    symbols = true
  } = options

  let charset = ''
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (numbers) charset += '0123456789'
  if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  return password
}

// 使用 crypto API (更安全)
function generateSecurePassword(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, x => charset[x % charset.length]).join('')
}

console.log(generatePassword(16, {}))
console.log(generateSecurePassword(16))`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "crypto/rand"
    "fmt"
    "math/big"
)

const (
    lowercase = "abcdefghijklmnopqrstuvwxyz"
    uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    numbers   = "0123456789"
    symbols   = "!@#$%^&*()_+-=[]{}|;:,.<>?"
)

func generatePassword(length int, useLower, useUpper, useNum, useSym bool) string {
    charset := ""
    if useLower {
        charset += lowercase
    }
    if useUpper {
        charset += uppercase
    }
    if useNum {
        charset += numbers
    }
    if useSym {
        charset += symbols
    }

    password := make([]byte, length)
    for i := 0; i < length; i++ {
        n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
        password[i] = charset[n.Int64()]
    }
    return string(password)
}

func main() {
    pwd := generatePassword(16, true, true, true, true)
    fmt.Println("生成的密码:", pwd)
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import secrets
import string

def generate_password(length=16, use_lower=True, use_upper=True,
                      use_digits=True, use_symbols=True):
    """生成安全的随机密码"""
    charset = ""
    if use_lower:
        charset += string.ascii_lowercase
    if use_upper:
        charset += string.ascii_uppercase
    if use_digits:
        charset += string.digits
    if use_symbols:
        charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    # 使用 secrets 模块生成密码安全的随机数
    password = ''.join(secrets.choice(charset) for _ in range(length))
    return password

def calculate_entropy(password):
    """计算密码熵值"""
    import math
    charset_size = 0
    if any(c.islower() for c in password):
        charset_size += 26
    if any(c.isupper() for c in password):
        charset_size += 26
    if any(c.isdigit() for c in password):
        charset_size += 10
    if any(not c.isalnum() for c in password):
        charset_size += 32

    return len(password) * math.log2(charset_size) if charset_size > 0 else 0

# 生成密码
pwd = generate_password(16)
print(f"密码: {pwd}")
print(f"熵值: {calculate_entropy(pwd):.1f} bits")`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PasswordGenerator {
    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String NUMBERS = "0123456789";
    private static final String SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    private static final SecureRandom random = new SecureRandom();

    public static String generate(int length, boolean lower, boolean upper,
                                  boolean numbers, boolean symbols) {
        StringBuilder charset = new StringBuilder();
        if (lower) charset.append(LOWERCASE);
        if (upper) charset.append(UPPERCASE);
        if (numbers) charset.append(NUMBERS);
        if (symbols) charset.append(SYMBOLS);

        StringBuilder password = new StringBuilder(length);
        String chars = charset.toString();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            password.append(chars.charAt(index));
        }

        return password.toString();
    }

    public static void main(String[] args) {
        String password = generate(16, true, true, true, true);
        System.out.println("生成的密码: " + password);
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 密码生成演示组件
function PasswordGeneratorDemo() {
  const [length, setLength] = useState(16)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(false)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [passwords, setPasswords] = useState<string[]>([])
  const [count, setCount] = useState(5)

  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const NUMBERS = '0123456789'
  const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const AMBIGUOUS = 'l1IO0'

  const generatePassword = () => {
    let charset = ''
    let requiredChars = ''

    if (includeLowercase) {
      const chars = excludeAmbiguous
        ? LOWERCASE.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
        : LOWERCASE
      charset += chars
      requiredChars += chars[Math.floor(Math.random() * chars.length)]
    }

    if (includeUppercase) {
      const chars = excludeAmbiguous
        ? UPPERCASE.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
        : UPPERCASE
      charset += chars
      requiredChars += chars[Math.floor(Math.random() * chars.length)]
    }

    if (includeNumbers) {
      const chars = excludeAmbiguous
        ? NUMBERS.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
        : NUMBERS
      charset += chars
      requiredChars += chars[Math.floor(Math.random() * chars.length)]
    }

    if (includeSymbols) {
      charset += SYMBOLS
      requiredChars += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    }

    if (!charset) {
      return
    }

    const newPasswords: string[] = []
    for (let i = 0; i < count; i++) {
      let password = ''
      password = requiredChars

      for (let j = password.length; j < length; j++) {
        password += charset[Math.floor(Math.random() * charset.length)]
      }

      password = password.split('').sort(() => Math.random() - 0.5).join('')
      newPasswords.push(password)
    }

    setPasswords(newPasswords)
  }

  const copyAll = () => {
    if (passwords.length > 0) {
      navigator.clipboard.writeText(passwords.join('\n'))
    }
  }

  const clearPasswords = () => {
    setPasswords([])
  }

  const calculateStrength = (pwd: string): { level: string; color: string } => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    if (score <= 2) return { level: '弱', color: '#f44336' }
    if (score <= 4) return { level: '中等', color: '#ff9800' }
    if (score <= 5) return { level: '强', color: '#4caf50' }
    return { level: '非常强', color: '#2e7d32' }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="connection-demo">
      <div className="config-grid">
        <div className="config-item">
          <label>密码长度: {length}</label>
          <input
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
          />
        </div>
        <div className="config-item">
          <label>生成数量</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            min="1"
            max="50"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ marginBottom: '8px' }}>包含字符</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="checkbox" checked={includeLowercase} onChange={(e) => setIncludeLowercase(e.target.checked)} />
            小写字母 (a-z)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="checkbox" checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} />
            大写字母 (A-Z)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} />
            数字 (0-9)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} />
            特殊符号 (!@#$%^&*...)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} />
            排除易混淆字符 (l, 1, I, O, 0)
          </label>
        </div>
      </div>

      <div className="demo-controls">
        <button
          onClick={generatePassword}
          disabled={!includeLowercase && !includeUppercase && !includeNumbers && !includeSymbols}
        >
          生成密码
        </button>
        <button onClick={clearPasswords}>清空</button>
      </div>

      {passwords.length > 0 && (
        <div className="result-box" style={{ marginTop: '16px', textAlign: 'left' }}>
          <h4 style={{ marginBottom: '12px' }}>生成结果</h4>
          {passwords.map((pwd, index) => {
            const strength = calculateStrength(pwd)
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  fontFamily: "'Consolas', 'Monaco', monospace"
                }}
              >
                <span style={{ flex: 1, wordBreak: 'break-all', fontSize: '13px' }}>{pwd}</span>
                <span
                  style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: strength.color,
                    color: '#fff'
                  }}
                >
                  {strength.level}
                </span>
                <button
                  onClick={() => copyToClipboard(pwd)}
                  style={{ fontSize: '12px', padding: '4px 8px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  复制
                </button>
              </div>
            )
          })}
          <div className="demo-controls" style={{ marginTop: '12px' }}>
            <button onClick={copyAll}>复制全部</button>
          </div>
        </div>
      )}
    </div>
  )
}

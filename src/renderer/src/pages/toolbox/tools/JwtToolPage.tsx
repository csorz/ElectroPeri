import { useState } from 'react'
import CryptoJS from 'crypto-js'
import './ToolPage.css'

type JwtMode = 'decode' | 'encode'

interface JwtHeader {
  alg: string
  typ: string
}

interface JwtPayload {
  [key: string]: unknown
}

export default function JwtToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🎫 JWT 编解码</h1>
        <p>JSON Web Token - JSON 网络令牌</p>
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
                <h3>自包含</h3>
                <p>JWT 载荷包含用户信息，无需多次查询数据库</p>
              </div>
              <div className="feature-card">
                <h3>无状态</h3>
                <p>服务端无需存储会话信息，易于水平扩展</p>
              </div>
              <div className="feature-card">
                <h3>跨域支持</h3>
                <p>可在不同域名间安全传递用户身份信息</p>
              </div>
              <div className="feature-card">
                <h3>签名验证</h3>
                <p>通过数字签名确保令牌未被篡改</p>
              </div>
            </div>

            <h2>结构组成</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  JWT = Header.Payload.Signature

  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
  │     Header      │  │     Payload     │  │    Signature    │
  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤
  │ {               │  │ {               │  │ HMACSHA256(     │
  │   "alg": "HS256",│  │   "sub": "123", │  │   base64Url(    │
  │   "typ": "JWT"  │  │   "name": "John",│  │     header),    │
  │ }               │  │   "iat": 1516...│  │   ".",          │
  └─────────────────┘  │   "exp": 1516...│  │   base64Url(    │
                       │ }               │  │     payload),   │
                       └─────────────────┘  │   secret        │
                                            │ )               │
                                            └─────────────────┘

  实际 JWT 示例:
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
              `}</pre>
            </div>

            <h2>标准声明字段</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>字段</th>
                    <th>名称</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>iss</code></td>
                    <td>Issuer</td>
                    <td>令牌签发者</td>
                  </tr>
                  <tr>
                    <td><code>sub</code></td>
                    <td>Subject</td>
                    <td>令牌主题（用户 ID）</td>
                  </tr>
                  <tr>
                    <td><code>aud</code></td>
                    <td>Audience</td>
                    <td>接收令牌的一方</td>
                  </tr>
                  <tr>
                    <td><code>exp</code></td>
                    <td>Expiration</td>
                    <td>过期时间（Unix 时间戳）</td>
                  </tr>
                  <tr>
                    <td><code>nbf</code></td>
                    <td>Not Before</td>
                    <td>生效时间</td>
                  </tr>
                  <tr>
                    <td><code>iat</code></td>
                    <td>Issued At</td>
                    <td>签发时间</td>
                  </tr>
                  <tr>
                    <td><code>jti</code></td>
                    <td>JWT ID</td>
                    <td>令牌唯一标识</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>身份认证</h4>
                <p>用户登录后颁发 JWT，后续请求携带令牌验证身份</p>
              </div>
              <div className="scenario-card">
                <h4>单点登录</h4>
                <p>多系统间共享用户身份，一次登录多处使用</p>
              </div>
              <div className="scenario-card">
                <h4>信息交换</h4>
                <p>安全地在各方之间传递信息，签名确保可信</p>
              </div>
              <div className="scenario-card">
                <h4>API 授权</h4>
                <p>微服务架构中的服务间授权验证</p>
              </div>
            </div>

            <div className="info-box warning">
              <strong>安全注意事项</strong>
              <ul>
                <li>JWT 载荷默认只做 Base64 编码，不加密敏感信息</li>
                <li>妥善保管 Secret 密钥，泄露后所有令牌都可被伪造</li>
                <li>设置合理的过期时间，避免令牌长期有效</li>
                <li>使用 HTTPS 传输，防止中间人攻击</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>JWT 编解码工具</h2>
            <JwtDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 使用 jsonwebtoken 库
const jwt = require('jsonwebtoken')

// 生成 JWT
const token = jwt.sign(
  { userId: 123, username: 'john' },
  'your-secret-key',
  { expiresIn: '1h' }
)
console.log(token)

// 验证并解析 JWT
try {
  const decoded = jwt.verify(token, 'your-secret-key')
  console.log(decoded) // { userId: 123, username: 'john', iat: ..., exp: ... }
} catch (err) {
  console.log('令牌无效或已过期')
}

// 不验证签名解析（仅查看内容）
const payload = jwt.decode(token)
console.log(payload)`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "time"
    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
    UserID   int    \`json:"userId"\`
    Username string \`json:"username"\`
    jwt.RegisteredClaims
}

func main() {
    secret := []byte("your-secret-key")

    // 生成 JWT
    claims := Claims{
        UserID:   123,
        Username: "john",
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, _ := token.SignedString(secret)
    fmt.Println(tokenString)

    // 解析 JWT
    parsed, err := jwt.ParseWithClaims(
        tokenString,
        &Claims{},
        func(t *jwt.Token) (interface{}, error) {
            return secret, nil
        },
    )

    if err == nil && parsed.Valid {
        if claims, ok := parsed.Claims.(*Claims); ok {
            fmt.Printf("UserID: %d\\n", claims.UserID)
        }
    }
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import jwt
import datetime

secret = "your-secret-key"

# 生成 JWT
payload = {
    "userId": 123,
    "username": "john",
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
    "iat": datetime.datetime.utcnow()
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)

# 解析并验证 JWT
try:
    decoded = jwt.decode(token, secret, algorithms=["HS256"])
    print(decoded)
except jwt.ExpiredSignatureError:
    print("令牌已过期")
except jwt.InvalidTokenError:
    print("无效的令牌")

# 不验证签名解析
decoded = jwt.decode(token, options={"verify_signature": False})
print(decoded)`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;

public class JwtDemo {
    static Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public static void main(String[] args) {
        // 生成 JWT
        String token = Jwts.builder()
            .setSubject("123")
            .claim("username", "john")
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 3600000))
            .signWith(key)
            .compact();
        System.out.println(token);

        // 解析 JWT
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
            System.out.println("Username: " + claims.get("username"));
        } catch (ExpiredJwtException e) {
            System.out.println("令牌已过期");
        } catch (JwtException e) {
            System.out.println("无效的令牌");
        }
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// JWT 演示组件
function JwtDemo() {
  const [mode, setMode] = useState<JwtMode>('decode')
  const [jwtInput, setJwtInput] = useState('')
  const [header, setHeader] = useState<JwtHeader | null>(null)
  const [payload, setPayload] = useState<JwtPayload | null>(null)
  const [signature, setSignature] = useState('')
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [encodeHeader, setEncodeHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [encodePayload, setEncodePayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}')
  const [encodeSecret, setEncodeSecret] = useState('')
  const [encodedJwt, setEncodedJwt] = useState('')

  const base64UrlEncode = (str: string): string => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const base64UrlDecode = (str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    try {
      return atob(base64)
    } catch {
      return ''
    }
  }

  const createSignature = (headerB64: string, payloadB64: string, secret: string): string => {
    const message = `${headerB64}.${payloadB64}`
    const signature = CryptoJS.HmacSHA256(message, secret)
    return CryptoJS.enc.Base64.stringify(signature)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const decodeJwt = () => {
    setError(null)
    setHeader(null)
    setPayload(null)
    setSignature('')
    setSignatureValid(null)

    const token = jwtInput.trim()
    if (!token) {
      setError('请输入 JWT Token')
      return
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      setError('无效的 JWT 格式，应该包含三部分（用 . 分隔）')
      return
    }

    try {
      const headerJson = base64UrlDecode(parts[0])
      const payloadJson = base64UrlDecode(parts[1])

      setHeader(JSON.parse(headerJson))
      setPayload(JSON.parse(payloadJson))
      setSignature(parts[2])
    } catch {
      setError('JWT 解析失败，请检查格式是否正确')
    }
  }

  const verifySignature = () => {
    if (!jwtInput.trim() || !encodeSecret.trim()) {
      setError('请输入 JWT Token 和密钥')
      return
    }

    const parts = jwtInput.trim().split('.')
    if (parts.length !== 3) {
      setError('无效的 JWT 格式')
      return
    }

    const expectedSignature = createSignature(parts[0], parts[1], encodeSecret)
    setSignatureValid(expectedSignature === parts[2])
  }

  const encodeJwt = () => {
    setError(null)
    setEncodedJwt('')

    if (!encodeSecret.trim()) {
      setError('请输入 Secret 密钥')
      return
    }

    try {
      const headerObj = JSON.parse(encodeHeader)
      const payloadObj = JSON.parse(encodePayload)

      const headerB64 = base64UrlEncode(JSON.stringify(headerObj))
      const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj))
      const signatureB64 = createSignature(headerB64, payloadB64, encodeSecret)

      setEncodedJwt(`${headerB64}.${payloadB64}.${signatureB64}`)
    } catch {
      setError('JSON 格式错误，请检查 Header 和 Payload 格式')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="connection-demo">
      <div className="config-item" style={{ marginBottom: '16px' }}>
        <label>模式</label>
        <select value={mode} onChange={(e) => setMode(e.target.value as JwtMode)}>
          <option value="decode">解码 JWT</option>
          <option value="encode">编码 JWT</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#ffebee', borderRadius: '6px', color: '#c62828', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {mode === 'decode' ? (
        <>
          <div className="config-item" style={{ marginBottom: '16px' }}>
            <label>JWT Token</label>
            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="输入 JWT Token..."
              rows={4}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: "'Consolas', monospace", fontSize: '13px' }}
            />
          </div>

          <div className="config-item" style={{ marginBottom: '16px' }}>
            <label>验证签名密钥（可选）</label>
            <input
              type="text"
              value={encodeSecret}
              onChange={(e) => setEncodeSecret(e.target.value)}
              placeholder="输入 Secret 密钥验证签名..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div className="demo-controls">
            <button onClick={decodeJwt}>解码</button>
            {jwtInput && encodeSecret && (
              <button onClick={verifySignature} style={{ background: '#e0e0e0', color: '#333' }}>验证签名</button>
            )}
          </div>

          {signatureValid !== null && (
            <div style={{ marginTop: '12px', padding: '12px', borderRadius: '6px', background: signatureValid ? '#e8f5e9' : '#ffebee', color: signatureValid ? '#2e7d32' : '#c62828' }}>
              {signatureValid ? '签名验证通过' : '签名验证失败'}
            </div>
          )}

          {header && (
            <div className="result-box" style={{ marginTop: '16px', textAlign: 'left' }}>
              <h4>Header</h4>
              <pre style={{ background: '#1e1e1e', color: '#4fc3f7', padding: '12px', borderRadius: '6px', overflow: 'auto', margin: '8px 0' }}>
                {JSON.stringify(header, null, 2)}
              </pre>
              <button onClick={() => copyToClipboard(JSON.stringify(header, null, 2))} style={{ fontSize: '12px', padding: '4px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>复制</button>
            </div>
          )}

          {payload && (
            <div className="result-box" style={{ marginTop: '16px', textAlign: 'left' }}>
              <h4>Payload</h4>
              <pre style={{ background: '#1e1e1e', color: '#4fc3f7', padding: '12px', borderRadius: '6px', overflow: 'auto', margin: '8px 0' }}>
                {JSON.stringify(payload, null, 2)}
              </pre>
              <button onClick={() => copyToClipboard(JSON.stringify(payload, null, 2))} style={{ fontSize: '12px', padding: '4px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>复制</button>
            </div>
          )}

          {signature && (
            <div className="result-box" style={{ marginTop: '16px', textAlign: 'left' }}>
              <h4>Signature</h4>
              <pre style={{ background: '#1e1e1e', color: '#4fc3f7', padding: '12px', borderRadius: '6px', overflow: 'auto', margin: '8px 0', wordBreak: 'break-all' }}>
                {signature}
              </pre>
              <button onClick={() => copyToClipboard(signature)} style={{ fontSize: '12px', padding: '4px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>复制</button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="config-item" style={{ marginBottom: '16px' }}>
            <label>Header (JSON)</label>
            <textarea
              value={encodeHeader}
              onChange={(e) => setEncodeHeader(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: "'Consolas', monospace", fontSize: '13px' }}
            />
          </div>

          <div className="config-item" style={{ marginBottom: '16px' }}>
            <label>Payload (JSON)</label>
            <textarea
              value={encodePayload}
              onChange={(e) => setEncodePayload(e.target.value)}
              rows={6}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: "'Consolas', monospace", fontSize: '13px' }}
            />
          </div>

          <div className="config-item" style={{ marginBottom: '16px' }}>
            <label>Secret 密钥</label>
            <input
              type="text"
              value={encodeSecret}
              onChange={(e) => setEncodeSecret(e.target.value)}
              placeholder="输入密钥（用于签名）..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div className="demo-controls">
            <button onClick={encodeJwt}>编码并签名</button>
          </div>

          {encodedJwt && (
            <div className="result-box" style={{ marginTop: '16px', textAlign: 'left' }}>
              <h4>编码结果</h4>
              <textarea
                value={encodedJwt}
                readOnly
                rows={4}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: "'Consolas', monospace", fontSize: '13px', background: '#f8f9fa' }}
              />
              <button onClick={() => copyToClipboard(encodedJwt)} style={{ marginTop: '8px', fontSize: '12px', padding: '4px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>复制 JWT</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

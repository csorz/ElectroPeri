import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

type ConvertMode = 'text-to-unicode' | 'unicode-to-text' | 'text-to-utf8' | 'utf8-to-text'

export default function UnicodeToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<ConvertMode>('text-to-unicode')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleConvert = () => {
    setError(null)
    try {
      switch (mode) {
        case 'text-to-unicode': {
          const codes: string[] = []
          for (let i = 0; i < input.length; i++) {
            codes.push(`U+${input.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')}`)
          }
          setOutput(codes.join(' '))
          break
        }
        case 'unicode-to-text': {
          const codes = input.split(/\s+/).filter(Boolean)
          const chars = codes.map((code) => {
            const hex = code.replace(/^U\+/i, '')
            return String.fromCharCode(parseInt(hex, 16))
          })
          setOutput(chars.join(''))
          break
        }
        case 'text-to-utf8': {
          const encoder = new TextEncoder()
          const bytes = encoder.encode(input)
          setOutput(Array.from(bytes).map((b) => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`).join(' '))
          break
        }
        case 'utf8-to-text': {
          const hexBytes = input.split(/\s+/).filter(Boolean)
          const bytes = new Uint8Array(
            hexBytes.map((hex) => parseInt(hex.replace(/^0x/i, ''), 16))
          )
          const decoder = new TextDecoder()
          setOutput(decoder.decode(bytes))
          break
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🌐 Unicode 编码</h1>
        <p>Unicode 码点与 UTF-8 字节编码转换</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 Unicode？</h2>
            <div className="info-box">
              <p>Unicode 是一种<strong>字符编码标准</strong>，为世界上所有字符分配唯一的数字编号（码点）。</p>
              <p>解决了不同语言字符集不兼容的问题，是现代文本处理的基础。</p>
            </div>

            <h2>Unicode 与 UTF-8</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>概念</th>
                  <th>说明</th>
                  <th>示例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>码点 (Code Point)</td>
                  <td>字符的唯一数字编号</td>
                  <td>U+4E2D (中)</td>
                </tr>
                <tr>
                  <td>UTF-8</td>
                  <td>变长编码，1-4 字节</td>
                  <td>0xE4 0xB8 0xAD</td>
                </tr>
                <tr>
                  <td>UTF-16</td>
                  <td>变长编码，2 或 4 字节</td>
                  <td>0x4E2D</td>
                </tr>
                <tr>
                  <td>UTF-32</td>
                  <td>定长编码，4 字节</td>
                  <td>0x00004E2D</td>
                </tr>
              </tbody>
            </table>

            <h2>UTF-8 编码规则</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  UTF-8 编码规则：

  码点范围           编码格式
  ─────────────────────────────────────────
  U+0000..U+007F    0xxxxxxx                    (1字节)
  U+0080..U+07FF    110xxxxx 10xxxxxx           (2字节)
  U+0800..U+FFFF    1110xxxx 10xxxxxx 10xxxxxx  (3字节)
  U+10000..U+10FFFF 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx (4字节)

  示例："中" (U+4E2D)
  码点: 0100 1110 0010 1101
  UTF-8: 11100100 10111000 10101101
       = 0xE4 0xB8 0xAD
              `}</pre>
            </div>

            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>全球统一</h3>
                <p>覆盖 149,000+ 字符，支持 161 种文字</p>
              </div>
              <div className="feature-card">
                <h3>向后兼容</h3>
                <p>前 128 个码点与 ASCII 完全一致</p>
              </div>
              <div className="feature-card">
                <h3>变长编码</h3>
                <p>UTF-8 根据字符自动调整字节数</p>
              </div>
              <div className="feature-card">
                <h3>自同步</h3>
                <p>可以从任意字节判断字符边界</p>
              </div>
            </div>

            <h2>常用字符码点</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>字符</th>
                  <th>码点</th>
                  <th>UTF-8 字节</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A</td>
                  <td>U+0041</td>
                  <td>0x41</td>
                  <td>ASCII 字母</td>
                </tr>
                <tr>
                  <td>中</td>
                  <td>U+4E2D</td>
                  <td>0xE4 0xB8 0xAD</td>
                  <td>常用汉字</td>
                </tr>
                <tr>
                  <td>😀</td>
                  <td>U+1F600</td>
                  <td>0xF0 0x9F 0x98 0x80</td>
                  <td>Emoji</td>
                </tr>
                <tr>
                  <td>€</td>
                  <td>U+20AC</td>
                  <td>0xE2 0x82 0xAC</td>
                  <td>欧元符号</td>
                </tr>
              </tbody>
            </table>

            <h2>ASCII 与 Unicode</h2>
            <div className="info-box">
              <p><strong>ASCII 是 Unicode 的子集</strong>：前 128 个 Unicode 码点（U+0000 到 U+007F）与 ASCII 完全一致。</p>
              <p>ASCII 字符在 UTF-8 编码中只占 1 字节，且字节值与 ASCII 码值相同。</p>
            </div>

            <h3>ASCII 可打印字符表 (32-126)</h3>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  {Array.from({ length: 10 }, (_, row) => (
                    <tr key={row}>
                      {Array.from({ length: 10 }, (_, col) => {
                        const code = 32 + row * 10 + col
                        if (code > 126) return <td key={col}></td>
                        const char = String.fromCharCode(code)
                        const displayChar = code === 32 ? 'SP' : code === 127 ? 'DEL' : char
                        return (
                          <td key={col} style={{ textAlign: 'center', padding: '4px', border: '1px solid #ddd' }}>
                            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{displayChar}</div>
                            <div style={{ color: '#666', fontSize: '10px' }}>{code}</div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>ASCII 控制字符 (0-31)</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>码点</th>
                  <th>缩写</th>
                  <th>名称</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>0</td><td>NUL</td><td>Null</td><td>空字符</td></tr>
                <tr><td>9</td><td>TAB</td><td>Horizontal Tab</td><td>制表符</td></tr>
                <tr><td>10</td><td>LF</td><td>Line Feed</td><td>换行</td></tr>
                <tr><td>13</td><td>CR</td><td>Carriage Return</td><td>回车</td></tr>
                <tr><td>27</td><td>ESC</td><td>Escape</td><td>转义</td></tr>
                <tr><td>127</td><td>DEL</td><td>Delete</td><td>删除</td></tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>📝 文本处理</h4>
                <p>正确处理多语言文本</p>
              </div>
              <div className="scenario-card">
                <h4>🌐 网页开发</h4>
                <p>HTML 实体编码、URL 编码</p>
              </div>
              <div className="scenario-card">
                <h4>💾 数据存储</h4>
                <p>数据库字符集配置</p>
              </div>
              <div className="scenario-card">
                <h4>🔧 调试分析</h4>
                <p>排查乱码问题</p>
              </div>
            </div>

            <h2>注意事项</h2>
            <div className="info-box warning">
              <strong>⚠️ 常见问题</strong>
              <ul>
                <li>Emoji 是代理对，需要 2 个码点表示</li>
                <li>不同编程语言字符串长度计算方式不同</li>
                <li>文件编码需统一为 UTF-8 避免乱码</li>
                <li>BOM (U+FEFF) 可能导致问题</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>Unicode 编码转换</h2>
            <div className="unicode-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>转换模式</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as ConvertMode)}>
                    <option value="text-to-unicode">文本 → Unicode 码点</option>
                    <option value="unicode-to-text">Unicode 码点 → 文本</option>
                    <option value="text-to-utf8">文本 → UTF-8 字节</option>
                    <option value="utf8-to-text">UTF-8 字节 → 文本</option>
                  </select>
                </div>
              </div>

              {error && (
                <div style={{ color: '#c62828', padding: '12px', background: '#ffebee', borderRadius: '6px', marginTop: 12 }}>
                  ❌ {error}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  输入
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === 'text-to-unicode'
                      ? '输入文本...'
                      : mode === 'unicode-to-text'
                        ? '输入 Unicode 码点（如 U+4E2D U+6587）...'
                        : mode === 'text-to-utf8'
                          ? '输入文本...'
                          : '输入 UTF-8 字节（如 0xE4 0xB8 0xAD）...'
                  }
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: mode === 'unicode-to-text' || mode === 'utf8-to-text' ? 'monospace' : 'inherit'
                  }}
                />
              </div>

              <div className="demo-controls" style={{ marginTop: 12 }}>
                <button onClick={handleConvert}>转换</button>
                {output && (
                  <button onClick={() => onCopy(output)} style={{ background: '#e0e0e0', color: '#333' }}>复制结果</button>
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

            <h2>字符信息查询</h2>
            <CharInfoDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 获取字符码点
const char = '中';
const codePoint = char.codePointAt(0);
console.log(codePoint.toString(16)); // "4e2d"
console.log('U+' + codePoint.toString(16).toUpperCase().padStart(4, '0')); // "U+4E2D"

// 码点转字符
const str = String.fromCodePoint(0x4E2D);
console.log(str); // "中"

// 文本转 UTF-8 字节
const encoder = new TextEncoder();
const bytes = encoder.encode('中');
console.log(Array.from(bytes).map(b => '0x' + b.toString(16).toUpperCase())); // ["0xE4", "0xB8", "0xAD"]

// UTF-8 字节转文本
const decoder = new TextDecoder();
const text = decoder.decode(new Uint8Array([0xE4, 0xB8, 0xAD]));
console.log(text); // "中"

// 遍历字符串（正确处理代理对）
const emoji = '😀';
for (const ch of emoji) {
  console.log(ch, ch.codePointAt(0).toString(16));
}`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "unicode/utf8"
)

func main() {
    text := "中"

    // 获取码点
    r, _ := utf8.DecodeRuneInString(text)
    fmt.Printf("码点: U+%04X\\n", r)

    // 码点转字符串
    s := string(0x4E2D)
    fmt.Println("字符:", s)

    // UTF-8 编码
    buf := make([]byte, 4)
    n := utf8.EncodeRune(buf, 0x4E2D)
    fmt.Printf("UTF-8: %x\\n", buf[:n])

    // 遍历字符串
    for i, r := range "你好" {
        fmt.Printf("位置 %d: %c U+%04X\\n", i, r, r)
    }

    // 字符串长度
    fmt.Println("字节数:", len("你好"))
    fmt.Println("字符数:", utf8.RuneCountInString("你好"))
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# 获取码点
char = '中'
code_point = ord(char)
print(f"码点: U+{code_point:04X}")

# 码点转字符
s = chr(0x4E2D)
print(f"字符: {s}")

# 文本转 UTF-8 字节
text = '中'
utf8_bytes = text.encode('utf-8')
print(f"UTF-8: {[hex(b) for b in utf8_bytes]}")

# UTF-8 字节转文本
decoded = bytes([0xE4, 0xB8, 0xAD]).decode('utf-8')
print(f"解码: {decoded}")

# 遍历字符串
for char in '你好世界':
    print(f"{char} -> U+{ord(char):04X}")`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.nio.charset.StandardCharsets;

public class UnicodeExample {
    public static void main(String[] args) {
        String text = "中";

        // 获取码点
        int codePoint = text.codePointAt(0);
        System.out.printf("码点: U+%04X%n", codePoint);

        // 码点转字符
        String s = new String(Character.toChars(0x4E2D));
        System.out.println("字符: " + s);

        // 文本转 UTF-8 字节
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        System.out.print("UTF-8: ");
        for (byte b : bytes) {
            System.out.printf("0x%02X ", b);
        }
        System.out.println();

        // UTF-8 字节转文本
        String decoded = new String(
            new byte[]{(byte)0xE4, (byte)0xB8, (byte)0xAD},
            StandardCharsets.UTF_8
        );
        System.out.println("解码: " + decoded);

        // 遍历码点
        text.codePoints().forEach(cp -> {
            System.out.printf("%c -> U+%04X%n", cp, cp);
        });
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CharInfoDemo() {
  const [char, setChar] = useState('')

  const charInfo = char ? {
    char: char.charAt(0),
    codePoint: char.codePointAt(0) || 0,
    utf8Bytes: Array.from(new TextEncoder().encode(char.charAt(0)))
  } : null

  return (
    <div className="unicode-demo">
      <input
        type="text"
        value={char}
        onChange={(e) => setChar(e.target.value.slice(0, 2))}
        placeholder="输入一个字符查看信息..."
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '24px',
          textAlign: 'center'
        }}
      />
      {charInfo && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12
          }}>
            <div style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>字符</div>
              <div style={{ fontSize: '32px' }}>{charInfo.char}</div>
            </div>
            <div style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>码点</div>
              <div style={{ fontSize: '18px', fontFamily: 'monospace' }}>
                U+{charInfo.codePoint.toString(16).toUpperCase().padStart(4, '0')}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                ({charInfo.codePoint})
              </div>
            </div>
            <div style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>UTF-8 字节</div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                {charInfo.utf8Bytes.map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`).join(' ')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

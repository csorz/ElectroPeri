import { useState } from 'react'
import './ToolPage.css'

type UuidVersion = 'v1' | 'v4'

export default function UuidGeneratorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔑 UUID 生成器</h1>
        <p>Universally Unique Identifier - 通用唯一标识符</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>全局唯一</h3>
                <p>UUID 在全球范围内几乎不可能重复，无需中央注册机构即可生成</p>
              </div>
              <div className="feature-card">
                <h3>无序生成</h3>
                <p>UUID 不依赖顺序生成机制，可由任何系统独立生成</p>
              </div>
              <div className="feature-card">
                <h3>固定长度</h3>
                <p>UUID 为 128 位，标准格式为 36 个字符（含 4 个连字符）</p>
              </div>
              <div className="feature-card">
                <h3>版本标识</h3>
                <p>UUID 包含版本号和变体标识，便于识别生成方式</p>
              </div>
            </div>

            <h2>格式规范</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  UUID 标准格式 (8-4-4-4-12)

  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  │       │    │    │    │
  │       │    │    │    └─ 节点标识 (12位)
  │       │    │    └────── 时钟序列 (4位)
  │       │    └─────────── 版本+时间 (4位)
  │       └──────────────── 时间中位 (4位)
  └──────────────────────── 时间低位 (8位)

  示例: 550e8400-e29b-41d4-a716-446655440000
              `}</pre>
            </div>

            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>版本</th>
                    <th>名称</th>
                    <th>生成方式</th>
                    <th>特点</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>v1</code></td>
                    <td>时间戳 UUID</td>
                    <td>基于时间和 MAC 地址</td>
                    <td>有序但暴露硬件信息</td>
                  </tr>
                  <tr>
                    <td><code>v4</code></td>
                    <td>随机 UUID</td>
                    <td>随机数生成</td>
                    <td>最常用，无序但安全</td>
                  </tr>
                  <tr>
                    <td><code>v3</code></td>
                    <td>命名空间 UUID</td>
                    <td>MD5 哈希</td>
                    <td>相同输入产生相同 UUID</td>
                  </tr>
                  <tr>
                    <td><code>v5</code></td>
                    <td>命名空间 UUID</td>
                    <td>SHA-1 哈希</td>
                    <td>比 v3 更安全</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>数据库主键</h4>
                <p>分布式系统中作为唯一主键，避免 ID 冲突</p>
              </div>
              <div className="scenario-card">
                <h4>会话标识</h4>
                <p>Web 应用的 Session ID、Token 标识</p>
              </div>
              <div className="scenario-card">
                <h4>文件命名</h4>
                <p>上传文件重命名，避免文件名冲突</p>
              </div>
              <div className="scenario-card">
                <h4>追踪标识</h4>
                <p>日志追踪、请求链路追踪的唯一标识</p>
              </div>
              <div className="scenario-card">
                <h4>设备标识</h4>
                <p>IoT 设备、移动设备的唯一标识符</p>
              </div>
              <div className="scenario-card">
                <h4>交易订单</h4>
                <p>电商订单号、支付流水号生成</p>
              </div>
            </div>

            <div className="info-box warning">
              <strong>注意事项</strong>
              <ul>
                <li>v1 UUID 包含 MAC 地址信息，可能存在隐私风险</li>
                <li>v4 UUID 碰撞概率极低但非零，约需生成 2.71 亿个才有 50% 碰撞概率</li>
                <li>UUID 作为数据库主键时，索引效率可能低于自增 ID</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>UUID 生成器</h2>
            <UuidGeneratorDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 生成 v4 UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

console.log(generateUUID())
// 输出: 550e8400-e29b-41d4-a716-446655440000

// 使用 crypto API (更安全)
function generateSecureUUID() {
  return crypto.randomUUID()
}

console.log(generateSecureUUID())`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "github.com/google/uuid"
)

func main() {
    // 生成 v4 UUID
    id := uuid.New()
    fmt.Println(id.String())

    // 生成 v1 UUID
    id1 := uuid.Must(uuid.NewUUID())
    fmt.Println(id1.String())

    // 解析 UUID
    parsed, err := uuid.Parse("550e8400-e29b-41d4-a716-446655440000")
    if err == nil {
        fmt.Println(parsed.Version())
    }
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import uuid

# 生成 v4 UUID
uuid4 = uuid.uuid4()
print(uuid4)  # 550e8400-e29b-41d4-a716-446655440000

# 生成 v1 UUID
uuid1 = uuid.uuid1()
print(uuid1)

# 生成 v5 UUID (基于命名空间)
namespace = uuid.NAMESPACE_DNS
name = "example.com"
uuid5 = uuid.uuid5(namespace, name)
print(uuid5)

# 转换为字符串
str_uuid = str(uuid4)
# 转换为字节
bytes_uuid = uuid4.bytes`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.util.UUID;

public class UUIDDemo {
    public static void main(String[] args) {
        // 生成随机 UUID (v4)
        UUID uuid = UUID.randomUUID();
        System.out.println(uuid.toString());

        // 从字符串创建 UUID
        UUID fromString = UUID.fromString(
            "550e8400-e29b-41d4-a716-446655440000"
        );

        // 获取 UUID 各部分
        System.out.println("版本: " + fromString.version());
        System.out.println("变体: " + fromString.variant());
        System.out.println("高位: " + fromString.getMostSignificantBits());
        System.out.println("低位: " + fromString.getLeastSignificantBits());
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// UUID 生成演示组件
function UuidGeneratorDemo() {
  const [version, setVersion] = useState<UuidVersion>('v4')
  const [count, setCount] = useState(5)
  const [uppercase, setUppercase] = useState(false)
  const [hyphens, setHyphens] = useState(true)
  const [results, setResults] = useState<string[]>([])

  // 生成 v4 UUID
  const generateV4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // 生成 v1 UUID (模拟时间戳版本)
  const generateV1 = (): string => {
    const now = Date.now()
    const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0')
    const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0')
    const timeHi = (((now >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0')
    const clockSeq = Math.random().toString(16).slice(2, 6)
    const node = Math.random().toString(16).slice(2, 8).padStart(12, '0')

    return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`
  }

  const formatUuid = (uuid: string): string => {
    let formatted = uuid
    if (!hyphens) {
      formatted = formatted.replace(/-/g, '')
    }
    if (uppercase) {
      formatted = formatted.toUpperCase()
    }
    return formatted
  }

  const generate = () => {
    const uuids: string[] = []
    for (let i = 0; i < count; i++) {
      const uuid = version === 'v4' ? generateV4() : generateV1()
      uuids.push(formatUuid(uuid))
    }
    setResults(uuids)
  }

  const copyAll = () => {
    if (results.length > 0) {
      navigator.clipboard.writeText(results.join('\n'))
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="connection-demo">
      <div className="config-grid">
        <div className="config-item">
          <label>UUID 版本</label>
          <select value={version} onChange={(e) => setVersion(e.target.value as UuidVersion)}>
            <option value="v4">v4 - 随机生成</option>
            <option value="v1">v1 - 时间戳</option>
          </select>
        </div>
        <div className="config-item">
          <label>生成数量</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            min="1"
            max="100"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
          />
          大写
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={hyphens}
            onChange={(e) => setHyphens(e.target.checked)}
          />
          包含连字符
        </label>
      </div>

      <div className="demo-controls">
        <button onClick={generate}>生成 UUID</button>
        <button onClick={clearResults}>清空</button>
      </div>

      {results.length > 0 && (
        <div className="result-box" style={{ textAlign: 'left', marginTop: '16px' }}>
          <h4 style={{ marginBottom: '12px' }}>生成结果 ({results.length} 个)</h4>
          <pre style={{
            background: '#1e1e1e',
            color: '#4fc3f7',
            padding: '12px',
            borderRadius: '6px',
            overflow: 'auto',
            maxHeight: '300px',
            fontFamily: "'Consolas', 'Monaco', monospace",
            fontSize: '13px',
            margin: 0
          }}>
            {results.join('\n')}
          </pre>
          <div className="demo-controls" style={{ marginTop: '12px' }}>
            <button onClick={copyAll}>复制全部</button>
          </div>
        </div>
      )}
    </div>
  )
}

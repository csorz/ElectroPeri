import { useState } from 'react'
import './ToolPage.css'

type UuidVersion = 'v1' | 'v4' | 'v6' | 'v7'

export default function UuidGeneratorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔑 UUID 生成器</h1>
        <p>Universally Unique Identifier - 通用唯一标识符 (RFC 9562)</p>
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
                <h3>固定长度</h3>
                <p>UUID 为 128 位，标准格式为 36 个字符（含 4 个连字符）</p>
              </div>
              <div className="feature-card">
                <h3>版本标识</h3>
                <p>UUID 包含版本号和变体标识，便于识别生成方式</p>
              </div>
              <div className="feature-card">
                <h3>时间排序</h3>
                <p>UUID v7 基于时间戳生成，天然有序，适合数据库索引</p>
              </div>
            </div>

            <h2>格式规范</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  UUID 标准格式 (8-4-4-4-12)

  xxxxxxxx-xxxx-Vxxx-Nxxx-xxxxxxxxxxxx
  │       │    │    │    │
  │       │    │    │    └─ 节点/随机标识 (12位)
  │       │    │    └────── 变体 + 随机 (4位)
  │       │    └─────────── 版本 + 数据 (4位)
  │       └──────────────── 时间中位 (4位)
  └──────────────────────── 时间低位 (8位)

  V = 版本号 (1, 4, 6, 7)
  N = 变体 (通常为 8, 9, a, b)

  示例: 019449a8-0787-7a3e-8c3f-5e4e6b8a2d1f (v7)
              `}</pre>
            </div>

            <h2>版本对比</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>版本</th>
                    <th>名称</th>
                    <th>生成方式</th>
                    <th>特点</th>
                    <th>推荐场景</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>v1</code></td>
                    <td>时间戳 UUID</td>
                    <td>基于时间和 MAC 地址</td>
                    <td>有序但暴露硬件信息</td>
                    <td>遗留系统</td>
                  </tr>
                  <tr>
                    <td><code>v4</code></td>
                    <td>随机 UUID</td>
                    <td>随机数生成</td>
                    <td>无序、简单、安全</td>
                    <td>一般用途</td>
                  </tr>
                  <tr>
                    <td><code>v6</code></td>
                    <td>时间排序 UUID</td>
                    <td>v1 的重排序版本</td>
                    <td>时间有序，兼容 v1</td>
                    <td>需要排序的场景</td>
                  </tr>
                  <tr>
                    <td><code style={{ color: '#4fc3f7', fontWeight: 'bold' }}>v7</code></td>
                    <td>时间戳随机 UUID</td>
                    <td>Unix 时间戳 + 随机数</td>
                    <td>时间有序、高性能、现代</td>
                    <td>数据库主键、分布式ID</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>UUID v7 详解</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  UUID v7 结构 (RFC 9562)

  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                        unix_ts_ms                             |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |          unix_ts_ms           |  ver  |       rand_a          |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |  var  |                       rand_b                          |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                           rand_b                              |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  unix_ts_ms (48位): Unix 时间戳（毫秒）
  ver (4位): 版本号 = 0111 (7)
  rand_a (12位): 随机/序列号
  var (2位): 变体 = 10
  rand_b (62位): 随机数

  优势:
  • 按时间排序，数据库索引友好
  • 无需协调即可分布式生成
  • 比 ULID 更短，比 v4 更有序
  • 适合作为数据库主键
              `}</pre>
            </div>

            <h2>v4 vs v7 选择</h2>
            <div className="info-box">
              <strong>如何选择？</strong>
              <ul>
                <li><strong>选择 v7</strong> - 数据库主键、需要时间排序、分布式系统 ID、日志追踪</li>
                <li><strong>选择 v4</strong> - 不需要排序、简单场景、兼容旧系统、匿名标识</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>数据库主键</h4>
                <p>分布式系统中作为唯一主键，v7 时间有序特性提升索引性能</p>
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
                <li>v7 UUID 可从时间戳推断生成时间，如有隐私需求可使用 v4</li>
                <li>UUID 作为数据库主键时，v7 比 v4 索引效率更高</li>
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
              <pre>{`// 使用 crypto.randomUUID() 生成 v4 UUID (现代浏览器)
const uuid4 = crypto.randomUUID()
console.log(uuid4)  // "550e8400-e29b-41d4-a716-446655440000"

// 生成 UUID v7 (需要手动实现或使用库)
function generateUUIDv7() {
  const timestamp = Date.now()
  const timestampHex = timestamp.toString(16).padStart(12, '0')

  // 生成随机部分
  const randomBytes = new Uint8Array(10)
  crypto.getRandomValues(randomBytes)

  // 构建各部分
  const timeHigh = timestampHex.slice(0, 8)
  const timeMid = timestampHex.slice(8, 12)

  // 版本位 (7) 和随机位
  const randA = (randomBytes[0] << 8 | randomBytes[1]) & 0x0fff | 0x7000

  // 变体位 (10) 和随机位
  const randB1 = (randomBytes[2] & 0x3f) | 0x80
  const randB2 = Array.from(randomBytes.slice(3))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  return \`\${timeHigh}-\${timeMid}-\${randA.toString(16).padStart(4, '0')}-\${randB1.toString(16).padStart(2, '0')}\${randB2.slice(0, 2)}-\${randB2.slice(2)}\`
}

console.log(generateUUIDv7())

// 使用 uuid 库 (推荐)
import { v4, v7 } from 'uuid'
console.log(v4())  // v4 UUID
console.log(v7())  // v7 UUID`}</pre>
            </div>

            <h2>TypeScript 类型定义</h2>
            <div className="code-block">
              <pre>{`// UUID 类型定义
type UUID = \`\${string}-\${string}-\${string}-\${string}-\${string}\`

// 验证 UUID 格式
function isUUID(str: string): str is UUID {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return regex.test(str)
}

// 获取 UUID 版本
function getUUIDVersion(uuid: string): number | null {
  if (!isUUID(uuid)) return null
  return parseInt(uuid.charAt(14), 16)
}

// 从 v7 UUID 提取时间戳
function extractTimestampFromV7(uuid: string): number | null {
  if (getUUIDVersion(uuid) !== 7) return null
  const hex = uuid.replace(/-/g, '').slice(0, 12)
  return parseInt(hex, 16)
}

// 使用示例
const uuid = "019449a8-0787-7a3e-8c3f-5e4e6b8a2d1f"
console.log(getUUIDVersion(uuid))  // 7
console.log(new Date(extractTimestampFromV7(uuid)!))  // 2024-12-20...`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "time"

    "github.com/google/uuid"
)

func main() {
    // 生成 v4 UUID
    id4 := uuid.New()
    fmt.Println("v4:", id4)

    // 生成 v7 UUID (需要 uuid v1.6+)
    id7 := uuid.Must(uuid.NewV7())
    fmt.Println("v7:", id7)

    // 从 v7 提取时间戳
    timestamp := id7.Time()
    fmt.Println("时间:", time.Unix(timestamp.UnixTime()))

    // 解析 UUID
    parsed, err := uuid.Parse("019449a8-0787-7a3e-8c3f-5e4e6b8a2d1f")
    if err == nil {
        fmt.Println("版本:", parsed.Version())
    }
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import uuid
import time
import secrets

# 生成 v4 UUID
uuid4 = uuid.uuid4()
print(f"v4: {uuid4}")

# 生成 v7 UUID (Python 3.12+)
try:
    uuid7 = uuid.uuid7()
    print(f"v7: {uuid7}")
except AttributeError:
    # 手动实现 v7
    def uuid7():
        timestamp = int(time.time() * 1000)
        timestamp_hex = format(timestamp, '012x')

        random_bytes = secrets.token_bytes(10)
        rand_a = int.from_bytes(random_bytes[:2], 'big') & 0x0fff | 0x7000
        rand_b = bytes([random_bytes[2] & 0x3f | 0x80]) + random_bytes[3:]

        return uuid.UUID(f"{timestamp_hex[:8]}-{timestamp_hex[8:12]}-"
                        f"{rand_a:04x}-{rand_b[:2].hex()}-{rand_b[2:].hex()}")

    print(f"v7: {uuid7()}")

# 生成 v5 UUID (基于命名空间)
namespace = uuid.NAMESPACE_DNS
name = "example.com"
uuid5 = uuid.uuid5(namespace, name)
print(f"v5: {uuid5}")`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.util.UUID;
import java.time.Instant;

public class UUIDDemo {
    public static void main(String[] args) {
        // 生成随机 UUID (v4)
        UUID uuid4 = UUID.randomUUID();
        System.out.println("v4: " + uuid4);

        // 生成 v7 UUID (Java 21+ 或使用第三方库)
        // 使用 java-uuid-generator 库
        // UUID uuid7 = Generators.timeBasedEpochGenerator().generate();

        // 手动实现 v7
        UUID uuid7 = generateV7();
        System.out.println("v7: " + uuid7);

        // 从字符串创建 UUID
        UUID fromString = UUID.fromString(
            "019449a8-0787-7a3e-8c3f-5e4e6b8a2d1f"
        );

        // 获取 UUID 各部分
        System.out.println("版本: " + fromString.version());
        System.out.println("变体: " + fromString.variant());
    }

    // 手动实现 v7
    public static UUID generateV7() {
        long timestamp = Instant.now().toEpochMilli();
        long mostSigBits = (timestamp << 16) | 0x7000L | (long)(Math.random() * 0x0fff);
        long leastSigBits = 0x8000000000000000L | (long)(Math.random() * 0x3fffffffffffffffL);
        return new UUID(mostSigBits, leastSigBits);
    }
}`}</pre>
            </div>

            <h2>数据库应用</h2>
            <div className="code-block">
              <pre>{`-- PostgreSQL 使用 UUID v7 作为主键
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入数据
INSERT INTO users (id, name) VALUES (uuid_generate_v7(), 'Alice');

-- 查询时利用时间排序特性
SELECT * FROM users ORDER BY id DESC LIMIT 10;

-- MySQL 8.0+
CREATE TABLE users (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 使用应用程序生成 v7 UUID 后插入`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// UUID 生成演示组件
function UuidGeneratorDemo() {
  const [version, setVersion] = useState<UuidVersion>('v7')
  const [count, setCount] = useState(5)
  const [uppercase, setUppercase] = useState(false)
  const [hyphens, setHyphens] = useState(true)
  const [results, setResults] = useState<{ uuid: string; timestamp?: string }[]>([])

  // 生成 v4 UUID
  const generateV4 = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
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

  // 生成 v6 UUID (v1 的重排序版本)
  const generateV6 = (): string => {
    const now = Date.now()
    const timestamp = now - 12219292800000 // UUID epoch
    const timeHigh = ((timestamp >> 28) & 0xffffffffffff).toString(16).padStart(12, '0')
    const timeLow = (timestamp & 0xfff).toString(16).padStart(3, '0')

    const clockSeq = (Math.random() * 0x3fff | 0x8000).toString(16).padStart(4, '0')
    const node = Math.random().toString(16).slice(2, 14).padStart(12, '0')

    // v6 格式: time_high-mid-ver-time_low-clock-node
    return `${timeHigh.slice(0, 8)}-${timeHigh.slice(8, 12)}-6${timeLow}-${clockSeq}-${node}`
  }

  // 生成 v7 UUID (时间戳 + 随机)
  const generateV7 = (): { uuid: string; timestamp: string } => {
    const now = Date.now()
    const timestampHex = now.toString(16).padStart(12, '0')

    // 生成随机字节
    const randomBytes = new Uint8Array(10)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes)
    } else {
      for (let i = 0; i < 10; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256)
      }
    }

    // 构建各部分
    const timeHigh = timestampHex.slice(0, 8)
    const timeMid = timestampHex.slice(8, 12)

    // 版本位 (7) 和随机位
    const randA = ((randomBytes[0] << 8) | randomBytes[1]) & 0x0fff | 0x7000

    // 变体位 (10) 和随机位
    const randB1 = (randomBytes[2] & 0x3f) | 0x80
    const randB2 = Array.from(randomBytes.slice(3))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const uuid = `${timeHigh}-${timeMid}-${randA.toString(16).padStart(4, '0')}-${randB1.toString(16).padStart(2, '0')}${randB2.slice(0, 2)}-${randB2.slice(2)}`

    return {
      uuid,
      timestamp: new Date(now).toLocaleString()
    }
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
    const newResults: { uuid: string; timestamp?: string }[] = []
    for (let i = 0; i < count; i++) {
      if (version === 'v4') {
        newResults.push({ uuid: formatUuid(generateV4()) })
      } else if (version === 'v1') {
        newResults.push({ uuid: formatUuid(generateV1()) })
      } else if (version === 'v6') {
        newResults.push({ uuid: formatUuid(generateV6()) })
      } else {
        const result = generateV7()
        newResults.push({ uuid: formatUuid(result.uuid), timestamp: result.timestamp })
      }
    }
    setResults(newResults)
  }

  const copyAll = () => {
    if (results.length > 0) {
      navigator.clipboard.writeText(results.map(r => r.uuid).join('\n'))
    }
  }

  const copySingle = (uuid: string) => {
    navigator.clipboard.writeText(uuid)
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
            <option value="v7">v7 - 时间戳随机 (推荐)</option>
            <option value="v4">v4 - 随机生成</option>
            <option value="v6">v6 - 时间排序</option>
            <option value="v1">v1 - 时间戳 (遗留)</option>
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

      {version === 'v7' && (
        <div className="info-box" style={{ marginBottom: '16px' }}>
          <strong>UUID v7</strong>
          <p style={{ margin: '4px 0 0 0' }}>基于 Unix 时间戳生成，天然按时间排序，适合作为数据库主键。生成后会显示对应的时间戳。</p>
        </div>
      )}

      <div className="demo-controls">
        <button onClick={generate}>生成 UUID</button>
        <button onClick={clearResults}>清空</button>
      </div>

      {results.length > 0 && (
        <div className="result-box" style={{ textAlign: 'left', marginTop: '16px' }}>
          <h4 style={{ marginBottom: '12px' }}>生成结果 ({results.length} 个)</h4>
          <div style={{
            background: '#1e1e1e',
            borderRadius: '6px',
            overflow: 'auto',
            maxHeight: '400px',
          }}>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderBottom: index < results.length - 1 ? '1px solid #333' : 'none',
                }}
              >
                <div>
                  <code style={{
                    color: '#4fc3f7',
                    fontFamily: "'Consolas', 'Monaco', monospace",
                    fontSize: '13px',
                  }}>
                    {result.uuid}
                  </code>
                  {result.timestamp && (
                    <span style={{
                      marginLeft: '12px',
                      color: '#888',
                      fontSize: '12px',
                    }}>
                      ({result.timestamp})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => copySingle(result.uuid)}
                  style={{
                    padding: '4px 8px',
                    background: '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  复制
                </button>
              </div>
            ))}
          </div>
          <div className="demo-controls" style={{ marginTop: '12px' }}>
            <button onClick={copyAll}>复制全部</button>
          </div>
        </div>
      )}
    </div>
  )
}

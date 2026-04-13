import { useState, useEffect } from 'react'
import './ToolPage.css'

export default function CurrentTimeToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [now, setNow] = useState(new Date())
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  const timestampMs = now.getTime()
  const timestampS = Math.floor(timestampMs / 1000)

  const formats = [
    { label: 'ISO 格式', value: now.toISOString() },
    { label: 'UTC 格式', value: now.toUTCString() },
    { label: '本地时间', value: now.toLocaleString() },
    { label: '日期', value: now.toLocaleDateString() },
    { label: '时间', value: now.toLocaleTimeString() },
    { label: '年月日', value: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` },
    { label: '时分秒', value: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}` },
    { label: '星期', value: ['日', '一', '二', '三', '四', '五', '六'][now.getDay()] },
  ]

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🕐 当前时间</h1>
        <p>Current Time - 显示当前时间戳和各种日期格式</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>时间表示方式</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Unix 时间戳</h3>
                <p>从 1970-01-01 00:00:00 UTC 开始计算的秒数，全球统一，便于存储和计算</p>
              </div>
              <div className="feature-card">
                <h3>ISO 8601</h3>
                <p>国际标准日期时间格式，如 2024-01-01T12:00:00Z，便于跨系统交换数据</p>
              </div>
              <div className="feature-card">
                <h3>本地时间</h3>
                <p>根据系统时区显示的时间，更符合人类阅读习惯，但受时区影响</p>
              </div>
              <div className="feature-card">
                <h3>UTC 时间</h3>
                <p>协调世界时，不受时区和夏令时影响，作为全球时间基准</p>
              </div>
            </div>

            <h2>时间格式说明</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>格式名称</th>
                    <th>示例</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>ISO 8601</code></td>
                    <td>2024-01-01T12:00:00.000Z</td>
                    <td>国际标准格式，Z 表示 UTC</td>
                  </tr>
                  <tr>
                    <td><code>UTC</code></td>
                    <td>Mon, 01 Jan 2024 12:00:00 GMT</td>
                    <td>RFC 2822 格式，常用于 HTTP</td>
                  </tr>
                  <tr>
                    <td><code>本地时间</code></td>
                    <td>2024/1/1 20:00:00</td>
                    <td>根据系统时区显示</td>
                  </tr>
                  <tr>
                    <td><code>Unix 时间戳(秒)</code></td>
                    <td>1704067200</td>
                    <td>10 位数字，Unix/Linux 常用</td>
                  </tr>
                  <tr>
                    <td><code>Unix 时间戳(毫秒)</code></td>
                    <td>1704067200000</td>
                    <td>13 位数字，JavaScript/Java 常用</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>时区知识</h2>
            <div className="info-box">
              <strong>世界主要时区</strong>
              <ul>
                <li><strong>UTC+8 (北京时间)</strong> - 中国、新加坡、香港、台湾</li>
                <li><strong>UTC+9 (东京时间)</strong> - 日本、韩国</li>
                <li><strong>UTC+0 (格林威治时间)</strong> - 英国（冬季）、冰岛</li>
                <li><strong>UTC-5 (东部时间)</strong> - 纽约、多伦多</li>
                <li><strong>UTC-8 (太平洋时间)</strong> - 洛杉矶、旧金山</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>调试开发</strong> - 快速获取当前时间戳用于测试</li>
              <li><strong>日志记录</strong> - 统一使用时间戳记录事件发生时间</li>
              <li><strong>数据同步</strong> - 使用时间戳进行增量同步</li>
              <li><strong>定时任务</strong> - 计算下次执行时间</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>实时时间</h2>
            <div className="current-time-demo">
              <div className="demo-controls" style={{ marginBottom: '16px' }}>
                <button onClick={() => setRunning(!running)}>
                  {running ? '暂停' : '继续'}
                </button>
              </div>

              <div className="timestamp-display">
                <div className="timestamp-card">
                  <div className="timestamp-label">毫秒时间戳</div>
                  <div className="timestamp-value">{timestampMs}</div>
                  <button
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(String(timestampMs))}
                  >
                    复制
                  </button>
                </div>
                <div className="timestamp-card">
                  <div className="timestamp-label">秒时间戳</div>
                  <div className="timestamp-value">{timestampS}</div>
                  <button
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(String(timestampS))}
                  >
                    复制
                  </button>
                </div>
              </div>

              <h3 style={{ marginTop: '24px' }}>各种格式</h3>
              <div className="format-list">
                {formats.map((format) => (
                  <div key={format.label} className="format-item">
                    <span className="format-label">{format.label}</span>
                    <span className="format-value">{format.value}</span>
                    <button
                      className="copy-btn-small"
                      onClick={() => navigator.clipboard.writeText(format.value)}
                    >
                      复制
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 获取当前时间
const now = new Date()

// 时间戳
console.log(Date.now())           // 毫秒时间戳
console.log(Math.floor(Date.now() / 1000))  // 秒时间戳

// 各种格式
console.log(now.toISOString())    // 2024-01-01T12:00:00.000Z
console.log(now.toUTCString())    // Mon, 01 Jan 2024 12:00:00 GMT
console.log(now.toLocaleString()) // 2024/1/1 20:00:00

// 获取各个时间分量
console.log(now.getFullYear())    // 年
console.log(now.getMonth() + 1)   // 月 (0-11)
console.log(now.getDate())        // 日
console.log(now.getHours())       // 时
console.log(now.getMinutes())     // 分
console.log(now.getSeconds())     // 秒
console.log(now.getDay())         // 星期 (0=周日)`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`from datetime import datetime
import time

# 获取当前时间
now = datetime.now()

# 时间戳
print(int(time.time()))           # 秒时间戳
print(int(time.time() * 1000))    # 毫秒时间戳

# 各种格式
print(now.isoformat())            # 2024-01-01T20:00:00
print(now.strftime('%Y-%m-%d %H:%M:%S'))

# 获取各个时间分量
print(now.year, now.month, now.day)
print(now.hour, now.minute, now.second)
print(now.weekday())              # 0=周一, 6=周日`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "time"
)

func main() {
    now := time.Now()

    // 时间戳
    fmt.Println(now.Unix())        // 秒时间戳
    fmt.Println(now.UnixMilli())   // 毫秒时间戳

    // 各种格式
    fmt.Println(now.Format(time.RFC3339))
    fmt.Println(now.Format("2006-01-02 15:04:05"))

    // 获取各个时间分量
    fmt.Println(now.Year(), now.Month(), now.Day())
    fmt.Println(now.Hour(), now.Minute(), now.Second())
    fmt.Println(now.Weekday())     // time.Monday, etc.
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.time.*;
import java.time.format.DateTimeFormatter;

public class CurrentTime {
    public static void main(String[] args) {
        // 获取当前时间
        LocalDateTime now = LocalDateTime.now();
        Instant instant = Instant.now();

        // 时间戳
        System.out.println(instant.getEpochSecond());    // 秒
        System.out.println(System.currentTimeMillis());  // 毫秒

        // 各种格式
        System.out.println(instant.toString());  // ISO 8601
        DateTimeFormatter fmt = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm:ss");
        System.out.println(now.format(fmt));

        // 获取各个时间分量
        System.out.println(now.getYear());
        System.out.println(now.getMonthValue());
        System.out.println(now.getDayOfMonth());
        System.out.println(now.getHour());
        System.out.println(now.getMinute());
        System.out.println(now.getSecond());
        System.out.println(now.getDayOfWeek());
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

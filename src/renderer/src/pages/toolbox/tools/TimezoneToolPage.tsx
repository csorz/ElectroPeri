import { useState } from 'react'
import './ToolPage.css'

const commonTimezones = [
  { value: 'Asia/Shanghai', label: '中国 (Asia/Shanghai)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: '日本 (Asia/Tokyo)', offset: '+09:00' },
  { value: 'Asia/Seoul', label: '韩国 (Asia/Seoul)', offset: '+09:00' },
  { value: 'Asia/Singapore', label: '新加坡 (Asia/Singapore)', offset: '+08:00' },
  { value: 'Asia/Hong_Kong', label: '香港 (Asia/Hong_Kong)', offset: '+08:00' },
  { value: 'Asia/Dubai', label: '迪拜 (Asia/Dubai)', offset: '+04:00' },
  { value: 'Europe/London', label: '伦敦 (Europe/London)', offset: '+00:00' },
  { value: 'Europe/Paris', label: '巴黎 (Europe/Paris)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: '柏林 (Europe/Berlin)', offset: '+01:00' },
  { value: 'America/New_York', label: '纽约 (America/New_York)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: '洛杉矶 (America/Los_Angeles)', offset: '-08:00' },
  { value: 'America/Chicago', label: '芝加哥 (America/Chicago)', offset: '-06:00' },
  { value: 'Australia/Sydney', label: '悉尼 (Australia/Sydney)', offset: '+11:00' },
  { value: 'Pacific/Auckland', label: '奥克兰 (Pacific/Auckland)', offset: '+13:00' },
  { value: 'UTC', label: 'UTC', offset: '+00:00' },
]

export default function TimezoneToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [inputTime, setInputTime] = useState('')
  const [sourceTimezone, setSourceTimezone] = useState('Asia/Shanghai')
  const [targetTimezone, setTargetTimezone] = useState('America/New_York')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleConvert = () => {
    setError(null)
    if (!inputTime.trim()) {
      setError('请输入时间')
      setOutput('')
      return
    }

    try {
      let date: Date
      if (inputTime.includes('T')) {
        date = new Date(inputTime)
      } else {
        date = new Date(inputTime)
      }

      if (isNaN(date.getTime())) {
        throw new Error('无效的时间格式')
      }

      const result = `原始时间: ${date.toLocaleString('zh-CN', { timeZone: sourceTimezone })}\n` +
        `源时区: ${sourceTimezone}\n\n` +
        `目标时区: ${targetTimezone}\n` +
        `转换后时间: ${date.toLocaleString('zh-CN', { timeZone: targetTimezone })}\n\n` +
        `UTC 时间: ${date.toISOString()}`

      setOutput(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleNow = () => {
    const now = new Date()
    setInputTime(now.toISOString().slice(0, 19))
  }

  const handleSwap = () => {
    const temp = sourceTimezone
    setSourceTimezone(targetTimezone)
    setTargetTimezone(temp)
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🌍 时区转换</h1>
        <p>Timezone Converter - 不同时区时间转换</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>时区概念</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>时区 (Timezone)</h3>
                <p>地球按经度划分为 24 个时区，每个时区相差 1 小时，以 UTC 为基准计算偏移量</p>
              </div>
              <div className="feature-card">
                <h3>UTC</h3>
                <p>协调世界时，全球时间基准，不受夏令时影响，等于格林威治标准时间 (GMT)</p>
              </div>
              <div className="feature-card">
                <h3>夏令时 (DST)</h3>
                <p>部分国家在夏季将时钟调快一小时，使用 IANA 时区标识可自动处理</p>
              </div>
              <div className="feature-card">
                <h3>IANA 时区</h3>
                <p>如 Asia/Shanghai、America/New_York，是时区的标准标识符，包含历史规则</p>
              </div>
            </div>

            <h2>世界时区地图</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  UTC-12  UTC-11  UTC-10  UTC-9   UTC-8   UTC-7   UTC-6   UTC-5   UTC-4   UTC-3
  ─────────────────────────────────────────────────────────────────────────────
    贝克岛   萨摩亚   夏威夷   阿拉斯加  洛杉矶   丹佛    芝加哥   纽约    智利     巴西

        ─────────────────────────────────────────────────────────────────────
  UTC-2   UTC-1    UTC     UTC+1   UTC+2   UTC+3   UTC+4   UTC+5   UTC+6   UTC+7
  ─────────────────────────────────────────────────────────────────────────────
    大西洋  亚速尔   伦敦     巴黎     开罗    莫斯科   迪拜     巴基斯坦  孟加拉   曼谷

        ─────────────────────────────────────────────────────────────────────
  UTC+8   UTC+9   UTC+10  UTC+11  UTC+12  UTC+13  UTC+14
  ─────────────────────────────────────────────────────────────────────
   北京    东京     悉尼     所罗门   奥克兰    萨摩亚    基里巴斯
              `}</pre>
            </div>

            <h2>常用时区对照表</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>时区标识</th>
                    <th>城市/地区</th>
                    <th>UTC 偏移</th>
                    <th>夏令时</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Asia/Shanghai</code></td>
                    <td>中国</td>
                    <td>+08:00</td>
                    <td>无</td>
                  </tr>
                  <tr>
                    <td><code>Asia/Tokyo</code></td>
                    <td>日本</td>
                    <td>+09:00</td>
                    <td>无</td>
                  </tr>
                  <tr>
                    <td><code>America/New_York</code></td>
                    <td>纽约</td>
                    <td>-05:00 / -04:00</td>
                    <td>有</td>
                  </tr>
                  <tr>
                    <td><code>America/Los_Angeles</code></td>
                    <td>洛杉矶</td>
                    <td>-08:00 / -07:00</td>
                    <td>有</td>
                  </tr>
                  <tr>
                    <td><code>Europe/London</code></td>
                    <td>伦敦</td>
                    <td>+00:00 / +01:00</td>
                    <td>有</td>
                  </tr>
                  <tr>
                    <td><code>Australia/Sydney</code></td>
                    <td>悉尼</td>
                    <td>+10:00 / +11:00</td>
                    <td>有</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="info-box warning">
              <strong>重要提示</strong>
              <p>使用 IANA 时区标识符（如 Asia/Shanghai）而非简单的时区偏移（如 +08:00），因为前者包含完整的时区规则，可以正确处理夏令时和历史变更。</p>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>国际会议</strong> - 协调不同时区的参会者时间</li>
              <li><strong>跨国业务</strong> - 转换客户或合作伙伴的当地时间</li>
              <li><strong>旅行规划</strong> - 了解目的地当地时间</li>
              <li><strong>系统开发</strong> - 处理全球用户的时间显示</li>
              <li><strong>金融市场</strong> - 掌握全球交易所开闭市时间</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>时区转换</h2>
            <div className="timezone-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>源时区</label>
                  <select value={sourceTimezone} onChange={(e) => setSourceTimezone(e.target.value)}>
                    {commonTimezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label} (UTC{tz.offset})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="config-item">
                  <label>目标时区</label>
                  <select value={targetTimezone} onChange={(e) => setTargetTimezone(e.target.value)}>
                    {commonTimezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label} (UTC{tz.offset})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="info-box warning" style={{ marginTop: '12px' }}>
                  <strong>错误</strong>
                  <p>{error}</p>
                </div>
              )}

              <div className="config-item" style={{ marginTop: '16px' }}>
                <label>输入时间</label>
                <textarea
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  placeholder="输入时间，如：2024-01-01 12:00:00 或 2024-01-01T12:00:00"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'Consolas, Monaco, monospace',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="demo-controls" style={{ marginTop: '16px' }}>
                <button onClick={handleConvert}>转换</button>
                <button onClick={handleNow}>当前时间</button>
                <button onClick={handleSwap}>交换时区</button>
                {output && (
                  <button onClick={() => navigator.clipboard.writeText(output)}>复制结果</button>
                )}
              </div>

              {output && (
                <div className="result-box" style={{ marginTop: '16px', textAlign: 'left' }}>
                  <h4>转换结果</h4>
                  <pre style={{
                    background: '#1e1e1e',
                    color: '#4fc3f7',
                    padding: '16px',
                    borderRadius: '6px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '13px'
                  }}>{output}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 时区转换
const date = new Date('2024-01-01T12:00:00Z')

// 使用 toLocaleString 转换时区
const options = {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
}

console.log(date.toLocaleString('zh-CN', options))
// 2024/01/01 07:00:00 (纽约时间)

// 使用 Intl.DateTimeFormat
const formatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Tokyo',
  ...options
})
console.log(formatter.format(date))

// 获取时区偏移量
console.log(date.getTimezoneOffset()) // 本地时区偏移(分钟)`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`from datetime import datetime, timezone
from zoneinfo import ZoneInfo

# 创建带时区的时间
dt = datetime(2024, 1, 1, 12, 0, tzinfo=ZoneInfo('Asia/Shanghai'))

# 转换时区
ny_time = dt.astimezone(ZoneInfo('America/New_York'))
print(ny_time)  # 2024-01-01 01:00:00-05:00

tokyo_time = dt.astimezone(ZoneInfo('Asia/Tokyo'))
print(tokyo_time)  # 2024-01-01 13:00:00+09:00

# 获取当前各时区时间
now_utc = datetime.now(timezone.utc)
now_shanghai = datetime.now(ZoneInfo('Asia/Shanghai'))
now_ny = datetime.now(ZoneInfo('America/New_York'))`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "time"
)

func main() {
    // 解析时间
    t, _ := time.Parse(time.RFC3339, "2024-01-01T12:00:00Z")

    // 转换时区
    loc, _ := time.LoadLocation("America/New_York")
    nyTime := t.In(loc)
    fmt.Println(nyTime.Format("2006-01-02 15:04:05 MST"))

    // 上海时区
    shLoc, _ := time.LoadLocation("Asia/Shanghai")
    shTime := t.In(shLoc)
    fmt.Println(shTime.Format("2006-01-02 15:04:05 MST"))

    // 获取时区偏移
    name, offset := t.Zone()
    fmt.Printf("Zone: %s, Offset: %d seconds\\n", name, offset)
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.time.*;

public class TimezoneExample {
    public static void main(String[] args) {
        // 解析时间
        ZonedDateTime zdt = ZonedDateTime.parse(
            "2024-01-01T12:00:00Z"
        );

        // 转换时区
        ZonedDateTime nyTime = zdt.withZoneSameInstant(
            ZoneId.of("America/New_York")
        );
        System.out.println(nyTime);

        ZonedDateTime shanghaiTime = zdt.withZoneSameInstant(
            ZoneId.of("Asia/Shanghai")
        );
        System.out.println(shanghaiTime);

        // 当前时间在不同时区
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime nowInTokyo = now.withZoneSameInstant(
            ZoneId.of("Asia/Tokyo")
        );
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

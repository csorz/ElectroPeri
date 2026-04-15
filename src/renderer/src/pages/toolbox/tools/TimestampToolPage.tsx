import { useState, useCallback } from 'react'
import './ToolPage.css'

export default function TimestampToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'timestampToDate' | 'dateToTimestamp'>('timestampToDate')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => navigator.clipboard.writeText(t), [])

  const handleConvert = () => {
    setError(null)
    const trimmedInput = input.trim()

    if (!trimmedInput) {
      setError('请输入内容')
      setOutput('')
      return
    }

    try {
      if (mode === 'timestampToDate') {
        let timestamp = Number(trimmedInput)
        if (isNaN(timestamp)) {
          throw new Error('无效的时间戳')
        }
        if (timestamp < 1e12) {
          timestamp *= 1000
        }
        const date = new Date(timestamp)
        if (isNaN(date.getTime())) {
          throw new Error('无效的时间戳')
        }
        setOutput(
          `本地时间: ${date.toLocaleString()}\n` +
          `ISO 格式: ${date.toISOString()}\n` +
          `UTC 时间: ${date.toUTCString()}\n` +
          `年: ${date.getFullYear()}\n` +
          `月: ${date.getMonth() + 1}\n` +
          `日: ${date.getDate()}\n` +
          `时: ${date.getHours()}\n` +
          `分: ${date.getMinutes()}\n` +
          `秒: ${date.getSeconds()}`
        )
      } else {
        const date = new Date(trimmedInput)
        if (isNaN(date.getTime())) {
          throw new Error('无效的日期格式')
        }
        const ms = date.getTime()
        const s = Math.floor(ms / 1000)
        setOutput(
          `毫秒时间戳: ${ms}\n` +
          `秒时间戳: ${s}`
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleNow = () => {
    const now = Date.now()
    if (mode === 'timestampToDate') {
      setInput(String(now))
    } else {
      const date = new Date()
      setInput(date.toISOString().slice(0, 19))
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>⏱️ 时间戳转换</h1>
        <p>Unix Timestamp - 时间戳与日期互转</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>时间戳概念</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Unix 时间戳</h3>
                <p>从 1970-01-01 00:00:00 UTC 到现在的秒数，是计算机系统表示时间的标准方式</p>
              </div>
              <div className="feature-card">
                <h3>毫秒时间戳</h3>
                <p>JavaScript/Java 等语言使用毫秒级时间戳，数值是秒级时间戳的 1000 倍</p>
              </div>
              <div className="feature-card">
                <h3>时区无关</h3>
                <p>时间戳本身不包含时区信息，同一时刻全球各地的 Unix 时间戳相同</p>
              </div>
              <div className="feature-card">
                <h3>数值范围</h3>
                <p>32 位系统最大支持到 2038 年，64 位系统可支持数千亿年</p>
              </div>
            </div>

            <h2>时间格式对照</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  时间戳(秒)      时间戳(毫秒)         ISO 8601              本地时间
  ─────────────────────────────────────────────────────────────────────
  1704067200   →  1704067200000   →  2024-01-01T00:00:00Z  →  2024-01-01 08:00:00 (北京)
                                       ↑
                                   UTC 标准时间
              `}</pre>
            </div>

            <h2>常见时间格式</h2>
            <div className="info-box">
              <strong>ISO 8601</strong>
              <ul>
                <li><code>2024-01-01T12:30:45Z</code> - UTC 时间</li>
                <li><code>2024-01-01T12:30:45+08:00</code> - 带时区偏移</li>
                <li><code>2024-01-01T12:30:45.123Z</code> - 带毫秒</li>
              </ul>
            </div>
            <div className="info-box warning">
              <strong>注意：秒 vs 毫秒</strong>
              <p>判断时间戳是秒还是毫秒：秒级时间戳通常为 10 位数字（如 1704067200），毫秒级为 13 位数字（如 1704067200000）。</p>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>数据库存储</strong> - 使用时间戳存储时间，便于排序和计算</li>
              <li><strong>API 通信</strong> - JSON 中常用毫秒时间戳或 ISO 8601 格式</li>
              <li><strong>日志记录</strong> - 时间戳格式便于日志分析和时间追踪</li>
              <li><strong>缓存控制</strong> - 比较时间戳判断缓存是否过期</li>
              <li><strong>定时任务</strong> - Cron 表达式与时间戳配合实现定时调度</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>时间戳转换</h2>
            <div className="timestamp-demo">
              <div className="config-grid">
                <div className="config-item">
                  <label>转换模式</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
                    <option value="timestampToDate">时间戳 → 日期</option>
                    <option value="dateToTimestamp">日期 → 时间戳</option>
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
                <label>{mode === 'timestampToDate' ? '输入时间戳' : '输入日期'}</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === 'timestampToDate'
                      ? '输入 Unix 时间戳（秒或毫秒），如：1704067200'
                      : '输入日期字符串，如：2024-01-01 或 2024-01-01T12:00:00'
                  }
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
                {output && (
                  <button onClick={() => onCopy(output)}>复制结果</button>
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
              <pre>{`// 获取当前时间戳
const nowMs = Date.now()           // 毫秒时间戳
const nowS = Math.floor(Date.now() / 1000)  // 秒时间戳

// 时间戳转日期
const timestamp = 1704067200000
const date = new Date(timestamp)
console.log(date.toISOString())    // 2024-01-01T00:00:00.000Z
console.log(date.toLocaleString()) // 2024/1/1 08:00:00

// 日期转时间戳
const d = new Date('2024-01-01')
const ts = d.getTime()             // 毫秒时间戳

// 格式化日期
const format = (ts) => {
  const d = new Date(ts)
  return \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import time
from datetime import datetime

# 获取当前时间戳
now_s = int(time.time())           # 秒时间戳
now_ms = int(time.time() * 1000)   # 毫秒时间戳

# 时间戳转日期
timestamp = 1704067200
dt = datetime.fromtimestamp(timestamp)
print(dt.strftime('%Y-%m-%d %H:%M:%S'))

# 日期转时间戳
dt = datetime(2024, 1, 1, 0, 0, 0)
ts = int(dt.timestamp())

# UTC 时间
dt_utc = datetime.utcfromtimestamp(timestamp)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "time"
)

func main() {
    // 获取当前时间戳
    now := time.Now()
    ts := now.Unix()       // 秒时间戳
    tsMs := now.UnixMilli() // 毫秒时间戳

    // 时间戳转时间
    t := time.Unix(1704067200, 0)
    fmt.Println(t.Format("2006-01-02 15:04:05"))

    // 字符串转时间
    t2, _ := time.Parse("2006-01-02", "2024-01-01")
    ts2 := t2.Unix()
}`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`import java.time.*;
import java.time.format.DateTimeFormatter;

public class TimestampExample {
    public static void main(String[] args) {
        // 获取当前时间戳
        long nowMs = System.currentTimeMillis();
        long nowS = Instant.now().getEpochSecond();

        // 时间戳转时间
        Instant instant = Instant.ofEpochSecond(1704067200);
        LocalDateTime ldt = LocalDateTime.ofInstant(instant, ZoneId.of("Asia/Shanghai"));

        // 格式化
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        System.out.println(ldt.format(fmt));

        // 时间转时间戳
        LocalDateTime dt = LocalDateTime.of(2024, 1, 1, 0, 0);
        long ts = dt.atZone(ZoneId.of("UTC")).toEpochSecond();
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

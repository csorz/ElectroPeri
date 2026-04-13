import { useState } from 'react'
import './ToolPage.css'

export default function CronGeneratorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>⏰ Cron 表达式</h1>
        <p>Cron Expression - 定时任务表达式</p>
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
                <h3>灵活配置</h3>
                <p>支持精确到分钟级别的定时任务配置</p>
              </div>
              <div className="feature-card">
                <h3>表达式简洁</h3>
                <p>5-7 个字段即可描述复杂的执行规则</p>
              </div>
              <div className="feature-card">
                <h3>广泛支持</h3>
                <p>Linux cron、Quartz、Spring 等主流框架支持</p>
              </div>
              <div className="feature-card">
                <h3>特殊字符</h3>
                <p>支持 *、-、/、,、?、L、W 等特殊符号</p>
              </div>
            </div>

            <h2>表达式结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  标准 Cron 表达式 (5 字段)

  ┌───────────── 分钟 (0 - 59)
  │ ┌───────────── 小时 (0 - 23)
  │ │ ┌───────────── 日期 (1 - 31)
  │ │ │ ┌───────────── 月份 (1 - 12)
  │ │ │ │ ┌───────────── 星期 (0 - 6, 0=周日)
  │ │ │ │ │
  * * * * *

  扩展 Cron 表达式 (6/7 字段, Quartz/Spring)

  ┌───────────── 秒 (0 - 59)
  │ ┌───────────── 分钟 (0 - 59)
  │ │ ┌───────────── 小时 (0 - 23)
  │ │ │ ┌───────────── 日期 (1 - 31)
  │ │ │ │ ┌───────────── 月份 (1 - 12)
  │ │ │ │ │ ┌───────────── 星期 (0 - 6)
  │ │ │ │ │ │
  * * * * * *
              `}</pre>
            </div>

            <h2>特殊字符说明</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>字符</th>
                    <th>名称</th>
                    <th>说明</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>*</code></td>
                    <td>所有值</td>
                    <td>匹配该字段的所有可能值</td>
                    <td>* * * * * 每分钟</td>
                  </tr>
                  <tr>
                    <td><code>-</code></td>
                    <td>范围</td>
                    <td>指定一个范围</td>
                    <td>0 9-17 * * * 9点到17点</td>
                  </tr>
                  <tr>
                    <td><code>,</code></td>
                    <td>列表</td>
                    <td>指定多个离散值</td>
                    <td>0 9,12,18 * * * 9/12/18点</td>
                  </tr>
                  <tr>
                    <td><code>/</code></td>
                    <td>步长</td>
                    <td>指定间隔频率</td>
                    <td>*/5 * * * * 每5分钟</td>
                  </tr>
                  <tr>
                    <td><code>?</code></td>
                    <td>不指定</td>
                    <td>日期或星期二选一</td>
                    <td>0 0 * * ? 每天</td>
                  </tr>
                  <tr>
                    <td><code>L</code></td>
                    <td>最后</td>
                    <td>月最后一天或周最后一天</td>
                    <td>0 0 L * * 月末</td>
                  </tr>
                  <tr>
                    <td><code>W</code></td>
                    <td>工作日</td>
                    <td>最近的工作日</td>
                    <td>0 0 15W * * 15号最近工作日</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>常用示例</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>表达式</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>* * * * *</code></td>
                    <td>每分钟执行</td>
                  </tr>
                  <tr>
                    <td><code>0 * * * *</code></td>
                    <td>每小时整点执行</td>
                  </tr>
                  <tr>
                    <td><code>0 0 * * *</code></td>
                    <td>每天零点执行</td>
                  </tr>
                  <tr>
                    <td><code>0 9 * * 1-5</code></td>
                    <td>工作日早上9点</td>
                  </tr>
                  <tr>
                    <td><code>0 0 1 * *</code></td>
                    <td>每月1号零点</td>
                  </tr>
                  <tr>
                    <td><code>*/10 * * * *</code></td>
                    <td>每10分钟</td>
                  </tr>
                  <tr>
                    <td><code>0 0 L * *</code></td>
                    <td>每月最后一天零点</td>
                  </tr>
                  <tr>
                    <td><code>0 0 0 1 1 *</code></td>
                    <td>每年1月1日零点（6字段）</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>日志清理</h4>
                <p>定时清理过期日志文件，释放磁盘空间</p>
              </div>
              <div className="scenario-card">
                <h4>数据备份</h4>
                <p>定期备份数据库、重要文件</p>
              </div>
              <div className="scenario-card">
                <h4>报表生成</h4>
                <p>每日/每周/每月自动生成统计报表</p>
              </div>
              <div className="scenario-card">
                <h4>消息推送</h4>
                <p>定时发送通知、提醒邮件</p>
              </div>
              <div className="scenario-card">
                <h4>缓存刷新</h4>
                <p>定时刷新热点数据缓存</p>
              </div>
              <div className="scenario-card">
                <h4>健康检查</h4>
                <p>定期检测服务可用性</p>
              </div>
            </div>

            <div className="info-box">
              <strong>提示</strong>
              <p>不同系统对 Cron 表达式的支持略有差异，Linux cron 使用 5 字段，而 Quartz、Spring 使用 6 或 7 字段（包含秒）。</p>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>Cron 表达式生成器</h2>
            <CronGeneratorDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 使用 node-cron
const cron = require('node-cron')

// 每分钟执行
cron.schedule('* * * * *', () => {
  console.log('每分钟执行一次')
})

// 每天 9 点执行
cron.schedule('0 9 * * *', () => {
  console.log('每天早上 9 点执行')
})

// 工作日 9 点执行
cron.schedule('0 9 * * 1-5', () => {
  console.log('工作日早上 9 点执行')
})

// 验证 cron 表达式
if (cron.validate('0 9 * * *')) {
  console.log('表达式有效')
}

// 停止任务
const task = cron.schedule('*/5 * * * *', () => {})
task.stop()`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "github.com/robfig/cron/v3"
)

func main() {
    c := cron.New()

    // 每分钟执行
    c.AddFunc("* * * * *", func() {
        fmt.Println("每分钟执行一次")
    })

    // 每天 9 点执行
    c.AddFunc("0 9 * * *", func() {
        fmt.Println("每天早上 9 点执行")
    })

    // 每 5 分钟执行
    c.AddFunc("*/5 * * * *", func() {
        fmt.Println("每 5 分钟执行一次")
    })

    // 启动调度器
    c.Start()
    defer c.Stop()

    // 阻塞主程序
    select {}
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

# 每 5 分钟执行
@scheduler.scheduled_job('cron', minute='*/5')
def job_every_5min():
    print("每 5 分钟执行一次")

# 每天 9 点执行
@scheduler.scheduled_job('cron', hour='9', minute='0')
def job_daily():
    print("每天早上 9 点执行")

# 工作日 9 点执行
@scheduler.scheduled_job('cron', hour='9', day_of_week='mon-fri')
def job_weekday():
    print("工作日早上 9 点执行")

# 每月 1 号执行
@scheduler.scheduled_job('cron', day='1', hour='0', minute='0')
def job_monthly():
    print("每月 1 号零点执行")

scheduler.start()`}</pre>
            </div>

            <h2>Java 示例 (Spring)</h2>
            <div className="code-block">
              <pre>{`import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

    // 每分钟执行
    @Scheduled(cron = "* * * * * *")
    public void everyMinute() {
        System.out.println("每分钟执行一次");
    }

    // 每天 9 点执行
    @Scheduled(cron = "0 0 9 * * *")
    public void daily() {
        System.out.println("每天早上 9 点执行");
    }

    // 工作 9 点执行 (周一到周五)
    @Scheduled(cron = "0 0 9 * * MON-FRI")
    public void weekday() {
        System.out.println("工作日早上 9 点执行");
    }

    // 每 5 分钟执行
    @Scheduled(cron = "0 */5 * * * *")
    public void every5Minutes() {
        System.out.println("每 5 分钟执行一次");
    }

    // 使用配置文件
    @Scheduled(cron = "\${app.cron.expression}")
    public void configurable() {
        System.out.println("可配置的定时任务");
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Cron 生成演示组件
function CronGeneratorDemo() {
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('9')
  const [day, setDay] = useState('*')
  const [month, setMonth] = useState('*')
  const [weekday, setWeekday] = useState('*')
  const [cronExpression, setCronExpression] = useState('')
  const [description, setDescription] = useState('')

  const presetOptions = [
    { label: '每分钟', value: '* * * * *' },
    { label: '每小时', value: '0 * * * *' },
    { label: '每天零点', value: '0 0 * * *' },
    { label: '每天上午9点', value: '0 9 * * *' },
    { label: '每天中午12点', value: '0 12 * * *' },
    { label: '每天下午6点', value: '0 18 * * *' },
    { label: '每周一上午9点', value: '0 9 * * 1' },
    { label: '每月1号零点', value: '0 0 1 * *' },
    { label: '每月最后一天23:59', value: '59 23 28-31 * *' },
    { label: '工作日上午9点', value: '0 9 * * 1-5' },
  ]

  const generateCron = () => {
    const parts = [minute, hour, day, month, weekday]
    const expr = parts.join(' ')
    setCronExpression(expr)
    setDescription(describeCron(expr))
  }

  const describeCron = (expr: string): string => {
    const parts = expr.split(' ')
    if (parts.length !== 5) return '无效的 Cron 表达式'

    const [m, h, d, mon, w] = parts
    let desc = ''

    if (m === '*') {
      desc += '每分钟'
    } else {
      desc += `在第 ${m} 分钟`
    }

    if (h !== '*') {
      desc += ` ${h} 点`
    }

    if (d !== '*') {
      desc += ` 每月 ${d} 号`
    }

    if (mon !== '*') {
      const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      const monthNum = parseInt(mon)
      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        desc += ` ${months[monthNum - 1]}`
      }
    }

    if (w !== '*') {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      if (w.includes('-')) {
        const [start, end] = w.split('-').map(Number)
        desc += ` ${weekdays[start]} 到 ${weekdays[end]}`
      } else {
        const dayNum = parseInt(w)
        if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
          desc += ` 每${weekdays[dayNum]}`
        }
      }
    }

    if (m === '*' && h === '*' && d === '*' && mon === '*' && w === '*') {
      desc = '每分钟执行'
    } else if (h !== '*' && d === '*' && mon === '*' && w === '*') {
      desc = `每天 ${h}:${m.padStart(2, '0')} 执行`
    }

    return desc
  }

  const handlePreset = (expr: string) => {
    const parts = expr.split(' ')
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDay(parts[2])
      setMonth(parts[3])
      setWeekday(parts[4])
      setCronExpression(expr)
      setDescription(describeCron(expr))
    }
  }

  const handleCustomExpression = (expr: string) => {
    setCronExpression(expr)
    const parts = expr.trim().split(/\s+/)
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDay(parts[2])
      setMonth(parts[3])
      setWeekday(parts[4])
      setDescription(describeCron(expr))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="connection-demo">
      <div className="info-box" style={{ marginBottom: '16px' }}>
        <strong>常用预设</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {presetOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePreset(opt.value)}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <h4 style={{ marginBottom: '12px' }}>自定义配置</h4>
      <div className="config-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="config-item">
          <label>分钟</label>
          <input
            type="text"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder="0-59"
          />
        </div>
        <div className="config-item">
          <label>小时</label>
          <input
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="0-23"
          />
        </div>
        <div className="config-item">
          <label>日期</label>
          <input
            type="text"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="1-31"
          />
        </div>
        <div className="config-item">
          <label>月份</label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="1-12"
          />
        </div>
        <div className="config-item">
          <label>星期</label>
          <input
            type="text"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            placeholder="0-6"
          />
        </div>
      </div>

      <div className="info-box" style={{ marginTop: '12px', fontSize: '12px' }}>
        提示：* 表示所有值，可使用 , 分隔多个值，- 表示范围，/ 表示间隔
      </div>

      <div className="demo-controls" style={{ marginTop: '16px' }}>
        <button onClick={generateCron}>生成表达式</button>
      </div>

      {cronExpression && (
        <div className="result-box" style={{ marginTop: '16px' }}>
          <h4>Cron 表达式</h4>
          <div style={{ fontSize: '24px', fontFamily: "'Consolas', monospace", margin: '12px 0', color: '#4fc3f7' }}>
            {cronExpression}
          </div>
          {description && (
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px 0' }}>
              说明：{description}
            </p>
          )}
          <button onClick={() => copyToClipboard(cronExpression)} style={{ fontSize: '12px', padding: '4px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            复制表达式
          </button>
        </div>
      )}

      <div className="config-item" style={{ marginTop: '16px' }}>
        <label>直接输入 Cron 表达式</label>
        <input
          type="text"
          value={cronExpression}
          onChange={(e) => handleCustomExpression(e.target.value)}
          placeholder="输入 Cron 表达式..."
          style={{ fontFamily: "'Consolas', monospace" }}
        />
      </div>
    </div>
  )
}

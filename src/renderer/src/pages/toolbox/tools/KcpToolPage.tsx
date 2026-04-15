import { useState } from 'react'
import './ToolPage.css'

export default function KcpToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>⚡ KCP 协议</h1>
        <p>快速可靠传输协议 - 低延迟的可靠 UDP</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是 KCP？</h2>
            <div className="info-box">
              <p>KCP 是一个<strong>快速可靠</strong>的协议，目标是<strong>以 10%-20% 的带宽浪费换取 30%-40% 的延迟降低</strong>。</p>
              <p>它运行在 UDP 之上，在应用层实现了可靠传输，可以根据需求调节可靠性级别。</p>
            </div>

            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>可配置可靠性</h3>
                <p>从完全可靠到尽力而为，根据场景灵活调整</p>
              </div>
              <div className="feature-card">
                <h3>低延迟</h3>
                <p>比 TCP 延迟降低 30-40%，适合实时应用</p>
              </div>
              <div className="feature-card">
                <h3>快速重传</h3>
                <p>跳过 TCP 的等待，更快检测和恢复丢包</p>
              </div>
              <div className="feature-card">
                <h3>流量控制</h3>
                <p>可配置的滑动窗口，灵活控制发送速率</p>
              </div>
            </div>

            <h2>KCP vs TCP 对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>特性</th>
                  <th>TCP</th>
                  <th>KCP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>重传超时</td>
                  <td>RTO = 2RTT（指数退避）</td>
                  <td>RTO = 1.5RTT（线性增长）</td>
                </tr>
                <tr>
                  <td>快速重传</td>
                  <td>3 个重复 ACK</td>
                  <td>可配置（默认 2 个）</td>
                </tr>
                <tr>
                  <td>延迟 ACK</td>
                  <td>200ms</td>
                  <td>可配置（默认 100ms）</td>
                </tr>
                <tr>
                  <td>拥塞控制</td>
                  <td>强制启用</td>
                  <td>可选</td>
                </tr>
                <tr>
                  <td>窗口大小</td>
                  <td>系统限制</td>
                  <td>可配置</td>
                </tr>
                <tr>
                  <td>典型延迟</td>
                  <td>100-200ms</td>
                  <td>30-50ms</td>
                </tr>
              </tbody>
            </table>

            <h2>工作原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  应用层
    ↓
+------------------+
|  KCP 协议层      |  ← 可靠性、流量控制、重传
+------------------+
    ↓
+------------------+
|  UDP 传输层      |  ← 实际网络传输
+------------------+
    ↓
    网络层
              `}</pre>
            </div>

            <h2>关键参数配置</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>参数</th>
                    <th>说明</th>
                    <th>推荐值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>nodelay</code></td>
                    <td>是否关闭延迟发送</td>
                    <td>1（开启）</td>
                  </tr>
                  <tr>
                    <td><code>interval</code></td>
                    <td>协议工作间隔（ms）</td>
                    <td>10-100ms</td>
                  </tr>
                  <tr>
                    <td><code>resend</code></td>
                    <td>快速重传阈值</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td><code>nc</code></td>
                    <td>是否关闭拥塞控制</td>
                    <td>1（游戏场景关闭）</td>
                  </tr>
                  <tr>
                    <td><code>sndwnd</code></td>
                    <td>发送窗口大小</td>
                    <td>32-128</td>
                  </tr>
                  <tr>
                    <td><code>rcvwnd</code></td>
                    <td>接收窗口大小</td>
                    <td>128</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>🎮 实时游戏</h4>
                <p>MOBA、FPS、格斗游戏，需要低延迟的状态同步</p>
              </div>
              <div className="scenario-card">
                <h4>📹 直播推流</h4>
                <p>视频直播、游戏直播，需要快速传输</p>
              </div>
              <div className="scenario-card">
                <h4>🔊 实时语音</h4>
                <p>游戏语音、在线会议，延迟敏感</p>
              </div>
              <div className="scenario-card">
                <h4>📱 即时通讯</h4>
                <p>聊天应用、消息推送，需要可靠性</p>
              </div>
            </div>

            <h2>最佳实践</h2>
            <div className="info-box warning">
              <strong>⚠️ 注意事项</strong>
              <ul>
                <li>在弱网环境下，KCP 优势更明显</li>
                <li>开启 <code>nodelay</code> 可以进一步降低延迟</li>
                <li>游戏场景建议关闭拥塞控制（<code>nc=1</code>）</li>
                <li>根据网络情况调整窗口大小</li>
                <li>需要自己实现加密（如配合 AES）</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>KCP 参数调优模拟</h2>
            <KcpConfigDemo />

            <h2>延迟对比</h2>
            <LatencyCompareDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例（kcp-go）</h2>
            <div className="code-block">
              <pre>{`// KCP 服务端
package main

import (
    "fmt"
    "github.com/xtaci/kcp-go"
)

func main() {
    listener, _ := kcp.ListenWithOptions(":8080", nil, 10, 3)
    defer listener.Close()

    for {
        conn, _ := listener.AcceptKCP()
        // 配置 KCP 参数
        conn.SetNoDelay(1, 10, 2, 1)  // nodelay, interval, resend, nc
        conn.SetWindowSize(128, 128)   // 发送窗口, 接收窗口

        go func() {
            buf := make([]byte, 1024)
            for {
                n, _ := conn.Read(buf)
                fmt.Printf("收到: %s\\n", string(buf[:n]))
                conn.Write(buf[:n])
            }
        }()
    }
}

// KCP 客户端
func client() {
    conn, _ := kcp.DialWithOptions("127.0.0.1:8080", nil, 10, 3)
    defer conn.Close()

    conn.SetNoDelay(1, 10, 2, 1)
    conn.SetWindowSize(128, 128)

    conn.Write([]byte("Hello KCP"))
    buf := make([]byte, 1024)
    n, _ := conn.Read(buf)
    fmt.Printf("响应: %s\\n", string(buf[:n]))
}`}</pre>
            </div>

            <h2>C 语言示例（原始 KCP）</h2>
            <div className="code-block">
              <pre>{`#include "ikcp.h"

// 创建 KCP 实例
ikcpcb *kcp = ikcp_create(conv, user);

// 配置参数
ikcp_nodelay(kcp, 1, 10, 2, 1);  // nodelay, interval, resend, nc
ikcp_wndsize(kcp, 128, 128);      // sndwnd, rcvwnd

// 发送数据
ikcp_send(kcp, data, len);

// 接收数据
ikcp_recv(kcp, buffer, len);

// 定时更新（需要在循环中调用）
ikcp_update(kcp, iclock());

// 收到 UDP 数据时调用
ikcp_input(kcp, data, len);`}</pre>
            </div>

            <h2>Node.js 示例</h2>
            <div className="code-block">
              <pre>{`const kcp = require('node-kcp');

// 服务端
const server = kcp.createServer({
    conv: 0x12345678,
    nodelay: 1,
    interval: 10,
    resend: 2,
    nc: 1
});

server.on('connection', (conn) => {
    conn.on('data', (data) => {
        console.log('收到:', data.toString());
        conn.send(data);
    });
});

server.listen(8080);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// KCP 配置演示
function KcpConfigDemo() {
  const [nodelay, setNodelay] = useState(1)
  const [interval, setInterval] = useState(10)
  const [resend, setResend] = useState(2)
  const [nc, setNc] = useState(1)
  const [latency, setLatency] = useState(0)

  const calculateLatency = () => {
    // 简化的延迟模拟
    const baseLatency = 100
    const nodelayFactor = nodelay ? 0.5 : 1
    const intervalFactor = interval / 100
    const resendFactor = resend === 0 ? 1.2 : resend === 2 ? 0.8 : 0.6
    const ncFactor = nc ? 0.9 : 1.1

    const result = baseLatency * nodelayFactor * intervalFactor * resendFactor * ncFactor
    setLatency(Math.round(result))
  }

  return (
    <div className="kcp-config-demo">
      <div className="config-grid">
        <div className="config-item">
          <label>NoDelay</label>
          <select value={nodelay} onChange={(e) => setNodelay(parseInt(e.target.value))}>
            <option value={0}>关闭（延迟发送）</option>
            <option value={1}>开启（立即发送）</option>
          </select>
        </div>
        <div className="config-item">
          <label>Interval (ms)</label>
          <input type="range" min="10" max="100" step="10" value={interval} onChange={(e) => setInterval(parseInt(e.target.value))} />
          <span>{interval}</span>
        </div>
        <div className="config-item">
          <label>快速重传</label>
          <select value={resend} onChange={(e) => setResend(parseInt(e.target.value))}>
            <option value={0}>关闭</option>
            <option value={2}>2 个重复 ACK</option>
            <option value={3}>3 个重复 ACK</option>
          </select>
        </div>
        <div className="config-item">
          <label>拥塞控制</label>
          <select value={nc} onChange={(e) => setNc(parseInt(e.target.value))}>
            <option value={0}>开启</option>
            <option value={1}>关闭</option>
          </select>
        </div>
      </div>

      <button onClick={calculateLatency}>模拟延迟</button>

      {latency > 0 && (
        <div className="result-box">
          <h4>预估延迟: {latency}ms</h4>
          <p className="hint">
            {latency < 50 ? '✅ 非常适合实时游戏' :
             latency < 80 ? '✅ 适合大多数实时应用' :
             latency < 120 ? '⚠️ 可接受，但可优化' :
             '❌ 建议调整参数'}
          </p>
        </div>
      )}
    </div>
  )
}

// 延迟对比演示
function LatencyCompareDemo() {
  const [tcpLatency, setTcpLatency] = useState(0)
  const [kcpLatency, setKcpLatency] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const runComparison = () => {
    setIsRunning(true)
    setTcpLatency(0)
    setKcpLatency(0)

    // 模拟 TCP 延迟
    const tcpTarget = 120 + Math.random() * 60
    const kcpTarget = 40 + Math.random() * 30

    let tcpCurrent = 0
    let kcpCurrent = 0

    const tcpInterval = setInterval(() => {
      tcpCurrent += 5
      setTcpLatency(Math.min(tcpCurrent, tcpTarget))
      if (tcpCurrent >= tcpTarget) {
        clearInterval(tcpInterval)
      }
    }, 30)

    const kcpInterval = setInterval(() => {
      kcpCurrent += 5
      setKcpLatency(Math.min(kcpCurrent, kcpTarget))
      if (kcpCurrent >= kcpTarget) {
        clearInterval(kcpInterval)
        setIsRunning(false)
      }
    }, 20)
  }

  return (
    <div className="latency-compare">
      <div className="compare-bars">
        <div className="bar-row">
          <span className="bar-label">TCP</span>
          <div className="bar-container">
            <div className="bar tcp" style={{ width: `${tcpLatency / 2}%` }}></div>
          </div>
          <span className="bar-value">{tcpLatency.toFixed(0)}ms</span>
        </div>
        <div className="bar-row">
          <span className="bar-label">KCP</span>
          <div className="bar-container">
            <div className="bar kcp" style={{ width: `${kcpLatency / 2}%` }}></div>
          </div>
          <span className="bar-value">{kcpLatency.toFixed(0)}ms</span>
        </div>
      </div>

      <button onClick={runComparison} disabled={isRunning}>
        {isRunning ? '测试中...' : '开始对比测试'}
      </button>

      {tcpLatency > 0 && kcpLatency > 0 && !isRunning && (
        <div className="compare-result">
          <p>KCP 比 TCP 延迟降低 <strong>{((1 - kcpLatency / tcpLatency) * 100).toFixed(1)}%</strong></p>
        </div>
      )}
    </div>
  )
}

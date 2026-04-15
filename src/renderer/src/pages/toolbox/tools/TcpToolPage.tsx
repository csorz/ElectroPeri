import { useState } from 'react'
import './ToolPage.css'

export default function TcpToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔗 TCP 协议</h1>
        <p>Transmission Control Protocol - 传输控制协议</p>
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
                <h3>面向连接</h3>
                <p>通信前必须建立连接（三次握手），通信结束需断开连接（四次挥手）</p>
              </div>
              <div className="feature-card">
                <h3>可靠传输</h3>
                <p>通过确认应答、超时重传、序号机制保证数据无差错、不丢失、不重复</p>
              </div>
              <div className="feature-card">
                <h3>流量控制</h3>
                <p>滑动窗口机制，根据接收方处理能力动态调整发送速率</p>
              </div>
              <div className="feature-card">
                <h3>拥塞控制</h3>
                <p>慢启动、拥塞避免、快重传、快恢复，防止网络拥塞</p>
              </div>
            </div>

            <h2>三次握手</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    客户端                                    服务端
       |                                        |
       |  ──────── SYN=1, seq=x ──────────────> |  ① 客户端请求建立连接
       |                                        |
       |  <─────── SYN=1, ACK=1, seq=y, ack=x+1 ─ |  ② 服务端确认并发起连接
       |                                        |
       |  ──────── ACK=1, seq=x+1, ack=y+1 ────> |  ③ 客户端确认
       |                                        |
              `}</pre>
            </div>
            <div className="info-box">
              <strong>为什么是三次？</strong>
              <p>防止已失效的连接请求报文段突然又传送到了服务端，导致服务端错误建立连接。</p>
            </div>

            <h2>四次挥手</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    客户端                                    服务端
       |                                        |
       |  ──────── FIN=1, seq=u ──────────────> |  ① 客户端请求关闭
       |                                        |
       |  <─────── ACK=1, seq=v, ack=u+1 ─────── |  ② 服务端确认
       |                                        |     (服务端可能还有数据要发送)
       |  <─────── FIN=1, ACK=1, seq=w, ack=u+1 ─ |  ③ 服务端请求关闭
       |                                        |
       |  ──────── ACK=1, seq=u+1, ack=w+1 ────> |  ④ 客户端确认
       |                                        |
              `}</pre>
            </div>
            <div className="info-box">
              <strong>为什么是四次？</strong>
              <p>TCP是全双工通信，每个方向的连接需要单独关闭。服务端收到FIN后可能还有数据要发送。</p>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>Web浏览</strong> - HTTP/HTTPS 基于 TCP</li>
              <li><strong>文件传输</strong> - FTP、SFTP 保证文件完整性</li>
              <li><strong>邮件服务</strong> - SMTP、POP3、IMAP</li>
              <li><strong>远程登录</strong> - SSH、Telnet</li>
              <li><strong>数据库连接</strong> - MySQL、PostgreSQL 客户端连接</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>连接状态模拟</h2>
            <TcpConnectionDemo />

            <h2>滑动窗口演示</h2>
            <SlidingWindowDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`// TCP 服务端
package main

import (
    "bufio"
    "fmt"
    "net"
    "strings"
)

func handleConn(conn net.Conn) {
    defer conn.Close()

    reader := bufio.NewReader(conn)
    for {
        msg, err := reader.ReadString('\\n')
        if err != nil {
            break
        }
        fmt.Printf("收到: %s", msg)
        conn.Write([]byte("ACK: " + msg))
    }
}

func main() {
    listener, _ := net.Listen("tcp", ":8080")
    defer listener.Close()

    for {
        conn, err := listener.Accept()
        if err != nil {
            continue
        }
        go handleConn(conn)
    }
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# TCP 服务端
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('0.0.0.0', 8080))
server.listen(5)
print("服务端启动，等待连接...")

while True:
    conn, addr = server.accept()
    print(f"客户端连接: {addr}")

    while True:
        data = conn.recv(1024)
        if not data:
            break
        print(f"收到: {data.decode()}")
        conn.send(b"ACK: " + data)

    conn.close()`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`// TCP 服务端
import java.io.*;
import java.net.*;

public class TcpServer {
    public static void main(String[] args) throws IOException {
        ServerSocket server = new ServerSocket(8080);
        System.out.println("服务端启动...");

        while (true) {
            Socket conn = server.accept();
            new Thread(() -> {
                try {
                    BufferedReader in = new BufferedReader(
                        new InputStreamReader(conn.getInputStream()));
                    PrintWriter out = new PrintWriter(conn.getOutputStream(), true);

                    String msg;
                    while ((msg = in.readLine()) != null) {
                        System.out.println("收到: " + msg);
                        out.println("ACK: " + msg);
                    }
                    conn.close();
                } catch (IOException e) {}
            }).start();
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

// TCP 连接状态演示组件
function TcpConnectionDemo() {
  const [state, setState] = useState<'closed' | 'syn_sent' | 'syn_received' | 'established' | 'fin_wait' | 'close_wait' | 'closing'>('closed')
  const [step, setStep] = useState(0)

  const steps = [
    { state: 'closed', label: 'CLOSED', desc: '初始状态，无连接' },
    { state: 'syn_sent', label: 'SYN_SENT', desc: '客户端发送 SYN，等待服务端响应' },
    { state: 'syn_received', label: 'SYN_RECEIVED', desc: '服务端收到 SYN，发送 SYN+ACK' },
    { state: 'established', label: 'ESTABLISHED', desc: '连接建立成功，可以传输数据' },
    { state: 'fin_wait', label: 'FIN_WAIT', desc: '主动关闭方发送 FIN' },
    { state: 'close_wait', label: 'CLOSE_WAIT', desc: '被动关闭方收到 FIN，等待应用关闭' },
    { state: 'closing', label: 'CLOSING', desc: '连接关闭中' },
    { state: 'closed', label: 'CLOSED', desc: '连接已关闭' }
  ]

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
      setState(steps[step + 1].state as typeof state)
    }
  }

  const reset = () => {
    setStep(0)
    setState('closed')
  }

  return (
    <div className="connection-demo">
      <div className="state-diagram">
        <div className={`state-node ${state === 'closed' ? 'active' : ''}`}>
          <span>CLOSED</span>
          <small style={{ display: 'block', fontSize: '10px', color: '#666' }}>已关闭</small>
        </div>
        <div className="state-arrow">→</div>
        <div className={`state-node ${state === 'syn_sent' ? 'active' : ''}`}>
          <span>SYN_SENT</span>
          <small style={{ display: 'block', fontSize: '10px', color: '#666' }}>已发送SYN</small>
        </div>
        <div className="state-arrow">→</div>
        <div className={`state-node ${state === 'syn_received' ? 'active' : ''}`}>
          <span>SYN_RCVD</span>
          <small style={{ display: 'block', fontSize: '10px', color: '#666' }}>已收到SYN</small>
        </div>
        <div className="state-arrow">→</div>
        <div className={`state-node ${state === 'established' ? 'active' : ''}`}>
          <span>ESTABLISHED</span>
          <small style={{ display: 'block', fontSize: '10px', color: '#666' }}>已建立</small>
        </div>
      </div>

      <div className="step-info">
        <h4>当前状态: {steps[step].label}</h4>
        <p>{steps[step].desc}</p>
      </div>

      <div className="demo-controls">
        <button onClick={nextStep} disabled={step >= steps.length - 1}>下一步</button>
        <button onClick={reset}>重置</button>
      </div>
    </div>
  )
}

// 滑动窗口演示组件
function SlidingWindowDemo() {
  const [windowSize, setWindowSize] = useState(4)
  const [sentSeq, setSentSeq] = useState(0)
  const [ackedSeq, setAckedSeq] = useState(0)

  const sendData = () => {
    if (sentSeq < ackedSeq + windowSize) {
      setSentSeq(sentSeq + 1)
    }
  }

  const receiveAck = () => {
    if (ackedSeq < sentSeq) {
      setAckedSeq(ackedSeq + 1)
    }
  }

  const reset = () => {
    setSentSeq(0)
    setAckedSeq(0)
  }

  return (
    <div className="window-demo">
      <div className="window-config">
        <label>窗口大小: </label>
        <input type="range" min="1" max="8" value={windowSize} onChange={(e) => setWindowSize(parseInt(e.target.value))} />
        <span>{windowSize}</span>
      </div>

      <div className="window-visual">
        <div className="seq-bar">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`seq-cell ${
                i < ackedSeq ? 'acked' :
                i < sentSeq ? 'sent' :
                i < ackedSeq + windowSize ? 'window' : ''
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="legend">
          <span className="legend-item acked">已确认</span>
          <span className="legend-item sent">已发送</span>
          <span className="legend-item window">窗口内</span>
        </div>
      </div>

      <div className="window-stats">
        <p>已发送: {sentSeq} | 已确认: {ackedSeq} | 可发送: {Math.max(0, ackedSeq + windowSize - sentSeq)}</p>
      </div>

      <div className="demo-controls">
        <button onClick={sendData} disabled={sentSeq >= ackedSeq + windowSize}>发送数据</button>
        <button onClick={receiveAck} disabled={ackedSeq >= sentSeq}>收到ACK</button>
        <button onClick={reset}>重置</button>
      </div>
    </div>
  )
}

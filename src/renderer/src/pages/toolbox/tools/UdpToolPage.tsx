import { useState } from 'react'
import './ToolPage.css'

export default function UdpToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📡 UDP 协议</h1>
        <p>User Datagram Protocol - 用户数据报协议</p>
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
                <h3>无连接</h3>
                <p>不需要建立连接，直接发送数据，减少开销和延迟</p>
              </div>
              <div className="feature-card">
                <h3>不可靠传输</h3>
                <p>不保证数据到达，不保证顺序，无确认重传机制</p>
              </div>
              <div className="feature-card">
                <h3>面向报文</h3>
                <p>保留报文边界，应用层给多大就发多大，不合并不拆分</p>
              </div>
              <div className="feature-card">
                <h3>高效低延迟</h3>
                <p>协议开销小（8字节头部），适合实时性要求高的场景</p>
              </div>
            </div>

            <h2>UDP 报文结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  0        7 8       15 16      23 24      31
  +--------+--------+--------+--------+
  |     Source      |   Destination   |
  |      Port       |      Port       |
  +--------+--------+--------+--------+
  |     Length      |    Checksum     |
  +--------+--------+--------+--------+
  |                                   |
  |           Data (if any)           |
  |                                   |
  +-----------------------------------+

  头部仅 8 字节（TCP 头部至少 20 字节）
              `}</pre>
            </div>

            <h2>TCP vs UDP 对比</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>对比项</th>
                  <th>TCP</th>
                  <th>UDP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>连接</td>
                  <td>面向连接</td>
                  <td>无连接</td>
                </tr>
                <tr>
                  <td>可靠性</td>
                  <td>保证可靠</td>
                  <td>不保证</td>
                </tr>
                <tr>
                  <td>顺序</td>
                  <td>有序</td>
                  <td>无序</td>
                </tr>
                <tr>
                  <td>流量控制</td>
                  <td>有</td>
                  <td>无</td>
                </tr>
                <tr>
                  <td>头部开销</td>
                  <td>20-60字节</td>
                  <td>8字节</td>
                </tr>
                <tr>
                  <td>传输速度</td>
                  <td>较慢</td>
                  <td>快</td>
                </tr>
                <tr>
                  <td>数据模式</td>
                  <td>字节流</td>
                  <td>数据报</td>
                </tr>
              </tbody>
            </table>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>📹 视频直播</h4>
                <p>实时性优先，丢帧可接受，如直播推流、视频会议</p>
              </div>
              <div className="scenario-card">
                <h4>🎮 在线游戏</h4>
                <p>低延迟关键，状态同步，如 FPS、MOBA 游戏</p>
              </div>
              <div className="scenario-card">
                <h4>🔊 VoIP 语音</h4>
                <p>实时通话，少量丢包不影响理解</p>
              </div>
              <div className="scenario-card">
                <h4>🔍 DNS 查询</h4>
                <p>简单请求响应，UDP 更高效</p>
              </div>
              <div className="scenario-card">
                <h4>📊 监控数据</h4>
                <p>大量传感器数据上报，偶发丢失可接受</p>
              </div>
              <div className="scenario-card">
                <h4>📡 广播/多播</h4>
                <p>一对多通信，如 IPTV、服务发现</p>
              </div>
            </div>

            <h2>UDP 可靠性优化</h2>
            <div className="info-box">
              <strong>如何在应用层实现可靠性？</strong>
              <ul>
                <li><strong>ACK 确认机制</strong> - 接收方返回确认包</li>
                <li><strong>序号</strong> - 检测丢包和乱序</li>
                <li><strong>重传机制</strong> - 超时重传、快速重传</li>
                <li><strong>流量控制</strong> - 发送速率控制</li>
                <li><strong>QUIC 协议</strong> - 基于 UDP 的可靠传输（HTTP/3）</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>UDP 数据包模拟</h2>
            <UdpPacketDemo />

            <h2>丢包模拟</h2>
            <PacketLossDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`// UDP 服务端
package main

import (
    "fmt"
    "net"
)

func main() {
    // 监听 UDP 端口
    addr, _ := net.ResolveUDPAddr("udp", ":8080")
    conn, _ := net.ListenUDP("udp", addr)
    defer conn.Close()

    buf := make([]byte, 1024)

    for {
        n, remoteAddr, err := conn.ReadFromUDP(buf)
        if err != nil {
            continue
        }
        fmt.Printf("收到来自 %s: %s\\n", remoteAddr, string(buf[:n]))

        // 直接回复，无需建立连接
        conn.WriteToUDP([]byte("ACK"), remoteAddr)
    }
}

// UDP 客户端
func client() {
    addr, _ := net.ResolveUDPAddr("udp", "127.0.0.1:8080")
    conn, _ := net.DialUDP("udp", nil, addr)
    defer conn.Close()

    conn.Write([]byte("Hello UDP"))
    buf := make([]byte, 1024)
    n, _ := conn.Read(buf)
    fmt.Printf("响应: %s\\n", string(buf[:n]))
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# UDP 服务端
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server.bind(('0.0.0.0', 8080))
print("UDP 服务端启动...")

while True:
    data, addr = server.recvfrom(1024)
    print(f"收到来自 {addr}: {data.decode()}")
    server.sendto(b"ACK", addr)

# UDP 客户端
import socket

client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
client.sendto(b"Hello UDP", ('127.0.0.1', 8080))
data, addr = client.recvfrom(1024)
print(f"响应: {data.decode()}")`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`// UDP 服务端
import java.net.*;

public class UdpServer {
    public static void main(String[] args) throws Exception {
        DatagramSocket socket = new DatagramSocket(8080);
        byte[] buf = new byte[1024];

        while (true) {
            DatagramPacket packet = new DatagramPacket(buf, buf.length);
            socket.receive(packet);

            String msg = new String(packet.getData(), 0, packet.getLength());
            System.out.println("收到: " + msg);

            // 回复
            byte[] ack = "ACK".getBytes();
            socket.send(new DatagramPacket(ack, ack.length,
                packet.getAddress(), packet.getPort()));
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

// UDP 数据包演示
function UdpPacketDemo() {
  const [sourcePort, setSourcePort] = useState(12345)
  const [destPort, setDestPort] = useState(8080)
  const [data, setData] = useState('Hello UDP')
  const [packet, setPacket] = useState<string>('')

  const generatePacket = () => {
    const length = 8 + Buffer.byteLength(data, 'utf8')
    const hex = `
+--------+--------+
| ${sourcePort.toString().padStart(5)} | ${destPort.toString().padStart(5)} |  源端口 / 目的端口
+--------+--------+
| ${length.toString().padStart(5)} |  0x0000  |  长度 / 校验和
+--------+--------+
| "${data}"               |  数据部分
+-------------------+
    `.trim()
    setPacket(hex)
  }

  return (
    <div className="udp-packet-demo">
      <div className="packet-config">
        <div className="config-row">
          <label>源端口:</label>
          <input type="number" value={sourcePort} onChange={(e) => setSourcePort(parseInt(e.target.value) || 0)} />
        </div>
        <div className="config-row">
          <label>目的端口:</label>
          <input type="number" value={destPort} onChange={(e) => setDestPort(parseInt(e.target.value) || 0)} />
        </div>
        <div className="config-row">
          <label>数据:</label>
          <input type="text" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <button onClick={generatePacket}>生成数据包</button>
      </div>
      {packet && <pre className="packet-output">{packet}</pre>}
    </div>
  )
}

// 丢包模拟演示
function PacketLossDemo() {
  const [packets, setPackets] = useState<number[]>([])
  const [received, setReceived] = useState<number[]>([])
  const [lossRate, setLossRate] = useState(20)

  const sendPackets = () => {
    const newPackets = Array.from({ length: 10 }, (_, i) => i + 1)
    setPackets(newPackets)
    setReceived([])

    // 模拟发送和丢包
    newPackets.forEach((seq, index) => {
      setTimeout(() => {
        if (Math.random() * 100 > lossRate) {
          setReceived(prev => [...prev, seq].sort((a, b) => a - b))
        }
      }, index * 200)
    })
  }

  return (
    <div className="packet-loss-demo">
      <div className="loss-config">
        <label>丢包率: {lossRate}%</label>
        <input type="range" min="0" max="80" value={lossRate} onChange={(e) => setLossRate(parseInt(e.target.value))} />
      </div>

      <div className="packet-flow">
        <div className="packet-row">
          <span className="label">发送:</span>
          {packets.map(p => (
            <span key={p} className="packet sent">{p}</span>
          ))}
        </div>
        <div className="packet-row">
          <span className="label">接收:</span>
          {packets.map(p => (
            <span
              key={p}
              className={`packet ${received.includes(p) ? 'received' : 'lost'}`}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="demo-controls">
        <button onClick={sendPackets}>发送数据包</button>
      </div>

      {received.length > 0 && (
        <div className="result-info">
          <p>发送: {packets.length} 包 | 接收: {received.length} 包 | 丢失: {packets.length - received.length} 包</p>
          <p>实际丢包率: {((1 - received.length / packets.length) * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  )
}

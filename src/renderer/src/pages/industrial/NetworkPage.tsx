import { useEffect, useMemo, useState } from 'react'
import { useDeviceStore } from '../../store/deviceStore'
import type { NetworkInterfaceItem } from '../../store/deviceStore'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

export default function NetworkPage() {
  return (
    <ElectronOnly>
      <NetworkPageContent />
    </ElectronOnly>
  )
}

function NetworkPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🌐 网络接口</h1>
        <p>Network Interface - TCP/IP 网络通信</p>
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
                <h3>网络接口扫描</h3>
                <p>获取本机所有网卡信息，包括 IP 地址、MAC 地址、子网掩码等</p>
              </div>
              <div className="feature-card">
                <h3>TCP 客户端</h3>
                <p>建立 TCP 连接，支持数据的可靠传输，适用于大多数网络应用</p>
              </div>
              <div className="feature-card">
                <h3>本地回环测试</h3>
                <p>通过 Echo 服务器进行自发自收测试，验证网络功能</p>
              </div>
              <div className="feature-card">
                <h3>多网卡支持</h3>
                <p>支持 IPv4/IPv6 双栈，自动识别内网/外网接口</p>
              </div>
            </div>

            <h2>网络接口信息</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>属性</th>
                    <th>说明</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>name</code></td>
                    <td>接口名称</td>
                    <td>eth0, wlan0, lo</td>
                  </tr>
                  <tr>
                    <td><code>address</code></td>
                    <td>IP 地址</td>
                    <td>192.168.1.100</td>
                  </tr>
                  <tr>
                    <td><code>mac</code></td>
                    <td>MAC 地址</td>
                    <td>00:1A:2B:3C:4D:5E</td>
                  </tr>
                  <tr>
                    <td><code>family</code></td>
                    <td>地址族</td>
                    <td>IPv4, IPv6</td>
                  </tr>
                  <tr>
                    <td><code>cidr</code></td>
                    <td>CIDR 表示法</td>
                    <td>192.168.1.100/24</td>
                  </tr>
                  <tr>
                    <td><code>internal</code></td>
                    <td>是否为内部接口</td>
                    <td>true, false</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>TCP 通信流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    客户端                                    服务端
       |                                        |
       |  ──────── SYN ──────────────────────> |  三次握手
       |  <─────── SYN+ACK ─────────────────── |
       |  ──────── ACK ──────────────────────> |
       |                                        |
       |  ──────── Data ─────────────────────> |  数据传输
       |  <─────── ACK ─────────────────────── |
       |                                        |
       |  ──────── FIN ──────────────────────> |  四次挥手
       |  <─────── ACK ─────────────────────── |
       |  <─────── FIN ─────────────────────── |
       |  ──────── ACK ──────────────────────> |
       |                                        |
              `}</pre>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>设备发现</strong> - 扫描本地网络接口，获取 IP 地址用于设备通信</li>
              <li><strong>TCP 调试</strong> - 连接远程设备或服务，发送/接收调试数据</li>
              <li><strong>本地测试</strong> - 使用 Echo 服务器验证网络功能</li>
              <li><strong>物联网网关</strong> - 作为 TCP 客户端连接传感器或控制器</li>
              <li><strong>跨平台通信</strong> - 通过标准 TCP/IP 协议与其他系统交互</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <NetworkDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`// 网络接口与 TCP 通信
package main

import (
    "fmt"
    "net"
)

func main() {
    // 获取网络接口列表
    interfaces, _ := net.Interfaces()
    for _, iface := range interfaces {
        fmt.Printf("接口: %s\\n", iface.Name)
        fmt.Printf("  MAC: %s\\n", iface.HardwareAddr)

        addrs, _ := iface.Addrs()
        for _, addr := range addrs {
            fmt.Printf("  地址: %s\\n", addr)
        }
    }

    // TCP 客户端连接
    conn, err := net.Dial("tcp", "192.168.1.100:9000")
    if err != nil {
        panic(err)
    }
    defer conn.Close()

    // 发送数据
    conn.Write([]byte("Hello\\n"))

    // 读取响应
    buf := make([]byte, 1024)
    n, _ := conn.Read(buf)
    fmt.Printf("响应: %s", buf[:n])
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# 网络接口与 TCP 通信
import socket
import netifaces

# 获取网络接口列表
interfaces = netifaces.interfaces()
for iface in interfaces:
    print(f"接口: {iface}")
    addrs = netifaces.ifaddresses(iface)
    for family, addr_list in addrs.items():
        family_name = 'IPv4' if family == 2 else 'IPv6'
        for addr in addr_list:
            print(f"  {family_name}: {addr.get('addr')}")

# TCP 客户端连接
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('192.168.1.100', 9000))

# 发送数据
sock.send(b'Hello\\n')

# 读取响应
data = sock.recv(1024)
print(f"响应: {data.decode()}")

sock.close()`}</pre>
            </div>

            <h2>Java 示例</h2>
            <div className="code-block">
              <pre>{`// 网络接口与 TCP 通信
import java.net.*;
import java.util.*;

public class NetworkExample {
    public static void main(String[] args) throws Exception {
        // 获取网络接口列表
        Enumeration<NetworkInterface> interfaces =
            NetworkInterface.getNetworkInterfaces();

        while (interfaces.hasMoreElements()) {
            NetworkInterface iface = interfaces.nextElement();
            System.out.println("接口: " + iface.getName());
            System.out.println("  MAC: " + formatMac(iface.getHardwareAddress()));

            Enumeration<InetAddress> addrs = iface.getInetAddresses();
            while (addrs.hasMoreElements()) {
                InetAddress addr = addrs.nextElement();
                System.out.println("  地址: " + addr.getHostAddress());
            }
        }

        // TCP 客户端连接
        Socket socket = new Socket("192.168.1.100", 9000);

        // 发送数据
        socket.getOutputStream().write("Hello\\n".getBytes());

        // 读取响应
        byte[] buf = new byte[1024];
        int n = socket.getInputStream().read(buf);
        System.out.println("响应: " + new String(buf, 0, n));

        socket.close();
    }

    private static String formatMac(byte[] mac) {
        if (mac == null) return "N/A";
        StringBuilder sb = new StringBuilder();
        for (byte b : mac) {
            if (sb.length() > 0) sb.append(":");
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 网络演示组件
function NetworkDemo() {
  const {
    networkInterfaces,
    networkStatus,
    networkError,
    networkData,
    setNetworkInterfaces,
    setNetworkStatus,
    setNetworkError,
    appendNetworkData,
    clearNetworkData
  } = useDeviceStore()

  const [tcpHost, setTcpHost] = useState('127.0.0.1')
  const [tcpPort, setTcpPort] = useState(9000)
  const [echoPort, setEchoPort] = useState(9000)
  const [echoRunning, setEchoRunning] = useState(false)
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState('')

  const summary = useMemo(() => {
    const ipv4 = networkInterfaces.filter((i) => i.family === 'IPv4' && !i.internal).length
    const ipv6 = networkInterfaces.filter((i) => i.family === 'IPv6' && !i.internal).length
    return { total: networkInterfaces.length, ipv4, ipv6 }
  }, [networkInterfaces])

  useEffect(() => {
    window.api.network.onTcpData((data) => appendNetworkData(`RX: ${data}\n`))
    window.api.network.onTcpError((err) => setNetworkError(err))
    window.api.network.onTcpClosed(() => {
      setConnected(false)
      setNetworkStatus('idle')
      appendNetworkData('TCP closed\n')
    })
    window.api.network.onEchoData((data) => appendNetworkData(`ECHO: ${data}\n`))
    window.api.network.onEchoError((err) => setNetworkError(err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScan = async () => {
    setNetworkStatus('scanning')
    setNetworkError(null)
    try {
      const items = await window.api.network.listInterfaces()
      setNetworkInterfaces(items as NetworkInterfaceItem[])
      setNetworkStatus('idle')
    } catch (err) {
      setNetworkError(err instanceof Error ? err.message : '扫描失败')
      setNetworkStatus('error')
    }
  }

  const handleStartEcho = async () => {
    setNetworkError(null)
    try {
      await window.api.network.startEchoServer(echoPort)
      setEchoRunning(true)
      appendNetworkData(`Echo server started on 127.0.0.1:${echoPort}\n`)
    } catch (err) {
      setNetworkError(err instanceof Error ? err.message : '启动失败')
    }
  }

  const handleStopEcho = async () => {
    setNetworkError(null)
    try {
      await window.api.network.stopEchoServer()
      setEchoRunning(false)
      appendNetworkData('Echo server stopped\n')
    } catch (err) {
      setNetworkError(err instanceof Error ? err.message : '停止失败')
    }
  }

  const handleTcpConnect = async () => {
    setNetworkStatus('scanning')
    setNetworkError(null)
    try {
      await window.api.network.tcpConnect(tcpHost, tcpPort)
      setConnected(true)
      setNetworkStatus('connected')
      appendNetworkData(`TCP connected to ${tcpHost}:${tcpPort}\n`)
    } catch (err) {
      setNetworkError(err instanceof Error ? err.message : '连接失败')
      setNetworkStatus('error')
    }
  }

  const handleTcpDisconnect = async () => {
    setNetworkError(null)
    try {
      await window.api.network.tcpDisconnect()
      setConnected(false)
      setNetworkStatus('idle')
      appendNetworkData('TCP disconnected\n')
    } catch (err) {
      setNetworkError(err instanceof Error ? err.message : '断开失败')
    }
  }

  const handleSend = async () => {
    if (!message.trim()) return
    setNetworkError(null)
    try {
      await window.api.network.tcpSend(message)
      appendNetworkData(`TX: ${message}\n`)
      setMessage('')
    } catch (err) {
      setNetworkError(err instanceof Error ? err.message : '发送失败')
    }
  }

  return (
    <div className="connection-demo">
      <h3>网络接口与 TCP 通信</h3>

      {networkError && (
        <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, marginBottom: 16, color: '#c62828' }}>
          {networkError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14 }}>接口列表 ({summary.total}) <span style={{ fontSize: 12, color: '#666' }}>IPv4:{summary.ipv4} IPv6:{summary.ipv6}</span></h4>
            <button
              onClick={handleScan}
              disabled={networkStatus === 'scanning'}
              style={{ padding: '6px 12px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              {networkStatus === 'scanning' ? '扫描中...' : '扫描接口'}
            </button>
          </div>

          {networkInterfaces.length === 0 ? (
            <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
              点击"扫描接口"获取本机网卡信息
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 180, overflowY: 'auto' }}>
              {networkInterfaces.map((it, idx) => (
                <li key={`${it.name}-${it.address}-${idx}`} style={{ padding: '8px 10px', background: '#fff', borderRadius: 6, marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{it.name}</span>
                    <span style={{ fontSize: 11, color: '#666' }}>{it.family} {it.address}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#888' }}>
                    <span style={{ padding: '2px 6px', background: it.internal ? '#e3f2fd' : '#e8f5e9', borderRadius: 3 }}>
                      {it.internal ? 'internal' : 'external'}
                    </span>
                    <span>MAC: {it.mac}</span>
                    {it.cidr && <span>CIDR: {it.cidr}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>TCP 通信</h4>

          <div style={{ marginBottom: 12, padding: 12, background: '#fff', borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, color: '#333' }}>本地 Echo 服务器</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: '#666' }}>端口:</label>
              <input
                type="number"
                value={echoPort}
                min={1}
                max={65535}
                onChange={(e) => setEchoPort(Number(e.target.value))}
                disabled={echoRunning}
                style={{ width: 80, padding: '6px 8px', borderRadius: 4, border: '1px solid #ddd' }}
              />
              {echoRunning ? (
                <button
                  onClick={handleStopEcho}
                  style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                >
                  停止
                </button>
              ) : (
                <button
                  onClick={handleStartEcho}
                  style={{ padding: '6px 12px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                >
                  启动
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 12, padding: 12, background: '#fff', borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, color: '#333' }}>连接目标</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={tcpHost}
                onChange={(e) => setTcpHost(e.target.value)}
                disabled={connected}
                placeholder="Host"
                style={{ flex: 1, minWidth: 100, padding: '6px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
              />
              <input
                type="number"
                value={tcpPort}
                min={1}
                max={65535}
                onChange={(e) => setTcpPort(Number(e.target.value))}
                disabled={connected}
                placeholder="Port"
                style={{ width: 80, padding: '6px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
              />
              {connected ? (
                <button
                  onClick={handleTcpDisconnect}
                  style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                >
                  断开
                </button>
              ) : (
                <button
                  onClick={handleTcpConnect}
                  style={{ padding: '6px 12px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                >
                  连接
                </button>
              )}
            </div>
          </div>

          <div style={{
            background: '#1e1e1e',
            color: '#4fc3f7',
            padding: 12,
            borderRadius: 6,
            minHeight: 60,
            maxHeight: 100,
            overflowY: 'auto',
            fontFamily: 'Consolas, monospace',
            fontSize: 11,
            marginBottom: 12
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{networkData || '暂无数据'}</pre>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={!connected}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}
            />
            <button
              onClick={handleSend}
              disabled={!connected || !message.trim()}
              style={{ padding: '8px 16px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              发送
            </button>
            <button
              onClick={clearNetworkData}
              style={{ padding: '8px 12px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              清空
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: networkStatus === 'connected' ? '#4caf50' : networkStatus === 'error' ? '#f44336' : '#ccc'
        }} />
        <span>
          状态: {networkStatus === 'idle' && (connected ? '已连接' : '就绪')}
          {networkStatus === 'scanning' && '处理中'}
          {networkStatus === 'connected' && `已连接 - ${tcpHost}:${tcpPort}`}
          {networkStatus === 'error' && '错误'}
        </span>
        {echoRunning && <span style={{ marginLeft: 16, color: '#4caf50', fontSize: 12 }}>Echo 服务器运行中 (端口 {echoPort})</span>}
      </div>
    </div>
  )
}

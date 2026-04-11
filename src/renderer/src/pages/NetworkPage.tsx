import { useEffect, useMemo, useState } from 'react'
import { useDeviceStore } from '../store/deviceStore'
import type { NetworkInterfaceItem } from '../store/deviceStore'
import './NetworkPage.css'

export default function NetworkPage() {
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
    <div className="network-page">
      <div className="page-header">
        <h1>网络采集（TCP/接口扫描）</h1>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={handleScan}
            disabled={networkStatus === 'scanning'}
          >
            {networkStatus === 'scanning' ? '扫描中...' : '扫描接口'}
          </button>
        </div>
      </div>

      {networkError && (
        <div className="error-message">
          <span>❌ {networkError}</span>
        </div>
      )}

      <div className="content-grid">
        <div className="device-list">
          <h3>
            接口列表 ({summary.total}) <span className="sub">IPv4:{summary.ipv4} IPv6:{summary.ipv6}</span>
          </h3>
          {networkInterfaces.length === 0 ? (
            <div className="empty-state">
              <p>点击“扫描接口”获取本机网卡信息</p>
            </div>
          ) : (
            <ul className="iface-list">
              {networkInterfaces.map((it, idx) => (
                <li key={`${it.name}-${it.address}-${idx}`} className="iface-item">
                  <div className="iface-main">
                    <span className="iface-name">{it.name}</span>
                    <span className="iface-addr">
                      {it.family} {it.address}
                    </span>
                  </div>
                  <div className="iface-meta">
                    <span className="tag">{it.internal ? 'internal' : 'external'}</span>
                    <span className="tag">mac {it.mac}</span>
                    {it.cidr && <span className="tag">cidr {it.cidr}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="data-panel">
          <div className="panel-header">
            <h3>TCP 通信（Node 层）</h3>
            <button className="btn btn-secondary" onClick={clearNetworkData}>
              清空
            </button>
          </div>

          <div className="config-row">
            <div className="config-block">
              <div className="config-title">本地 Echo（用于快速自测）</div>
              <div className="config-controls">
                <label>
                  端口:
                  <input
                    type="number"
                    value={echoPort}
                    min={1}
                    max={65535}
                    onChange={(e) => setEchoPort(Number(e.target.value))}
                    disabled={echoRunning}
                  />
                </label>
                {echoRunning ? (
                  <button className="btn btn-danger" onClick={handleStopEcho}>
                    停止
                  </button>
                ) : (
                  <button className="btn btn-success" onClick={handleStartEcho}>
                    启动
                  </button>
                )}
              </div>
            </div>

            <div className="config-block">
              <div className="config-title">连接目标</div>
              <div className="config-controls">
                <label>
                  Host:
                  <input
                    type="text"
                    value={tcpHost}
                    onChange={(e) => setTcpHost(e.target.value)}
                    disabled={connected}
                  />
                </label>
                <label>
                  Port:
                  <input
                    type="number"
                    value={tcpPort}
                    min={1}
                    max={65535}
                    onChange={(e) => setTcpPort(Number(e.target.value))}
                    disabled={connected}
                  />
                </label>
                {connected ? (
                  <button className="btn btn-danger" onClick={handleTcpDisconnect}>
                    断开
                  </button>
                ) : (
                  <button className="btn btn-success" onClick={handleTcpConnect}>
                    连接
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="data-display">
            <pre>{networkData || '暂无数据'}</pre>
          </div>

          <div className="send-panel">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入要发送的数据..."
              disabled={!connected}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={!connected || !message.trim()}
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-indicator ${networkStatus}`} />
        <span>
          状态: {networkStatus === 'idle' && (connected ? '已连接' : '就绪')}
          {networkStatus === 'scanning' && '处理中'}
          {networkStatus === 'connected' && `已连接 - ${tcpHost}:${tcpPort}`}
          {networkStatus === 'error' && '错误'}
        </span>
      </div>
    </div>
  )
}


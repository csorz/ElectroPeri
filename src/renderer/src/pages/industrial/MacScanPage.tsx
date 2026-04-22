import { useEffect, useState, useRef, useCallback } from 'react'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

interface NetInterface {
  index: number
  name: string
  description: string
  mac: string | null
}

interface MacScanApplication {
  isIndustrial: boolean
  protocol: string
  port: number
  parsed: {
    valid: boolean
    protocol?: string
    error?: string
    [key: string]: any
  }
}

interface MacPacket {
  timestamp: number
  ethernet: {
    srcMac: string
    dstMac: string
    etherType: string
  }
  ip?: {
    srcIp: string
    dstIp: string
    protocol: string
  }
  transport?: {
    srcPort: number
    dstPort: number
    protocol: string
  }
  application?: MacScanApplication
  payload?: string
  payloadLength?: number
}

const MAX_PACKETS = 500

export default function MacScanPage() {
  return (
    <ElectronOnly>
      <MacScanPageContent />
    </ElectronOnly>
  )
}

function MacScanPageContent() {
  const [tsharkAvailable, setTsharkAvailable] = useState<boolean | null>(null)
  const [tsharkVersion, setTsharkVersion] = useState('')
  const [tsharkError, setTsharkError] = useState<string | null>(null)
  const [interfaces, setInterfaces] = useState<NetInterface[]>([])
  const [selectedInterface, setSelectedInterface] = useState<number>(0)
  const [captureFilter, setCaptureFilter] = useState('')
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packets, setPackets] = useState<MacPacket[]>([])
  const [selectedPacket, setSelectedPacket] = useState<MacPacket | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const tableRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const errorCleanupRef = useRef<(() => void) | null>(null)

  // 检查 tshark 可用性
  useEffect(() => {
    const check = async () => {
      try {
        const result = await window.api.macScan.check()
        setTsharkAvailable(result.available)
        if (result.available) {
          setTsharkVersion(result.version || '')
        } else {
          setTsharkError(result.error || '未找到 tshark')
        }
      } catch {
        setTsharkAvailable(false)
        setTsharkError('检查 tshark 失败')
      }
    }
    check()
  }, [])

  // 加载网络接口列表
  useEffect(() => {
    const loadInterfaces = async () => {
      try {
        const ifaces = await window.api.macScan.listInterfaces()
        setInterfaces(ifaces)
        if (ifaces.length > 0) setSelectedInterface(ifaces[0].index)
      } catch {
        // ignore
      }
    }
    if (tsharkAvailable) loadInterfaces()
  }, [tsharkAvailable])

  // 自动滚动
  useEffect(() => {
    if (autoScroll && tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight
    }
  }, [packets, autoScroll])

  // 组件卸载时停止捕获
  useEffect(() => {
    return () => {
      if (capturing) {
        window.api.macScan.stop().catch(() => {})
      }
      cleanupRef.current?.()
      errorCleanupRef.current?.()
    }
  }, [])

  const handleStart = useCallback(async () => {
    setError(null)
    setPackets([])
    setSelectedPacket(null)

    try {
      await window.api.macScan.start(selectedInterface, captureFilter || undefined)
      setCapturing(true)

      const cleanup = window.api.macScan.onData((packet: MacPacket) => {
        setPackets(prev => {
          const next = [...prev, packet]
          return next.length > MAX_PACKETS ? next.slice(-MAX_PACKETS) : next
        })
      })
      cleanupRef.current = cleanup

      const errorCleanup = window.api.macScan.onError((msg: string) => {
        setError(msg)
      })
      errorCleanupRef.current = errorCleanup
    } catch (err) {
      setError(err instanceof Error ? err.message : '启动捕获失败')
      setCapturing(false)
    }
  }, [selectedInterface, captureFilter])

  const handleStop = useCallback(async () => {
    try {
      cleanupRef.current?.()
      cleanupRef.current = null
      errorCleanupRef.current?.()
      errorCleanupRef.current = null
      await window.api.macScan.stop()
      setCapturing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '停止捕获失败')
    }
  }, [])

  const handleClear = () => {
    setPackets([])
    setSelectedPacket(null)
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
  }

  const getEtherTypeColor = (type: string) => {
    switch (type) {
      case 'IPv4': return '#4fc3f7'
      case 'IPv6': return '#81c784'
      case 'ARP': return '#ffb74d'
      case 'LLDP': return '#ce93d8'
      default: return '#999'
    }
  }

  const getProtocolColor = (proto: string) => {
    switch (proto) {
      case 'TCP': return '#4fc3f7'
      case 'UDP': return '#81c784'
      case 'ICMP': return '#ffb74d'
      default: return '#999'
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🔌 MAC 帧扫描</h1>
        <p>捕获局域网 MAC 帧，分析以太网通信数据</p>
      </div>

      <div className="tool-content">
        <div className="demo-section">
          {/* tshark 不可用警告 */}
          {tsharkAvailable === false && (
            <div style={{ marginBottom: 16, padding: 16, background: '#fff3e0', borderRadius: 8, border: '1px solid #ffcc80' }}>
              <div style={{ fontWeight: 500, color: '#e65100', marginBottom: 8 }}>⚠️ tshark 不可用</div>
              <div style={{ fontSize: 13, color: '#666' }}>{tsharkError}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                请安装 Wireshark: <a href="https://www.wireshark.org/" target="_blank" rel="noreferrer">https://www.wireshark.org/</a>
              </div>
            </div>
          )}

          {/* 配置区 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>网络接口</label>
              <select
                value={selectedInterface}
                onChange={(e) => setSelectedInterface(Number(e.target.value))}
                disabled={capturing}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', minWidth: 200, background: '#fff' }}
              >
                {interfaces.map((iface) => (
                  <option key={iface.index} value={iface.index}>
                    {iface.description}{iface.mac ? ` (${iface.mac})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>捕获过滤器 (BPF)</label>
              <input
                type="text"
                value={captureFilter}
                onChange={(e) => setCaptureFilter(e.target.value)}
                placeholder="e.g. ether host aa:bb:cc:dd:ee:ff"
                disabled={capturing}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', width: 260, fontFamily: 'Consolas, monospace' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {capturing ? (
                <button
                  onClick={handleStop}
                  style={{ padding: '8px 20px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}
                >
                  停止捕获
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={tsharkAvailable === false || interfaces.length === 0}
                  style={{
                    padding: '8px 20px',
                    background: (tsharkAvailable === false || interfaces.length === 0) ? '#ccc' : '#4fc3f7',
                    color: '#fff', border: 'none', borderRadius: 4,
                    cursor: (tsharkAvailable === false || interfaces.length === 0) ? 'not-allowed' : 'pointer',
                    fontWeight: 500
                  }}
                >
                  开始捕获
                </button>
              )}
              <button
                onClick={handleClear}
                style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                清空
              </button>
            </div>
          </div>

          {/* 状态指示 */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: capturing ? '#4caf50' : '#ccc'
            }} />
            <span>
              {capturing ? '捕获中' : '未捕获'}
            </span>
            <span style={{ marginLeft: 12, color: '#888' }}>
              数据包: {packets.length}{packets.length >= MAX_PACKETS ? ` (保留最近 ${MAX_PACKETS})` : ''}
            </span>
            {tsharkVersion && <span style={{ marginLeft: 12, color: '#888' }}>{tsharkVersion}</span>}
            <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
              自动滚动
            </label>
          </div>

          {/* 错误提示 */}
          {error && (
            <div style={{ marginBottom: 16, padding: 16, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcdd2' }}>
              <div style={{ fontWeight: 500, color: '#c62828' }}>⚠️ {error}</div>
            </div>
          )}

          {/* 数据区域：包列表 + 详情 */}
          <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 380px)', minHeight: 300 }}>
            {/* 包列表 */}
            <div style={{ flex: 1, background: '#f8f9fa', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div ref={tableRef} style={{ flex: 1, overflow: 'auto' }}>
                {packets.length === 0 ? (
                  <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 40 }}>
                    {capturing ? '等待数据包...' : '选择网络接口后点击"开始捕获"'}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f0f0f0', zIndex: 1 }}>
                      <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>时间</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>源 MAC</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>目标 MAC</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>类型</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>源 IP</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>目标 IP</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>协议</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>工业协议</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>端口</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>长度</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packets.map((pkt, idx) => (
                        <tr
                          key={idx}
                          onClick={() => setSelectedPacket(pkt)}
                          style={{
                            borderBottom: '1px solid #eee',
                            cursor: 'pointer',
                            background: selectedPacket === pkt ? '#e3f2fd' : undefined
                          }}
                        >
                          <td style={{ padding: '4px 8px', color: '#999' }}>{idx + 1}</td>
                          <td style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>{formatTime(pkt.timestamp)}</td>
                          <td style={{ padding: '4px 8px', fontFamily: 'Consolas, monospace', fontSize: 11 }}>{pkt.ethernet.srcMac}</td>
                          <td style={{ padding: '4px 8px', fontFamily: 'Consolas, monospace', fontSize: 11 }}>{pkt.ethernet.dstMac}</td>
                          <td style={{ padding: '4px 8px', color: getEtherTypeColor(pkt.ethernet.etherType), fontWeight: 500 }}>{pkt.ethernet.etherType}</td>
                          <td style={{ padding: '4px 8px', fontFamily: 'Consolas, monospace', fontSize: 11 }}>{pkt.ip?.srcIp || '-'}</td>
                          <td style={{ padding: '4px 8px', fontFamily: 'Consolas, monospace', fontSize: 11 }}>{pkt.ip?.dstIp || '-'}</td>
                          <td style={{ padding: '4px 8px', color: pkt.transport ? getProtocolColor(pkt.transport.protocol) : '#999', fontWeight: 500 }}>
                            {pkt.transport?.protocol || pkt.ip?.protocol || '-'}
                          </td>
                          <td style={{ padding: '4px 8px' }}>
                            {pkt.application ? (
                              <span style={{
                                background: '#e8f5e9',
                                color: '#2e7d32',
                                padding: '2px 6px',
                                borderRadius: 3,
                                fontSize: 11,
                                fontWeight: 500
                              }}>
                                {pkt.application.protocol}
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '4px 8px', fontSize: 11 }}>
                            {pkt.transport ? `${pkt.transport.srcPort} → ${pkt.transport.dstPort}` : '-'}
                          </td>
                          <td style={{ padding: '4px 8px' }}>{pkt.payloadLength || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* 详情面板 */}
            {selectedPacket && (
              <div style={{ width: 280, background: '#f8f9fa', borderRadius: 8, padding: 12, overflow: 'auto', fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>数据包详情</div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>Ethernet</div>
                  <div style={{ fontFamily: 'Consolas, monospace', lineHeight: 1.8 }}>
                    <div>源: {selectedPacket.ethernet.srcMac}</div>
                    <div>目标: {selectedPacket.ethernet.dstMac}</div>
                    <div>类型: <span style={{ color: getEtherTypeColor(selectedPacket.ethernet.etherType) }}>{selectedPacket.ethernet.etherType}</span></div>
                  </div>
                </div>

                {selectedPacket.ip && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>IP</div>
                    <div style={{ fontFamily: 'Consolas, monospace', lineHeight: 1.8 }}>
                      <div>源: {selectedPacket.ip.srcIp}</div>
                      <div>目标: {selectedPacket.ip.dstIp}</div>
                      <div>协议: {selectedPacket.ip.protocol}</div>
                    </div>
                  </div>
                )}

                {selectedPacket.transport && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>Transport</div>
                    <div style={{ fontFamily: 'Consolas, monospace', lineHeight: 1.8 }}>
                      <div>协议: <span style={{ color: getProtocolColor(selectedPacket.transport.protocol) }}>{selectedPacket.transport.protocol}</span></div>
                      <div>源端口: {selectedPacket.transport.srcPort}</div>
                      <div>目标端口: {selectedPacket.transport.dstPort}</div>
                    </div>
                  </div>
                )}

                {selectedPacket.application && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ color: '#2e7d32', fontSize: 11, marginBottom: 2, fontWeight: 600 }}>
                      工业协议: {selectedPacket.application.protocol} (端口 {selectedPacket.application.port})
                    </div>
                    <div style={{
                      fontFamily: 'Consolas, monospace',
                      fontSize: 11,
                      background: '#e8f5e9',
                      padding: 8,
                      borderRadius: 4,
                      border: '1px solid #c8e6c9',
                      lineHeight: 1.8,
                      maxHeight: 200,
                      overflow: 'auto'
                    }}>
                      {selectedPacket.application.parsed.valid ? (
                        Object.entries(selectedPacket.application.parsed)
                          .filter(([k]) => k !== 'valid' && k !== 'raw')
                          .map(([key, value]) => (
                            <div key={key}>
                              <span style={{ color: '#666' }}>{key}:</span>{' '}
                              <span style={{ color: '#1b5e20' }}>{String(value)}</span>
                            </div>
                          ))
                      ) : (
                        <div style={{ color: '#c62828' }}>
                          解析失败: {selectedPacket.application.parsed.error || '未知错误'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedPacket.payload && (
                  <div>
                    <div style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>Payload ({selectedPacket.payloadLength} bytes)</div>
                    <div style={{
                      fontFamily: 'Consolas, monospace',
                      fontSize: 10,
                      background: '#fff',
                      padding: 8,
                      borderRadius: 4,
                      border: '1px solid #e0e0e0',
                      wordBreak: 'break-all',
                      maxHeight: 200,
                      overflow: 'auto',
                      lineHeight: 1.6
                    }}>
                      {selectedPacket.payload.match(/.{1,2}/g)?.join(' ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

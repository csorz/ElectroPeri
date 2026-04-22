import { useEffect, useState, useRef } from 'react'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

interface ScanDevice {
  mac: string
  name: string
  rssi: number
  manufacturerData: string
  parsedData: Record<string, any> | null
  timestamp: string
}

export default function BleScanPage() {
  return (
    <ElectronOnly>
      <BleScanPageContent />
    </ElectronOnly>
  )
}

function BleScanPageContent() {
  const [companyId, setCompanyId] = useState('0x1012')
  const [targetName, setTargetName] = useState('XJ_T01')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<Map<string, ScanDevice>>(new Map())
  const [moduleAvailable, setModuleAvailable] = useState<boolean | null>(null)
  const [moduleError, setModuleError] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<ScanDevice | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // 检查蓝牙模块是否可用
  useEffect(() => {
    const checkModule = async () => {
      try {
        const result = await window.api.bluetooth.check()
        setModuleAvailable(result.available)
        if (!result.available && result.error) {
          setModuleError(result.error)
        }
      } catch {
        setModuleAvailable(false)
        setModuleError('无法检查蓝牙模块状态')
      }
    }
    checkModule()
  }, [])

  // 组件卸载时停止扫描
  useEffect(() => {
    return () => {
      if (scanning) {
        window.api.bleScan.stop().catch(() => {})
      }
      cleanupRef.current?.()
    }
  }, [])

  const handleStartScan = async () => {
    if (!companyId.trim()) {
      setError('请输入 Company ID')
      return
    }
    setError(null)
    try {
      await window.api.bleScan.start(companyId.trim(), targetName.trim())
      setScanning(true)

      // 监听扫描数据
      const cleanup = window.api.bleScan.onData((device: ScanDevice) => {
        setDevices(prev => {
          const next = new Map(prev)
          next.set(device.mac, device)
          return next
        })
      })
      cleanupRef.current = cleanup
    } catch (err) {
      setError(err instanceof Error ? err.message : '启动扫描失败')
      setScanning(false)
    }
  }

  const handleStopScan = async () => {
    try {
      cleanupRef.current?.()
      cleanupRef.current = null
      await window.api.bleScan.stop()
      setScanning(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '停止扫描失败')
    }
  }

  const handleClear = () => {
    setDevices(new Map())
  }

  // 按更新时间倒序排列
  const sortedDevices = Array.from(devices.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const getRssiColor = (rssi: number) => {
    if (rssi >= -50) return '#4caf50'
    if (rssi >= -60) return '#8bc34a'
    if (rssi >= -70) return '#ffeb3b'
    if (rssi >= -80) return '#ff9800'
    return '#f44336'
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString()
  }

  const renderParsedData = (data: Record<string, any>, depth = 0): JSX.Element[] => {
    const entries: JSX.Element[] = []
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue
      if (typeof value === 'object' && !Array.isArray(value)) {
        entries.push(
          <div key={key} style={{ marginLeft: depth * 8 }}>
            <span style={{ color: '#666' }}>{key}:</span>
            {renderParsedData(value, depth + 1)}
          </div>
        )
      } else {
        entries.push(
          <div key={key} style={{ marginLeft: depth * 8 }}>
            <span style={{ color: '#666' }}>{key}:</span>{' '}
            <span style={{ color: '#1b5e20' }}>{String(value)}</span>
          </div>
        )
      }
    }
    return entries
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📡 BLE 广播扫描</h1>
        <p>扫描 BLE 设备广播数据，按 Company ID / 设备名过滤</p>
      </div>

      <div className="tool-content">
        <div className="demo-section">
          {/* 模块不可用警告 */}
          {moduleAvailable === false && (
            <div style={{ marginBottom: 16, padding: 16, background: '#fff3e0', borderRadius: 8, border: '1px solid #ffcc80' }}>
              <div style={{ fontWeight: 500, color: '#e65100', marginBottom: 8 }}>⚠️ 蓝牙模块不可用</div>
              <div style={{ fontSize: 13, color: '#666' }}>{moduleError}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                请安装 Visual Studio Build Tools 后运行: pnpm rebuild @abandonware/noble
              </div>
            </div>
          )}

          {/* 配置区 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>TARGET_COMPANY_ID</label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="0x1012"
                disabled={scanning}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', width: 140, fontFamily: 'Consolas, monospace' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>TARGET_NAME</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="XJ_T01"
                disabled={scanning}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', width: 140, fontFamily: 'Consolas, monospace' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {scanning ? (
                <button
                  onClick={handleStopScan}
                  style={{ padding: '8px 20px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}
                >
                  停止扫描
                </button>
              ) : (
                <button
                  onClick={handleStartScan}
                  disabled={moduleAvailable === false}
                  style={{ padding: '8px 20px', background: moduleAvailable === false ? '#ccc' : '#4fc3f7', color: '#fff', border: 'none', borderRadius: 4, cursor: moduleAvailable === false ? 'not-allowed' : 'pointer', fontWeight: 500 }}
                >
                  开始扫描
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
              background: scanning ? '#4caf50' : '#ccc'
            }} />
            <span>
              {scanning ? `扫描中 (Company ID: ${companyId}, Name: ${targetName || '*'})` : '未扫描'}
            </span>
            <span style={{ marginLeft: 12, color: '#888' }}>
              设备数: {devices.size}
            </span>
          </div>

          {/* 错误提示 */}
          {error && (
            <div style={{ marginBottom: 16, padding: 16, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcdd2' }}>
              <div style={{ fontWeight: 500, color: '#c62828' }}>⚠️ {error}</div>
            </div>
          )}

          {/* 数据区域：表格 + 详情 */}
          <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 320px)', minHeight: 300 }}>
            {/* 设备列表 */}
            <div style={{ flex: 1, background: '#f8f9fa', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                {sortedDevices.length === 0 ? (
                  <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
                    {scanning ? '等待扫描结果...' : '配置参数后点击"开始扫描"'}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f0f0f0', zIndex: 1 }}>
                      <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>MAC</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>设备名</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>RSSI</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>ManufacturerData</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>解析数据</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>更新时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDevices.map((device) => (
                        <tr
                          key={device.mac}
                          onClick={() => setSelectedDevice(device)}
                          style={{
                            borderBottom: '1px solid #eee',
                            cursor: 'pointer',
                            background: selectedDevice?.mac === device.mac ? '#e3f2fd' : undefined
                          }}
                        >
                          <td style={{ padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: 12 }}>{device.mac}</td>
                          <td style={{ padding: '8px 12px' }}>{device.name || '-'}</td>
                          <td style={{ padding: '8px 12px', color: getRssiColor(device.rssi), fontWeight: 500 }}>{device.rssi} dBm</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.manufacturerData || '-'}</td>
                          <td style={{ padding: '8px 12px', fontSize: 11 }}>
                            {device.parsedData ? (
                              <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: 3, fontWeight: 500 }}>
                                已解析
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#888', fontSize: 12, whiteSpace: 'nowrap' }}>{formatTime(device.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* 详情面板 */}
            {selectedDevice && (
              <div style={{ width: 280, background: '#f8f9fa', borderRadius: 8, padding: 12, overflow: 'auto', fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>设备详情</div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>基本信息</div>
                  <div style={{ fontFamily: 'Consolas, monospace', lineHeight: 1.8 }}>
                    <div>MAC: {selectedDevice.mac}</div>
                    <div>名称: {selectedDevice.name || '-'}</div>
                    <div>RSSI: <span style={{ color: getRssiColor(selectedDevice.rssi) }}>{selectedDevice.rssi} dBm</span></div>
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>ManufacturerData (原始)</div>
                  <div style={{
                    fontFamily: 'Consolas, monospace',
                    fontSize: 10,
                    background: '#fff',
                    padding: 8,
                    borderRadius: 4,
                    border: '1px solid #e0e0e0',
                    wordBreak: 'break-all',
                    maxHeight: 120,
                    overflow: 'auto',
                    lineHeight: 1.6
                  }}>
                    {selectedDevice.manufacturerData.match(/.{1,2}/g)?.join(' ') || '-'}
                  </div>
                </div>

                {selectedDevice.parsedData && (
                  <div>
                    <div style={{ color: '#2e7d32', fontSize: 11, marginBottom: 2, fontWeight: 600 }}>解析结果</div>
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
                      {renderParsedData(selectedDevice.parsedData)}
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

import { useEffect, useState, useRef, useCallback } from 'react'
import { ElectronOnly } from '../../components/ElectronOnly'
import '../toolbox/tools/ToolPage.css'

interface KeyboardDevice {
  handle: number
  name: string
  vid: number
  pid: number
}

interface KeyEvent {
  handle: number
  vKey: number
  scanCode: number
  keyDown: boolean
  keyName: string
}

const MAX_EVENTS = 200

export default function RawKeyboardPage() {
  return (
    <ElectronOnly>
      <RawKeyboardPageContent />
    </ElectronOnly>
  )
}

function RawKeyboardPageContent() {
  const [moduleAvailable, setModuleAvailable] = useState<boolean | null>(null)
  const [moduleError, setModuleError] = useState<string | null>(null)
  const [devices, setDevices] = useState<KeyboardDevice[]>([])
  const [selectedHandle, setSelectedHandle] = useState<number | null>(null)
  const [listening, setListening] = useState(false)
  const [events, setEvents] = useState<KeyEvent[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [filterSelected, setFilterSelected] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // 检查模块可用性
  useEffect(() => {
    const check = async () => {
      try {
        const result = await window.api.rawKeyboard.check()
        setModuleAvailable(result.available)
        if (!result.available) {
          setModuleError(result.error || '模块不可用')
        }
      } catch {
        setModuleAvailable(false)
        setModuleError('检查模块失败')
      }
    }
    check()
  }, [])

  // 加载设备列表
  useEffect(() => {
    const load = async () => {
      try {
        const list = await window.api.rawKeyboard.listDevices()
        setDevices(list)
        if (list.length > 0) setSelectedHandle(list[0].handle)
      } catch {
        // ignore
      }
    }
    if (moduleAvailable) load()
  }, [moduleAvailable])

  // 自动滚动
  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [events, autoScroll])

  // 组件卸载时停止监听
  useEffect(() => {
    return () => {
      if (listening) {
        window.api.rawKeyboard.stop().catch(() => {})
      }
      cleanupRef.current?.()
    }
  }, [])

  const handleStart = useCallback(async () => {
    try {
      await window.api.rawKeyboard.start()
      setListening(true)

      const cleanup = window.api.rawKeyboard.onData((evt: KeyEvent) => {
        setEvents(prev => {
          const next = [...prev, evt]
          return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next
        })
      })
      cleanupRef.current = cleanup
    } catch (err) {
      setModuleError(err instanceof Error ? err.message : '启动监听失败')
    }
  }, [])

  const handleStop = useCallback(async () => {
    try {
      cleanupRef.current?.()
      cleanupRef.current = null
      await window.api.rawKeyboard.stop()
      setListening(false)
    } catch (err) {
      setModuleError(err instanceof Error ? err.message : '停止监听失败')
    }
  }, [])

  const handleClear = () => {
    setEvents([])
  }

  const handleRefresh = async () => {
    try {
      const list = await window.api.rawKeyboard.listDevices()
      setDevices(list)
    } catch {
      // ignore
    }
  }

  const formatVidPid = (vid: number, pid: number) => {
    return `VID_${vid.toString(16).toUpperCase().padStart(4, '0')} PID_${pid.toString(16).toUpperCase().padStart(4, '0')}`
  }

  const isMatchedEvent = (evt: KeyEvent) => {
    if (!filterSelected || selectedHandle === null) return true
    return evt.handle === selectedHandle
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>⌨️ 指定键盘监听</h1>
        <p>监听指定物理键盘的输入，区分多个键盘设备</p>
      </div>

      <div className="tool-content">
        <div className="demo-section">
          {/* 模块不可用警告 */}
          {moduleAvailable === false && (
            <div style={{ marginBottom: 16, padding: 16, background: '#fff3e0', borderRadius: 8, border: '1px solid #ffcc80' }}>
              <div style={{ fontWeight: 500, color: '#e65100', marginBottom: 8 }}>⚠️ 原生模块不可用</div>
              <div style={{ fontSize: 13, color: '#666' }}>{moduleError}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                此功能仅支持 Windows 平台，需要编译 raw-keyboard 原生模块
              </div>
            </div>
          )}

          {/* 配置区 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>键盘设备</label>
              <select
                value={selectedHandle ?? ''}
                onChange={(e) => setSelectedHandle(Number(e.target.value))}
                disabled={listening}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd', minWidth: 280, background: '#fff', fontFamily: 'Consolas, monospace', fontSize: 12 }}
              >
                {devices.map((device) => (
                  <option key={device.handle} value={device.handle}>
                    {formatVidPid(device.vid, device.pid)} (handle: {device.handle})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRefresh}
              disabled={listening}
              style={{ padding: '8px 12px', background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: listening ? 'not-allowed' : 'pointer', fontSize: 12 }}
            >
              刷新设备
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {listening ? (
                <button
                  onClick={handleStop}
                  style={{ padding: '8px 20px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}
                >
                  停止监听
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={moduleAvailable === false || devices.length === 0}
                  style={{
                    padding: '8px 20px',
                    background: (moduleAvailable === false || devices.length === 0) ? '#ccc' : '#4fc3f7',
                    color: '#fff', border: 'none', borderRadius: 4,
                    cursor: (moduleAvailable === false || devices.length === 0) ? 'not-allowed' : 'pointer',
                    fontWeight: 500
                  }}
                >
                  开始监听
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
              background: listening ? '#4caf50' : '#ccc'
            }} />
            <span>{listening ? '监听中' : '未监听'}</span>
            <span style={{ marginLeft: 12, color: '#888' }}>
              事件: {events.length}{events.length >= MAX_EVENTS ? ` (保留最近 ${MAX_EVENTS})` : ''}
            </span>
            <span style={{ marginLeft: 12, color: '#888' }}>
              键盘设备: {devices.length}
            </span>
            <label style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={filterSelected} onChange={(e) => setFilterSelected(e.target.checked)} />
              仅显示选中设备
            </label>
            <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
              自动滚动
            </label>
          </div>

          {/* 设备列表 */}
          {devices.length > 0 && (
            <div style={{ marginBottom: 16, background: '#f8f9fa', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>检测到的键盘设备</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {devices.map((device) => (
                  <div
                    key={device.handle}
                    onClick={() => !listening && setSelectedHandle(device.handle)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: `2px solid ${device.handle === selectedHandle ? '#4fc3f7' : '#ddd'}`,
                      background: device.handle === selectedHandle ? '#e3f2fd' : '#fff',
                      cursor: listening ? 'default' : 'pointer',
                      fontSize: 12,
                      fontFamily: 'Consolas, monospace'
                    }}
                  >
                    <div style={{ fontWeight: 500, color: '#333' }}>{formatVidPid(device.vid, device.pid)}</div>
                    <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Handle: {device.handle}</div>
                    <div style={{ color: '#aaa', fontSize: 10, marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {device.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 键事件日志 */}
          <div style={{ background: '#1e1e1e', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 'calc(100vh - 480px)', minHeight: 250 }}>
            <div style={{ padding: '8px 12px', background: '#2d2d2d', color: '#ccc', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span>键事件日志</span>
              <span style={{ color: '#888' }}>{listening ? '实时监听中...' : '等待开始'}</span>
            </div>
            <div ref={logRef} style={{ flex: 1, overflow: 'auto', padding: 8, fontFamily: 'Consolas, monospace', fontSize: 12 }}>
              {events.length === 0 ? (
                <div style={{ color: '#666', textAlign: 'center', padding: 40 }}>
                  {listening ? '等待键盘输入...' : '选择键盘设备后点击"开始监听"'}
                </div>
              ) : (
                events.map((evt, idx) => {
                  const matched = isMatchedEvent(evt)
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 3,
                        marginBottom: 2,
                        background: !matched && filterSelected ? 'transparent' : evt.keyDown ? '#1a3a1a' : '#1a1a2a',
                        color: !matched && filterSelected ? '#444' : evt.keyDown ? '#81c784' : '#90caf9',
                        opacity: !matched && filterSelected ? 0.3 : 1,
                        borderLeft: `3px solid ${evt.handle === selectedHandle ? '#4fc3f7' : '#555'}`
                      }}
                    >
                      <span style={{ color: '#888' }}>#{idx + 1}</span>{' '}
                      <span style={{ color: evt.handle === selectedHandle ? '#4fc3f7' : '#999' }}>h:{evt.handle}</span>{' '}
                      <span style={{ fontWeight: 500 }}>{evt.keyName}</span>{' '}
                      <span style={{ color: '#888' }}>0x{evt.vKey.toString(16).toUpperCase().padStart(2, '0')}</span>{' '}
                      <span style={{ color: '#666' }}>sc:{evt.scanCode}</span>{' '}
                      <span style={{ color: evt.keyDown ? '#81c784' : '#ef9a9a' }}>{evt.keyDown ? 'DOWN' : 'UP'}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

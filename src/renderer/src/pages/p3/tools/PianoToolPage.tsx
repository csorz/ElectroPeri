import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../toolbox.css'

interface KeyConfig {
  note: string
  key: string
  frequency: number
}

// 钢琴键位配置（C4 到 B5）
const KEYS: KeyConfig[] = [
  { note: 'C4', key: 'a', frequency: 261.63 },
  { note: 'C#4', key: 'w', frequency: 277.18 },
  { note: 'D4', key: 's', frequency: 293.66 },
  { note: 'D#4', key: 'e', frequency: 311.13 },
  { note: 'E4', key: 'd', frequency: 329.63 },
  { note: 'F4', key: 'f', frequency: 349.23 },
  { note: 'F#4', key: 't', frequency: 369.99 },
  { note: 'G4', key: 'g', frequency: 392.00 },
  { note: 'G#4', key: 'y', frequency: 415.30 },
  { note: 'A4', key: 'h', frequency: 440.00 },
  { note: 'A#4', key: 'u', frequency: 466.16 },
  { note: 'B4', key: 'j', frequency: 493.88 },
  { note: 'C5', key: 'k', frequency: 523.25 },
  { note: 'C#5', key: 'o', frequency: 554.37 },
  { note: 'D5', key: 'l', frequency: 587.33 },
  { note: 'D#5', key: 'p', frequency: 622.25 },
  { note: 'E5', key: ';', frequency: 659.25 },
  { note: 'F5', key: "'", frequency: 698.46 },
]

export default function PianoToolPage() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const [volume, setVolume] = useState(0.5)
  const audioContextRef = useRef<AudioContext | null>(null)
  const activeOscillators = useRef<Map<string, OscillatorNode>>(new Map())

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playNote = useCallback((key: KeyConfig) => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // 如果该音符已经在播放，先停止
    if (activeOscillators.current.has(key.note)) {
      return
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(key.frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start()
    activeOscillators.current.set(key.note, oscillator)
    setActiveKeys(prev => new Set(prev).add(key.note))
  }, [getAudioContext, volume])

  const stopNote = useCallback((note: string) => {
    const oscillator = activeOscillators.current.get(note)
    if (oscillator) {
      oscillator.stop()
      activeOscillators.current.delete(note)
    }
    setActiveKeys(prev => {
      const newSet = new Set(prev)
      newSet.delete(note)
      return newSet
    })
  }, [])

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const keyConfig = KEYS.find(k => k.key === e.key.toLowerCase())
      if (keyConfig) {
        playNote(keyConfig)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyConfig = KEYS.find(k => k.key === e.key.toLowerCase())
      if (keyConfig) {
        stopNote(keyConfig.note)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [playNote, stopNote])

  const whiteKeys = KEYS.filter(k => !k.note.includes('#'))
  const blackKeys = KEYS.filter(k => k.note.includes('#'))

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/fun" className="toolbox-back">
        ← 返回娱乐工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🎹</span>
          <h1>在线钢琴</h1>
        </div>
        <p className="page-sub">使用键盘或鼠标弹奏钢琴</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">控制面板</div>
          <div className="tool-row">
            <label className="tool-label">
              音量
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ marginLeft: '8px' }}
              />
              <span style={{ marginLeft: '8px' }}>{Math.round(volume * 100)}%</span>
            </label>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">钢琴键盘</div>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: '#1a1a2e',
              borderRadius: '8px',
              overflowX: 'auto'
            }}
          >
            {/* 白键 */}
            <div style={{ display: 'flex', gap: '2px' }}>
              {whiteKeys.map((key) => (
                <button
                  key={key.note}
                  type="button"
                  onMouseDown={() => playNote(key)}
                  onMouseUp={() => stopNote(key.note)}
                  onMouseLeave={() => stopNote(key.note)}
                  style={{
                    width: '50px',
                    height: '180px',
                    backgroundColor: activeKeys.has(key.note) ? '#ddd' : '#fff',
                    border: '1px solid #333',
                    borderRadius: '0 0 4px 4px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    paddingBottom: '10px',
                    transition: 'background-color 0.1s',
                    boxShadow: activeKeys.has(key.note) ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#666' }}>{key.note}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginTop: '4px' }}>
                    {key.key.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            {/* 黑键 */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                pointerEvents: 'none'
              }}
            >
              {blackKeys.map((key, index) => {
                // 计算黑键位置
                const blackKeyPositions: Record<number, number> = {
                  0: 35, 1: 87, 2: 191, 3: 243, 4: 295, 5: 399, 6: 451
                }
                return (
                  <button
                    key={key.note}
                    type="button"
                    onMouseDown={() => playNote(key)}
                    onMouseUp={() => stopNote(key.note)}
                    onMouseLeave={() => stopNote(key.note)}
                    style={{
                      position: 'absolute',
                      left: `${blackKeyPositions[index] || 0}px`,
                      width: '30px',
                      height: '110px',
                      backgroundColor: activeKeys.has(key.note) ? '#444' : '#000',
                      border: 'none',
                      borderRadius: '0 0 4px 4px',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      paddingBottom: '8px',
                      zIndex: 1,
                      boxShadow: activeKeys.has(key.note) ? 'inset 0 2px 4px rgba(255,255,255,0.2)' : '0 4px 8px rgba(0,0,0,0.5)'
                    }}
                  >
                    <span style={{ fontSize: '8px', color: '#999' }}>{key.note}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>
                      {key.key.toUpperCase()}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">键盘快捷键</div>
          <div className="tool-result">
            <p>使用键盘弹奏钢琴：</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {KEYS.map((key) => (
                <span
                  key={key.note}
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: key.note.includes('#') ? '#333' : '#eee',
                    color: key.note.includes('#') ? '#fff' : '#333',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {key.key.toUpperCase()}: {key.note}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">使用说明</div>
          <div className="tool-result">
            <ul style={{ paddingLeft: '20px' }}>
              <li>点击钢琴键或按键盘对应的按键发声</li>
              <li>白键对应自然音，黑键对应升/降音</li>
              <li>可以同时按多个键弹奏和弦</li>
              <li>调节音量滑块控制声音大小</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
